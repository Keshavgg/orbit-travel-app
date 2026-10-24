'use client';

import React from 'react';

interface ServiceTab {
  id: string;
  icon: string;
  title: string;
  sublabel: string;
  isHot?: boolean;
}

const SERVICE_TABS: ServiceTab[] = [
  { id: 'recommender', icon: '✨', title: 'AI Recommender', sublabel: 'Tell AI & Get Plan ↗', isHot: true },
  { id: 'events', icon: '🍸', title: 'Events & City Life', sublabel: 'Cafes, Nightlife & Gigs', isHot: true },
  { id: 'flights', icon: '✈️', title: 'Flights', sublabel: '520+ Live Routes' },
  { id: 'stays', icon: '🏨', title: 'Hotels & Villas', sublabel: '520+ Luxury Stays' },
  { id: 'weekend', icon: '🏡', title: 'Weekend <3h', sublabel: 'Rishikesh, Jaipur' },
  { id: 'visa', icon: '🛂', title: 'Visas', sublabel: 'Flat ₹499 Cap', isHot: true },
  { id: 'dirtcheap', icon: '🔥', title: 'Cheap Drops', sublabel: '60% Off Unsold', isHot: true },
  { id: 'gst', icon: '🏢', title: 'myBiz (GST)', sublabel: '18% & 5% ITC' },
  { id: 'esim', icon: '📶', title: 'eSIM & Forex', sublabel: '140+ Countries' },
];

interface ServiceNavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export default function ServiceNavigation({ activeTab, onSelectTab }: ServiceNavigationProps) {
  const handleTabClick = (tabId: string) => {
    if (tabId === 'recommender') {
      window.open('/chat', '_blank');
      return;
    }
    onSelectTab(tabId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-8 pb-1 relative z-10 select-none">
      {/* Floating White Category Pill Capsule Dock (Exact MakeMyTrip screenshot style) */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 px-3 py-3 sm:py-3.5 sm:px-4">
        <div className="flex items-center justify-between sm:justify-around overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          {SERVICE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-xl transition-all duration-150 shrink-0 group relative btn-press cursor-pointer ${
                  isActive
                    ? 'text-[#0084FF] font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-50'
                }`}
              >
                {/* Full Unclipped Icon */}
                <div className={`text-2xl sm:text-3xl leading-none transition-transform duration-200 group-hover:scale-110 mb-1.5 ${
                  isActive ? 'scale-110' : ''
                }`}>
                  {tab.icon}
                </div>

                {/* Title */}
                <div className="text-xs sm:text-[13px] tracking-tight leading-tight flex items-center gap-1 font-bold">
                  <span>{tab.title}</span>
                  {tab.isHot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EB2026] animate-ping" />
                  )}
                </div>

                {/* Sublabel */}
                <span className={`text-[10px] mt-0.5 leading-tight ${
                  isActive ? 'text-[#0084FF] font-bold' : 'text-slate-400 font-normal'
                }`}>
                  {tab.sublabel}
                </span>

                {/* Bottom Active Pill Indicator Line */}
                {isActive && (
                  <div className="absolute -bottom-1.5 inset-x-3 h-1 bg-[#0084FF] rounded-full shadow-sm shadow-blue-500/50" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
