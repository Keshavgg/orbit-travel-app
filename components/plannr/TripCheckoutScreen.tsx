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
            One checkout · everything for Bali
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ── Top Tabs: Trip cart · 6 / Split & settle ── */}
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
            Trip cart · 6
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
            Split & settle
          </button>
        </div>

        {/* ── Itemized Cart Breakdown Cards (Matching Page 6) ── */}
        <div className="space-y-3">
          {/* Card 1: Flights */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#1A56DB]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutFlightIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  DEL → DPS · IndiGo · round trip
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  12 Nov 02:40 · 18 Nov 23:10 · 4 pax · 1 stop
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">₹24,800</div>
              <div className="text-[11px] text-[#7A8699]">per person</div>
            </div>
          </div>

          {/* Card 2: Villa */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#D95338]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutVillaIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  Villa Senja · Ubud · 6 nights
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  2 bedrooms · pool · free cancellation
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">₹8,200</div>
              <div className="text-[11px] text-[#7A8699]">per person</div>
            </div>
          </div>

          {/* Card 3: Activities */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#1B8054]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutActivitiesIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  Activities · 4 items
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  Mt Batur hike, Nusa Penida, temple, cooking class
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">₹14,600</div>
              <div className="text-[11px] text-[#7A8699]">per person</div>
            </div>
          </div>

          {/* Card 4: Restaurants */}
          <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3 hover:border-[#D95338]/30 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <CheckoutDiningIcon className="w-13 h-13" />
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-[#151E28] leading-tight">
                  Restaurants · 2 reservations
                </h4>
                <p className="text-xs text-[#7A8699] mt-1 line-clamp-1">
                  Zest Café, Locavore · pay at venue
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-[#151E28]">₹0</div>
              <div className="text-[11px] text-[#7A8699]">reserve only</div>
            </div>
          </div>
        </div>

        {/* ── Split 4 Ways Section (Matching Page 6) ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-[#151E28]">Split 4 ways</h3>
            <button
              type="button"
              onClick={() => showToast('Equal split enabled (₹47,600 each)', 'info')}
              className="text-xs font-bold text-[#0066CC] hover:underline"
            >
              Equal · edit
            </button>
          </div>

          {/* Member Status List */}
          <div className="space-y-2">
            {/* RS You */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D95338] text-white text-xs font-bold flex items-center justify-center">
                  RS
                </div>
                <span className="text-xs font-bold text-[#151E28]">You</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[#151E28]">₹47,600</span>
                {getStatusBadge('paying', false, false, true)}
              </div>
            </div>

            {/* AK Aman */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#26855F] text-white text-xs font-bold flex items-center justify-center">
                  AK
                </div>
                <span className="text-xs font-bold text-[#151E28]">Aman</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[#151E28]">₹47,600</span>
                {getStatusBadge('confirmed', true, false, false)}
              </div>
            </div>

            {/* VJ Vikram */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5E2FB] text-[#554DBF] text-xs font-bold flex items-center justify-center">
                  VJ
                </div>
                <span className="text-xs font-bold text-[#151E28]">Vikram</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[#151E28]">₹47,600</span>
                {getStatusBadge('reminded', false, true, false)}
              </div>
            </div>

            {/* NK Nikhil */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#DCF3F6] text-[#1E7485] text-xs font-bold flex items-center justify-center">
                  NK
                </div>
                <span className="text-xs font-bold text-[#151E28]">Nikhil</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[#151E28]">₹47,600</span>
                {getStatusBadge('pending', false, false, false)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Checkout Bar (Matching Page 6) ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE7DF] p-4 z-40 shadow-[0_-6px_25px_rgba(0,0,0,0.07)] space-y-3">
        {/* Total Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7A8699]">
            Trip total · 4 travellers
          </span>
          <span className="text-xl font-black text-[#151E28] tracking-tight">
            ₹1,90,400
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

          {/* Pay my share · ₹47,600 button */}
          <button
            type="button"
            onClick={handlePayShare}
            disabled={isPaying}
            className="flex-1 py-3.5 px-3 rounded-2xl bg-[#D95338] text-white font-bold text-xs hover:bg-[#C4442B] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(217,83,56,0.35)] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{isPaying ? 'Verifying...' : 'Pay my share · ₹47,600'}</span>
          </button>
        </div>
      </div>


    </div>
  );
};
