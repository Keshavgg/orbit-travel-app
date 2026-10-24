'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Clock, 
  Sparkles, 
  Camera, 
  UploadCloud, 
  FileText, 
  Lock, 
  AlertCircle, 
  Search,
  CheckCircle2,
  Trash2,
  X,
  Zap,
  Globe
} from 'lucide-react';
import VisaApplicationModal from './VisaApplicationModal';

export interface VisaCountry {
  id: string;
  country: string;
  flag: string;
  timeline: string;
  approval: string;
  govtFee: number;
  platformFee: number;
  image: string;
  docs: string[];
  features: string[];
  cityKey: string;
  category: string;
}

export const POPULAR_VISAS: VisaCountry[] = [
  {
    id: 'v1',
    country: 'Thailand',
    flag: '🇹🇭',
    timeline: '24-48 Hours',
    approval: '99.4% Approved',
    govtFee: 2150,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
    docs: ['Passport Front & Back Scan', 'White Background Passport Photo', 'Return Flight Itinerary'],
    features: ['No Embassy Visit Required', 'Instant WhatsApp Updates', 'Guaranteed on-time or 100% refund'],
    cityKey: 'thailand',
    category: 'eVisa on Arrival'
  },
  {
    id: 'v2',
    country: 'Dubai / UAE',
    flag: '🇦🇪',
    timeline: '24 Hours Guaranteed',
    approval: '99.1% Approved',
    govtFee: 5690,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    docs: ['Passport Bio-Page Scan', 'Colored Passport Photo (JPEG)'],
    features: ['Express 24h Approval', 'Valid for 30 Days Stay', 'Flat ₹499 Family Cap'],
    cityKey: 'dubai',
    category: 'Tourist eVisa'
  },
  {
    id: 'v3',
    country: 'Vietnam',
    flag: '🇻🇳',
    timeline: '3 Working Days',
    approval: '99.6% Approved',
    govtFee: 2100,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    docs: ['Passport Bio-Page Scan', 'Portrait Photo (No glasses)'],
    features: ['Direct Immigration Link', 'Multiple Entry Available', 'Official Embassy PDF'],
    cityKey: 'vietnam',
    category: 'Official eVisa'
  },
  {
    id: 'v4',
    country: 'Bali (Indonesia)',
    flag: '🇮🇩',
    timeline: '1-2 Hours (Instant)',
    approval: '99.8% Approved',
    govtFee: 2850,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    docs: ['Passport Cover & Bio Page', 'Confirmed Return Flight'],
    features: ['Fast-track Airport Line', 'Instant QR on WhatsApp', 'Skip the Bali Airport Queue'],
    cityKey: 'bali',
    category: 'Electronic VoA'
  },
  {
    id: 'v5',
    country: 'Singapore',
    flag: '🇸🇬',
    timeline: '3-4 Working Days',
    approval: '98.8% Approved',
    govtFee: 2600,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
    docs: ['Passport Front & Back', 'White Background Photo', 'Form 14A Auto-Filled'],
    features: ['Authorized Visa Agent Verification', '2-Year Multiple Entry', 'No physical submission needed'],
    cityKey: 'delhi',
    category: 'e-Visa Multi Entry'
  },
  {
    id: 'v6',
    country: 'Schengen (Europe)',
    flag: '🇪🇺',
    timeline: '10-15 Working Days',
    approval: '97.2% Approved',
    govtFee: 7800,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80',
    docs: ['Passport Scan', 'Bank Statements (6 Mo)', 'Cover Letter & Itinerary Generator'],
    features: ['AI VFS Appointment Bot', 'Auto Dummy Tickets Included', 'Expert Document Audit'],
    cityKey: 'delhi',
    category: 'Consulate Tourist Visa'
  }
];

interface MakeMyTripVisaBookingProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  activeCityKey?: string;
}

export default function MakeMyTripVisaBooking({
  onSelectToCart,
  onFocusCity,
  activeCityKey = 'thailand',
}: MakeMyTripVisaBookingProps) {
  const [selectedCountry, setSelectedCountry] = useState(POPULAR_VISAS[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [activeVisaModal, setActiveVisaModal] = useState<VisaCountry | null>(null);

  const handleSelectCountry = (country: VisaCountry) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    onFocusCity(country.cityKey);
  };

  const handleApplyClick = (country: VisaCountry) => {
    setActiveVisaModal(country);
    onFocusCity(country.cityKey);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ── 1. PROMINENT MAKEMYTRIP / ATLYS VISA SEARCH BAR ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/10 border border-slate-200 space-y-5">
        
        {/* Top Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-extrabold text-slate-800">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-800 border border-emerald-300 rounded-full font-black text-xs">
              🛂 Visas (Atlys Flow)
            </span>
            <span className="text-slate-500 font-medium hidden sm:inline">
              Guaranteed On-Time Approval or 100% Full Refund · Flat ₹499 Family Cap
            </span>
          </div>

          <div className="text-xs text-blue-600 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0084FF]" />
            <span>AI Passport OCR &amp; Instant Photo Background Remover</span>
          </div>
        </div>

        {/* ── Segmented Search Inputs Grid ── */}
        <div className="border border-slate-200 rounded-2xl overflow-visible grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/50">
          
          {/* Destination Country Box */}
          <div 
            className="md:col-span-4 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer relative group"
            onClick={() => setIsCountryOpen(!isCountryOpen)}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Destination Country</span>
              <span className="text-[10px] text-blue-600 group-hover:underline font-extrabold">Change ▾</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-baseline gap-2">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.country}</span>
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {selectedCountry.category} · {selectedCountry.timeline}
            </div>

            {/* Dropdown Menu */}
            {isCountryOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-800 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Select Destination Country</span>
                  <Globe className="w-3.5 h-3.5 text-[#0084FF]" />
                </div>
                <div className="mt-1 space-y-1">
                  {POPULAR_VISAS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCountry(c)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left hover:bg-blue-50 hover:text-[#0084FF] transition"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{c.flag}</span>
                        <div>
                          <div className="text-slate-900 font-extrabold">{c.country}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{c.timeline} · {c.approval}</div>
                        </div>
                      </div>
                      {selectedCountry.id === c.id && <Check className="w-4 h-4 text-[#0084FF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nationality Box */}
          <div className="md:col-span-3 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Citizen / Nationality</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>🇮🇳 Indian</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">Valid Passport (6+ Months)</div>
          </div>

          {/* Processing Timeline Box */}
          <div className="md:col-span-3 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Turnaround Guarantee</span>
              <Clock className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {selectedCountry.timeline}
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-0.5">99.4% On-time Success Rate</div>
          </div>

          {/* Family Cap Fee Box */}
          <div className="md:col-span-2 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Platform Fee</span>
              <Users className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1 font-mono">
              ₹499 <span className="text-xs font-normal text-slate-500">Cap</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">For Entire Family</div>
          </div>

        </div>

        {/* ── Bottom Strip: Quick Country Selector Chips & Big Primary CTA ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 mr-1">Popular Visas:</span>
            
            {POPULAR_VISAS.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCountry(c)}
                className={`px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCountry.id === c.id
                    ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.country} ({c.timeline})</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleApplyClick(selectedCountry)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 btn-press cursor-pointer shrink-0"
          >
            <span>Apply Now ({selectedCountry.country})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── 2. ATLYS-STYLE VISA CARDS GRID ── */}
      <div className="space-y-4">
        
        {/* Results Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Express Tourist &amp; Business Visas</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                ⚡ 99.4% Approval Guarantee
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Zero embassy visits · AI document pre-check in 60s · Flat ₹499 fee capped for up to 6 family members
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <span className="text-slate-400">Atlys Disruption:</span>
            <span className="text-emerald-700 font-extrabold">Save ₹3,500+ vs Visa Agents</span>
          </div>
        </div>

        {/* Country Visa Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_VISAS.map((visa) => {
            const totalFee = visa.govtFee + visa.platformFee;

            return (
              <div
                key={visa.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Flag Header */}
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onFocusCity(visa.cityKey)}>
                    <img 
                      src={visa.image} 
                      alt={visa.country}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-black shadow-md flex items-center gap-1.5">
                        <span className="text-base">{visa.flag}</span>
                        <span>{visa.country}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                        ⚡ {visa.timeline}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-extrabold">{visa.category}</span>
                      <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/30">
                        {visa.approval}
                      </span>
                    </div>
                  </div>

                  {/* Body: Requirements & Inclusions */}
                  <div className="p-5 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Required Documents (Zero Paperwork):
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {visa.docs.map((doc, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                          <span className="font-medium">{doc}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                      {visa.features.map((f, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-blue-700 font-bold">
                          <span>●</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Price & Apply Button */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Govt ₹{visa.govtFee.toLocaleString()} + Atlys ₹{visa.platformFee}
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                      ₹{totalFee.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ person</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Flat ₹499 cap for whole family
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyClick(visa)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5 btn-press cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ── 3. ATLYS 4-STEP DOCUMENT UPLOAD & OCR VERIFICATION MODAL ── */}
      {activeVisaModal && (
        <VisaApplicationModal
          isOpen={!!activeVisaModal}
          onClose={() => setActiveVisaModal(null)}
          country={activeVisaModal.country}
          flag={activeVisaModal.flag}
          govtFee={activeVisaModal.govtFee}
          platformFee={activeVisaModal.platformFee}
          timeline={activeVisaModal.timeline}
          onComplete={(summary) => {
            setActiveVisaModal(null);
          }}
        />
      )}

    </div>
  );
}
