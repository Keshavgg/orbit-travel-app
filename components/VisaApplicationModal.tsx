'use client';

import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Lock,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  QrCode,
  Download,
  Share2,
  Calendar,
  Plane,
  Building2,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface VisaApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: string;
  flag: string;
  govtFee: number;
  platformFee: number;
  timeline: string;
  onComplete: (summary: string) => void;
}

export default function VisaApplicationModal({
  isOpen,
  onClose,
  country,
  flag,
  govtFee,
  platformFee,
  timeline,
  onComplete,
}: VisaApplicationModalProps) {
  // Steps: 1: Travellers & Dates, 2: Passport OCR, 3: AI Photo Studio, 4: Flight/Hotel Itinerary, 5: Review & 1-Tap Pay, 6: Live WhatsApp Radar
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isFamilyPass, setIsFamilyPass] = useState(true);
  const [departureDate, setDepartureDate] = useState('24 Oct 2026');
  const [returnDate, setReturnDate] = useState('02 Nov 2026');
  
  const [applicants, setApplicants] = useState([
    { name: 'Rahul Sharma', passport: 'Z8912401', relation: 'Primary (Self)', dob: '14/08/1994', gender: 'Male', expiry: '22/05/2032' },
    { name: 'Pooja Sharma', passport: 'Z8912402', relation: 'Spouse', dob: '19/11/1996', gender: 'Female', expiry: '10/09/2033' },
  ]);
  const [newApplicantName, setNewApplicantName] = useState('');
  const [includeGst, setIncludeGst] = useState(false);
  const [dummyItineraryOption, setDummyItineraryOption] = useState<'free_orbit' | 'own'>('free_orbit');
  
  // AI Photo Studio State
  const [photoBackgroundMode, setPhotoBackgroundMode] = useState<'ai_white' | 'original'>('ai_white');
  
  // Payment & Live Radar State
  const [isPaying, setIsPaying] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [showSampleVisaPdf, setShowSampleVisaPdf] = useState(false);

  if (!isOpen) return null;

  const totalPlatformFee = isFamilyPass ? 499 : 299 * applicants.length;
  const totalGovtFee = govtFee * applicants.length;
  const totalAmount = totalGovtFee + totalPlatformFee;
  const atlysMarketPrice = 1800 * applicants.length + totalGovtFee;
  const savingsVsAtlys = atlysMarketPrice - totalAmount;

  const handleAddApplicant = () => {
    if (!newApplicantName.trim()) return;
    if (applicants.length >= 6) return;
    setApplicants((prev) => [
      ...prev,
      { 
        name: newApplicantName, 
        passport: `Z${Math.floor(1000000 + Math.random() * 9000000)}`, 
        relation: 'Family Member',
        dob: '12/03/1998',
        gender: 'Other',
        expiry: '15/06/2034'
      },
    ]);
    setNewApplicantName('');
  };

  const handleRemoveApplicant = (idx: number) => {
    if (applicants.length <= 1) return;
    setApplicants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompleteVisaPayment = async (method: string) => {
    setIsPaying(true);
    let bId = `ATLYS-ORB-${country.slice(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_slug: country.toLowerCase(),
          trip_title: `${country} Official Express eVisa (${applicants.length} Applicants)`,
          destination_key: country.toLowerCase(),
          travel_date: departureDate,
          travelers_count: applicants.length,
          total_amount: totalAmount,
          payment_method: method || 'UPI_ATLYS_EXPRESS',
          user_name: applicants[0].name,
          user_email: 'rahul@travel.in',
          user_phone: '+91 98101 23456',
          gstin: includeGst ? '07AAAAA0000A1Z5' : undefined,
          company_name: includeGst ? 'Sharma Tech Enterprises' : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking_id) bId = data.booking_id;
      }
    } catch (err) {
      console.warn('Booking API error for Visa, using local fallback:', err);
    }

    setConfirmedBookingId(bId);
    setIsPaying(false);
    setStep(6); // Move directly to Atlys Live Radar screen
  };

  const handleFinishAndClose = () => {
    onComplete(
      `${country} Visa for ${applicants.length} travellers (${applicants.map(a => a.name).join(', ')}) confirmed. Reference: ${confirmedBookingId || 'ORB-VISA-CONFIRMED'}. Total: ₹${totalAmount.toLocaleString()}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 text-slate-900 shadow-2xl border border-slate-200 modal-panel-enter relative my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        
        {/* Top Header with Country & Guarantee */}
        <div className="border-b border-slate-100 pb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <span className="text-4xl shrink-0">{flag}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-slate-900">{country} eVisa Express</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  ⚡ {timeline}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Atlys Guarantee: 100% On-Time or Full Refund · Flat ₹499 Family Cap</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Atlys Step Progress Pills */}
        <div className="grid grid-cols-6 gap-1.5 text-center text-[9px] font-mono font-black uppercase tracking-wider">
          <div className={`p-1.5 rounded-xl transition ${step >= 1 ? 'bg-blue-50 text-[#0084FF] border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
            1. Dates
          </div>
          <div className={`p-1.5 rounded-xl transition ${step >= 2 ? 'bg-blue-50 text-[#0084FF] border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
            2. OCR
          </div>
          <div className={`p-1.5 rounded-xl transition ${step >= 3 ? 'bg-blue-50 text-[#0084FF] border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
            3. Photo
          </div>
          <div className={`p-1.5 rounded-xl transition ${step >= 4 ? 'bg-blue-50 text-[#0084FF] border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
            4. Flight
          </div>
          <div className={`p-1.5 rounded-xl transition ${step >= 5 ? 'bg-blue-50 text-[#0084FF] border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
            5. Pay
          </div>
          <div className={`p-1.5 rounded-xl transition ${step >= 6 ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50 text-slate-400'}`}>
            6. Radar
          </div>
        </div>

        {/* ── STEP 1: TRAVEL DATES & APPLICANT ROSTER ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Travel Dates Picker Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0084FF]" /> Entry Date
                </span>
                <input
                  type="text"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="font-black text-slate-900 text-sm bg-transparent mt-1 focus:outline-none w-full"
                />
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0084FF]" /> Exit Date
                </span>
                <input
                  type="text"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="font-black text-slate-900 text-sm bg-transparent mt-1 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Solo vs Flat ₹499 Family Pass Switch */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsFamilyPass(false)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  !isFamilyPass
                    ? 'border-[#0084FF] bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <div className="font-black text-slate-900 text-xs">Solo Traveller</div>
                <div className="text-[11px] text-slate-500 font-medium">₹299 platform fee</div>
              </button>

              <button
                type="button"
                onClick={() => setIsFamilyPass(true)}
                className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden cursor-pointer ${
                  isFamilyPass
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-bl">
                  POPULAR
                </span>
                <div className="font-black text-slate-900 text-xs">Flat ₹499 Family Pass</div>
                <div className="text-[11px] text-emerald-700 font-bold">Up to 6 Travellers</div>
              </button>
            </div>

            {/* Atlys Price Comparison Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">You Save With Orbit vs Atlys:</span>
                <div className="text-sm font-black text-emerald-950">
                  Save ₹{savingsVsAtlys.toLocaleString()} on Platform Fees
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 line-through">₹{atlysMarketPrice.toLocaleString()} on Atlys</span>
                <div className="text-lg font-black text-emerald-700">₹{totalAmount.toLocaleString()} Total</div>
              </div>
            </div>

            {/* Applicants List */}
            <div className="space-y-2">
              <div className="font-extrabold text-slate-800 flex items-center justify-between">
                <span>Travellers Included ({applicants.length}/6):</span>
                <span className="text-[10px] text-slate-500">Auto-filled via Passport OCR</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto thin-scrollbar pr-1">
                {applicants.map((a, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#0084FF]/10 text-[#0084FF] flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{a.name}</div>
                        <div className="text-[10px] text-slate-500">{a.relation} · Passport: {a.passport} · DOB: {a.dob}</div>
                      </div>
                    </div>
                    {applicants.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveApplicant(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Member Input */}
              {applicants.length < 6 && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Enter Family Member Name..."
                    value={newApplicantName}
                    onChange={(e) => setNewApplicantName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddApplicant()}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0084FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddApplicant}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 font-bold text-slate-700 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer btn-press"
            >
              <span>Continue to Atlys AI Passport OCR ➔</span>
            </button>
          </div>
        )}

        {/* ── STEP 2: ATLYS AI PASSPORT OCR SCANNER ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#0084FF] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Atlys Computer-Vision OCR Engine
              </span>
              <h4 className="text-lg font-black text-slate-900">AI Passport Data Extraction</h4>
              <p className="text-slate-500">Live scanning front bio-page, verifying MRZ checksum &amp; 6-month validity</p>
            </div>

            {/* Passport Scanner Simulation Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 p-5 text-center text-white">
              <div className="relative mx-auto w-64 h-36 rounded-xl bg-slate-800 border-2 border-dashed border-cyan-400 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                {/* Simulated Green Laser Scanning Line */}
                <div className="scan-laser-line"></div>

                <div className="text-3xl mb-1">🛂</div>
                <div className="font-extrabold text-white text-xs">Republic of India Passport</div>
                <div className="text-[10px] font-mono text-cyan-300 font-bold mt-1">P&lt;INDSHARMA&lt;&lt;RAHUL&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>MRZ Checksum: Validated 100%</span>
                </div>
              </div>

              {/* Live Biometric Audit Badges */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-left text-[11px] text-slate-800">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <b className="text-slate-900 block">Lighting &amp; Glare</b>
                    <span className="text-emerald-700 text-[10px]">Zero glare detected</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <b className="text-slate-900 block">6-Month Validity</b>
                    <span className="text-emerald-700 text-[10px]">Valid till 22 May 2032</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Fields Confirmation Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-400">Verified Fields (Rahul Sharma):</div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Given Name</span>
                  <strong className="text-slate-900">Rahul</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Surname</span>
                  <strong className="text-slate-900">Sharma</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Passport No.</span>
                  <strong className="text-[#0084FF]">Z8912401</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Nationality</span>
                  <strong className="text-slate-900">Indian 🇮🇳</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">DOB</span>
                  <strong className="text-slate-900">14/08/1994</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Expiry</span>
                  <strong className="text-emerald-700">22/05/2032</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer btn-press"
              >
                <span>Continue to Atlys AI Photo Studio ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: ATLYS AI PHOTO STUDIO & BIOMETRIC VALIDATOR ── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Atlys Magic Photo Background Eraser
              </span>
              <h4 className="text-lg font-black text-slate-900">Embassy Photo Studio</h4>
              <p className="text-slate-500">Snap a regular selfie against any wall — AI converts it into pure embassy white</p>
            </div>

            {/* Interactive Photo Background Eraser Toggle Box */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPhotoBackgroundMode('original')}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                    photoBackgroundMode === 'original'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Original Wall Selfie
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoBackgroundMode('ai_white')}
                  className={`px-3 py-1.5 rounded-xl border font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
                    photoBackgroundMode === 'ai_white'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Atlys AI Studio (#FFFFFF)</span>
                </button>
              </div>

              {/* Photo Comparison Display */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="relative w-32 h-40 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md flex items-center justify-center transition-all">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                    alt="Applicant Biometric Portrait"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      photoBackgroundMode === 'ai_white' ? 'filter contrast-105 brightness-105' : 'filter saturate-75'
                    }`}
                  />
                  {photoBackgroundMode === 'ai_white' && (
                    <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                      ✓ 35x45mm Valid
                    </span>
                  )}
                </div>

                {/* 4-Point Biometric Audit Checklist */}
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Face Centered &amp; Eyes Open (99.4%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Pure White Background (#FFFFFF)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Neutral Expression &amp; No Glare</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Standard Embassy 35x45mm Ratio</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer btn-press"
              >
                <span>Continue to Flight &amp; Hotel Itinerary ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: FLIGHT & HOTEL ITINERARY GENERATOR ── */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#0084FF] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Orbit Zero-Risk Visa Feature
              </span>
              <h4 className="text-lg font-black text-slate-900">Flight &amp; Hotel Proof for Embassy</h4>
              <p className="text-slate-500">Never risk buying non-refundable flight tickets before your visa is approved</p>
            </div>

            <div className="space-y-3">
              {/* Option A: Orbit Free Embassy Itinerary */}
              <div 
                onClick={() => setDummyItineraryOption('free_orbit')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3 ${
                  dummyItineraryOption === 'free_orbit'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  dummyItineraryOption === 'free_orbit' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {dummyItineraryOption === 'free_orbit' && <Check className="w-3 h-3" />}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-black">
                      ✨ Generate Free Verified Dummy Flight &amp; Hotel Itinerary
                    </strong>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      ₹0 FREE (Save ₹1,200)
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    We generate official Thai Airways / Emirates PNR reservations and hotel vouchers compliant with embassy requirements. Zero financial risk.
                  </p>
                  <div className="pt-1 text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1.5">
                    <span>PNR: 6E-MMT-VISA-PROOF</span>
                    <span>•</span>
                    <span>Hotel: Grand Hyatt Bangkok (Voucher Active)</span>
                  </div>
                </div>
              </div>

              {/* Option B: Already have flights */}
              <div 
                onClick={() => setDummyItineraryOption('own')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3 ${
                  dummyItineraryOption === 'own'
                    ? 'border-[#0084FF] bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  dummyItineraryOption === 'own' ? 'border-[#0084FF] bg-[#0084FF] text-white' : 'border-slate-300'
                }`}>
                  {dummyItineraryOption === 'own' && <Check className="w-3 h-3" />}
                </div>
                <div className="space-y-1 flex-1">
                  <strong className="text-slate-900 font-black">
                    I Already Booked Flight Tickets on Orbit / MakeMyTrip
                  </strong>
                  <p className="text-slate-500 text-[11px]">
                    We will automatically sync your confirmed Orbit flight PNR and hotel vouchers to your visa file.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="flex-1 py-3.5 bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer btn-press"
              >
                <span>Proceed to Review &amp; 1-Tap Pay ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: REVIEW & 1-TAP PAYMENT ── */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Order Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>{country} Govt Embassy Fee ({applicants.length}x ₹{govtFee.toLocaleString()}):</span>
                <span className="font-mono text-slate-900 font-bold">₹{totalGovtFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 items-center">
                <span className="flex items-center gap-1.5">
                  <span>Orbit Flat Family Service Cap:</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">₹499 Flat</span>
                </span>
                <span className="font-mono text-emerald-700 font-bold">₹{totalPlatformFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Free Embassy Flight &amp; Hotel Itinerary:</span>
                <span className="font-mono text-emerald-700 font-bold">₹0 Free</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm">
                <div>
                  <span className="font-black text-slate-900">Total Payable:</span>
                  <div className="text-[10px] text-emerald-700 font-bold">Save ₹{savingsVsAtlys.toLocaleString()} vs Atlys</div>
                </div>
                <strong className="text-2xl font-black text-[#0084FF] font-mono">₹{totalAmount.toLocaleString()}</strong>
              </div>
            </div>

            {/* GSTIN Toggle */}
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer">
              <input
                type="checkbox"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
                className="w-4 h-4 rounded text-[#0084FF] focus:ring-0 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-extrabold text-slate-800 block">Claim 18% GST Input Tax Credit (ITC)</span>
                <span className="text-[10px] text-slate-500 font-medium">Auto-bill to Sharma Tech Enterprises (07AAAAA0000A1Z5)</span>
              </div>
            </label>

            {/* UPI Buttons */}
            <div className="space-y-2">
              <div className="text-slate-700 font-extrabold flex items-center justify-between">
                <span>Pay via 1-Tap UPI:</span>
                <span className="text-[10px] text-emerald-700 font-bold">Zero Transaction Fees</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={() => handleCompleteVisaPayment('Google Pay')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0084FF] hover:bg-blue-50 flex items-center justify-between font-bold text-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>🇬 Google Pay</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={() => handleCompleteVisaPayment('PhonePe')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0084FF] hover:bg-blue-50 flex items-center justify-between font-bold text-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>🟣 PhonePe</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isPaying}
                onClick={() => handleCompleteVisaPayment('Instant UPI')}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer btn-press disabled:opacity-75"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>LODGING APPLICATION...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount.toLocaleString()} &amp; Submit Visa</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: ATLYS SIGNATURE LIVE WHATSAPP MILESTONE RADAR ── */}
        {step === 6 && (
          <div className="space-y-4 animate-fade-in text-xs py-1 select-none">
            {/* Top Confirmed Status Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Application Successfully Lodged!
              </h3>
              <p className="text-slate-600 text-xs max-w-sm mx-auto">
                Official reference issued. Live status dispatched to your WhatsApp (+91 98101 23456).
              </p>
              <div className="inline-block px-3 py-1 bg-white rounded-full border border-emerald-300 font-mono font-black text-xs text-emerald-800 shadow-xs">
                Ref: {confirmedBookingId || `ATLYS-ORB-TH-${Math.floor(100000 + Math.random() * 900000)}`}
              </div>
            </div>

            {/* Atlys Signature 4-Stage Animated Milestone Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-sm">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Atlys Milestone Radar Timeline:
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                
                {/* Stage 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-xs font-black">1. Application Lodged &amp; AI Pre-Checked</strong>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">Just Now</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      MRZ checksum verified, passport photo formatted to 35x45mm white studio backdrop.
                    </div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#0084FF] border-2 border-white shadow flex items-center justify-center text-white animate-pulse">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className="text-[#0084FF] text-xs font-black">2. Licensed Immigration Officer Audit</strong>
                      <span className="text-[10px] font-mono text-[#0084FF] font-bold">In Progress · &lt;2h</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Senior immigration officer verifying document checklist against Royal Embassy directives.
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="relative opacity-60">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-700 text-xs font-bold">3. Submission to Ministry of Foreign Affairs</strong>
                      <span className="text-[10px] font-mono text-slate-400 font-medium">Tomorrow 10:00 AM</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Lodged into official immigration consular portal.
                    </div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="relative opacity-60">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-700 text-xs font-bold">4. Approved eVisa PDF Dispatched to WhatsApp</strong>
                      <span className="text-[10px] font-mono text-slate-400 font-medium">{timeline}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Downloadable PDF with official embassy QR code sent to WhatsApp and email.
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSampleVisaPdf(true)}
                className="py-3 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#0084FF]" />
                <span>Preview Approved eVisa PDF</span>
              </button>

              <button
                type="button"
                onClick={handleFinishAndClose}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Done &amp; Close ➔</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── SAMPLE APPROVED EVISA PDF MODAL ── */}
      {showSampleVisaPdf && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4 text-xs font-sans">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{flag}</span>
                <div>
                  <h4 className="text-sm font-black uppercase text-slate-900">
                    Official Electronic Visa (eVisa)
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">
                    Embassy Reference: {confirmedBookingId || 'TH-VISA-948102'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowSampleVisaPdf(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual eVisa Pass */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-dashed border-amber-300 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-800">Visa Type:</span>
                  <div className="font-black text-slate-900">TOURIST EVISA - SINGLE ENTRY</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-amber-800">Status:</span>
                  <div className="font-black text-emerald-700">✓ ISSUED &amp; VERIFIED</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 font-sans block">Applicant Name:</span>
                  <strong>Rahul Sharma</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-sans block">Passport Number:</span>
                  <strong>Z8912401</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-sans block">Valid From:</span>
                  <strong>24 Oct 2026</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-sans block">Valid Until:</span>
                  <strong>23 Jan 2027</strong>
                </div>
              </div>

              <div className="border-t border-amber-200 pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white p-1 rounded border border-amber-300 flex items-center justify-center font-mono text-[8px] text-center">
                    [QR CODE PASS]
                  </div>
                  <div className="text-[10px] text-slate-600">
                    <div>Scannable at ICAO e-Gates</div>
                    <div className="text-emerald-700 font-bold">Suvarnabhumi Airport (BKK)</div>
                  </div>
                </div>
                <div className="text-right text-[9px] text-slate-400 font-mono">
                  Royal Thai Embassy<br />New Delhi
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSampleVisaPdf(false)}
              className="w-full py-2.5 bg-[#0084FF] text-white text-xs font-black rounded-xl hover:bg-blue-600 transition"
            >
              Back to Live Tracker
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
