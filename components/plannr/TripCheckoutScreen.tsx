'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  CreditCard,
  QrCode,
  ShieldCheck,
  Check,
  Send,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { PlannrScreen } from './types';
import { usePlannr } from '@/lib/plannr-context';
import {
  CheckoutFlightIcon,
  CheckoutVillaIcon,
  CheckoutActivitiesIcon,
  CheckoutDiningIcon,
} from './TimelineIcons';


interface TripCheckoutScreenProps {
  onNavigate?: (screen: PlannrScreen, data?: any) => void;
}

export const TripCheckoutScreen: React.FC<TripCheckoutScreenProps> = ({
  onNavigate: propNavigate,
}) => {
  const {
    navigate: contextNavigate,
    goBack,
    activeTrip,
    requestPaymentShares,
    payMyShare,
    showToast,
  } = usePlannr();

  const navigate = propNavigate || contextNavigate;
  const [activeTab, setActiveTab] = useState<'trip_cart' | 'split_settle'>('trip_cart');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);

  const allStops = activeTrip.days.flatMap((d) => d.stops);
  const myShareAmount = activeTrip.members?.find((m) => m.is_current_user)?.share_amount || activeTrip.budget_per_person || 15000;
  const totalTripCost = activeTrip.total_budget || (activeTrip.budget_per_person * (activeTrip.members?.length || 4));
  const isMicro = activeTrip.total_days === 1;

  // Status badges helper
  const getStatusBadge = (status: string, hasPaid: boolean, isReminded?: boolean, isYou?: boolean) => {
    if (hasPaid) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5F5ED] text-[#1B8054]">
          Paid
        </span>
      );
    }
    if (isYou) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5F5ED] text-[#1B8054]">
          Paying
        </span>
      );
    }
    if (isReminded || status === 'reminded') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#B26B00]">
          Reminded
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F1EFEA] text-[#737985]">
        Pending
      </span>
    );
  };

  const handleRequestShares = async () => {
    setIsRequesting(true);
    await requestPaymentShares();
    setIsRequesting(false);
  };

  const handlePayShare = async () => {
    setIsPaying(true);
    await payMyShare('UPI_INSTANT');
    setIsPaying(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] pb-36 select-none">
      {/* ── Top Bar (Matching Page 6) ── */}
      <div className="pt-4 px-4 pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="w-11 h-11 rounded-full bg-white text-[#151E28] flex items-center justify-center shadow-sm border border-[#EDE7DF] active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div>
          <h1 className="text-xl font-black text-[#151E28] leading-tight">
            Book the trip
          </h1>
          <p className="text-xs text-[#7A8699] font-medium mt-0.5">
            One checkout · everything for {activeTrip.destination}
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ── Top Tabs: Trip cart / Split & settle ── */}
        <div className="p-1 rounded-2xl bg-[#EDE7DF]/60 flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab('trip_cart')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'trip_cart'
                ? 'bg-white text-[#151E28] shadow-sm'
                : 'text-[#7A8699] hover:text-[#151E28]'
            }`}
          >
            Trip cart · {allStops.length || 4}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split_settle')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'split_settle'
                ? 'bg-white text-[#151E28] shadow-sm'
                : 'text-[#7A8699] hover:text-[#151E28]'
            }`}
          >
            Split &amp; settle
          </button>
        </div>

        {/* ── Itemized Cart Breakdown Cards (Matching Page 6) ── */}
        <div className="space-y-3">
          {/* Card 1: Flights / Transit */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#1A56DB]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutFlightIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  {isMicro
                    ? `${activeTrip.destination} Fast-Track Metro & Cab`
                    : `DEL → ${activeTrip.destination.slice(0, 3).toUpperCase()} · Round Trip Flight`}
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  {activeTrip.start_date} · {activeTrip.members?.length || 4} pax · express connectivity
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">
                ₹{Math.round(activeTrip.budget_per_person * (isMicro ? 0.25 : 0.45)).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#7A8699]">per person</div>
            </div>
          </div>

          {/* Card 2: Villa / Stay */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#D95338]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutVillaIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  {isMicro
                    ? `${activeTrip.destination} Terminal & Hub Day Lounge`
                    : `${activeTrip.destination} Curated Boutique Stay`}
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  {isMicro ? 'Lounge pass & luggage assist' : `${activeTrip.total_days} nights · pool suite · breakfast`}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">
                {isMicro ? '₹0' : `₹${Math.round(activeTrip.budget_per_person * 0.35).toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-[#7A8699]">{isMicro ? 'included' : 'per person'}</div>
            </div>
          </div>

          {/* Card 3: Activities */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#1B8054]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutActivitiesIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  Experiences · {allStops.filter((s) => s.category === 'Activity' || s.category === 'Culture').length || 3} items
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  {allStops.map((s) => s.place_name).slice(0, 3).join(', ') || 'Curated sightseeing & activities'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">
                ₹{Math.round(activeTrip.budget_per_person * (isMicro ? 0.75 : 0.2)).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#7A8699]">per person</div>
            </div>
          </div>

          {/* Card 4: Restaurants */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#D95338]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutDiningIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  Dining · {allStops.filter((s) => s.category === 'Food').length || 1} reservations
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  {allStops.filter((s) => s.category === 'Food').map((s) => s.place_name).join(', ') || 'Signature local cafes'} · pay at venue
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">₹0</div>
              <div className="text-[11px] text-[#7A8699]">reserve only</div>
            </div>
          </div>
        </div>

        {/* ── Split Section ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-[#151E28]">
              Split {activeTrip.members?.length || 4} ways
            </h3>
            <button
              type="button"
              onClick={() => showToast(`Equal split enabled (₹${myShareAmount.toLocaleString('en-IN')} each)`, 'info')}
              className="text-xs font-bold text-[#0066CC] hover:underline"
            >
              Equal · edit
            </button>
          </div>

          {/* Dynamic Member Status List */}
          <div className="space-y-2">
            {activeTrip.members?.map((mem) => {
              const isYou = mem.is_current_user || mem.initials === 'RS';
              const shareAmt = mem.share_amount || myShareAmount;
              return (
                <div key={mem.id} className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                        isYou ? 'bg-[#D95338]' : mem.status === 'confirmed' ? 'bg-[#26855F]' : 'bg-[#554DBF]'
                      }`}
                    >
                      {mem.initials}
                    </div>
                    <span className="text-xs font-bold text-[#151E28]">{isYou ? 'You' : mem.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#151E28]">₹{shareAmt.toLocaleString('en-IN')}</span>
                    {getStatusBadge(mem.status, mem.has_paid, mem.is_reminded, isYou)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Checkout Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE7DF] p-4 z-40 shadow-[0_-6px_25px_rgba(0,0,0,0.07)] space-y-3">
        {/* Total Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7A8699]">
            Trip total · {activeTrip.members?.length || 4} travellers
          </span>
          <span className="text-xl font-black text-[#151E28] tracking-tight">
            ₹{totalTripCost.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3">
          {/* Request shares button */}
          <button
            type="button"
            onClick={handleRequestShares}
            disabled={isRequesting}
            className="flex-1 py-3.5 px-3 rounded-2xl bg-white border border-[#EDE7DF] text-[#151E28] font-bold text-xs hover:bg-[#FAF7F2] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isRequesting ? 'Sending...' : 'Request shares'}</span>
          </button>

          {/* Pay my share button */}
          <button
            type="button"
            onClick={handlePayShare}
            disabled={isPaying}
            className="flex-1 py-3.5 px-3 rounded-2xl bg-[#D95338] text-white font-bold text-xs hover:bg-[#C4442B] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(217,83,56,0.35)] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{isPaying ? 'Verifying...' : `Pay my share · ₹${myShareAmount.toLocaleString('en-IN')}`}</span>
          </button>
        </div>
      </div>


    </div>
  );
};
