'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Check, 
  Clock, 
  Plane, 
  Building2, 
  ShieldCheck, 
  FileCheck2, 
  Calendar, 
  X, 
  Zap, 
  TrendingUp, 
  MapPin, 
  CheckCircle2,
  Send,
  HelpCircle,
  Wifi
} from 'lucide-react';

interface OrbitAiCopilotProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  onSelectTab: (tab: string) => void;
  onOpenChatbot?: (initialQuery?: string) => void;
}

export interface AiTripPlan {
  destination: string;
  country: string;
  cityKey: string;
  duration: string;
  totalPrice: string;
  savings: string;
  flight: {
    airline: string;
    route: string;
    time: string;
    farePrediction: string;
    confidence: string;
  };
  stay: {
    name: string;
    room: string;
    perks: string[];
  };
  visa: {
    status: string;
    fee: string;
    timeline: string;
  };
  esim: {
    data: string;
    cost: string;
  };
  itinerary: {
    day: string;
    title: string;
    activities: string[];
  }[];
}

const PRESET_PLANS: Record<string, AiTripPlan> = {
  goa: {
    destination: 'Goa Coastal Getaway',
    country: 'India',
    cityKey: 'goa',
    duration: '4 Days / 3 Nights',
    totalPrice: '₹14,899',
    savings: 'Save ₹6,200 vs MMT',
    flight: {
      airline: 'IndiGo Direct Flight',
      route: 'DEL ➔ GOI (Non-Stop)',
      time: '06:15 AM Dep · 2h 35m',
      farePrediction: 'Lowest fare in 30 days · Predicted to jump +₹1,200 in 12h',
      confidence: '94% AI Confidence'
    },
    stay: {
      name: 'Candolim Sunset Luxury Beachfront Villa',
      room: 'Private Pool Villa with Garden Gazebo',
      perks: ['Breakfast buffet included', 'Complimentary beach transfers', 'Chef on call']
    },
    visa: {
      status: 'Domestic · No Visa Required',
      fee: '₹0',
      timeline: 'Instant'
    },
    esim: {
      data: 'Unlimited 5G Data Included',
      cost: '₹0'
    },
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Sunset Cruise', activities: ['Morning arrival at MOPA airport', 'Private cab to Candolim villa', 'Sunset catamaran cruise at Mandovi'] },
      { day: 'Day 2', title: 'Private Beach & Water Sports', activities: ['Complimentary floating breakfast', 'Parasailing & Jet-ski at Calangute', 'Beachside candlelight dinner'] },
      { day: 'Day 3', title: 'Old Goa Heritage & Spice Plantation', activities: ['Basilica of Bom Jesus walking tour', 'Organic spice plantation lunch & elephant bath', 'Night market shopping'] },
      { day: 'Day 4', title: 'Brunch & Return Departure', activities: ['Lazy poolside morning brunch', 'Souvenir shopping at Panjim Latin quarter', 'Evening return flight to Delhi'] }
    ]
  },
  thailand: {
    destination: 'Bangkok & Phuket Tropical Escape',
    country: 'Thailand',
    cityKey: 'thailand',
    duration: '5 Days / 4 Nights',
    totalPrice: '₹28,999',
    savings: 'Save ₹9,500 with Flat ₹499 Visa Cap',
    flight: {
      airline: 'Thai Airways Royal Silk / Direct',
      route: 'DEL ➔ BKK (Suvarnabhumi)',
      time: '11:40 AM Dep · 4h 15m',
      farePrediction: 'Distressed airline block booked · Price locked',
      confidence: '96% AI Confidence'
    },
    stay: {
      name: 'Anantara Riverside 5-Star Resort & Spa',
      room: 'Chao Phraya River View Luxury Suite',
      perks: ['Daily international buffet breakfast', 'Complimentary river shuttle', 'Spa discount voucher']
    },
    visa: {
      status: '30-Day Express Tourist eVisa',
      fee: 'Govt Fee + Flat ₹499 Family Cap (Save ₹3,500 vs agents)',
      timeline: 'Guaranteed 24-48h Approval'
    },
    esim: {
      data: '10GB High-Speed Asia eSIM QR',
      cost: 'Free 1GB + Top-up Included'
    },
    itinerary: [
      { day: 'Day 1', title: 'Bangkok Arrival & Rooftop Welcome', activities: ['Fast-track airport clearance', 'Private transfer to Anantara resort', 'Mahanakhon SkyWalk sunset drink'] },
      { day: 'Day 2', title: 'Grand Palace & Floating Markets', activities: ['Wat Pho & Grand Palace tour', 'Damnoen Saduak floating market boat ride', 'Chao Phraya luxury dinner cruise'] },
      { day: 'Day 3', title: 'Island Hop or Phuket Transfer', activities: ['Speedboat tour to Coral Island', 'Snorkeling & private beach lunch', 'Patong Night Market exploration'] },
      { day: 'Day 4', title: 'Spa & Luxury Shopping', activities: ['Traditional 90-min Thai herbal massage', 'Shopping at ICONSIAM & Siam Paragon', 'Michelin-starred street food dinner'] },
      { day: 'Day 5', title: 'Return Flight to Delhi', activities: ['Hotel breakfast & airport transfer', 'Duty-free shopping', 'Direct evening flight home'] }
    ]
  },
  dubai: {
    destination: 'Dubai 24h Express Luxury Escape',
    country: 'United Arab Emirates',
    cityKey: 'dubai',
    duration: '4 Days / 3 Nights',
    totalPrice: '₹34,500',
    savings: 'Save ₹8,400 with 18% Corporate ITC',
    flight: {
      airline: 'Emirates Direct Flight',
      route: 'DEL ➔ DXB (Terminal 3)',
      time: '04:10 AM Dep · 3h 45m',
      farePrediction: 'Early-bird corporate fare · Buy now',
      confidence: '91% AI Confidence'
    },
    stay: {
      name: 'JW Marriott Marquis Dubai',
      room: 'Deluxe Skyline View Room',
      perks: ['Complimentary breakfast', 'Free Burj Khalifa lounge access', 'Airport pickup']
    },
    visa: {
      status: '30-Day Dubai eVisa Express',
      fee: 'Govt Fee + Flat ₹499 Family Cap',
      timeline: '24 Hours Guaranteed'
    },
    esim: {
      data: '5GB UAE Du/Etisalat eSIM QR',
      cost: 'Instant Delivery on WhatsApp'
    },
    itinerary: [
      { day: 'Day 1', title: 'Downtown Dubai & Burj Khalifa', activities: ['Marhaba VIP fast-track airport exit', 'Check-in to JW Marriott Marquis', '124th Floor Burj Khalifa sunset ticket'] },
      { day: 'Day 2', title: 'Desert Safari & BBQ Feast', activities: ['Morning Dubai Mall & Aquarium', '4x4 Dune bashing & camel ride', 'VIP desert camp dinner with belly dance'] },
      { day: 'Day 3', title: 'Marina Yacht & Palm Jumeirah', activities: ['Private 2-hour luxury yacht cruise', 'Atlantis Aquaventure waterpark', 'Dinner at Pier 7 Marina'] },
      { day: 'Day 4', title: 'Gold Souk & Evening Departure', activities: ['Traditional abra boat ride at Deira Creek', 'Duty-free gold & perfume shopping', 'Return flight to Delhi'] }
    ]
  },
  rishikesh: {
    destination: 'Rishikesh Rafting & Mountain Escape',
    country: 'India',
    cityKey: 'rishikesh',
    duration: '2 Days / 1 Night (Weekend <3h)',
    totalPrice: '₹3,499',
    savings: 'Flat ₹0 Hidden Fees · 53% Off',
    flight: {
      airline: 'Vande Bharat Express / Highway Direct',
      route: 'Delhi NCR ➔ Haridwar / Rishikesh',
      time: '3h 15m direct',
      farePrediction: 'Fastest weekend road/rail getaway',
      confidence: '99% AI Confidence'
    },
    stay: {
      name: 'Rishikesh Ganga Riverfront Glamping & Retreat',
      room: 'Luxury Swiss Air-Cooled Tent right on riverbed',
      perks: ['All 3 buffet meals included', '16km Ganga rafting session', 'Evening riverside bonfire & live music']
    },
    visa: {
      status: 'No Visa Needed · Domestic',
      fee: '₹0',
      timeline: 'Instant'
    },
    esim: {
      data: 'Domestic 5G Coverage',
      cost: '₹0'
    },
    itinerary: [
      { day: 'Day 1 (Saturday)', title: 'Drive In, Rafting & Bonfire', activities: ['Morning drive from Delhi NCR (2h 45m)', 'Check-in to riverside Swiss tent', '16km thrilling river rafting through rapids', 'Evening bonfire with acoustic guitar & BBQ snacks'] },
      { day: 'Day 2 (Sunday)', title: 'Cliff Jump, Aarti & Return', activities: ['Sunrise mountain yoga & Ganga view breakfast', 'Cliff jumping & body surfing', 'Visit Ram Jhula & attend evening Ganga Aarti', 'Comfortable return drive back to Delhi'] }
    ]
  }
};

export default function OrbitAiCopilot({
  onSelectToCart,
  onFocusCity,
  onSelectTab,
  onOpenChatbot,
}: OrbitAiCopilotProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<AiTripPlan | null>(null);
  const [showVisaPredictor, setShowVisaPredictor] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Visa Odds Predictor State
  const [predictorCountry, setPredictorCountry] = useState('Thailand');
  const [predictorBalance, setPredictorBalance] = useState('₹1L - ₹3L');
  const [predictorHistory, setPredictorHistory] = useState('1-2 Countries Visited');
  const [predictorResult, setPredictorResult] = useState<number | null>(null);

  const handleRunAiPrompt = (query: string) => {
    if (typeof window !== 'undefined') {
      window.open(`/chat?q=${encodeURIComponent(query)}`, '_blank');
      return;
    }
    const q = query.toLowerCase();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      if (q.includes('visa odds') || q.includes('approval') || q.includes('odds')) {
        setShowVisaPredictor(true);
        setActivePlan(null);
        return;
      }

      if (q.includes('thailand') || q.includes('bangkok') || q.includes('phuket')) {
        setActivePlan(PRESET_PLANS.thailand);
        onFocusCity('thailand');
      } else if (q.includes('dubai') || q.includes('uae')) {
        setActivePlan(PRESET_PLANS.dubai);
        onFocusCity('dubai');
      } else if (q.includes('rishikesh') || q.includes('weekend') || q.includes('rafting')) {
        setActivePlan(PRESET_PLANS.rishikesh);
        onFocusCity('rishikesh');
      } else {
        setActivePlan(PRESET_PLANS.goa);
        onFocusCity('goa');
      }
    }, 700);
  };

  const handleCalculateVisaOdds = () => {
    let score = 96.5;
    if (predictorBalance === '₹3L+') score += 3.2;
    if (predictorBalance === '₹1L - ₹3L') score += 2.1;
    if (predictorHistory === '5+ Countries Visited') score += 1.2;
    if (predictorHistory === 'First Time International') score -= 1.5;
    setPredictorResult(Math.min(99.8, score));
  };

  const handleBookAiPackage = () => {
    if (!activePlan) return;
    onSelectToCart(
      `Orbit AI Custom Package: ${activePlan.destination} (${activePlan.duration})`,
      activePlan.totalPrice
    );
    setActivePlan(null);
  };

  return (
    <div className="select-none max-w-6xl mx-auto px-4 mb-4 relative z-10">
      {/* ── 1. GLOWING ORBIT AI TRAVEL COPILOT PROMPT BAR (FLYSCAN.AI STYLE) ── */}
      <div className="bg-gradient-to-r from-[#0E1A3A] via-[#102A6B] to-[#0A1A40] p-4 sm:p-5 rounded-3xl border border-cyan-400/30 shadow-2xl shadow-blue-950/40 text-white relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#0084FF]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-white shadow-md shadow-cyan-400/30">
                <Sparkles className="w-4 h-4 fill-current animate-pulse text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-sm tracking-tight text-white">Orbit AI Trip Recommender</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">
                    GPT-4o Engine
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Tell AI your budget &amp; vibe — AI cross-questions &amp; recommends flights, villas, visas &amp; tailored itineraries.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <a
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-[#0084FF] text-slate-950 font-black transition flex items-center gap-1.5 active:scale-95 cursor-pointer text-xs shadow-md shadow-cyan-400/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommender (New Tab) ↗</span>
              </a>
              <button
                onClick={() => {
                  setShowVisaPredictor(true);
                  setActivePlan(null);
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 border border-cyan-400/30 font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Test Visa Approval Odds</span>
              </button>
            </div>
          </div>

          {/* Interactive Search Input Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1.5 flex items-center space-x-2 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 transition shadow-inner">
            <div className="pl-3 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunAiPrompt(prompt)}
              placeholder="e.g. 'Plan a 4-day Goa vacation under ₹15,000' or 'Bangkok family trip with visa & direct flight'..."
              className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:outline-none py-2"
            />
            <button
              onClick={() => handleRunAiPrompt(prompt || 'Goa 4 Days')}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:from-[#0070db] hover:to-[#00b0e0] active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-cyan-400/30 transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Recommend Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Preset Quick Prompts Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-bold pt-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">Try Asking AI:</span>
            
            <button
              onClick={() => handleRunAiPrompt('Goa 4 Days under ₹15k')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer text-xs"
            >
              <span>🏖️</span>
              <span>Goa 4 Days &lt; ₹15k</span>
            </button>

            <button
              onClick={() => handleRunAiPrompt('Thailand Bangkok with Visa & Resort')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer text-xs"
            >
              <span>🇹🇭</span>
              <span>Thailand All-Inclusive</span>
            </button>

            <button
              onClick={() => handleRunAiPrompt('Dubai 24h Express Visa & Hotel')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer text-xs"
            >
              <span>🇦🇪</span>
              <span>Dubai 48h Visa + JW Marriott</span>
            </button>

            <button
              onClick={() => handleRunAiPrompt('Rishikesh weekend rafting')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer text-xs"
            >
              <span>⛰️</span>
              <span>Rishikesh Rafting &lt;3h</span>
            </button>

            <button
              onClick={() => {
                setShowVisaPredictor(true);
                setActivePlan(null);
              }}
              className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 transition shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer text-xs font-bold"
            >
              <span>⚡</span>
              <span>Check Visa Approval Odds (Free)</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── 2. AI GENERATED TRIP BLUEPRINT MODAL ── */}
      {mounted && activePlan && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 text-slate-900 shadow-2xl border border-slate-200 modal-panel-enter relative my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto">
            
            {/* Modal Header with AI Badge */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0084FF] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Orbit AI Custom Blueprint
                  </span>
                  <span className="text-xs font-bold text-slate-500">{activePlan.duration}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {activePlan.destination}
                </h3>
                <div className="text-xs text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{activePlan.savings}</span>
                </div>
              </div>

              <button
                onClick={() => setActivePlan(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Synthesized Trip Components Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Component 1: Flight */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#0084FF]">
                  <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> Direct Flight</span>
                  <span className="text-emerald-700 font-black">₹0 Fee</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{activePlan.flight.airline}</div>
                <div className="text-slate-600">{activePlan.flight.route} · {activePlan.flight.time}</div>
                <div className="text-[10px] text-emerald-700 font-bold pt-1 border-t border-blue-200/60 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{activePlan.flight.farePrediction}</span>
                </div>
              </div>

              {/* Component 2: Stay */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-800">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Handpicked Stay</span>
                  <span className="text-amber-800 font-black">4.9★</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm truncate">{activePlan.stay.name}</div>
                <div className="text-slate-600 truncate">{activePlan.stay.room}</div>
                <div className="text-[10px] text-slate-700 font-medium pt-1 border-t border-amber-200/60">
                  ✓ {activePlan.stay.perks.join(' · ')}
                </div>
              </div>

              {/* Component 3: Visa Guarantee */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-800">
                  <span className="flex items-center gap-1"><FileCheck2 className="w-3 h-3" /> Visa Processing</span>
                  <span className="text-emerald-800 font-black">⚡ Express</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{activePlan.visa.status}</div>
                <div className="text-slate-600 text-[11px]">{activePlan.visa.timeline}</div>
                <div className="text-[10px] text-emerald-800 font-bold pt-1 border-t border-emerald-200/60">
                  {activePlan.visa.fee}
                </div>
              </div>

              {/* Component 4: Connectivity */}
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-indigo-800">
                  <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Global Connectivity</span>
                  <span className="text-indigo-800 font-black">Free QR</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{activePlan.esim.data}</div>
                <div className="text-slate-600 text-[11px]">Instant WhatsApp Delivery upon booking</div>
                <div className="text-[10px] text-indigo-800 font-bold pt-1 border-t border-indigo-200/60">
                  {activePlan.esim.cost}
                </div>
              </div>

            </div>

            {/* Day-by-Day Timeline Preview */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0084FF]" />
                <span>AI Day-by-Day Smart Itinerary:</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 max-h-48 overflow-y-auto text-xs">
                {activePlan.itinerary.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-[#0084FF] pl-3 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-[#0084FF] font-mono">{item.day}:</span>
                      <span className="font-bold text-slate-900">{item.title}</span>
                    </div>
                    <ul className="text-slate-600 space-y-0.5 text-[11px]">
                      {item.activities.map((act, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <span className="text-emerald-600">●</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer with 1-Tap Booking */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">All Flights, Villa &amp; Visa Included</div>
                <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {activePlan.totalPrice} <span className="text-xs font-normal text-slate-500">/ Total Bundle</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onFocusCity(activePlan.cityKey);
                    setActivePlan(null);
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Explore in 3D
                </button>
                <button
                  onClick={handleBookAiPackage}
                  className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-1.5 btn-press cursor-pointer"
                >
                  <span>1-Tap Book Entire Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ── 3. AI PRE-VISA APPROVAL ODDS PREDICTOR MODAL (SPEC VIRAL FEATURE) ── */}
      {mounted && showVisaPredictor && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-slate-900 shadow-2xl border border-slate-200 modal-panel-enter relative my-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    AI Visa Approval Predictor
                  </h3>
                  <div className="text-xs text-slate-500">
                    Calculates approval probability based on 1.34M historical embassy filings.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowVisaPredictor(false);
                  setPredictorResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-3 text-xs">
              
              {/* Destination Country */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">1. Destination Country:</label>
                <select
                  value={predictorCountry}
                  onChange={(e) => setPredictorCountry(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  <option value="Thailand">Thailand 🇹🇭 (30-Day Express Tourist eVisa)</option>
                  <option value="Dubai">Dubai / UAE 🇦🇪 (30-Day Tourist eVisa)</option>
                  <option value="Vietnam">Vietnam 🇻🇳 (Official 30-Day eVisa)</option>
                  <option value="Bali">Bali (Indonesia) 🇮🇩 (Electronic VoA)</option>
                  <option value="Singapore">Singapore 🇸🇬 (2-Year Multi Entry)</option>
                  <option value="Schengen">Schengen (Europe) 🇪🇺 (Short-Stay Tourist)</option>
                </select>
              </div>

              {/* Bank Balance Tier */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">2. Estimated Bank Balance:</label>
                <select
                  value={predictorBalance}
                  onChange={(e) => setPredictorBalance(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  <option value="₹50k - ₹1L">₹50,000 - ₹1,00,000</option>
                  <option value="₹1L - ₹3L">₹1,00,000 - ₹3,00,000 (Recommended)</option>
                  <option value="₹3L+">₹3,00,000+ (High Financial Stability)</option>
                </select>
              </div>

              {/* Travel History */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">3. Past International Travel:</label>
                <select
                  value={predictorHistory}
                  onChange={(e) => setPredictorHistory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  <option value="First Time International">First Time International Traveler</option>
                  <option value="1-2 Countries Visited">1 - 2 Countries Visited</option>
                  <option value="5+ Countries Visited">5+ Countries Visited (Frequent Flyer)</option>
                </select>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCalculateVisaOdds}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate Approval Odds Now</span>
              </button>
            </div>

            {/* Calculated Result Card */}
            {predictorResult && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-2 animate-fade-in">
                <div className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                  Predicted Approval Probability:
                </div>
                <div className="text-4xl font-black text-emerald-600 font-mono">
                  {predictorResult}%
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  Status: <strong>Ultra-High Approval Probability</strong>. Embassy requirements for {predictorCountry} are 100% satisfied.
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setShowVisaPredictor(false);
                      onSelectTab('visa');
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Apply Now (Flat ₹499 Family Cap)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
