'use client';

import React, { useState, useId } from 'react';
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Flame, 
  Plane, 
  Home, 
  ShieldCheck, 
  RotateCcw,
  Sliders,
  ChevronRight,
  Globe2,
  Heart
} from 'lucide-react';

export interface RecommendationTrip {
  id: string;
  name: string;
  cityKey: string;
  location: string;
  tagline: string;
  matchScore: number;
  matchReason: string;
  price: string;
  originalPrice: string;
  duration: string;
  vibe: string;
  travelerType: string;
  budgetCategory: string;
  image: string;
  inclusions: string[];
  highlights: string[];
  itinerary: { day: string; title: string; desc: string }[];
}

const ALL_TRIP_DATABASE: RecommendationTrip[] = [
  // 1. Goa Friends / Party / Beach
  {
    id: 'rec-goa-party',
    name: 'Goa Coastal Villa & Beach Club Escape',
    cityKey: 'goa',
    location: 'Vagator, North Goa',
    tagline: 'Private pool villa with beach club VIP access & scooter pass',
    matchScore: 99,
    matchReason: 'Top match for Party vibe + Friends Gang under ₹15,000 budget.',
    price: '₹11,499',
    originalPrice: '₹18,500',
    duration: '4 Days / 3 Nights',
    vibe: 'party',
    travelerType: 'friends',
    budgetCategory: 'mid',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    inclusions: ['✈️ Direct Flight', '🏡 3BHK Pool Villa', '🛵 2 Scooters', '🍳 Daily Breakfast'],
    highlights: ['15-min walk to Thalassa', 'Private swimming pool', '₹0 Reschedule flex'],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Sunset Poolside', desc: 'IndiGo direct flight to MOPA, private cab to Vagator villa, evening sundowner.' },
      { day: 'Day 2', title: 'North Goa Beach Hopping', desc: 'Scooter run across Anjuna & Ashvem, VIP entry to beachfront lounge.' },
      { day: 'Day 3', title: 'Watersports & Nightlife', desc: 'Jet ski at Calangute, followed by party night at Tito’s Lane.' },
      { day: 'Day 4', title: 'Brunch & Departure', desc: 'Lazy breakfast by the pool, souvenir shopping in Panjim, departure flight.' },
    ],
  },

  // 2. Rishikesh Weekend / Hills / Adventure / Peace
  {
    id: 'rec-rishi-glamp',
    name: 'Rishikesh Ganga Riverfront Glamping & Rafting',
    cityKey: 'rishikesh',
    location: 'Shivpuri, Rishikesh',
    tagline: 'Luxury Swiss dome tents on white sand beach with 16km Ganga rafting',
    matchScore: 98,
    matchReason: 'Perfect < 3h weekend getaway with adventure & peace under ₹5,000.',
    price: '₹3,499',
    originalPrice: '₹5,999',
    duration: '2 Days / 1 Night',
    vibe: 'wellness',
    travelerType: 'friends',
    budgetCategory: 'budget',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    inclusions: ['⛺ AC Swiss Tent', '🌊 16km Grade-3 Rafting', '🔥 Evening Bonfire', '🍲 All 3 Meals'],
    highlights: ['Direct Ganga sand access', 'Cliff jumping included', 'Zero toll highway via Delhi Exp'],
    itinerary: [
      { day: 'Day 1', title: 'Scenic Drive & Campfire', desc: 'Morning drive via Meerut Expressway (2.5h), check-in to luxury tents, evening music by Ganga.' },
      { day: 'Day 2', title: 'Rafting & Departure', desc: 'Exciting 16km rapid rafting with cliff jumping, riverside lunch, afternoon drive back.' },
    ],
  },

  // 3. Thailand Phuket & Krabi International / Couple
  {
    id: 'rec-thai-couple',
    name: 'Thailand Phuket & Krabi Island Romance Package',
    cityKey: 'thailand',
    location: 'Phuket & Phi Phi Islands',
    tagline: 'Private speedboat island hopping with flat ₹499 family visa cap',
    matchScore: 97,
    matchReason: 'Best international pick with 24-hr visa pre-approval & couple sea-view resort.',
    price: '₹24,999',
    originalPrice: '₹38,000',
    duration: '5 Days / 4 Nights',
    vibe: 'beach',
    travelerType: 'couple',
    budgetCategory: 'premium',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
    inclusions: ['✈️ Return Flights', '🏨 4-Star Sea Resort', '🛂 Flat ₹499 eVisa', '🚤 Speedboat Tour'],
    highlights: ['Phi Phi Island full-day catamaran', 'Daily international buffet', 'Airport VIP pickup'],
    itinerary: [
      { day: 'Day 1', title: 'Touchdown Phuket', desc: 'Direct flight from Delhi/Mumbai, private transfer to Patong beachfront resort.' },
      { day: 'Day 2', title: 'Phi Phi & Maya Bay', desc: 'Exclusive speedboat trip to Maya Bay & snorkel at Bamboo Island.' },
      { day: 'Day 3', title: 'Old Phuket Town & Café Run', desc: 'Explore Sino-Portuguese architecture, local night markets, sunset viewpoint.' },
      { day: 'Day 4', title: 'Spa & Candlelight Dinner', desc: 'Traditional Thai massage and private beach candlelight dinner.' },
      { day: 'Day 5', title: 'Duty Free & Return', desc: 'Last minute shopping in Phuket town, evening flight home.' },
    ],
  },

  // 4. Dubai Luxury / Family / Shopping
  {
    id: 'rec-dubai-family',
    name: 'Dubai Downtown & Desert Safari Extravaganza',
    cityKey: 'dubai',
    location: 'Downtown Dubai & Palm Jumeirah',
    tagline: 'Burj Khalifa At The Top, luxury 4x4 dune safari & Marina yacht cruise',
    matchScore: 96,
    matchReason: 'Top choice for Family luxury with 24h express visa and kid-friendly attractions.',
    price: '₹29,999',
    originalPrice: '₹46,000',
    duration: '5 Days / 4 Nights',
    vibe: 'heritage',
    travelerType: 'family',
    budgetCategory: 'premium',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    inclusions: ['✈️ Direct Flight', '🏨 5-Star Hotel', '🛂 24h Express Visa', '🏜️ VIP Desert Safari'],
    highlights: ['Burj Khalifa Level 124 ticket', 'BBQ dinner with fire show', 'Marina yacht cruise'],
    itinerary: [
      { day: 'Day 1', title: 'Hello Dubai', desc: 'Arrive at DXB, luxury hotel check-in, evening Dubai Mall Fountain show.' },
      { day: 'Day 2', title: 'Burj Khalifa & Museum of Future', desc: 'Panoramic 124th floor view, interactive tech museum tour.' },
      { day: 'Day 3', title: 'Red Dunes Safari', desc: 'Thrilling 4x4 dune bashing, camel ride, Arabian night BBQ under stars.' },
      { day: 'Day 4', title: 'Palm Jumeirah & Marina Cruise', desc: 'Monorail to Atlantis, 2-hour luxury yacht tour with buffet.' },
      { day: 'Day 5', title: 'Gold Souk & Departure', desc: 'Traditional spice & gold souk shopping, private transfer to airport.' },
    ],
  },

  // 5. Samode / Jaipur Royal Heritage / Couple or Family
  {
    id: 'rec-samode-royal',
    name: 'Samode Palace Royal Haveli Weekend Escape',
    cityKey: 'samode',
    location: 'Samode, Rajasthan (< 3h from Delhi)',
    tagline: '475-year-old Rajput royal palace with marble pool and courtyards',
    matchScore: 95,
    matchReason: 'Under 3 hours drive from Delhi NCR with authentic royal maharaja hospitality.',
    price: '₹8,999',
    originalPrice: '₹14,000',
    duration: '2 Days / 1 Night',
    vibe: 'heritage',
    travelerType: 'couple',
    budgetCategory: 'mid',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    inclusions: ['🏰 Royal Heritage Suite', '🍽️ Royal Thali Dinner', '🏊 Marble Pool Access', '☕ High Tea'],
    highlights: ['Sheesh Mahal private tour', 'Live folk music & puppet show', 'Zero toll stress'],
    itinerary: [
      { day: 'Day 1', title: 'Royal Welcome', desc: 'Scenic morning drive on NH48, traditional aarti welcome, afternoon palace tour.' },
      { day: 'Day 2', title: 'Village Safari & Return', desc: 'Camel cart ride through Samode village, Rajasthani royal lunch, evening return.' },
    ],
  },

  // 6. Bali Tropical Paradise / Nature & Wellness
  {
    id: 'rec-bali-wellness',
    name: 'Bali Ubud Forest Villa & Seminyak Sunset',
    cityKey: 'bali',
    location: 'Ubud & Seminyak, Bali',
    tagline: 'Infinity jungle pool villa, Mount Batur sunrise trek & floating breakfast',
    matchScore: 94,
    matchReason: 'Ultimate wellness & romantic nature retreat with instant e-VOA support.',
    price: '₹34,999',
    originalPrice: '₹52,000',
    duration: '6 Days / 5 Nights',
    vibe: 'wellness',
    travelerType: 'couple',
    budgetCategory: 'luxury',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    inclusions: ['✈️ Flight Connection', '🌴 Private Pool Villa', '🍳 Floating Breakfast', '🌋 Volcano Trek'],
    highlights: ['Ayung river rafting', 'Jungle swing pass', 'Complimentary Balinese massage'],
    itinerary: [
      { day: 'Day 1', title: 'Arrival in Denpasar', desc: 'Private cab to Ubud lush jungle villa, herbal welcome drink.' },
      { day: 'Day 2', title: 'Tegalalang Rice Terraces', desc: 'Iconic jungle swing, coffee tasting, sacred monkey forest.' },
      { day: 'Day 3', title: 'Mount Batur Sunrise', desc: 'Early morning 4x4 jeep tour to volcano rim, hot spring soak.' },
      { day: 'Day 4', title: 'Transfer to Seminyak', desc: 'Beachfront resort check-in, sunset at Potato Head Beach Club.' },
      { day: 'Day 5', title: 'Uluwatu Sunset & Kecak Dance', desc: 'Cliff-edge temple tour and seafood dinner at Jimbaran bay.' },
      { day: 'Day 6', title: 'Souvenirs & Departure', desc: 'Art market shopping, transfer to airport.' },
    ],
  },
];

const VIBE_OPTIONS = [
  { id: 'all', label: '✨ Any Vibe', icon: '✨' },
  { id: 'beach', label: '🏖️ Beach & Sun', icon: '🏖️' },
  { id: 'wellness', label: '⛰️ Hills & Peace', icon: '⛰️' },
  { id: 'party', label: '🎉 Party & Nightlife', icon: '🎉' },
  { id: 'heritage', label: '🏛️ Royal Heritage', icon: '🏛️' },
];

const TRAVELER_OPTIONS = [
  { id: 'all', label: '👥 Any Group' },
  { id: 'friends', label: 'Friends Gang 🍻' },
  { id: 'couple', label: 'Couple / Romance 💑' },
  { id: 'family', label: 'Family with Kids 👨‍👩‍👧' },
  { id: 'solo', label: 'Solo Adventurer 🎒' },
];

const BUDGET_OPTIONS = [
  { id: 'all', label: 'Any Budget' },
  { id: 'budget', label: '< ₹5,000 (Roadtrip/Camp)' },
  { id: 'mid', label: '₹5,000 - ₹15,000 (Weekend Flight/Villa)' },
  { id: 'premium', label: '₹15,000 - ₹35,000 (Thailand/Dubai)' },
  { id: 'luxury', label: '₹35,000+ (Bali / Luxury)' },
];

const QUICK_INSPIRATION_PROMPTS = [
  '🏖️ Goa beach villa for 4 friends under ₹15,000 with pool',
  '⛰️ Weekend drive from Delhi with campfire & rafting under ₹5k',
  '🇹🇭 Thailand international escape with flat ₹499 visa',
  '💑 Royal haveli anniversary getaway under 3h drive',
  '🌴 Bali jungle pool villa with volcano sunrise trek',
];

interface TripRecommenderProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function TripRecommender({
  onSelectToCart,
  onFocusCity,
  onSelectTab,
}: TripRecommenderProps) {
  const formId = useId();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [selectedTraveler, setSelectedTraveler] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [isRecommending, setIsRecommending] = useState(false);
  const [selectedTripForModal, setSelectedTripForModal] = useState<RecommendationTrip | null>(null);

  // Filter recommendations based on active preferences
  const filteredTrips = ALL_TRIP_DATABASE.filter((trip) => {
    // Prompt text matching
    if (searchPrompt.trim()) {
      const q = searchPrompt.toLowerCase();
      const matchesText = 
        trip.name.toLowerCase().includes(q) ||
        trip.location.toLowerCase().includes(q) ||
        trip.tagline.toLowerCase().includes(q) ||
        trip.cityKey.toLowerCase().includes(q);
      if (!matchesText && !q.includes(trip.vibe)) return false;
    }

    // Vibe match
    if (selectedVibe !== 'all' && trip.vibe !== selectedVibe) {
      return false;
    }

    // Traveler match
    if (selectedTraveler !== 'all' && trip.travelerType !== selectedTraveler) {
      return false;
    }

    // Budget match
    if (selectedBudget !== 'all' && trip.budgetCategory !== selectedBudget) {
      return false;
    }

    return true;
  });

  const handleApplyPrompt = (promptText: string) => {
    setSearchPrompt(promptText);
    const lower = promptText.toLowerCase();

    if (lower.includes('goa') || lower.includes('party')) {
      setSelectedVibe('party');
      setSelectedTraveler('friends');
      setSelectedBudget('mid');
    } else if (lower.includes('rishi') || lower.includes('rafting') || lower.includes('camp')) {
      setSelectedVibe('wellness');
      setSelectedTraveler('friends');
      setSelectedBudget('budget');
    } else if (lower.includes('thailand') || lower.includes('visa')) {
      setSelectedVibe('beach');
      setSelectedTraveler('couple');
      setSelectedBudget('premium');
    } else if (lower.includes('haveli') || lower.includes('royal')) {
      setSelectedVibe('heritage');
      setSelectedTraveler('couple');
      setSelectedBudget('mid');
    } else if (lower.includes('bali')) {
      setSelectedVibe('wellness');
      setSelectedTraveler('couple');
      setSelectedBudget('luxury');
    }

    triggerRecommendationSimulation();
  };

  const triggerRecommendationSimulation = () => {
    setIsRecommending(true);
    setTimeout(() => {
      setIsRecommending(false);
    }, 400);
  };

  const handleResetFilters = () => {
    setSearchPrompt('');
    setSelectedVibe('all');
    setSelectedTraveler('all');
    setSelectedBudget('all');
    triggerRecommendationSimulation();
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── MAIN HERO RECOMMENDER COCKPIT CARD ─── */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden select-none">
        
        {/* Top Header Banner with Glowing AI Gradient */}
        <div className="bg-gradient-to-r from-[#0084FF] via-[#0A225C] to-[#EB2026] text-white p-5 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-black tracking-wide border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>ORBIT AI TRIP RECOMMENDER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Tell Us What You Want. <br className="hidden sm:inline" />
                <span className="text-cyan-300">We’ll Design Your Dream Trip in Seconds.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                Type your mood, budget, or who you&apos;re traveling with — our AI matches real-time flights, handpicked havelis, and flat ₹499 family visas.
              </p>
            </div>

            {/* Quick Stats Pill & Dedicated Chat Link */}
            <div className="flex flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-xs">
              <a
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-[#0084FF] hover:from-cyan-300 hover:to-[#0070db] text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 btn-press cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Conversational Recommender ↗</span>
              </a>
              <div className="hidden lg:flex items-center gap-2 text-white/90 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-bold">120+ Curated Getaways Linked</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-white/90">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="font-bold">Zero Hidden Convenience Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body for Input & Filter Selectors */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            triggerRecommendationSimulation();
          }}
          className="p-4 sm:p-7 space-y-6"
        >
          {/* 1. Natural Language Prompt Input */}
          <div className="space-y-2">
            <label 
              htmlFor={`${formId}-prompt`} 
              className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#0084FF]" />
              <span>1. Tell Orbit AI What You Feel Like Doing:</span>
            </label>

            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white border-2 border-slate-200 focus-within:border-[#0084FF] rounded-2xl p-2 transition-all shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-[#0084FF]/10 text-[#0084FF] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                id={`${formId}-prompt`}
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Type e.g. 'Goa beach villa with pool under 15k', 'Rishikesh camp drive', 'Thailand visa trip'..."
                className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchPrompt && (
                <button
                  type="button"
                  onClick={() => setSearchPrompt('')}
                  className="text-slate-400 hover:text-slate-700 p-1.5 text-xs font-bold"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/30 transition flex items-center gap-1.5 shrink-0 btn-press"
              >
                <span>Find Matches</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10.5px] font-black text-slate-500 shrink-0 uppercase tracking-wider">Try:</span>
              {QUICK_INSPIRATION_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPrompt(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0084FF] text-slate-600 font-bold text-[11px] whitespace-nowrap border border-slate-200 transition shrink-0 active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Interactive 1-Tap Category Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            
            {/* Filter A: Vibe / Mood */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎭 Select Trip Vibe:</span>
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {VIBE_OPTIONS.map((vibe) => (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => {
                      setSelectedVibe(vibe.id);
                      triggerRecommendationSimulation();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 btn-press ${
                      selectedVibe === vibe.id
                        ? 'bg-[#0084FF] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {vibe.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Filter B: Who is Traveling */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>👥 Who&apos;s Traveling?</span>
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {TRAVELER_OPTIONS.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => {
                      setSelectedTraveler(tr.id);
                      triggerRecommendationSimulation();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 btn-press ${
                      selectedTraveler === tr.id
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Filter C: Budget Range */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                <span>💰 Budget per Person:</span>
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBudget(b.id);
                      triggerRecommendationSimulation();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 btn-press ${
                      selectedBudget === b.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </fieldset>

          </div>

          {/* Active Filter Bar & Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-bold">
            <div className="flex items-center gap-2">
              <span>Showing:</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0084FF] font-black">
                {filteredTrips.length} Handpicked Matches
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>

        </form>
      </div>

      {/* ─── RECOMMENDATION RESULTS GRID ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#0084FF]" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Top Recommended Trips For You
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Ranked by AI match score &amp; live seat availability
          </span>
        </div>

        {/* Loading shimmer simulation */}
        {isRecommending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-96 border border-slate-200 p-4 space-y-4">
                <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
                <div className="w-1/2 h-4 bg-slate-200 rounded-md" />
                <div className="w-full h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0084FF] flex items-center justify-center text-2xl mx-auto">
              🧭
            </div>
            <h4 className="text-lg font-black text-slate-900">No exact match for this combination</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Try resetting your budget or vibe filter to view all available flight and stay packages.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#0084FF] text-white text-xs font-black rounded-xl hover:bg-[#0070db] transition"
            >
              Show All Recommended Trips
            </button>
          </div>
        ) : (
          /* Trip Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group select-none fs-card"
              >
                {/* Card Media Header */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={trip.image}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Match Score Badge */}
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white font-mono font-black text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>{trip.matchScore}% MATCH</span>
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full border border-white/20">
                    {trip.duration}
                  </div>

                  {/* Location & Title on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-bold mb-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{trip.location}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black leading-tight text-white drop-shadow-sm">
                      {trip.name}
                    </h4>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* AI Why Recommended Bullet */}
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700">
                    <div className="text-[10px] font-black text-[#0084FF] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Why Orbit Recommends This:</span>
                    </div>
                    <p className="font-semibold text-[11px] leading-relaxed text-slate-800">
                      {trip.matchReason}
                    </p>
                  </div>

                  {/* What's Included Pills */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Package Inclusions:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.inclusions.map((inc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10.5px]"
                        >
                          {inc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Primary CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg sm:text-xl font-black text-[#0084FF] font-mono">
                          {trip.price}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {trip.originalPrice}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-medium">
                        Total per head · Taxes included
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Itinerary Preview Button */}
                      <button
                        onClick={() => setSelectedTripForModal(trip)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition active:scale-95"
                        title="View Day-by-Day Itinerary"
                      >
                        Plan ➔
                      </button>

                      {/* Instant Book Button */}
                      <button
                        onClick={() => onSelectToCart(trip.name, trip.price)}
                        className="px-4 py-2 bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1 btn-press"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── DAY-BY-DAY ITINERARY MODAL ─── */}
      {selectedTripForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-modal-enter select-none">
            
            {/* Modal Header with Image */}
            <div className="relative h-44 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTripForModal.image}
                alt={selectedTripForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <button
                onClick={() => setSelectedTripForModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                  {selectedTripForModal.duration} · {selectedTripForModal.location}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {selectedTripForModal.name}
                </h3>
              </div>
            </div>

            {/* Modal Body - Itinerary Days */}
            <div className="p-4 sm:p-6 overflow-y-auto thin-scrollbar space-y-4 flex-1 text-xs">
              <div className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0084FF]" />
                <span>Day-by-Day Curated Schedule</span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedTripForModal.itinerary.map((day, idx) => (
                  <div key={idx} className="relative pl-7 space-y-0.5">
                    <span className="absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full bg-[#0084FF] border-2 border-white ring-1 ring-blue-300"></span>
                    <div className="font-black text-[#0084FF] text-[11px]">
                      {day.day}: <span className="text-slate-900 font-bold">{day.title}</span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {day.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 text-[11px]">Trip Highlights:</div>
                <div className="space-y-1">
                  {selectedTripForModal.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <div className="text-base font-black text-[#0084FF] font-mono">
                  {selectedTripForModal.price}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {selectedTripForModal.duration} all-inclusive
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onFocusCity(selectedTripForModal.cityKey);
                    setSelectedTripForModal(null);
                  }}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black rounded-xl transition flex items-center gap-1"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>3D Route</span>
                </button>

                <button
                  onClick={() => {
                    onSelectToCart(selectedTripForModal.name, selectedTripForModal.price);
                    setSelectedTripForModal(null);
                  }}
                  className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1 btn-press"
                >
                  <span>Book Entire Trip ➔</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
