'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building, 
  Luggage, 
  Heart, 
  User, 
  ChevronDown, 
  MapPin, 
  Phone, 
  MessageCircle,
  Briefcase,
  Globe2,
  Sparkles,
  Zap,
  Bot
} from 'lucide-react';

interface HeaderProps {
  currentLocation: string;
  activeTab: string;
  onSelectCity?: (city: string) => void;
  onOpenPhoneModal: () => void;
  onOpenWhatsAppDrawer: () => void;
  onSelectTab: (tab: string) => void;
  onOpenAuthModal?: () => void;
}

const CITIES = [
  { name: 'Delhi NCR (Hub)', code: 'DEL', tag: 'Fastest 2h Getaways' },
  { name: 'Mumbai (BOM)', code: 'BOM', tag: 'Direct Beach Escapes' },
  { name: 'Bengaluru (BLR)', code: 'BLR', tag: 'Hill & Coffee Retreats' },
  { name: 'Goa (GOI)', code: 'GOI', tag: 'Coastal Direct Access' },
];

export default function Header({
  currentLocation,
  activeTab,
  onSelectCity,
  onOpenPhoneModal,
  onOpenWhatsAppDrawer,
  onSelectTab,
  onOpenAuthModal,
}: HeaderProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0A1024] text-white shadow-lg border-b border-white/10 select-none">
      {/* ── MakeMyTrip Authentic Top Navigation Utility Bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo: MakeMyTrip Authentic Style */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => onSelectTab('flights')}
            className="flex items-center space-x-2 group text-left"
          >
            <div className="flex items-center space-x-1.5">
              <span className="bg-[#EB2026] text-white font-black text-sm sm:text-base px-2 py-0.5 rounded-md tracking-tight shadow-md">
                make
              </span>
              <span className="bg-[#0084FF] text-white font-black text-sm sm:text-base px-2 py-0.5 rounded-md tracking-tight shadow-md">
                my
              </span>
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                trip
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-white/10 px-1.5 py-0.5 rounded ml-1 hidden sm:inline">
              ORBIT OS
            </span>
          </button>

          {/* Departing Hub Quick Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white border border-white/15 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0084FF]" />
              <span className="font-bold text-white">{currentLocation}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-800 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 flex items-center justify-between">
                  <span>Select Origin Hub</span>
                  <MapPin className="w-3 h-3 text-[#0084FF]" />
                </div>
                <div className="mt-1 space-y-1">
                  {CITIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onSelectCity?.(c.name);
                        setIsCityDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left hover:bg-blue-50 hover:text-[#0084FF] transition"
                    >
                      <div>
                        <div className="text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{c.tag}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {c.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Nav Utilities Matching User's Screenshot */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-xs font-medium">
          {/* List Your Property */}
          <button 
            onClick={() => onSelectTab('stays')}
            className="hidden md:flex items-center space-x-2 text-left hover:text-cyan-300 transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              🏠
            </div>
            <div>
              <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 leading-tight">List Your Property</div>
              <div className="text-[9px] text-slate-400 font-normal leading-none">Grow your business!</div>
            </div>
          </button>

          {/* Introducing myBiz (GST ITC) */}
          <button 
            onClick={() => onSelectTab('gst')}
            className="hidden lg:flex items-center space-x-2 text-left hover:text-cyan-300 transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-[10px] font-black">
              myBiz
            </div>
            <div>
              <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 leading-tight">Introducing myBiz</div>
              <div className="text-[9px] text-slate-400 font-normal leading-none">Business Travel &amp; ITC</div>
            </div>
          </button>

          {/* My Trips */}
          <button 
            onClick={() => onSelectTab('flights')}
            className="hidden sm:flex items-center space-x-1.5 hover:text-cyan-300 transition"
          >
            <span className="text-sm">🧳</span>
            <div className="text-left">
              <div className="text-[11px] font-bold leading-tight">My Trips</div>
              <div className="text-[9px] text-slate-400 leading-none">Manage bookings</div>
            </div>
          </button>

          {/* Phone Call Desk */}
          <button
            onClick={onOpenPhoneModal}
            className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>2-Min Desk</span>
          </button>

          {/* UNIFIED AI TRIP RECOMMENDER (Opens Dedicated New Tab) */}
          <a
            href="/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-[#0084FF] to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-slate-950 text-xs font-black shadow-[0_4px_25px_rgba(0,132,255,0.45)] hover:shadow-[0_6px_30px_rgba(0,132,255,0.65)] transition-all active:scale-95 btn-press cursor-pointer border border-cyan-300/40"
            title="Open AI Trip Recommender Studio (New Tab)"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-200 animate-ping" />
            </div>
            <span className="text-[12px] font-black tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
              <span>Recommender</span>
              <span className="bg-white/20 text-cyan-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">AI ↗</span>
            </span>
          </a>

          {/* Login or Create Account Button (Exact Blue Pill from Screenshot) */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/30 transition-all btn-press"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Login or Create Account</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* Currency / Language */}
          <div className="hidden sm:flex items-center space-x-1 text-slate-300 text-[11px] font-semibold pl-1 border-l border-white/10">
            <span>🇮🇳</span>
            <span>INR | English</span>
          </div>
        </div>

      </div>
    </header>
  );
}
