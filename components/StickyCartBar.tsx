'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface StickyCartBarProps {
  itemName: string;
  itemPrice: string;
  onOpenCheckout: () => void;
  onDismiss?: () => void;
}

export default function StickyCartBar({ 
  itemName, 
  itemPrice, 
  onOpenCheckout,
  onDismiss 
}: StickyCartBarProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 600);
    return () => clearTimeout(timer);
  }, [itemName, itemPrice]);

  return (
    <aside
      aria-label="Quick Checkout"
      className={`fixed bottom-0 inset-x-0 z-50 sticky-cart-bar px-4 py-3 slide-up-enter ${
        isPulsing ? 'cart-pulse' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Cart Item Information */}
        <div className="flex items-center space-x-3">
          <div className="relative w-11 h-11 rounded-2xl bg-blue-50 text-[#0084FF] border border-blue-200 flex items-center justify-center text-xl font-bold shadow-sm">
            <ShoppingBag className={`w-5 h-5 text-[#0084FF] ${isPulsing ? 'animate-bounce-sm' : ''}`} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">{itemName}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase font-mono">
                Instant Lock
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Zero form filling · <strong className="text-[#0084FF] font-black font-mono">{itemPrice} Total</strong> (Taxes &amp; Fees Included)
            </div>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCheckout}
            className="px-6 sm:px-9 py-3 bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center space-x-2 shrink-0 group btn-press cursor-pointer"
          >
            <span>Instant 1-Tap Pay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              title="Dismiss"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
