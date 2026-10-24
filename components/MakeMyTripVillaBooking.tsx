'use client';

import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  Star, 
  Check, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  Coffee, 
  Utensils, 
  Waves, 
  Trees, 
  Flame, 
  Search,
  Filter
} from 'lucide-react';

export interface VillaProperty {
  id: string;
  name: string;
  location: string;
  distanceBadge: string;
  category: string;
  categoryTag: string;
  categoryTagColor: string;
  rating: string;
  reviewsCount: string;
  image: string;
  pricePerNight: number;
  oldPricePerNight: number;
  inclusions: string[];
  cityKey: string;
  theme: string;
}

export const SAMPLE_VILLAS: VillaProperty[] = [
  {
    id: 'v1',
    name: 'Rishikesh Ganga Riverfront Glamping & Luxury Retreat',
    location: 'Shivpuri, Rishikesh (Ganges Valley)',
    distanceBadge: '🚗 2h 45m from Delhi NCR',
    category: 'RIVERSIDE GLAMPING',
    categoryTag: 'ALL 3 MEALS + RAFTING INCLUDED',
    categoryTagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rating: '★ 4.9',
    reviewsCount: '1,240 reviews',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 3499,
    oldPricePerNight: 7500,
    inclusions: [
      'Swiss air-cooled tent right on white sand riverbed',
      'All 3 buffet meals included (Breakfast, Lunch, Dinner)',
      '16km Ganga river rafting with licensed guide',
      'Evening riverside bonfire with acoustic music'
    ],
    cityKey: 'rishikesh',
    theme: 'riverside'
  },
  {
    id: 'v2',
    name: 'Samode Royal Palace & 475-Yr Heritage Haveli',
    location: 'Samode, Jaipur Foothills',
    distanceBadge: '⚡ 1.8h on Vande Bharat Express',
    category: 'ROYAL HERITAGE HAVELI',
    categoryTag: 'REGAL COURTYARD + FORT TOUR',
    categoryTagColor: 'bg-amber-100 text-amber-900 border-amber-200',
    rating: '★ 4.9',
    reviewsCount: '2,150 reviews',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 4800,
    oldPricePerNight: 11000,
    inclusions: [
      'Hand-painted fresco bedroom with royal four-poster bed',
      'Rooftop fort-view breakfast & sunset tea ceremony',
      'Traditional puppet show & Rajasthani folk dance',
      'Heated outdoor marble courtyard plunge pool'
    ],
    cityKey: 'delhi',
    theme: 'heritage'
  },
  {
    id: 'v3',
    name: 'Candolim Sunset Luxury 4BHK Private Pool Villa',
    location: 'Candolim, North Goa (Beachside)',
    distanceBadge: '🏖️ 3 mins walk to Candolim Beach',
    category: 'LUXURY PRIVATE VILLA',
    categoryTag: 'PRIVATE SWIMMING POOL',
    categoryTagColor: 'bg-blue-100 text-[#0084FF] border-blue-200',
    rating: '★ 4.9',
    reviewsCount: '890 reviews',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 6800,
    oldPricePerNight: 14500,
    inclusions: [
      'Entire 4-bedroom villa with private crystal swimming pool',
      'Dedicated villa chef on call for Goan & continental dishes',
      'Lush tropical garden with outdoor dining gazebo',
      'High-speed Wi-Fi, daily housekeeping & power backup'
    ],
    cityKey: 'goa',
    theme: 'pool'
  },
  {
    id: 'v4',
    name: 'Manali Cedar Forest Treehouse & Glass Chalet',
    location: 'Old Manali, Himachal Pradesh',
    distanceBadge: '⛰️ Panoramic Snow Peak Views',
    category: 'ALPINE TREEHOUSE',
    categoryTag: 'FIREPLACE + WOODEN BALCONY',
    categoryTagColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    rating: '★ 4.8',
    reviewsCount: '640 reviews',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 3999,
    oldPricePerNight: 8200,
    inclusions: [
      'Elevated wooden treehouse built among 100-year deodars',
      'Cast-iron indoor fireplace with complimentary firewood',
      'Fresh Himalayan breakfast delivered to your wooden deck',
      'Private bonfire pit with barbeque setup under the stars'
    ],
    cityKey: 'delhi',
    theme: 'treehouse'
  },
  {
    id: 'v5',
    name: 'Udaipur Pichola Waterfront Rajputana Haveli',
    location: 'Lake Pichola Ghat, Udaipur',
    distanceBadge: '🏰 Unobstructed Lake & City Palace View',
    category: 'WATERFRONT HAVELI',
    categoryTag: 'ROOFTOP SUNSET RESTAURANT',
    categoryTagColor: 'bg-rose-100 text-rose-900 border-rose-200',
    rating: '★ 4.9',
    reviewsCount: '1,420 reviews',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 5200,
    oldPricePerNight: 12500,
    inclusions: [
      'Jharokha window seating overlooking the shimmering lake',
      'Candlelit rooftop dinner table reservation included',
      'Sunset boat ride on Lake Pichola for two',
      '24/7 dedicated butler & travel desk concierge'
    ],
    cityKey: 'delhi',
    theme: 'heritage'
  }
];

interface MakeMyTripVillaBookingProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  activeCityKey?: string;
}

export default function MakeMyTripVillaBooking({
  onSelectToCart,
  onFocusCity,
  activeCityKey = 'rishikesh',
}: MakeMyTripVillaBookingProps) {
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [checkInDate, setCheckInDate] = useState('24 Oct 2026, Sat');
  const [checkOutDate, setCheckOutDate] = useState('25 Oct 2026, Sun (1 Night)');
  const [guests, setGuests] = useState('2 Adults · 1 Villa');
  const [themeFilter, setThemeFilter] = useState<'all' | 'riverside' | 'heritage' | 'pool' | 'treehouse'>('all');
  const [isDestOpen, setIsDestOpen] = useState(false);

  const DESTINATION_OPTIONS = [
    { label: 'All Destinations', cityKey: 'all', desc: 'Rishikesh, Goa, Jaipur, Manali, Udaipur' },
    { label: 'Rishikesh, Uttarakhand', cityKey: 'rishikesh', desc: 'Riverside Glamping & Rafting (<3h)' },
    { label: 'Goa (North & South)', cityKey: 'goa', desc: 'Private Pool Beachfront Luxury Villas' },
    { label: 'Jaipur, Rajasthan', cityKey: 'delhi', desc: 'Royal 18th-Century Heritage Havelis' },
    { label: 'Manali, Himachal', cityKey: 'delhi', desc: 'Snow Peak Cedar Treehouses & Chalets' },
  ];

  const filteredVillas = SAMPLE_VILLAS.filter((v) => {
    if (themeFilter !== 'all' && v.theme !== themeFilter) return false;
    if (selectedDestination !== 'All' && !v.location.toLowerCase().includes(selectedDestination.toLowerCase()) && !v.name.toLowerCase().includes(selectedDestination.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSelectDestOption = (opt: typeof DESTINATION_OPTIONS[0]) => {
    setSelectedDestination(opt.label.split(',')[0]);
    setIsDestOpen(false);
    if (opt.cityKey !== 'all') {
      onFocusCity(opt.cityKey);
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ── 1. PROMINENT MAKEMYTRIP HOMESTAYS & VILLAS SEARCH COCKPIT ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/10 border border-slate-200 space-y-5">
        
        {/* Top Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-extrabold text-slate-800">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-800 border border-amber-300 rounded-full font-black text-xs">
              🏡 Villas &amp; Homestays
            </span>
            <span className="text-slate-500 font-medium hidden sm:inline">
              Handpicked Private Stays · Verified Amenities · Zero Hidden Cleaning Fees
            </span>
          </div>

          <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Early Check-in Included</span>
          </div>
        </div>

        {/* ── Segmented Search Inputs Row ── */}
        <div className="border border-slate-200 rounded-2xl overflow-visible grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/50">
          
          {/* Destination Box */}
          <div 
            className="md:col-span-4 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer relative group"
            onClick={() => setIsDestOpen(!isDestOpen)}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>City / Destination / Region</span>
              <span className="text-[10px] text-blue-600 group-hover:underline font-extrabold">Change ▾</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-baseline gap-2">
              <span>{selectedDestination === 'All' ? 'All Destinations' : selectedDestination}</span>
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              Rishikesh, Goa, Jaipur, Manali, Udaipur
            </div>

            {/* Dropdown Menu */}
            {isDestOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-800 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Select Weekend Destination</span>
                  <MapPin className="w-3.5 h-3.5 text-[#0084FF]" />
                </div>
                <div className="mt-1 space-y-1">
                  {DESTINATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelectDestOption(opt)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left hover:bg-blue-50 hover:text-[#0084FF] transition"
                    >
                      <div>
                        <div className="text-slate-900 font-extrabold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                      </div>
                      {selectedDestination.includes(opt.label.split(',')[0]) && <Check className="w-4 h-4 text-[#0084FF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Check-In Date */}
          <div className="md:col-span-3 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Check-In</span>
              <Calendar className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              24 Oct <span className="text-xs font-normal text-slate-500">2026</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">Saturday · Early Arrival Included</div>
          </div>

          {/* Check-Out Date */}
          <div className="md:col-span-3 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Check-Out</span>
              <Calendar className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              25 Oct <span className="text-xs font-normal text-slate-500">2026</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">Sunday · 1 Night Stay</div>
          </div>

          {/* Guests Box */}
          <div className="md:col-span-2 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Guests</span>
              <Users className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              2 <span className="text-xs font-normal text-slate-500">Guests</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">1 Villa / Swiss Tent</div>
          </div>

        </div>

        {/* ── Theme Filter Chips ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 mr-1">Experience:</span>
            
            <button
              onClick={() => setThemeFilter('all')}
              className={`px-3 py-1.5 rounded-full border transition cursor-pointer ${
                themeFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Types
            </button>

            <button
              onClick={() => setThemeFilter('riverside')}
              className={`px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                themeFilter === 'riverside'
                  ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50'
              }`}
            >
              <Waves className="w-3 h-3" />
              <span>Riverside Glamping</span>
            </button>

            <button
              onClick={() => setThemeFilter('heritage')}
              className={`px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                themeFilter === 'heritage'
                  ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50'
              }`}
            >
              <span>🏰</span>
              <span>Heritage Haveli</span>
            </button>

            <button
              onClick={() => setThemeFilter('pool')}
              className={`px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                themeFilter === 'pool'
                  ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50'
              }`}
            >
              <span>🏊‍♂️</span>
              <span>Private Pool Villa</span>
            </button>

            <button
              onClick={() => setThemeFilter('treehouse')}
              className={`px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                themeFilter === 'treehouse'
                  ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50'
              }`}
            >
              <Trees className="w-3 h-3" />
              <span>Mountain Treehouse</span>
            </button>
          </div>

          {/* Search Button */}
          <button
            onClick={() => onFocusCity(selectedDestination.toLowerCase().includes('goa') ? 'goa' : 'rishikesh')}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/30 transition flex items-center gap-2 btn-press cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search Villas</span>
          </button>
        </div>

      </div>

      {/* ── 2. CURATED HOMESTAY & VILLA CARDS ── */}
      <div className="space-y-4">
        
        {/* Results Count & Quick Sort */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Verified Villas &amp; Homestays</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                {filteredVillas.length} Handpicked
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant 1-tap booking · All meals, rafting &amp; private pools included · Zero hidden host fees
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <span className="text-slate-400">Sort by:</span>
            <span className="text-[#0084FF] font-extrabold cursor-pointer hover:underline">Distance &amp; Rating ▾</span>
          </div>
        </div>

        {/* Villa Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVillas.map((villa) => {
            const savings = villa.oldPricePerNight - villa.pricePerNight;

            return (
              <div 
                key={villa.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-60 overflow-hidden cursor-pointer" onClick={() => onFocusCity(villa.cityKey)}>
                    <img 
                      src={villa.image} 
                      alt={villa.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-extrabold shadow-md flex items-center gap-1">
                        {villa.distanceBadge}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                        {villa.rating} <span className="text-[10px] font-normal text-slate-800">({villa.reviewsCount})</span>
                      </span>
                    </div>

                    {/* Bottom Feature Tag */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${villa.categoryTagColor}`}>
                        {villa.categoryTag}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-extrabold text-[#0084FF] tracking-wider">
                        {villa.category}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#0084FF] transition-colors">
                        {villa.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{villa.location}</span>
                      </div>
                    </div>

                    {/* Inclusions List */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                      {villa.inclusions.map((inc, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                          <span className="font-medium">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Pricing & 1-Tap Book */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{villa.oldPricePerNight.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Save ₹{savings.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                      ₹{villa.pricePerNight.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ night (all-in)</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> ₹0 Cleaning Fee · Free Cancellation
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onFocusCity(villa.cityKey)}
                      title="Inspect Route on 3D Globe"
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#0084FF] flex items-center justify-center transition shadow-xs cursor-pointer active:scale-90"
                    >
                      <Compass className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectToCart(`${villa.name} (1 Night)`, `₹${villa.pricePerNight.toLocaleString()}`)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/25 transition flex items-center gap-1.5 btn-press cursor-pointer"
                    >
                      <span>Book Villa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
