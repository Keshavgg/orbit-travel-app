'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface MakeMyTripAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string, accountType: 'personal' | 'mybiz') => void;
  title?: string;
  promoTitle?: string;
  promoSubtitle?: string;
}

export default function MakeMyTripAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Login or Create Account',
  promoTitle = 'GET YOUR KINDA GOA STAYS:',
  promoSubtitle = 'Grab FLAT 20% OFF* on Flights, Stays & Visas!',
}: MakeMyTripAuthModalProps) {
  const [accountType, setAccountType] = useState<'personal' | 'mybiz'>('personal');
  const [phone, setPhone] = useState('9810123456');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(`+91 ${phone}`, accountType);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none">
      {/* Split 2-Column MakeMyTrip Card Exactly like Screenshot */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row modal-panel-enter border border-slate-200">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── LEFT COLUMN: VIBRANT TRAVEL PROMO BANNER ── */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0A84FF] via-[#0066CC] to-[#004B99] p-6 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background image overlay */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80')`,
            }}
          />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-1.5">
              <span className="bg-[#EB2026] text-white font-black text-xs px-2 py-0.5 rounded shadow">
                make
              </span>
              <span className="bg-white text-[#0084FF] font-black text-xs px-2 py-0.5 rounded shadow">
                my
              </span>
              <span className="font-extrabold text-white text-sm">trip</span>
            </div>
            <div className="text-[11px] font-mono tracking-widest text-cyan-200 uppercase font-bold">
              ORBIT TRAVEL OS
            </div>
          </div>

          <div className="relative z-10 py-6">
            <div className="text-4xl font-black text-white/90 font-mono tracking-tight drop-shadow-md">
              GOA
            </div>
            <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl mt-3 space-y-1">
              <div className="text-xs font-black text-slate-800 leading-tight">
                {promoTitle}
              </div>
              <div className="text-sm font-extrabold text-[#0084FF] leading-snug">
                {promoSubtitle}
              </div>
              <div className="text-[9px] text-slate-400 font-medium">*T&amp;C Apply · Zero Fee Direct PNR</div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-white/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Verified ITC Invoice on GSTIN</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: AUTH & QUICK 1-TAP FORM ── */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-white">
          
          {/* Account Type Toggle Pill: PERSONAL vs MYBIZ */}
          <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all duration-150 ${
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
              className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all duration-150 ${
                accountType === 'mybiz'
                  ? 'bg-[#0084FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MYBIZ ACCOUNT
            </button>
          </div>

          {accountType === 'mybiz' && (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <span className="font-bold">🏢 Business ITC Mode:</span>
              <span>18% &amp; 5% GST invoice will be auto-synced to your company GSTIN.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-[#0084FF] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <div className="flex items-center space-x-1 px-3 py-3 bg-slate-50 border-r border-slate-300 text-xs font-bold text-slate-700 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  required
                  className="w-full px-3 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phone.length < 10}
              className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 btn-press ${
                phone.length >= 10
                  ? 'bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white shadow-lg shadow-blue-500/30 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Or Login/Signup With */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Login/Signup With
              </span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setPhone('9810123456');
                  onSuccess('+91 9810123456 (Google)', accountType);
                  onClose();
                }}
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition shadow-xs"
                title="Login with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('9810123456');
                  onSuccess('+91 9810123456 (Email)', accountType);
                  onClose();
                }}
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs"
                title="Login with Email"
              >
                <Mail className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Legal Subtext */}
          <p className="text-[10px] text-slate-400 text-center leading-tight">
            By proceeding, you agree to Orbit &amp; MakeMyTrip&apos;s{' '}
            <span className="text-[#0084FF] underline cursor-pointer">Privacy Policy</span>,{' '}
            <span className="text-[#0084FF] underline cursor-pointer">User Agreement</span> and{' '}
            <span className="text-[#0084FF] underline cursor-pointer">T&amp;Cs</span>.
          </p>

        </div>

      </div>
    </div>
  );
}
