'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  Zap, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MakeMyTripAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (phone: string, accountType: 'personal' | 'mybiz') => void;
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
  const { loginWithOtp, loginDemo, sendOtp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<'personal' | 'mybiz'>('personal');
  const [phone, setPhone] = useState('9810123456');
  const [otp, setOtp] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await sendOtp(phone);
      setDemoOtpHint(res.demo_otp || '1234');
      setStep(2);
    } catch {
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    const otpToVerify = customOtp || otp;
    if (!otpToVerify || otpToVerify.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit OTP.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const success = await loginWithOtp(phone, otpToVerify, accountType);
      if (success) {
        onSuccess?.(phone.startsWith('+') ? phone : `+91 ${phone}`, accountType);
        handleClose();
      } else {
        setErrorMessage('Invalid OTP code. Please use 1234.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Try demo code 1234.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoOneClick = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginDemo();
      onSuccess?.('+91 9810123456', accountType);
      handleClose();
    } catch {
      onSuccess?.('+91 9810123456', accountType);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setOtp('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none">
      {/* Split 2-Column MakeMyTrip Card Exactly like Screenshot */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row modal-panel-enter border border-slate-200">
        
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
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
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-white">
          
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
              className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                accountType === 'mybiz'
                  ? 'bg-[#0084FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>MYBIZ ACCOUNT</span>
              <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-black">
                GST
              </span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            /* ── STEP 1: MOBILE ENTRY & 1-CLICK DEMO ── */
            <div className="space-y-4">
              {/* 1-Click Demo Login Button (Instant) */}
              <button
                type="button"
                onClick={handleDemoOneClick}
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-cyan-500/15 border-2 border-amber-400/60 hover:border-amber-500 text-slate-900 font-black text-xs flex items-center justify-between group transition-all shadow-sm active:scale-98"
              >
                <div className="flex items-center space-x-2 text-left">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
                    ⚡
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-slate-900 leading-tight">
                      Continue as Keshav Jindal (Demo)
                    </div>
                    <div className="text-[9px] text-amber-700 font-bold leading-none">
                      Titanium Elite Member · 1-Click Instant Login
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-400/30 text-amber-800 px-2 py-0.5 rounded-full font-black">
                  SKIP OTP ➔
                </span>
              </button>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter Mobile Number"
                      maxLength={10}
                      required
                      autoFocus
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
                      <span>CONTINUE WITH OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Or Login/Signup With */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Or Login With
                  </span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    onClick={handleDemoOneClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
                    title="Login with Google"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoOneClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
                    title="Login with Email"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── STEP 2: 4-DIGIT OTP VERIFICATION ── */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    Verify with 4-Digit OTP
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Sent to <span className="font-bold text-slate-800">+91 {phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#0084FF] hover:underline font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Demo OTP Helper Callout */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#0084FF]" />
                  <div>
                    <div className="text-[11px] font-bold text-blue-900">
                      Demo OTP Code: <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-blue-300 text-blue-700">{demoOtpHint}</span>
                    </div>
                    <div className="text-[9px] text-blue-600 font-medium">Use demo code to verify instantly</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtp('1234');
                    handleVerifyOtp(undefined, '1234');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0084FF] hover:bg-[#0070db] text-white text-[10px] font-black uppercase shadow-xs transition active:scale-95 shrink-0"
                >
                  ✨ Auto-Fill
                </button>
              </div>

              {/* OTP Input Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter 4-Digit Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="• • • •"
                    maxLength={4}
                    autoFocus
                    required
                    className="w-full text-center tracking-[1em] text-2xl font-black text-slate-900 py-3 border-2 border-slate-300 rounded-xl focus:border-[#0084FF] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 4}
                className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 btn-press ${
                  otp.length === 4
                    ? 'bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white shadow-lg shadow-blue-500/30 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY &amp; PROCEED</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="font-bold text-[#0084FF] hover:underline"
                >
                  Resend OTP (1234)
                </button>
              </div>
            </form>
          )}

          {/* Legal Subtext */}
          <p className="text-[10px] text-slate-400 text-center leading-tight pt-1">
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
