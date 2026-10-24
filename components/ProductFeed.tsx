'use client';

import React from 'react';
import { ArrowRight, Check, Star, Clock, ShieldCheck, Globe, Zap, Sparkles, FileText, Camera, Flame } from 'lucide-react';

export interface FeedItem {
  id: string;
  title: string;
  subtitle?: string;
  timeBadge?: string;
  rating?: string;
  tag: string;
  tagColor: string;
  price: string;
  oldPrice?: string;
  image: string;
  perks?: string[];
  cityKey: string;
}

export interface VisaItem {
  id: string;
  country: string;
  flag: string;
  timeline: string;
  approval: string;
  govtFee: number;
  platformFee: number;
  image: string;
  docs: string;
  bundlePrice: string;
  cityKey: string;
}

export const VISA_ITEMS: VisaItem[] = [
  {
    id: 'v1',
    country: 'Thailand',
    flag: '🇹🇭',
    timeline: '24-48 Hours',
    approval: '99.2% Approved',
    govtFee: 2150,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&auto=format&fit=crop&q=80',
    docs: 'Passport Photo + White Background Photo',
    bundlePrice: '₹18,999 (Flight + 4-Star Resort + Visa)',
    cityKey: 'thailand'
  },
  {
    id: 'v2',
    country: 'Dubai / UAE',
    flag: '🇦🇪',
    timeline: '24 Hours Guaranteed',
    approval: '98.9% Approved',
    govtFee: 5690,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
    docs: 'Passport Front & Back Page Scan',
    bundlePrice: '₹24,500 (Flights + 4-Star Downtown Hotel + Visa)',
    cityKey: 'dubai'
  },
  {
    id: 'v3',
    country: 'Vietnam',
    flag: '🇻🇳',
    timeline: '3 Working Days',
    approval: '99.5% Approved',
    govtFee: 2100,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
    docs: 'Passport Bio Page Scan',
    bundlePrice: '₹18,999 (Da Nang Beachfront Resort + Flight + Visa)',
    cityKey: 'vietnam'
  },
  {
    id: 'v4',
    country: 'Bali (Indonesia)',
    flag: '🇮🇩',
    timeline: 'Instant (1-2 Hours)',
    approval: '99.8% Approved',
    govtFee: 2850,
    platformFee: 499,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
    docs: 'Passport Front Cover + Return Ticket',
    bundlePrice: '₹26,800 (Private Pool Villa + Flight + Visa)',
    cityKey: 'bali'
  }
];

export const WEEKEND_ITEMS: FeedItem[] = [
  {
    id: 'w1',
    title: 'Rishikesh Ganga Riverfront Glamping',
    subtitle: 'Luxury Swiss tents right on the riverbed',
    timeBadge: '🚗 2h 45m from Delhi Hub',
    rating: '★ 4.9 (1.2k)',
    tag: 'ALL MEALS INCLUDED',
    tagColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    price: '₹3,499',
    oldPrice: '₹7,500',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
    perks: ['River Rafting Included', 'Evening Bonfire & Acoustic Jam', 'Zero Hidden Fees'],
    cityKey: 'rishikesh'
  },
  {
    id: 'w2',
    title: 'Samode Palace Heritage Haveli',
    subtitle: '475-year-old regal fort & infinity heated pool',
    timeBadge: '🚗 3h 15m from Delhi',
    rating: '★ 4.8 (890)',
    tag: 'ROYAL RAJASTHANI MEALS',
    tagColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    price: '₹7,499',
    oldPrice: '₹14,000',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
    perks: ['Frescoed Maharaja Suite', 'Folk Dance Performance', 'Late Check-out 4 PM'],
    cityKey: 'delhi'
  },
  {
    id: 'w3',
    title: 'Jim Corbett Private Jungle Glass Chalet',
    subtitle: 'Dense sal forest cottage with private deck',
    timeBadge: '🚗 4h 10m from Delhi',
    rating: '★ 4.9 (2.1k)',
    tag: 'FREE JEEP SAFARI',
    tagColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    price: '₹5,999',
    oldPrice: '₹11,500',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    perks: ['Complimentary Zone Safari', 'All 3 Buffet Meals', 'Naturalist Guide'],
    cityKey: 'delhi'
  },
  {
    id: 'w4',
    title: 'Neemrana Royal Fort-Palace Weekend',
    subtitle: '15th-century stepped fortress on Delhi-Jaipur highway',
    timeBadge: '🚗 1h 45m from Delhi Hub',
    rating: '★ 4.7 (3.4k)',
    tag: 'INSTANT CONFIRMATION',
    tagColor: 'bg-blue-100 text-blue-800 border border-blue-200',
    price: '₹6,499',
    oldPrice: '₹12,000',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    perks: ['Zipline Discount', 'High Tea at Sunset Point', 'Free Parking & EV Charger'],
    cityKey: 'delhi'
  }
];

export const DIRT_CHEAP_ITEMS: FeedItem[] = [
  {
    id: 'd1',
    title: 'IndiGo Delhi ➔ Goa (Dabolim)',
    subtitle: 'Unsold inventory released 18h before flight',
    timeBadge: '⚡ 3 Seats Remaining',
    rating: '★ 4.9 (420 booked today)',
    tag: '62% BELOW AIRLINE RETAIL',
    tagColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    price: '₹2,899',
    oldPrice: '₹8,200',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    perks: ['Direct Non-stop Flight', '15kg Check-in + 7kg Cabin', 'Official PNR in 30s'],
    cityKey: 'goa'
  },
  {
    id: 'd2',
    title: 'Air India Delhi ➔ Dubai (DXB T3)',
    subtitle: 'Boeing 787 Dreamliner distressed corporate seat drop',
    timeBadge: '⚡ 5 Seats Remaining',
    rating: '★ 4.8 (190 booked)',
    tag: 'HOT MEAL & 25KG BAGGAGE',
    tagColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    price: '₹9,800',
    oldPrice: '₹18,500',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
    perks: ['Full Service Flight', 'Free Hot Meals & Beverages', 'Instant WhatsApp Pass'],
    cityKey: 'dubai'
  },
  {
    id: 'd3',
    title: 'Thai Airways Delhi ➔ Bangkok Direct',
    subtitle: 'Midnight red-eye flight flash drop',
    timeBadge: '⚡ 2 Seats Remaining',
    rating: '★ 4.9 (310 booked)',
    tag: '54% OFF RETAIL',
    tagColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    price: '₹8,999',
    oldPrice: '₹19,800',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&auto=format&fit=crop&q=80',
    perks: ['Non-Stop Airbus A350', 'Flat ₹499 Visa Bundle Eligible', 'Zero Cancellation Penalty'],
    cityKey: 'thailand'
  }
];

interface ProductFeedProps {
  activeTab: string;
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  onOpenVisaModal?: (visa: VisaItem) => void;
}

export default function ProductFeed({
  activeTab,
  onSelectToCart,
  onFocusCity,
  onOpenVisaModal
}: ProductFeedProps) {
  
  // 1. WEEKEND GETAWAYS VIEW
  if (activeTab === 'weekend') {
    return (
      <div className="space-y-6 tab-content-enter select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              🚗 Weekend Getaways &lt;3 Hours from Delhi NCR
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All properties vetted with guaranteed early check-in, verified river views &amp; all meals included.
            </p>
          </div>
          <span className="text-xs font-bold text-[#0084FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            ⚡ Instant 1-Tap Booking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WEEKEND_ITEMS.map((item) => (
            <div key={item.id} className="fs-card p-5 space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div 
                  className="relative rounded-2xl overflow-hidden h-52 cursor-pointer"
                  onClick={() => onFocusCity(item.cityKey)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[11px] font-extrabold text-slate-900 shadow-md">
                    {item.timeBadge}
                  </span>
                  <span className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold shadow-sm ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0084FF] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      {item.rating}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  {item.perks?.map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through font-mono">{item.oldPrice}</span>
                  <div className="text-2xl font-black text-slate-900 leading-tight font-mono">
                    {item.price} <span className="text-xs text-slate-500 font-normal">/ all-in</span>
                  </div>
                </div>
                <button
                  onClick={() => onSelectToCart(item.title, item.price)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 btn-press"
                >
                  <span>Book in 1-Click</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. VISA VIEW (ATLYS DISRUPTION)
  if (activeTab === 'visa') {
    return (
      <div className="space-y-5 tab-content-enter select-none">
        {/* Atlys Disruption Guarantee Card */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0A84FF] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
              Atlys Disruption Guarantee
            </span>
            <h3 className="text-2xl font-black tracking-tight">Flat ₹499 Family Visa Service Fee Cap</h3>
            <p className="text-xs text-white/90 max-w-xl leading-relaxed">
              Other apps charge ₹1,200/person (₹4,800 for a family of 4). At Orbit, your entire family of up to 6 members is processed under a single flat ₹499 fee cap. Snap your passport photo and AI automatically enhances it to embassy specs.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/20 text-center shrink-0 shadow-lg">
            <div className="text-xs text-white/90 font-medium">Family Savings vs Atlys</div>
            <div className="text-3xl font-black text-amber-300 font-mono">Save ₹4,301</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VISA_ITEMS.map((v) => (
            <div key={v.id} className="fs-card p-5 space-y-4 group">
              <div 
                className="flex items-start justify-between cursor-pointer" 
                onClick={() => onFocusCity(v.cityKey)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{v.flag}</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0084FF] transition-colors">{v.country} Express Visa</h3>
                    <span className="text-xs text-emerald-700 font-bold">⚡ {v.timeline} · {v.approval}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-extrabold border border-emerald-200">
                  24h Express
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Official Embassy Fee:</span>
                  <span className="text-slate-900 font-bold">₹{v.govtFee.toLocaleString()} (At Actuals)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Orbit Family Fee Cap:</span>
                  <span className="text-emerald-700 font-bold">Flat ₹{v.platformFee} Total</span>
                </div>
                <div className="flex justify-between text-slate-400 line-through">
                  <span>Other Apps (Atlys 4 Travellers):</span>
                  <span>₹4,800 (₹1,200/person)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Total All-in Fee:</span>
                  <strong className="text-lg font-black text-[#0084FF]">
                    ₹{(v.govtFee + v.platformFee).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-[#0084FF]" />
                  <span>Docs: {v.docs}</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>AI Embassy Photo Cropping &amp; Auto-Resize</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onFocusCity(v.cityKey)}
                  className="text-xs text-slate-500 hover:text-[#0084FF] font-bold"
                >
                  View Route on Globe ➔
                </button>
                <button
                  onClick={() => {
                    if (onOpenVisaModal) {
                      onOpenVisaModal(v);
                    } else {
                      onSelectToCart(`${v.country} Express Visa`, `₹${(v.govtFee + v.platformFee).toLocaleString()}`);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 btn-press cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Apply Visa in 1-Click</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. DIRT CHEAP FLASH DROPS
  if (activeTab === 'dirtcheap') {
    return (
      <div className="space-y-6 tab-content-enter select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#EB2026]" />
              <span>Distressed Airline Seat Drops (60% to 70% Off)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unsold seats released 12-24 hours prior to departure rather than flying empty. Guaranteed PNR + 15kg baggage included.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            CLOSES IN 01:24:08
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DIRT_CHEAP_ITEMS.map((item) => (
            <div key={item.id} className="fs-card p-5 space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div 
                  className="relative rounded-2xl overflow-hidden h-44 cursor-pointer"
                  onClick={() => onFocusCity(item.cityKey)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600 text-[10px] font-black text-white shadow-md">
                    {item.timeBadge}
                  </span>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[9px] font-black bg-white/90 text-rose-800">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#0084FF] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {item.perks?.map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-700">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through font-mono">{item.oldPrice}</span>
                  <div className="text-2xl font-black text-slate-900 leading-tight font-mono">
                    {item.price}
                  </div>
                </div>
                <button
                  onClick={() => onSelectToCart(item.title, item.price)}
                  className="px-4 py-2 rounded-xl bg-[#EB2026] hover:bg-[#c91823] active:scale-95 text-white text-xs font-black shadow-md shadow-rose-500/30 transition-all flex items-center gap-1.5 btn-press"
                >
                  <span>Grab Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. ESIM & FOREX TAB
  if (activeTab === 'esim') {
    return (
      <div className="space-y-6 tab-content-enter select-none">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
              140+ Countries Covered
            </span>
            <h3 className="text-2xl font-black tracking-tight">Free 1GB International Data Pass</h3>
            <p className="text-xs text-white/90 max-w-xl leading-relaxed">
              Every visa approved on Orbit receives an automated high-speed eSIM QR code on WhatsApp in under 60 seconds. Zero roaming shock on landing.
            </p>
          </div>
          <div className="bg-white/15 px-6 py-3.5 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="text-xs text-white/90">Forex Markup</div>
            <div className="text-3xl font-black text-emerald-300 font-mono">0% Markup</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="fs-card p-5 space-y-4">
            <div className="text-3xl">🇹🇭</div>
            <h3 className="text-base font-extrabold text-slate-900">Thailand Unlimited 5G eSIM (8 Days)</h3>
            <p className="text-xs text-slate-500">TrueMove / AIS 5G network · 15GB high-speed data + unlimited calls</p>
            <div className="text-2xl font-black text-slate-900 font-mono">₹499 <span className="text-xs text-slate-500 font-normal">/ pass</span></div>
            <button
              onClick={() => onSelectToCart('Thailand 8-Day 5G eSIM QR', '₹499')}
              className="w-full py-2.5 rounded-xl bg-[#0084FF] text-white text-xs font-bold shadow-md hover:bg-blue-600 transition"
            >
              Get Instant QR
            </button>
          </div>

          <div className="fs-card p-5 space-y-4">
            <div className="text-3xl">🇦🇪</div>
            <h3 className="text-base font-extrabold text-slate-900">Dubai / UAE 5G eSIM (10GB)</h3>
            <p className="text-xs text-slate-500">du / Etisalat network · Instant activation at DXB terminal</p>
            <div className="text-2xl font-black text-slate-900 font-mono">₹899 <span className="text-xs text-slate-500 font-normal">/ pass</span></div>
            <button
              onClick={() => onSelectToCart('Dubai 10GB 5G eSIM QR', '₹899')}
              className="w-full py-2.5 rounded-xl bg-[#0084FF] text-white text-xs font-bold shadow-md hover:bg-blue-600 transition"
            >
              Get Instant QR
            </button>
          </div>

          <div className="fs-card p-5 space-y-4">
            <div className="text-3xl">💳</div>
            <h3 className="text-base font-extrabold text-slate-900">Zero Forex Multi-Currency Card</h3>
            <p className="text-xs text-slate-500">Mastercard World · Zero markup vs bank 3.5% · Delivered in 24h</p>
            <div className="text-2xl font-black text-emerald-700 font-mono">₹0 Fee <span className="text-xs text-slate-500 font-normal">Free Card</span></div>
            <button
              onClick={() => onSelectToCart('Orbit Zero Forex Multi-Currency Card', '₹0')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition"
            >
              Order Free Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
