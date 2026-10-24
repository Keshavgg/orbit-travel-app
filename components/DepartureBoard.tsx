'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Plane, Sparkles } from 'lucide-react';

interface DepartureBoardProps {
  onSelectToCart: (name: string, price: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function DepartureBoard({ onSelectToCart, onSelectTab }: DepartureBoardProps) {
  const [clock, setClock] = useState('18:42:10 IST');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toTimeString().split(' ')[0] + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-4 w-full select-none">
      <div className="bg-[#0F1A33] rounded-[28px] p-5 sm:p-7 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1F5EFF]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-[#FFC940] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Distressed Inventory Feed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
              Airport Split-Flap Seat Drops
            </h2>
            <p className="text-xs sm:text-sm text-[#9FB0D6] mt-1 max-w-xl">
              Airlines release unsold seats 12-24h before departure at wholesale cost. 100% confirmed PNR + WhatsApp boarding pass.
            </p>
          </div>
          <div className="flex items-center space-x-2 font-mono text-lg sm:text-2xl font-bold text-[#FFC940] bg-white/5 px-4 py-2 rounded-xl border border-white/10 shrink-0 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#16A57A] animate-ping inline-block mr-1"></span>
            <span>{clock}</span>
          </div>
        </div>

        {/* Departure Board Rows */}
        <div className="space-y-3 text-xs relative z-10">
          {/* Row 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
            <div className="flex items-center space-x-3.5">
              <div className="flex space-x-0.5">
                <span className="flap-char">6</span>
                <span className="flap-char">E</span>
                <span className="flap-char">2</span>
                <span className="flap-char">1</span>
                <span className="flap-char">3</span>
              </div>
              <div>
                <div className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Delhi (DEL) ➔ Goa (GOI)</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded-full border border-rose-500/30">
                    3 Seats Left
                  </span>
                </div>
                <div className="text-[#9FB0D6] text-[11px] mt-0.5">
                  Departs Tomorrow 06:15 AM · IndiGo Direct · 15kg baggage included
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-white/50 line-through">₹7,200</span>
                <div className="text-lg font-extrabold text-[#FFC940]">₹2,899</div>
              </div>
              <button
                onClick={() => onSelectToCart('IndiGo Direct Flight: Delhi ➔ Goa (6E 213)', '₹2,899')}
                className="px-5 py-2.5 rounded-xl bg-[#1F5EFF] hover:bg-[#1646C8] active:scale-95 text-white text-xs font-extrabold transition-all duration-150 shadow-md shadow-[#1F5EFF]/30 flex items-center gap-1.5"
              >
                <span>Grab Deal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
            <div className="flex items-center space-x-3.5">
              <div className="flex space-x-0.5">
                <span className="flap-char">T</span>
                <span className="flap-char">H</span>
                <span className="flap-char">A</span>
                <span className="flap-char">I</span>
                <span className="flap-char">2</span>
              </div>
              <div>
                <div className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Thailand Tourist eVisa · Express Queue</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">
                    24h Approval
                  </span>
                </div>
                <div className="text-[#9FB0D6] text-[11px] mt-0.5">
                  Flat ₹499 Family Service Fee Cap · Up to 6 pax · 99.2% approval rate
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-white/50 line-through">₹4,800 others</span>
                <div className="text-lg font-extrabold text-emerald-400">₹499 Flat</div>
              </div>
              <button
                onClick={() => onSelectTab('visa')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold transition-all duration-150 shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
            <div className="flex items-center space-x-3.5">
              <div className="flex space-x-0.5">
                <span className="flap-char">R</span>
                <span className="flap-char">I</span>
                <span className="flap-char">S</span>
                <span className="flap-char">H</span>
                <span className="flap-char">1</span>
              </div>
              <div>
                <div className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Rishikesh Riverside Glamping &amp; Rafting</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30">
                    &lt;3h Escapes
                  </span>
                </div>
                <div className="text-[#9FB0D6] text-[11px] mt-0.5">
                  Swiss cottage tent on river + 16km rafting + all 3 buffet meals + bonfire
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-white/50 line-through">₹8,500</span>
                <div className="text-lg font-extrabold text-[#FFC940]">₹3,499 Total</div>
              </div>
              <button
                onClick={() => onSelectToCart('Rishikesh Riverside Glamping & Rafting', '₹3,499')}
                className="px-5 py-2.5 rounded-xl bg-[#1F5EFF] hover:bg-[#1646C8] active:scale-95 text-white text-xs font-extrabold transition-all duration-150 shadow-md shadow-[#1F5EFF]/30 flex items-center gap-1.5"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
