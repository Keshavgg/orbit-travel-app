'use client';

import React, { useEffect, useState } from 'react';

interface FlyscanJetWipeProps {
  isActive: boolean;
  destinationCity: string;
  destinationCountry: string;
  bgImageUrl?: string;
  onComplete: () => void;
}

export default function FlyscanJetWipe({
  isActive,
  destinationCity,
  destinationCountry,
  bgImageUrl = 'https://images.unsplash.com/photo-1652707228067-25672fa0b082?auto=format&fit=crop&w=1600&q=70',
  onComplete,
}: FlyscanJetWipeProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onComplete();
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className="flyscan-wipe"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(6, 20, 70, 0.35) 0%, rgba(6, 20, 70, 0.15) 40%, rgba(6, 20, 70, 0.8) 100%), url('${bgImageUrl}')`,
      }}
    >
      {/* 3 Condensation Vapor Streaks */}
      <span className="flyscan-streak s1"></span>
      <span className="flyscan-streak s2"></span>
      <span className="flyscan-streak s3"></span>

      {/* Arrival Destination HUD */}
      <div className="flyscan-wipe-city">
        <small className="block font-sans font-bold text-xs sm:text-sm text-[#FFC940] uppercase tracking-widest drop-shadow-sm mb-1">
          ✈️ Now arriving
        </small>
        <b className="block font-display font-black text-4xl sm:text-7xl lg:text-8xl tracking-tight leading-none text-white drop-shadow-md">
          {destinationCity}
        </b>
        <span className="block font-sans font-semibold text-sm sm:text-lg text-white/90 drop-shadow-sm mt-1 sm:mt-2">
          {destinationCountry}
        </span>
      </div>

      {/* Flyscan Supersonic Airliner Jet Vector */}
      <div className="flyscan-wipe-jet">
        <svg
          viewBox="0 0 640 200"
          className="w-full h-auto drop-shadow-2xl"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="wjF" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.48" stopColor="#F3F6FB" />
              <stop offset="0.8" stopColor="#D5DDEA" />
              <stop offset="1" stopColor="#A9B6CB" />
            </linearGradient>
            <linearGradient id="wjT" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1F5EFF" />
              <stop offset="1" stopColor="#0F3FB8" />
            </linearGradient>
            <linearGradient id="wjW" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E6ECF5" />
              <stop offset="1" stopColor="#9AA8BE" />
            </linearGradient>
            <linearGradient id="wjE" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F4F7FC" />
              <stop offset="0.55" stopColor="#C9D3E2" />
              <stop offset="1" stopColor="#8795AD" />
            </linearGradient>
            <linearGradient id="wjS" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FF9A5C" />
              <stop offset="1" stopColor="#FF6A2B" />
            </linearGradient>
          </defs>

          {/* Horizontal Stabiliser (Far side) */}
          <path d="M74 95 L22 100 C17 101 17 106 22 106 L44 106 L112 99 Z" fill="#B7C3D6" />

          {/* Vertical Tail Fin */}
          <path d="M58 86 L24 15 C22 10 25 8 30 8 L60 8 C65 8 68 10 70 14 L140 79 Z" fill="url(#wjT)" />
          <path d="M40 46 C62 40 86 44 104 58 L96 62 C80 52 60 50 45 56 Z" fill="url(#wjS)" />
          <circle cx="54" cy="30" r="7" fill="#fff" opacity="0.95" />
          <path d="M50.5 30 L58 27.2 L56 30 L58 32.8 Z" fill="#1F5EFF" />

          {/* Fuselage */}
          <path d="M118 77 L520 77 C556 77 590 88 604 104 C597 116 566 123 522 123 L190 123 C150 123 98 112 46 94 L42 88 C66 82 92 78 118 77 Z" fill="url(#wjF)" />
          <path d="M124 79 L518 79 C548 79 574 86 590 96" fill="none" stroke="#fff" strokeWidth="2" opacity="0.9" />

          {/* Livery Speed Stripes */}
          <path d="M128 106 L594 106 C596 107.6 596 109 594 110.4 L132 110.4 C116 110 100 107 86 103 Z" fill="url(#wjS)" />
          <path d="M136 112.5 L588 112.5 C587 114 586 115 584 115.5 L140 115.5 C120 115 104 112 92 108 Z" fill="#1F5EFF" opacity="0.9" />

          {/* Cabin Passenger Windows */}
          <g fill="#23324F">
            <rect x="196" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="207" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="218" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="229" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="240" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="251" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="262" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="273" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="284" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="295" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="306" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="317" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="328" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="339" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="350" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="361" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="372" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="383" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="394" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="405" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="416" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="427" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="438" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="449" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="482" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="493" y="89" width="5.2" height="7.5" rx="2.6" />
            <rect x="504" y="89" width="5.2" height="7.5" rx="2.6" />
          </g>

          {/* Doors */}
          <rect x="528" y="83" width="12" height="25" rx="3.5" fill="none" stroke="#A5B2C6" strokeWidth="1.3" />
          <rect x="150" y="85" width="11" height="22" rx="3.5" fill="none" stroke="#A5B2C6" strokeWidth="1.3" />

          {/* Cockpit Windshield */}
          <path d="M565 87.5 L582 90.5 C585 91.5 587 93.5 588 96 L566 95.5 Z" fill="#1B2436" />
          <path d="M568 89 L578 90.8 L577 93.8 L568 93.6 Z" fill="#3B5484" opacity="0.8" />

          {/* Swept-back Main Wing */}
          <path d="M384 111 L218 160 C213 162 206 163 199 162 L193 161 L292 113 Z" fill="url(#wjW)" />
          <path d="M384 111 L218 160" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
          <path d="M199 162 L186 145 L193 144 L208 160 Z" fill="url(#wjT)" />

          {/* High-Bypass Turbofan Jet Engine */}
          <path d="M322 117 L354 115 L360 128 L326 129 Z" fill="#B9C4D6" />
          <path d="M306 128 L366 126 C381 126 388 132 388 139 C388 146 381 152 366 152 L306 150 C297 149 296 130 306 128 Z" fill="url(#wjE)" />
          <path d="M312 133 L370 131" stroke="#fff" strokeWidth="1.6" opacity="0.8" />
          <ellipse cx="386" cy="139" rx="4" ry="12.5" fill="#1B2436" />
          <path d="M306 132 L291 139 L306 146 Z" fill="#6B778C" />
          <path d="M336 127.5 L352 127 C360 127 364 131 366 134" fill="none" stroke="#1F5EFF" strokeWidth="2.4" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
