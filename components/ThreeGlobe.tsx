'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export interface CityData {
  key: string;
  name: string;
  flag: string;
  lat: number;
  lon: number;
  color: number;
  price: string;
  desc: string;
}

export const CITY_COORDINATES: Record<string, CityData> = {
  delhi: { key: 'delhi', lat: 28.6139, lon: 77.2090, name: 'Delhi NCR (Hub)', flag: '🇮🇳', color: 0xFFC940, price: 'HUB', desc: 'Main origin hub. Direct flights & express routes.' },
  goa: { key: 'goa', lat: 15.2993, lon: 74.1240, name: 'Goa (GOI)', flag: '🏖️', color: 0xFF3D71, price: '₹2,899', desc: 'IndiGo direct flight · 3 distressed seats remaining.' },
  thailand: { key: 'thailand', lat: 13.7563, lon: 100.5018, name: 'Bangkok (Thailand)', flag: '🇹🇭', color: 0x1F5EFF, price: '₹499 Cap', desc: '24h eVisa approval · Flat ₹499 family fee cap.' },
  dubai: { key: 'dubai', lat: 25.2048, lon: 55.2708, name: 'Dubai (UAE)', flag: '🇦🇪', color: 0x9061F9, price: '₹499 Fee', desc: 'Instant 24h tourist visa · Phone passport snap.' },
  rishikesh: { key: 'rishikesh', lat: 30.0869, lon: 78.2676, name: 'Rishikesh', flag: '⛰️', color: 0x16A57A, price: '₹3,499', desc: '2.5h drive · Riverside Swiss glamping + rafting + meals.' },
  vietnam: { key: 'vietnam', lat: 16.0544, lon: 108.2022, name: 'Da Nang (Vietnam)', flag: '🇻🇳', color: 0x00D2FF, price: '₹18,999', desc: 'Direct flight + beachfront resort + official eVisa.' },
  bali: { key: 'bali', lat: -8.3405, lon: 115.0920, name: 'Bali (Indonesia)', flag: '🇮🇩', color: 0x10B981, price: '₹26,800', desc: 'e-VoA instant approval + private pool villa.' }
};

interface ThreeGlobeProps {
  activeCityKey: string;
  onSelectCity?: (cityKey: string) => void;
  onBookItem?: (name: string, price: string) => void;
}

export default function ThreeGlobe({ activeCityKey, onSelectCity, onBookItem }: ThreeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const [selectedHudCity, setSelectedHudCity] = useState<CityData | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 30, 280);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 100;

    // 4. Procedural High-Tech World Grid Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0B1736';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(31, 94, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= canvas.width; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#2A437E';
      for (let i = 0; i < 2800; i++) {
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        if ((rx > 1000 && rx < 1800) || Math.random() > 0.6) {
          ctx.beginPath();
          ctx.arc(rx, ry, Math.random() * 2.2 + 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const canvasTexture = new THREE.CanvasTexture(canvas);

    // 5. Globe Sphere
    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: canvasTexture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x223355),
      shininess: 15,
      transparent: true,
      opacity: 0.98
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // 6. Atmospheric Glow Outer Shell
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.05, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x1F5EFF,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphere);

    // 7. Ambient Lighting & Directional Light
    const ambientLight = new THREE.AmbientLight(0xdde6ff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(200, 150, 180);
    scene.add(dirLight);

    // 8. Ambient Dust Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 600;
      positions[i + 1] = (Math.random() - 0.5) * 600;
      positions[i + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x7383A8,
      size: 1.5,
      transparent: true,
      opacity: 0.6
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Helper: Convert Lat/Lon to Vector3
    function latLonToVector3(lat: number, lon: number, radius: number) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    }

    const beaconMarkers: { ring: THREE.Mesh }[] = [];
    const flightArcMeshes: { curve: THREE.QuadraticBezierCurve3; particle: THREE.Mesh; progress: number }[] = [];

    // 9. Add Beacons & Flight Arcs
    const delhiCoords = latLonToVector3(CITY_COORDINATES.delhi.lat, CITY_COORDINATES.delhi.lon, GLOBE_RADIUS);

    Object.keys(CITY_COORDINATES).forEach(key => {
      const city = CITY_COORDINATES[key];
      const pos = latLonToVector3(city.lat, city.lon, GLOBE_RADIUS);

      // Beacon Dot
      const beaconGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: city.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos);
      globeGroup.add(beaconMesh);

      // Vertical Ray
      const rayGeo = new THREE.CylinderGeometry(0.4, 0.4, 8, 8);
      const rayMat = new THREE.MeshBasicMaterial({ color: city.color, transparent: true, opacity: 0.8 });
      const rayMesh = new THREE.Mesh(rayGeo, rayMat);
      const normal = pos.clone().normalize();
      rayMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(4)));
      rayMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      globeGroup.add(rayMesh);

      // Pulse Ring
      const ringGeo = new THREE.RingGeometry(1.5, 3.5, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: city.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.5)));
      ringMesh.lookAt(pos.clone().add(normal));
      globeGroup.add(ringMesh);

      beaconMarkers.push({ ring: ringMesh });

      // Flight Arc if not Delhi
      if (key !== 'delhi') {
        const distance = delhiCoords.distanceTo(pos);
        const mid = delhiCoords.clone().lerp(pos, 0.5);
        const altitude = GLOBE_RADIUS + Math.min(distance * 0.45, 45);
        mid.normalize().multiplyScalar(altitude);

        const curve = new THREE.QuadraticBezierCurve3(delhiCoords, mid, pos);
        const points = curve.getPoints(50);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
        const curveMat = new THREE.LineBasicMaterial({
          color: city.color,
          transparent: true,
          opacity: 0.65,
          linewidth: 2
        });
        const line = new THREE.Line(curveGeo, curveMat);
        globeGroup.add(line);

        // Moving Particle (Airplane)
        const particleGeo = new THREE.SphereGeometry(1.8, 12, 12);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        globeGroup.add(particle);

        flightArcMeshes.push({
          curve,
          particle,
          progress: Math.random()
        });
      }
    });

    // Default Rotation to Face India (Delhi)
    globeGroup.rotation.y = -1.25;
    globeGroup.rotation.x = 0.35;

    // 10. Mouse Drag Interaction
    let isDragging = false;
    let autoRotate = true;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x += dy * 0.005;
      globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => { autoRotate = true; }, 3500);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 11. Resize Handler
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 12. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0018;
      }

      flightArcMeshes.forEach(item => {
        item.progress += 0.0045;
        if (item.progress > 1) item.progress = 0;
        const pt = item.curve.getPoint(item.progress);
        item.particle.position.copy(pt);
      });

      beaconMarkers.forEach((b, idx) => {
        const time = Date.now() * 0.003 + idx;
        const scale = 1 + Math.sin(time) * 0.25;
        b.ring.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // When activeCityKey changes from parent props, animate 3D rotation
  useEffect(() => {
    if (!globeGroupRef.current || !activeCityKey) return;
    const city = CITY_COORDINATES[activeCityKey];
    if (!city) return;

    setSelectedHudCity(city);

    const targetY = -(city.lon * (Math.PI / 180)) - 0.2;
    const targetX = (city.lat * (Math.PI / 180)) * 0.3;

    gsap.to(globeGroupRef.current.rotation, {
      y: targetY,
      x: targetX,
      duration: 1.2,
      ease: 'power2.out',
    });
  }, [activeCityKey]);

  return (
    <div className="relative w-full h-[420px] rounded-[28px] overflow-hidden bg-gradient-to-b from-[#0E1838] via-[#091026] to-[#050814] border border-white/10 shadow-[0_0_50px_-10px_rgba(0,229,255,0.2)]">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Badges Over 3D Globe */}
      <div className="pchip absolute top-3 left-3 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-xs">🏷️</div>
        <div className="text-left">
          <b className="text-xs font-extrabold text-white block leading-tight">Flat ₹499 Visa Cap</b>
          <small className="text-[10px] text-slate-400 font-mono">Family pass for up to 6</small>
        </div>
      </div>

      <div className="pchip absolute bottom-3 right-3 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-xs">⚡</div>
        <div className="text-left">
          <b className="text-xs font-extrabold text-white block leading-tight">Leave in 2 Hours</b>
          <small className="text-[10px] text-slate-400 font-mono">1-Tap Instant Escapes</small>
        </div>
      </div>

      {/* Live Route Status Pill */}
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#060913]/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center space-x-2 z-20 shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
        <span className="text-cyan-300 font-bold">{selectedHudCity ? `${selectedHudCity.flag} ${selectedHudCity.name.toUpperCase()}` : 'HUB: DELHI (DEL)'}</span>
      </div>

      {/* Interactive 3D City HUD Card in Dark Glass */}
      {selectedHudCity && selectedHudCity.key !== 'delhi' && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xs bg-[#0A1024]/95 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-2xl text-xs z-30 transition-all text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{selectedHudCity.flag}</span>
              <div>
                <h4 className="font-black text-white text-sm">{selectedHudCity.name}</h4>
                <span className="text-[10px] text-rose-400 font-bold font-mono">Orbit Drop: {selectedHudCity.price}</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedHudCity(null)} 
              className="w-6 h-6 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{selectedHudCity.desc}</p>
          <div className="mt-2 pt-2 border-t border-white/[0.1] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">1-Tap Price</span>
              <span className="text-base font-black text-cyan-400 font-mono">{selectedHudCity.price} Total</span>
            </div>
            <button 
              onClick={() => onBookItem?.(selectedHudCity.name, selectedHudCity.price)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition"
            >
              Book ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
