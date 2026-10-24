'use client';

import React, { useState } from 'react';
import { ArrowRight, Lock, X, Check, ShieldCheck, Phone, Zap } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemPrice: string;
  onCompletePayment: (method: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  itemName,
  itemPrice,
  onCompletePayment,
}: CheckoutModalProps) {
  const [accountType, setAccountType] = useState<'personal' | 'mybiz'>('personal');
  const [phone, setPhone] = useState('9810123456');
  const [includeGst, setIncludeGst] = useState(true);
  const [selectedUpi, setSelectedUpi] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = (method: string) => {
    setSelectedUpi(method);
    setTimeout(() => {
      onCompletePayment(method);
      setSelectedUpi(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none">
      {/* ── MakeMyTrip Authentic Split Modal Card ── */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row modal-panel-enter border border-slate-200">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── LEFT COLUMN: TRAVEL PROMO BANNER ── */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0A84FF] via-[#0066CC] to-[#004B99] p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80')`,
            }}
          />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="bg-[#EB2026] text-white font-black text-xs px-2 py-0.5 rounded shadow">
                make
              </span>
              <span className="bg-white text-[#0084FF] font-black text-xs px-2 py-0.5 rounded shadow">
                my
              </span>
              <span className="font-extrabold text-white text-sm">trip</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-200 uppercase font-bold">
              ZERO-FORM 1-TAP CHECKOUT
            </div>
          </div>

          <div className="relative z-10 py-5">
            <div className="text-3xl font-black text-white/90 font-mono tracking-tight drop-shadow-md">
              CONFIRM
            </div>
            <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl mt-3 space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Selected Booking:
              </div>
              <div className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                {itemName}
              </div>
              <div className="text-2xl font-black text-[#0084FF] font-mono">
                {itemPrice} <span className="text-xs text-slate-500 font-normal">All-in</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span>✓</span> Zero Convenience Fee · Instant WhatsApp Ticket
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-white/90 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Secure Payment Guarantee</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: AUTH & 1-TAP UPI PAYMENT ── */}
        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-white">
          
          {/* Personal vs myBiz Account Toggle */}
          <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`flex-1 py-1.5 rounded-full text-xs font-extrabold transition-all duration-150 ${
                accountType === 'personal'
                  ? 'bg-[#0084FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PERSONAL ACCOUNT
            </button>
            <button
              type="button"
              onClick={() => setAccountType('mybiz')}
              className={`flex-1 py-1.5 rounded-full text-xs font-extrabold transition-all duration-150 ${
                accountType === 'mybiz'
                  ? 'bg-[#0084FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MYBIZ ACCOUNT
            </button>
          </div>

          {/* Contact Verification */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Mobile Number (Vouchers sent on WhatsApp)
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-[#0084FF] focus-within:ring-2 focus-within:ring-blue-500/20">
              <div className="flex items-center space-x-1 px-3 py-2 bg-slate-50 border-r border-slate-300 text-xs font-bold text-slate-700">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Mobile Number"
                className="w-full px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* GSTIN Claim Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeGst || accountType === 'mybiz'}
                onChange={(e) => setIncludeGst(e.target.checked)}
                className="w-4 h-4 text-[#0084FF] rounded cursor-pointer accent-[#0084FF]"
              />
              <span className="font-extrabold text-slate-800">
                Claim GST Input Tax Credit (ITC)
              </span>
            </label>
            {(includeGst || accountType === 'mybiz') && (
              <div className="pl-6 text-[11px] text-slate-600 space-y-1">
                <div>GSTIN: <span className="font-mono font-bold text-[#0084FF]">07AABCU9603R1ZV</span> (Tata Tech)</div>
                <div className="text-emerald-700 font-bold">✓ 18% &amp; 5% Tax Invoice generated instantly in GSTR-2B</div>
              </div>
            )}
          </div>

          {/* 1-Tap UPI Apps */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Select 1-Tap UPI Payment Method:</span>
              <span className="text-emerald-600 font-bold text-[11px]">⚡ Instant PNR</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handlePay('Google Pay')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all btn-press ${
                  selectedUpi === 'Google Pay'
                    ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇬</span>
                  <span className="font-bold text-slate-800">Google Pay</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handlePay('PhonePe')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all btn-press ${
                  selectedUpi === 'PhonePe'
                    ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🟣</span>
                  <span className="font-bold text-slate-800">PhonePe</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handlePay('Paytm')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all btn-press ${
                  selectedUpi === 'Paytm'
                    ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔵</span>
                  <span className="font-bold text-slate-800">Paytm UPI</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handlePay('CRED Pay')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all btn-press ${
                  selectedUpi === 'CRED Pay'
                    ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💳</span>
                  <span className="font-bold text-slate-800">CRED UPI</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <button
            onClick={() => handlePay('1-Tap Instant UPI')}
            className="w-full py-3.5 bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 btn-press cursor-pointer"
          >
            <span>PAY {itemPrice} &amp; CONFIRM BOOKING</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            🔒 256-Bit SSL Encrypted · Instant Refund Guarantee on Cancellation
          </p>

        </div>

      </div>
    </div>
  );
}
