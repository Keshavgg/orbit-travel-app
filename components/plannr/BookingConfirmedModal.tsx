'use client';

import React from 'react';
import { CheckCircle2, QrCode, Plane, Home, Calendar, MessageSquare, Download, X, ArrowRight } from 'lucide-react';
import { usePlannr } from '@/lib/plannr-context';

export const BookingConfirmedModal: React.FC = () => {
  const {
    isBookingConfirmedModalOpen,
    setIsBookingConfirmedModalOpen,
    lastPaymentReceipt,
    navigate,
    showToast,
  } = usePlannr();

  if (!isBookingConfirmedModalOpen) return null;

  const receipt = lastPaymentReceipt || {
    transaction_id: 'UPI-PLN-784291',
    amount_paid: 47600,
    payer_name: 'Rohit Sharma (You)',
    payer_initials: 'RS',
    trip_title: 'Bali with the boys',
    timestamp: 'Today, 11:30 AM',
    pnr: 'IND-DPS-8842',
    villa_ref: 'SENJA-UB-6N',
  };

  const handleDownloadReceipt = () => {
    showToast('Official Plannr PDF tax invoice downloaded!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-[#EDE7DF] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Celebration Banner */}
        <div className="p-6 bg-gradient-to-br from-[#15803D] to-[#166534] text-white text-center relative">
          <button
            type="button"
            onClick={() => setIsBookingConfirmedModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-3 ring-4 ring-white/30 animate-bounce-sm">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-2xl font-black tracking-tight">Your Share is Paid!</h3>
          <p className="text-green-100 text-xs mt-1 font-medium">
            ₹{receipt.amount_paid?.toLocaleString('en-IN') || '47,600'} paid & verified instantly via UPI
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Transaction Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE7DF] space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#7A8699]">
              <span>Transaction Ref</span>
              <span className="font-mono font-bold text-[#151E28]">{receipt.transaction_id}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#7A8699]">
              <span>Paid For</span>
              <span className="font-bold text-[#151E28]">Bali with the boys (4 pax)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#7A8699]">
              <span>IndiGo Flight PNR</span>
              <span className="font-mono font-bold text-[#0066CC] bg-[#E6F0FA] px-2 py-0.5 rounded">
                {receipt.pnr || 'IND-DPS-8842'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#7A8699]">
              <span>Villa Confirmation</span>
              <span className="font-mono font-bold text-[#1B8054] bg-[#E5F5ED] px-2 py-0.5 rounded">
                {receipt.villa_ref || 'SENJA-UB-6N'}
              </span>
            </div>
          </div>

          {/* WhatsApp Confirmation Dispatch */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9]">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-4 h-4 fill-white" />
            </div>
            <div className="text-xs text-[#1F4B2C]">
              <span className="font-bold block">WhatsApp Confirmation Dispatched</span>
              <span className="text-[11px] text-[#2E6B3E] block mt-0.5">
                Flight boarding passes, Villa voucher & Day 1 Ubud timetable sent to <strong>+91 98765 43210</strong>
              </span>
            </div>
          </div>

          {/* Split Status Update */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EDE7DF]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#151E28]">Group Split Status</span>
              <span className="text-[11px] font-bold text-[#1B8054]">2 of 4 Paid</span>
            </div>
            <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
              <div className="bg-[#1B8054] h-full rounded-full w-1/2 transition-all duration-500" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#7A8699] mt-2">
              <span>Rohit (You): Paid</span>
              <span>Aman: Paid</span>
              <span>Vikram: Reminded</span>
              <span>Nikhil: Reminded</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#EDE7DF] bg-[#FAF7F2] flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="flex-1 py-3 px-3 rounded-xl border border-[#EDE7DF] bg-white text-[#151E28] font-bold text-xs hover:bg-[#FAF7F2] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Invoice PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBookingConfirmedModalOpen(false);
              navigate('itinerary');
            }}
            className="flex-1 py-3 px-3 rounded-xl bg-[#D95338] text-white font-bold text-xs hover:bg-[#C4442B] flex items-center justify-center gap-1.5 transition-colors shadow-[0_4px_14px_rgba(217,83,56,0.35)]"
          >
            <span>Back to Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
