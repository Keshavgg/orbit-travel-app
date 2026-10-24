'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Copy,
  MessageSquare,
  Check,
  Sparkles,
  ChevronRight,
  Vote,
  Clock,
  Send,
} from 'lucide-react';
import { PlannrScreen } from './types';
import { usePlannr } from '@/lib/plannr-context';
import { BaliHeroArt } from './TimelineIcons';


interface GroupCollabScreenProps {
  onNavigate?: (screen: PlannrScreen, data?: any) => void;
}

export const GroupCollabScreen: React.FC<GroupCollabScreenProps> = ({
  onNavigate: propNavigate,
}) => {
  const {
    navigate: contextNavigate,
    goBack,
    activeTrip,
    voteOnPoll,
    inviteTravelerMember,
    matchedTravelers,
    setIsGroupChatOpen,
    setIsInviteModalOpen,
    showToast,
  } = usePlannr();

  const navigate = propNavigate || contextNavigate;
  const [activeTab, setActiveTab] = useState<'my_group' | 'find_travellers'>('my_group');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const poll = activeTrip.poll || {
    id: 'poll_1',
    question: 'Day 3 — Nusa Penida or Uluwatu?',
    expires_in_hours: 6,
    options: [
      { id: 'opt_nusa', title: 'Nusa Penida day trip', votes: 2, voted_by: ['RS', 'AK'] },
      { id: 'opt_uluwatu', title: 'Uluwatu + Kecak dance', votes: 1, voted_by: ['VJ'] },
    ],
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleCopyLink = () => {
    const inviteUrl = 'https://plannr.app/join/bali-boys-4';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    setCopiedLink(true);
    showToast('Invite link copied: https://plannr.app/join/bali-boys-4', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] pb-28 select-none">
      {/* ── Top App Bar (Matching Page 5) ── */}
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
            Bali with the boys
          </h1>
          <p className="text-xs text-[#7A8699] font-medium mt-0.5">
            Group · 4 members · 2 pending
          </p>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* ── Header Banner Illustration Card (Matching Page 5) ── */}
        <div className="w-full rounded-3xl overflow-hidden border border-[#EDE7DF] shadow-sm bg-[#9E90A1]">
          {/* Upper Artwork */}
          <div className="h-[95px] relative overflow-hidden">
            <BaliHeroArt compact className="w-full h-full object-cover" />
          </div>

          {/* Dark Navy Info Bar */}
          <div className="bg-[#1A263E] text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
            <span>Bali · 12 – 18 Nov</span>
            <span className="text-slate-300">In 19 days</span>
          </div>
        </div>

        {/* ── Top Tabs: My Group / Find Travellers ── */}
        <div className="p-1 rounded-2xl bg-[#EDE7DF]/60 flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab('my_group')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'my_group'
                ? 'bg-white text-[#151E28] shadow-sm'
                : 'text-[#7A8699] hover:text-[#151E28]'
            }`}
          >
            My group
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('find_travellers')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'find_travellers'
                ? 'bg-white text-[#151E28] shadow-sm'
                : 'text-[#7A8699] hover:text-[#151E28]'
            }`}
          >
            Find travellers
          </button>
        </div>

        {/* ── Member Circles Row (Matching Page 5) ── */}
        <div className="flex items-start justify-between px-1">
          {/* RS You */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#D95338] text-white font-extrabold text-sm flex items-center justify-center shadow-sm ring-4 ring-[#D95338]/20">
              RS
            </div>
            <span className="text-xs font-bold text-[#151E28] mt-1.5">You</span>
          </div>

          {/* AK Aman */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#26855F] text-white font-extrabold text-sm flex items-center justify-center shadow-sm ring-4 ring-[#26855F]/20">
              AK
            </div>
            <span className="text-xs font-bold text-[#151E28] mt-1.5">Aman</span>
          </div>

          {/* VJ Vikram (Pending) */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#E5E2FB] text-[#554DBF] font-extrabold text-sm flex items-center justify-center shadow-sm ring-4 ring-[#E5A93C]/40">
              VJ
            </div>
            <span className="text-xs font-bold text-[#D97706] mt-1.5">Pending</span>
          </div>

          {/* NK Nikhil (Pending) */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#DCF3F6] text-[#1E7485] font-extrabold text-sm flex items-center justify-center shadow-sm ring-4 ring-[#E5A93C]/40">
              NK
            </div>
            <span className="text-xs font-bold text-[#D97706] mt-1.5">Pending</span>
          </div>

          {/* + Invite button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="w-14 h-14 rounded-full border-2 border-dashed border-[#A0AEC0] bg-white text-[#151E28] font-bold text-xl flex items-center justify-center hover:border-[#D95338] hover:text-[#D95338] active:scale-95 transition-all shadow-sm"
              aria-label="Invite friends"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-[#7A8699] mt-1.5">Invite</span>
          </div>
        </div>

        {/* ── Live Voting Card (Matching Page 5) ── */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          {/* Card Top Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#D95338] tracking-wider uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D95338] animate-pulse" />
              VOTE · ENDS IN 6H
            </span>
            <span className="font-medium text-[#7A8699]">
              {totalVotes} of 4 voted
            </span>
          </div>

          {/* Poll Question */}
          <h3 className="text-base font-black text-[#151E28] tracking-tight">
            {poll.question}
          </h3>

          {/* Voting Options */}
          <div className="space-y-2.5">
            {poll.options.map((option) => {
              const isUserVote = option.voted_by?.includes('RS');
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => voteOnPoll(option.id)}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] border ${
                    isUserVote
                      ? 'bg-[#EBF2FE] border-[#B9D5FD] text-[#0066CC] shadow-sm'
                      : 'bg-white border-[#EDE7DF] text-[#151E28] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                        isUserVote
                          ? 'border-[#0066CC] bg-[#0066CC] text-white'
                          : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      {isUserVote && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{option.title}</span>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      isUserVote
                        ? 'bg-[#0066CC]/10 text-[#0066CC]'
                        : 'bg-[#FAF7F2] text-[#7A8699]'
                    }`}
                  >
                    {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Travellers who match this trip (Matching Page 5) ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#151E28]">
              Travellers who match this trip
            </h3>
            <button
              type="button"
              onClick={() => showToast('Showing 14 matched travellers in Bali', 'info')}
              className="text-xs font-bold text-[#D95338] hover:underline"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {matchedTravelers.map((traveler) => (
              <div
                key={traveler.id}
                className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      traveler.id === 'traveler_priya'
                        ? 'bg-[#FDEEE9] text-[#D95338]'
                        : 'bg-[#E7F3ED] text-[#1B8054]'
                    }`}
                  >
                    {traveler.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#151E28] truncate">
                        {traveler.name} · {traveler.city}
                      </h4>
                      <span className="text-[11px] font-extrabold text-[#1B8054] bg-[#E5F5ED] px-2 py-0.5 rounded-full shrink-0">
                        {traveler.match_pct}% match
                      </span>
                    </div>
                    <p className="text-xs text-[#7A8699] mt-0.5 truncate">
                      {traveler.date_flexibility} · {traveler.interests.join(', ')} ·{' '}
                      {traveler.trips_count} trips
                    </p>
                  </div>
                </div>

                {/* Invite Button */}
                <button
                  type="button"
                  onClick={() => inviteTravelerMember(traveler.id, traveler.name)}
                  disabled={traveler.invited}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    traveler.invited
                      ? 'bg-[#E5F5ED] text-[#1B8054] border border-[#C8E6D9]'
                      : 'bg-[#151E28] text-white hover:bg-black active:scale-95 shadow-sm'
                  }`}
                >
                  {traveler.invited ? 'Invited ✓' : 'Invite'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Sticky Actions (Matching Page 5) ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE7DF] px-4 py-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center gap-3">
        {/* Copy invite link button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 py-3.5 px-3 rounded-2xl bg-white border border-[#EDE7DF] text-[#151E28] font-bold text-xs hover:bg-[#FAF7F2] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-[#1B8054]" />
              <span className="text-[#1B8054]">Link copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy invite link</span>
            </>
          )}
        </button>

        {/* Group chat button */}
        <button
          type="button"
          onClick={() => setIsGroupChatOpen(true)}
          className="flex-1 py-3.5 px-3 rounded-2xl bg-[#D95338] text-white font-bold text-xs hover:bg-[#C4442B] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(217,83,56,0.35)] flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Group chat</span>
        </button>
      </div>


    </div>
  );
};
