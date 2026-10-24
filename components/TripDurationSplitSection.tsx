'use client';

import React, { useState } from 'react';
import { 
  Car, 
  Plane, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Check, 
  Calendar, 
  MapPin, 
  Compass, 
  Wifi, 
  FileCheck2, 
  Coffee, 
  Utensils, 
  Flame,
  Zap,
  Luggage
} from 'lucide-react';

interface TripItem {
  id: string;
  title: string;
  tagline: string;
  location: string;
  duration: string;
  travelTime: string;
  rating: string;
  reviews: string;
  price: string;
  oldPrice: string;
  savings: string;
  image: string;
  cityKey: string;
  type: 'short' | 'long';
  categoryBadge: string;
  inclusions: string[];
  visaInfo?: string;
}

const SHORT_TRIPS: TripItem[] = [
  {
    id: 's1',
    title: 'Rishikesh Ganga Riverfront Glamping',
    tagline: 'Swiss tents right on white sand riverbed',
    location: 'Shivpuri, Rishikesh',
    duration: '2 Days / 1 Night',
    travelTime: '🚗 2h 45m from Delhi Hub',
    rating: '★ 4.9',
    reviews: '1.2k',
    price: '₹3,499',
    oldPrice: '₹7,500',
    savings: 'Save ₹4,001 (53% Off)',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    cityKey: 'rishikesh',
    type: 'short',
    categoryBadge: 'ALL 3 MEALS + 16KM RAFTING',
    inclusions: [
      'Swiss air-cooled tent with attached washroom',
      'All 3 buffet meals (Breakfast, Lunch, Dinner)',
      '16km Ganga river rafting with licensed guide',
      'Evening riverside bonfire with acoustic music'
    ]
  },
  {
    id: 's2',
    title: 'Samode 475-Yr Royal Palace & Haveli',
    tagline: 'Regal courtyards & historic Rajputana suites',
    location: 'Samode, Jaipur Foothills',
    duration: '2 Days / 1 Night',
    travelTime: '⚡ 1.8h on Vande Bharat Express',
    rating: '★ 4.9',
    reviews: '2.1k',
    price: '₹4,800',
    oldPrice: '₹11,000',
    savings: 'Save ₹6,200 (56% Off)',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    cityKey: 'delhi',
    type: 'short',
    categoryBadge: 'ROYAL HERITAGE FORT',
    inclusions: [
      'Hand-painted fresco room with four-poster bed',
      'Rooftop fort-view breakfast & sunset tea',
      'Traditional puppet show & Rajasthani folk dance',
      'Heated outdoor marble courtyard pool'
    ]
  },
  {
    id: 's3',
    title: 'Mussoorie Cloud Mountain Chalet',
    tagline: 'Panoramic Doon Valley views & private jacuzzi',
    location: 'Landour, Mussoorie',
    duration: '3 Days / 2 Nights',
    travelTime: '🚗 4h drive from Delhi Hub',
    rating: '★ 4.8',
    reviews: '890',
    price: '₹5,200',
    oldPrice: '₹12,000',
    savings: 'Save ₹6,800 (57% Off)',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
    cityKey: 'delhi',
    type: 'short',
    categoryBadge: 'HIMALAYAN CHALET',
    inclusions: [
      'Cedar wooden cottage with private glass balcony',
      'Fresh Himalayan bakery breakfast daily',
      'Indoor fireplace with complimentary firewood',
      'Guided pine forest nature walk to Lal Tibba'
    ]
  }
];

const LONG_TRIPS: TripItem[] = [
  {
    id: 'l1',
    title: 'Thailand (Bangkok + Phuket) All-Inclusive',
    tagline: 'Direct flight + 5★ Anantara resort + express visa',
    location: 'Bangkok & Phuket, Thailand',
    duration: '5 Days / 4 Nights',
    travelTime: '✈️ 4h 15m Direct Flight',
    rating: '★ 4.9',
    reviews: '3.4k',
    price: '₹28,999',
    oldPrice: '₹42,000',
    savings: 'Save ₹13,001 (Flat ₹499 Visa Cap)',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
    cityKey: 'thailand',
    type: 'long',
    categoryBadge: 'FLIGHT + 5★ STAY + VISA',
    visaInfo: '⚡ 24-48h Express eVisa Included (Flat ₹499 Cap)',
    inclusions: [
      'Return direct flight (DEL ➔ BKK Suvarnabhumi)',
      '4 Nights at Anantara Riverside 5-Star Luxury Resort',
      'Speedboat tour to Coral Island & snorkeling gear',
      'Free 10GB High-Speed Asia eSIM QR delivered on WhatsApp'
    ]
  },
  {
    id: 'l2',
    title: 'Dubai 24h Express & Desert Safari VIP',
    tagline: 'Emirates direct + JW Marriott + Burj Khalifa 124th fl',
    location: 'Downtown Dubai, UAE',
    duration: '4 Days / 3 Nights',
    travelTime: '✈️ 3h 45m Direct Flight',
    rating: '★ 4.9',
    reviews: '4.8k',
    price: '₹34,500',
    oldPrice: '₹48,000',
    savings: 'Save ₹13,500 with Corporate ITC',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    cityKey: 'dubai',
    type: 'long',
    categoryBadge: 'EMIRATES FLIGHT + JW MARRIOTT',
    visaInfo: '⚡ 24h Dubai eVisa Guaranteed (100% Refund)',
    inclusions: [
      'Emirates direct flight tickets with 30kg baggage',
      'JW Marriott Marquis Deluxe Skyline room with breakfast',
      'VIP 4x4 Desert Safari with dune bashing & BBQ dinner',
      'Marhaba airport fast-track immigration escort'
    ]
  },
  {
    id: 'l3',
    title: 'Bali Ubud Bamboo Villa & Beach Club',
    tagline: 'Private pool bamboo villa + floating breakfast + e-VoA',
    location: 'Ubud & Seminyak, Bali (Indonesia)',
    duration: '6 Days / 5 Nights',
    travelTime: '✈️ Direct Flight Access',
    rating: '★ 4.9',
    reviews: '1.9k',
    price: '₹39,999',
    oldPrice: '₹55,000',
    savings: 'Save ₹15,001 (Zero Forex Markup)',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    cityKey: 'bali',
    type: 'long',
    categoryBadge: 'PRIVATE POOL BAMBOO VILLA',
    visaInfo: '⚡ 1-Hour Electronic VoA Guaranteed',
    inclusions: [
      'Return flights to Denpasar (DPS) included',
      '5 Nights in luxury private pool bamboo villa in Ubud',
      'Daily floating breakfast in private pool',
      'Full-day Nusa Penida island speedboat excursion'
    ]
  }
];

interface TripDurationSplitSectionProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function TripDurationSplitSection({
  onSelectToCart,
  onFocusCity,
  onSelectTab
}: TripDurationSplitSectionProps) {
  const [shortFilter, setShortFilter] = useState<'all' | 'riverside' | 'heritage'>('all');
  const [longFilter, setLongFilter] = useState<'all' | 'thailand' | 'dubai'>('all');

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 w-full select-none">
      
      {/* Section Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-[#0084FF] text-xs font-bold border border-blue-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Orbit Curated Trip Blueprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Short Escapes vs Long Vacations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Compare quick spontaneous weekend getaways (&lt;3 hours) with all-inclusive international holidays (4-7 days).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-slate-400">All trips include:</span>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3" /> ₹0 Hidden Fees
          </span>
        </div>
      </div>

      {/* ── TWO-COLUMN POWER GRID: SHORT TRIPS (LEFT) VS LONG TRIPS (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ════════ COLUMN 1: SHORT TRIPS (<3 HOURS / WEEKEND) ════════ */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-200/80 shadow-xl shadow-slate-900/5 space-y-5 relative overflow-hidden">
          
          {/* Subtle Top Accent Banner */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

          {/* Column Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shadow-xs">
                🚗
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Short Trips (&lt;3 Hours)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Zero Planning
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Weekend getaways near Delhi NCR · Leave in 2 hours
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('weekend')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All 12 ➔</span>
            </button>
          </div>

          {/* Feature Highlight Pill */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs flex items-center justify-between text-emerald-900 font-bold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600 fill-current" />
              <span>All 3 Meals + Adventure Activities Included</span>
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-700">
              Guaranteed Check-in
            </span>
          </div>

          {/* Short Trip Cards List */}
          <div className="space-y-4">
            {SHORT_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 justify-between group"
              >
                {/* Photo Thumbnail */}
                <div 
                  className="sm:w-36 h-32 rounded-xl overflow-hidden relative shrink-0 cursor-pointer"
                  onClick={() => onFocusCity(trip.cityKey)}
                >
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[9px] font-black">
                    {trip.duration}
                  </span>
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black">
                    {trip.rating}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase">
                      {trip.travelTime}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {trip.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {trip.tagline}
                    </div>
                  </div>

                  {/* Bullet Inclusions */}
                  <div className="space-y-0.5 text-[10px] text-slate-600">
                    {trip.inclusions.slice(0, 2).map((inc, i) => (
                      <div key={i} className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0 font-bold" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price & Book */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through font-mono">{trip.oldPrice}</span>
                      <div className="text-lg font-black text-slate-900 font-mono leading-none">
                        {trip.price} <span className="text-[10px] font-normal text-slate-500">/ all-in</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectToCart(`${trip.title} (${trip.duration})`, trip.price)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1 btn-press cursor-pointer"
                    >
                      <span>Book Weekend</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Quick Pillar Footer */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Need a custom road trip?{' '}
            <button 
              onClick={() => onSelectTab('weekend')}
              className="font-bold text-emerald-700 hover:underline"
            >
              Explore 20+ weekend homestays &amp; villas ➔
            </button>
          </div>

        </div>

        {/* ════════ COLUMN 2: LONG TRIPS (INTERNATIONAL / 4-7 DAYS) ════════ */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200/80 shadow-xl shadow-slate-900/5 space-y-5 relative overflow-hidden">
          
          {/* Subtle Top Accent Banner */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0084FF] to-cyan-400" />

          {/* Column Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0084FF] flex items-center justify-center text-xl font-bold shadow-xs">
                ✈️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Long Trips (4-7 Days Vacations)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0084FF] text-[10px] font-black uppercase">
                    All-Inclusive
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Direct Flights + 5★ Stay + Flat ₹499 Visa + Free eSIM
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('visa')}
              className="text-xs font-bold text-[#0084FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Visas ➔</span>
            </button>
          </div>

          {/* Feature Highlight Pill */}
          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 text-xs flex items-center justify-between text-blue-950 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0084FF]" />
              <span>Flat ₹499 Family Visa Cap · Save ₹3,500+ vs Agents</span>
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-blue-200 text-[#0084FF]">
              99.4% Approval
            </span>
          </div>

          {/* Long Trip Cards List */}
          <div className="space-y-4">
            {LONG_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 justify-between group"
              >
                {/* Photo Thumbnail */}
                <div 
                  className="sm:w-36 h-32 rounded-xl overflow-hidden relative shrink-0 cursor-pointer"
                  onClick={() => onFocusCity(trip.cityKey)}
                >
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[9px] font-black">
                    {trip.duration}
                  </span>
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black">
                    {trip.rating}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="text-[10px] font-extrabold text-[#0084FF] tracking-wider uppercase flex items-center gap-1">
                      <span>{trip.travelTime}</span>
                      <span>•</span>
                      <span className="text-emerald-700">₹0 Flight Fee</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0084FF] transition-colors leading-snug">
                      {trip.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {trip.tagline}
                    </div>
                  </div>

                  {/* Visa Guarantee Badge */}
                  {trip.visaInfo && (
                    <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{trip.visaInfo}</span>
                    </div>
                  )}

                  {/* Price & Book */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through font-mono">{trip.oldPrice}</span>
                      <div className="text-lg font-black text-slate-900 font-mono leading-none">
                        {trip.price} <span className="text-[10px] font-normal text-slate-500">/ person</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectToCart(`${trip.title} (${trip.duration})`, trip.price)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1 btn-press cursor-pointer"
                    >
                      <span>Book Package</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Quick Pillar Footer */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Applying only for Visas?{' '}
            <button 
              onClick={() => onSelectTab('visa')}
              className="font-bold text-[#0084FF] hover:underline"
            >
              Get Thailand, Dubai &amp; Vietnam in 24h (Flat ₹499) ➔
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
