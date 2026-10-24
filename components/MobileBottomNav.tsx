'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Plane, 
  ShieldCheck, 
  Sparkles,
  Ticket,
  User as UserIcon,
  X,
  ChevronRight,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import MakeMyTripAuthModal from './MakeMyTripAuthModal';

interface MobileBottomNavProps {
  onOpenVisa?: () => void;
  onOpenFlights?: () => void;
  onOpenEvents?: () => void;
}

export default function MobileBottomNav({ 
  onOpenVisa, 
  onOpenFlights,
  onOpenEvents
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const isChat = pathname === '/chat';
  const { user, logout } = useAuth();

  const [isPlannrMode, setIsPlannrMode] = useState(false);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleMode = (e: any) => {
      setIsPlannrMode(e.detail?.mode === 'plannr');
    };
    window.addEventListener('orbit:mode-change', handleMode);
    if (pathname === '/plannr') {
      setIsPlannrMode(true);
    }
    return () => window.removeEventListener('orbit:mode-change', handleMode);
  }, [pathname]);

  if (pathname === '/plannr' || isPlannrMode) {
    return null;
  }

  const handleProfileClick = () => {
    if (user) {
      setIsAccountSheetOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#070D1E]/95 backdrop-blur-xl border-t border-cyan-400/25 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around gap-1 text-center">
          
          {/* 1. Explore / Home */}
          <button
            type="button"
            onClick={() => {
              if (pathname !== '/') {
                window.location.href = '/';
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('orbit:navigate', { detail: { tab: 'flights' } }));
              }
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition group cursor-pointer ${
              !isChat 
                ? 'text-cyan-300 font-bold' 
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              !isChat ? 'bg-cyan-500/20 border border-cyan-400/40 shadow-sm shadow-cyan-400/30' : 'group-hover:bg-white/5'
            }`}>
              <Compass className={`w-4 h-4 ${!isChat ? 'text-cyan-300' : 'text-slate-400'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-mono">Explore</span>
          </button>

          {/* 2. Flights */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFlights) onOpenFlights();
              window.dispatchEvent(new CustomEvent('orbit:navigate', { detail: { tab: 'flights' } }));
              if (pathname !== '/') {
                window.location.href = '/#flights-section';
              } else {
                const el = document.getElementById('flights-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl transition text-slate-400 hover:text-slate-200 font-medium group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:bg-white/5 transition">
              <Plane className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-mono">Flights</span>
          </button>

          {/* 3. CENTER HERO: AI Copilot */}
          <button
            type="button"
            onClick={() => {
              if (pathname === '/') {
                window.dispatchEvent(new CustomEvent('orbit:open-chatbot'));
              } else {
                window.location.href = '/chat';
              }
            }}
            className="flex flex-col items-center justify-center -mt-4 relative group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-active:scale-95 ${
              isChat
                ? 'bg-gradient-to-tr from-[#0084FF] to-cyan-400 text-slate-950 shadow-cyan-400/50 ring-2 ring-cyan-300'
                : 'bg-gradient-to-tr from-[#0E1B3E] to-[#172B5E] text-cyan-300 border border-cyan-400/40 shadow-blue-500/20'
            }`}>
              <Sparkles className={`w-6 h-6 ${isChat ? 'text-slate-950 animate-spin fill-current' : 'text-cyan-300'}`} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#070D1E] animate-pulse" />
            </div>
            <span className={`text-[10px] mt-1 font-black tracking-tight font-mono ${
              isChat ? 'text-cyan-300' : 'text-slate-300'
            }`}>
              AI Copilot
            </span>
          </button>

          {/* 4. Visas (Atlys Flow) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenVisa) onOpenVisa();
              window.dispatchEvent(new CustomEvent('orbit:navigate', { detail: { tab: 'visa' } }));
              if (pathname !== '/') {
                window.location.href = '/#visa-section';
              } else {
                const el = document.getElementById('visa-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl transition text-slate-400 hover:text-slate-200 font-medium group cursor-pointer relative"
          >
            <span className="absolute -top-1 right-2 px-1 py-0.2 rounded-full bg-emerald-500/90 text-white text-[8px] font-mono font-bold">
              ₹499
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:bg-white/5 transition">
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-mono">Visas</span>
          </button>

          {/* 5. Account / Profile Indicator */}
          <button
            type="button"
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition group cursor-pointer ${
              user ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center relative transition">
              {user ? (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-white text-[11px] font-black shadow-sm shadow-cyan-400/40 ring-1 ring-cyan-300">
                  {user.avatar || 'KJ'}
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#070D1E]" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-white/15 flex items-center justify-center text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-mono truncate max-w-[58px]">
              {user ? user.name.split(' ')[0] : 'Account'}
            </span>
          </button>

        </div>
      </nav>

      {/* Mobile Account Profile Bottom Sheet Modal */}
      {isAccountSheetOpen && user && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0C152E] border-t sm:border border-cyan-400/30 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 text-slate-100 space-y-4">
            
            {/* Close Button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Member Profile
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <button
                onClick={() => setIsAccountSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 via-cyan-950/40 to-slate-900 border border-cyan-400/30 space-y-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-white text-base font-black shadow-lg shadow-cyan-400/30">
                  {user.avatar || 'KJ'}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>{user.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs font-mono text-cyan-300">{user.phone}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{user.email || 'keshav@orbit.travel'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-slate-400">Loyalty Status:</span>
                <span className="font-extrabold text-amber-300 font-mono flex items-center gap-1">
                  <span>★</span>
                  <span>{user.tier || 'Titanium Elite'}</span>
                </span>
              </div>
            </div>

            {/* Quick Links Menu */}
            <div className="space-y-1.5 text-xs">
              <div 
                onClick={() => {
                  setIsAccountSheetOpen(false);
                  const el = document.getElementById('flights-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">🧳</span>
                  <div>
                    <div className="font-bold text-white">My Bookings</div>
                    <div className="text-[10px] text-slate-400 font-mono">3 Active Itineraries</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div 
                onClick={() => {
                  setIsAccountSheetOpen(false);
                  const el = document.getElementById('gst-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-[10px]">
                    GST
                  </span>
                  <div>
                    <div className="font-bold text-white">myBiz Business Profile</div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {user.mybiz_gstin || '07AAACR5055K1Z4'} · Verified
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div 
                onClick={() => {
                  if (onOpenEvents) onOpenEvents();
                  setIsAccountSheetOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-bold text-white">Concerts &amp; Live Events</div>
                    <div className="text-[10px] text-slate-400 font-mono">VIP Access Pass</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                setIsAccountSheetOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out ({user.name})</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal for mobile login if logged out */}
      <MakeMyTripAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
