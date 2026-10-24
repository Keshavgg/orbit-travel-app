'use client';

import React, { useState } from 'react';
import { X, Clock, MapPin, Tag, IndianRupee, Sparkles } from 'lucide-react';
import { usePlannr } from '@/lib/plannr-context';

export const AddStopModal: React.FC = () => {
  const { isAddStopModalOpen, setIsAddStopModalOpen, activeDayNumber, addStop } = usePlannr();

  const [timeSlot, setTimeSlot] = useState<string>('15:00');
  const [placeName, setPlaceName] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Activity');
  const [price, setPrice] = useState<string>('1200');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAddStopModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim()) return;

    setIsSubmitting(true);
    await addStop({
      day_number: activeDayNumber,
      time_slot: timeSlot,
      place_name: placeName.trim(),
      subtitle: subtitle.trim() || `Custom ${category.toLowerCase()} stop · ${timeSlot}`,
      category,
      price: parseInt(price, 10) || 0,
    });
    setIsSubmitting(false);
    setIsAddStopModalOpen(false);

    // Reset form
    setPlaceName('');
    setSubtitle('');
  };

  const categories = [
    { label: 'Activity', color: 'bg-[#E6F0FA] text-[#0066CC]' },
    { label: 'Food', color: 'bg-[#FDF0EC] text-[#D95338]' },
    { label: 'Culture', color: 'bg-[#EDE7FA] text-[#6941C6]' },
    { label: 'Walk', color: 'bg-[#E7F3ED] text-[#1B8054]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-[#EDE7DF] shadow-2xl p-6 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE7DF]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D95338] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Day {activeDayNumber} · Custom Stop
            </div>
            <h3 className="text-xl font-bold text-[#151E28] mt-0.5">Add Stop to Timeline</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddStopModalOpen(false)}
            className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#7A8699] hover:text-[#151E28] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Time & Category Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
                <Clock className="w-3 h-3 inline mr-1" />
                Time Slot
              </label>
              <input
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-[#151E28] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#D95338]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
                <Tag className="w-3 h-3 inline mr-1" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-[#151E28] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#D95338]"
              >
                {categories.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Place Name */}
          <div>
            <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
              <MapPin className="w-3 h-3 inline mr-1" />
              Place / Activity Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alas Harum Bali Giant Swing"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-[#151E28] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#D95338] placeholder:text-[#A0AEC0]"
              required
              autoFocus
            />
          </div>

          {/* Subtitle / Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
              Details / Duration / Tips
            </label>
            <input
              type="text"
              placeholder="e.g. Jungle swing & Luwak coffee tasting · 1.5 hrs"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-[#151E28] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#D95338] placeholder:text-[#A0AEC0]"
            />
          </div>

          {/* Price per person */}
          <div>
            <label className="block text-xs font-semibold text-[#7A8699] uppercase tracking-wider mb-1.5">
              <IndianRupee className="w-3 h-3 inline mr-1" />
              Price per Person (₹)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              placeholder="0 for free"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DF] bg-[#FAF7F2] text-[#151E28] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#D95338]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddStopModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-xl border border-[#EDE7DF] bg-white text-[#151E28] font-bold text-sm hover:bg-[#FAF7F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !placeName.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#D95338] text-white font-bold text-sm hover:bg-[#C4442B] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(217,83,56,0.35)] disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Stop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
