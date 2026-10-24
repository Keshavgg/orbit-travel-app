'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  CloudRain, 
  Plane, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Bell, 
  ArrowRight,
  Send,
  Calendar,
  Zap,
  Globe
} from 'lucide-react';

export interface TravelAlert {
  id: string;
  category: 'flight' | 'visa' | 'concert' | 'weather';
  badge: string;
  badgeColor: string;
  title: string;
  location: string;
  timeStr: string;
  description: string;
  impactLevel: 'Low' | 'Moderate' | 'High';
  recommendedAction: string;
  actionButtonLabel?: string;
  actionItemName?: string;
  actionItemPrice?: string;
}

const LIVE_ALERTS: TravelAlert[] = [
  {
    id: 'a1',
    category: 'flight',
    badge: 'AIRSPACE ADVISORY',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Delhi IGI Airport (DEL) Morning Fog Window — CAT-III Active',
    location: 'Delhi NCR (DEL T1/T2/T3)',
    timeStr: 'Updated 12 mins ago',
    description: 'Dense radiation fog expected between 05:00 AM and 08:30 AM. CAT-III ILS approaches active. Airlines have enacted zero-penalty reschedule waivers.',
    impactLevel: 'Moderate',
    recommendedAction: 'Choose late morning flights departing after 09:30 AM for 100% on-time departure guarantee.',
    actionButtonLabel: 'View On-Time Noon Flights',
    actionItemName: 'IndiGo 10:15 AM Direct (DEL ➔ GOI)',
    actionItemPrice: '₹3,199'
  },
  {
    id: 'a2',
    category: 'visa',
    badge: 'IMMIGRATION UPDATE',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Thailand 60-Day Visa Exemption Extended for Indian Citizens',
    location: 'Bangkok (BKK & DMK) / Phuket (HKT)',
    timeStr: 'Updated 1 hour ago',
    description: 'Royal Thai Embassy has officially confirmed 60-day visa-free entry for Indian passport holders. Orbit automated OCR arrival card pre-check active.',
    impactLevel: 'Low',
    recommendedAction: 'No consular visa required! Ensure 6 months passport validity and pre-fill arrival card with Orbit 1-click generator.',
    actionButtonLabel: 'Pre-check Passport OCR (₹499)',
    actionItemName: 'Thailand OCR Fast-Track & eSIM Pass',
    actionItemPrice: '₹499'
  },
  {
    id: 'a3',
    category: 'concert',
    badge: 'EVENT ACCESS NOTICE',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Coldplay Music of the Spheres (Mumbai) — Gate 4 VIP Rapid Lane',
    location: 'DY Patil Stadium, Navi Mumbai',
    timeStr: 'Updated 3 hours ago',
    description: 'Special Harbour Line local train frequencies doubled on concert dates. Orbit VIP combo wristband pickup counters active at Gate 4 from 02:00 PM.',
    impactLevel: 'High',
    recommendedAction: 'Avail Orbit Stadium Shuttle service departing direct from BKC and Lower Parel hotels to bypass expressway bottlenecks.',
    actionButtonLabel: 'Book Coldplay VIP Combo Pass',
    actionItemName: 'Coldplay Mumbai VIP Pass + Stay + Cab Combo',
    actionItemPrice: '₹14,999'
  },
  {
    id: 'a4',
    category: 'weather',
    badge: 'MONSOON & SURF ADVISORY',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Goa Coastal Waters: Red Flag at Non-Lifeguard Beach Sections',
    location: 'North & South Goa Coastline',
    timeStr: 'Updated 4 hours ago',
    description: 'Drishti Lifesaving advisory active for swimming in rough sea zones. Water sports operating normally in sheltered bays (Bambolim & Grand Island).',
    impactLevel: 'Moderate',
    recommendedAction: 'Book beach villas with heated private pools for guaranteed swimming without sea condition restrictions.',
    actionButtonLabel: 'Explore Private Pool Villas',
    actionItemName: 'Candolim 3BHK Sunset Private Pool Villa',
    actionItemPrice: '₹13,499'
  },
  {
    id: 'a5',
    category: 'visa',
    badge: 'FAST-TRACK RADAR',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Dubai 48-Hour Transit Visa Now Available with Instant DXB Terminal Entry',
    location: 'Dubai International (DXB Terminal 1 & 3)',
    timeStr: 'Updated 6 hours ago',
    description: 'General Directorate of Residency and Foreigners Affairs (GDRFA) now approving transit eVisas in under 4 hours via automated biometrics.',
    impactLevel: 'Low',
    recommendedAction: 'Add a 2-day Dubai stopover on your flight to Europe or US with flat ₹499 processing.',
    actionButtonLabel: 'Apply 48h Dubai Transit Visa',
    actionItemName: 'Dubai 48h Express Transit Visa',
    actionItemPrice: '₹499'
  }
];

interface TravelAlertsFeedProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
}

export default function TravelAlertsFeed({
  onSelectToCart,
  onFocusCity
}: TravelAlertsFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flight' | 'visa' | 'concert' | 'weather'>('all');
  const [whatsappPhone, setWhatsappPhone] = useState('+91 98101 23456');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const filteredAlerts = LIVE_ALERTS.filter((alert) => {
    if (selectedFilter === 'all') return true;
    return alert.category === selectedFilter;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 tab-content-enter select-none">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0E1A3A] via-[#1A2C5B] to-[#0A84FF] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-Time DGCA, METAR &amp; Embassy Radar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Live Travel Advisories &amp; Status Bulletins
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Instant updates on airport delays, visa regulation shifts, and major concert access routes. AI automatically proposes zero-penalty alternative bookings.
          </p>
        </div>

        {/* WhatsApp Alert Subscription Box */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 sm:w-80 shrink-0 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300">
            <Bell className="w-4 h-4" />
            <span>Get Live Alerts on WhatsApp</span>
          </div>
          {isSubscribed ? (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Subscribed! Live advisories active.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="+91 Mobile number"
                className="w-full bg-black/20 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition shrink-0"
              >
                Alert Me
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { id: 'all', label: 'All Live Advisories (5)', icon: '⚡' },
          { id: 'flight', label: 'Flights & Airports', icon: '✈️' },
          { id: 'visa', label: 'Visas & Immigration', icon: '🛂' },
          { id: 'concert', label: 'Concerts & Events', icon: '🎸' },
          { id: 'weather', label: 'Weather & Ocean', icon: '🌊' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center space-x-1.5 ${
              selectedFilter === f.id
                ? 'bg-[#0E1A3A] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Alerts Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="fs-card p-5 space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${alert.badgeColor}`}>
                  {alert.badge}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> {alert.timeStr}
                </span>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0084FF] transition-colors leading-snug">
                  {alert.title}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0084FF] shrink-0" />
                  <span>{alert.location}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {alert.description}
              </p>

              {/* Action Recommendation */}
              <div className="text-xs text-slate-700 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/60 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#0084FF]">
                  AI Recommended Action:
                </div>
                <div className="font-medium text-slate-800">
                  {alert.recommendedAction}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            {alert.actionButtonLabel && alert.actionItemName && alert.actionItemPrice && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Instant Solution Rate:</div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {alert.actionItemPrice}
                  </div>
                </div>
                <button
                  onClick={() => onSelectToCart(alert.actionItemName!, alert.actionItemPrice!)}
                  className="px-4 py-2 rounded-xl bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 btn-press cursor-pointer"
                >
                  <span>{alert.actionButtonLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
