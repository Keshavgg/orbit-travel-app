'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Share2,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  UtensilsCrossed,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { PlannrScreen, PlannrTripStop } from './types';
import { usePlannr } from '@/lib/plannr-context';
import {
  BaliHeroArt,
  TegallalangIcon,
  ZestCafeIcon,
  TirtaEmpulIcon,
  CampuhanRidgeIcon,
} from './TimelineIcons';


interface ItineraryTimelineScreenProps {
  onNavigate?: (screen: PlannrScreen, data?: any) => void;
}

export const ItineraryTimelineScreen: React.FC<ItineraryTimelineScreenProps> = ({
  onNavigate: propNavigate,
}) => {
  const {
    navigate: contextNavigate,
    goBack,
    activeTrip,
    activeDayNumber,
    setActiveDayNumber,
    setIsAddStopModalOpen,
    regenerateDayStops,
    reserveTableStop,
    showToast,
  } = usePlannr();

  const navigate = propNavigate || contextNavigate;
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Get active day object
  const currentDay =
    activeTrip.days.find((d) => d.day_number === activeDayNumber) || activeTrip.days[0];

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://plannr.app/trips/bali-with-the-boys');
    }
    showToast('Trip itinerary link copied to clipboard!', 'success');
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await regenerateDayStops(activeDayNumber);
    setIsRegenerating(false);
  };

  // Helper to render stop icon
  const renderStopIcon = (stop: PlannrTripStop, index: number) => {
    const nameLower = stop.place_name.toLowerCase();
    if (nameLower.includes('tegallalang') || nameLower.includes('terrace')) {
      return <TegallalangIcon className="w-14 h-14" />;
    }
    if (nameLower.includes('zest') || nameLower.includes('brunch') || nameLower.includes('café') || nameLower.includes('cafe')) {
      return <ZestCafeIcon className="w-14 h-14" />;
    }
    if (nameLower.includes('tirta') || nameLower.includes('temple') || nameLower.includes('empul')) {
      return <TirtaEmpulIcon className="w-14 h-14" />;
    }
    if (nameLower.includes('campuhan') || nameLower.includes('ridge') || nameLower.includes('sunset')) {
      return <CampuhanRidgeIcon className="w-14 h-14" />;
    }

    // Category fallback
    if (stop.category === 'Food') {
      return <ZestCafeIcon className="w-14 h-14" />;
    }
    if (stop.category === 'Culture') {
      return <TirtaEmpulIcon className="w-14 h-14" />;
    }
    if (index % 2 === 0) {
      return <TegallalangIcon className="w-14 h-14" />;
    }
    return <CampuhanRidgeIcon className="w-14 h-14" />;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] pb-28 select-none">
      {/* ── Top Header Hero Banner (Matching Page 4) ── */}
      <div className="relative w-full h-[230px] overflow-hidden bg-[#9C8F9F]">
        {/* Background Vector Artwork */}
        <div className="absolute inset-0">
          <BaliHeroArt className="w-full h-full object-cover" />
        </div>

        {/* Top Control Bar */}
        <div className="relative z-10 pt-4 px-4 flex items-center justify-between">
          {/* Back Arrow */}
          <button
            type="button"
            onClick={goBack}
            className="w-11 h-11 rounded-full bg-white text-[#151E28] flex items-center justify-center shadow-md active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Right Action Icons: Group Count & Share */}
          <div className="flex items-center gap-2">
            {/* Group Members Pill: 👥 4 (navigates to Screen 5 Group Collaboration) */}
            <button
              type="button"
              onClick={() => navigate('group')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#151E28] font-bold text-sm shadow-md active:scale-95 transition-transform hover:bg-slate-50"
            >
              <Users className="w-4 h-4 text-[#151E28]" />
              <span>{activeTrip.members?.length || 4}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-11 h-11 rounded-full bg-white text-[#151E28] flex items-center justify-center shadow-md active:scale-95 transition-transform"
              aria-label="Share trip"
            >
              <Share2 className="w-4 h-4 text-[#151E28]" />
            </button>
          </div>
        </div>

        {/* Header Text Overlay (Base of Hero) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
          <div className="inline-block text-[11px] font-black uppercase tracking-wider text-white/90 drop-shadow-sm mb-1">
            AI-BUILT ITINERARY · {activeTrip.destination?.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {activeTrip.title}
          </h1>
          <p className="text-xs text-white/95 font-medium drop-shadow-sm mt-0.5">
            {activeTrip.start_date} – {activeTrip.end_date} · {activeTrip.total_days} days · ₹{activeTrip.budget_per_person?.toLocaleString('en-IN')} / person
          </p>
        </div>
      </div>

      {/* ── Day Selection Tabs (Horizontal Scroll) ── */}
      <div className="px-4 py-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max">
          {activeTrip.days.map((day) => {
            const isSelected = day.day_number === activeDayNumber;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setActiveDayNumber(day.day_number)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-[#151E28] text-white shadow-md'
                    : 'bg-white text-[#151E28] border border-[#EDE7DF] hover:bg-[#F5EFE6]'
                }`}
              >
                {day.day_number === 1 ? 'Day 1 · Ubud' : `Day ${day.day_number}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Vertical Timeline Section (Matching Page 4) ── */}
      <div className="px-4 mt-1">
        <div className="relative pl-14 space-y-4">
          {/* Vertical Guide Line */}
          <div className="absolute left-[34px] top-6 bottom-6 w-[2px] bg-[#E6DECة] bg-[#E3DCD1]" />

          {currentDay.stops.map((stop, index) => {
            const isTegallalang = stop.place_name.toLowerCase().includes('tegallalang');
            const isZest = stop.place_name.toLowerCase().includes('zest');
            const isTirta = stop.place_name.toLowerCase().includes('tirta');
            const isCampuhan = stop.place_name.toLowerCase().includes('campuhan');

            return (
              <div key={stop.id} className="relative group">
                {/* Time Indicator on the Left */}
                <div className="absolute -left-14 top-4 w-12 text-left">
                  <span className="text-sm font-bold text-[#151E28] tracking-tight">
                    {stop.time_slot}
                  </span>
                </div>

                {/* Timeline Card */}
                <div className="bg-white rounded-3xl p-3.5 border border-[#EDE7DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-3.5 hover:border-[#D95338]/30 transition-all">
                  {/* Custom Vector Icon */}
                  {renderStopIcon(stop, index)}

                  {/* Card Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="text-[15px] font-bold text-[#151E28] leading-snug truncate">
                      {stop.place_name}
                    </h4>
                    <p className="text-xs text-[#7A8699] mt-0.5 line-clamp-1">
                      {stop.subtitle}
                    </p>

                    {/* Badge Row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Category Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          stop.category === 'Food'
                            ? 'bg-[#FDF0EC] text-[#D95338]'
                            : stop.category === 'Culture'
                            ? 'bg-[#E6F0FA] text-[#0066CC]'
                            : 'bg-[#E6F0FA] text-[#0066CC]'
                        }`}
                      >
                        {stop.category}
                      </span>

                      {/* Status or Action Badge */}
                      {isTegallalang && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E5F5ED] text-[#1B8054]">
                          Booked
                        </span>
                      )}

                      {isZest && (
                        <button
                          type="button"
                          onClick={() => reserveTableStop(stop.id, 'Zest Café')}
                          className={`text-[11px] font-bold px-3 py-0.5 rounded-full border transition-all ${
                            stop.is_booked
                              ? 'bg-[#E5F5ED] text-[#1B8054] border-[#C8E6D9]'
                              : 'bg-[#FAF7F2] text-[#151E28] border-[#EDE7DF] hover:bg-[#F3ECE0]'
                          }`}
                        >
                          {stop.is_booked ? 'Reserved ✓' : 'Reserve table'}
                        </button>
                      )}

                      {isTirta && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#B26B00]">
                          ₹400 pp · unbooked
                        </span>
                      )}

                      {!isTegallalang && !isZest && !isTirta && stop.price_per_person > 0 && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A8699] border border-[#EDE7DF]">
                          ₹{stop.price_per_person} pp
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Action Buttons Below Timeline (Matching Page 4) ── */}
        <div className="flex items-center gap-3 mt-6">
          {/* + Add stop button */}
          <button
            type="button"
            onClick={() => setIsAddStopModalOpen(true)}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-white border border-[#EDE7DF] text-[#151E28] font-bold text-sm hover:bg-[#FAF7F2] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add stop</span>
          </button>

          {/* Regenerate day button */}
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#E8EEF8] text-[#1F5EFF] font-bold text-sm hover:bg-[#DCE7F8] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate day'}</span>
          </button>
        </div>
      </div>

      {/* ── Sticky Bottom Bar (Matching Page 4) ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE7DF] px-4 py-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8699] block">
            UNBOOKED ITEMS
          </span>
          <div className="text-lg font-black text-[#151E28] leading-tight mt-0.5">
            ₹18,600 <span className="text-xs font-normal text-[#7A8699]">/ person</span>
          </div>
        </div>

        {/* Direct Link to Screen 6: Checkout */}
        <button
          type="button"
          onClick={() => navigate('checkout')}
          className="py-3 px-6 rounded-2xl bg-[#D95338] text-white font-bold text-sm hover:bg-[#C4442B] active:scale-95 transition-all shadow-[0_4px_14px_rgba(217,83,56,0.35)] flex items-center gap-1.5"
        >
          <span>Book all · 6</span>
        </button>
      </div>


    </div>
  );
};
