'use client';

import React, { useState } from 'react';
import { X, UserPlus, Link, Copy, Check, Send } from 'lucide-react';
import { usePlannr } from '@/lib/plannr-context';

export const InviteTravelerModal: React.FC = () => {
  const { isInviteModalOpen, setIsInviteModalOpen, inviteTravelerMember, showToast } = usePlannr();

  const [name, setName] = useState<string>('');
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isInviteModalOpen) return null;

  const handleCopyLink = () => {
    const inviteLink = 'https://plannr.app/join/bali-boys-4';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
    }
    setCopied(true);
    showToast('Invite link copied: https://plannr.app/join/bali-boys-4', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await inviteTravelerMember(undefined, name.trim());
    setIsSubmitting(false);
    setIsInviteModalOpen(false);
    setName('');
    setEmailOrPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-[#EDE7DF] shadow-2xl p-6 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE7DF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FDEEE9] text-[#D95338] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#151E28]">Invite to Bali Trip</h3>
              <p className="text-xs text-[#7A8699]">Add friends to collaborate & split costs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7A8699] hover:text-[#151E28] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copy Link Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EDE7DF]">
          <span className="text-[11px] font-bold text-[#7A8699] uppercase tracking-wider block mb-1.5">
            Shareable Trip Invite Link
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value="https://plannr.app/join/bali-boys-4"
              className="flex-1 bg-white border border-[#EDE7DF] rounded-xl px-3 py-2 text-xs font-mono text-[#151E28] select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EDE7DF] text-[#151E28] hover:bg-[#FAF7F2] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1B8054]" />
                  <span className="text-[#1B8054]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Manual Invite Form */}
        <form onSubmit={handleInviteSubmit} className="space-y-3.5 pt-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
              Friend’s Name
            </label>
            <input
              type="text"
              placeholder="e.g. Siddharth Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-sm text-[#151E28] focus:outline-none focus:ring-2 focus:ring-[#D95338]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
              Email or WhatsApp Mobile (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. sid@gmail.com or +91 98123 45678"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-sm text-[#151E28] focus:outline-none focus:ring-2 focus:ring-[#D95338]"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-[#EDE7DF] bg-white text-[#151E28] font-bold text-xs hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-[#D95338] text-white font-bold text-xs hover:bg-[#C4442B] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(217,83,56,0.35)] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Invite'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
