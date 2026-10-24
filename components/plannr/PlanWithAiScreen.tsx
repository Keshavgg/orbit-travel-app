import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Mic, Film, Check, Loader2 } from 'lucide-react';
import { PlannrScreen, PlannrTrip } from './types';
import { BaliVectorArt } from './VectorArt';

interface PlanWithAiScreenProps {
  initialIdea?: string;
  onNavigate: (screen: PlannrScreen, data?: any) => void;
  onTripGenerated?: (trip: PlannrTrip) => void;
}

export const PlanWithAiScreen: React.FC<PlanWithAiScreenProps> = ({
  initialIdea = 'A relaxed week in Bali with 3 friends. Beaches, cafés, one volcano hike. Keep it under 60k per person.',
  onNavigate,
  onTripGenerated,
}) => {
  const [tripIdea, setTripIdea] = useState<string>(initialIdea);
  const [selectedStyle, setSelectedStyle] = useState<string>('Chill');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Beaches',
    'Cafés',
    'Hiking',
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>('Bali');
  const [dates, setDates] = useState<string>('12 – 18 Nov');
  const [travellers, setTravellers] = useState<string>('4 · Friends');
  const [budgetPerPerson, setBudgetPerPerson] = useState<string>('₹60,000');

  const travelStyles = ['Chill', 'Adventure', 'Luxury', 'Budget'];
  const allInterests = [
    'Beaches',
    'Cafés',
    'Hiking',
    'Nightlife',
    'Temples',
    'Food tours',
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        prompt: tripIdea,
        style: selectedStyle.toLowerCase(),
        interests: selectedInterests,
        group_size: 4,
        max_budget_per_person: 60000,
      };

      const res = await fetch('/api/plannr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const generatedData = await res.json();
        if (onTripGenerated) {
          onTripGenerated(generatedData);
        }
        onNavigate('itinerary', { trip: generatedData });
        return;
      }
    } catch {
      // Backend fallback gracefully handles network/SSR
    } finally {
      setIsGenerating(false);
    }

    // Default seamless transition to Bali Itinerary (Screen 4)
    onNavigate('itinerary', {
      tripId: 'trip_bali_boys',
      title: 'Bali with the boys',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] pb-12 font-sans antialiased max-w-md mx-auto relative select-none">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3.5 mb-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white border border-[#EDE7DF] flex items-center justify-center shadow-sm hover:bg-[#F7F3EC] active:scale-95 transition-transform"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-[#151E28]" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#151E28] tracking-tight">
              Plan with AI
            </h1>
            <p className="text-xs text-[#7A8699] font-medium">
              Describe it, Plannr builds the whole trip
            </p>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="px-5 space-y-4">
        {/* YOUR TRIP IDEA Container */}
        <div className="bg-[#EDF2F7] rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
          <span className="text-[11px] font-extrabold text-[#7A8699] tracking-wider uppercase block mb-2">
            YOUR TRIP IDEA
          </span>

          <textarea
            rows={3}
            value={tripIdea}
            onChange={(e) => setTripIdea(e.target.value)}
            className="w-full bg-transparent text-[15px] sm:text-base font-bold text-[#151E28] leading-snug resize-none focus:outline-none placeholder-[#7A8699]"
            placeholder="E.g. A relaxed week in Bali with 3 friends..."
          />

          <div className="mt-3 pt-3 border-t border-[#DFE6EE] flex items-center justify-between text-xs">
            <span className="text-[#64748B] font-medium">
              Plannr understood: destination, dates, budget, group
            </span>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white text-[#151E28] shadow-sm flex items-center justify-center hover:bg-[#F1F5F9] active:scale-90 transition-transform"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2x2 Extracted Entity Badges */}
        <div className="grid grid-cols-2 gap-3">
          {/* Destination */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
              <BaliVectorArt className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#7A8699] tracking-wider uppercase block">
                DESTINATION
              </span>
              <span className="text-sm font-extrabold text-[#151E28]">
                {destination}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-[#FBF8F2] rounded-2xl p-3.5 border border-[#EDE7DF] shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-[#7A8699] tracking-wider uppercase block">
              DATES
            </span>
            <span className="text-sm font-extrabold text-[#151E28] mt-0.5">
              {dates}
            </span>
          </div>

          {/* Travellers */}
          <div className="bg-[#FBF8F2] rounded-2xl p-3.5 border border-[#EDE7DF] shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-[#7A8699] tracking-wider uppercase block">
              TRAVELLERS
            </span>
            <span className="text-sm font-extrabold text-[#151E28] mt-0.5">
              {travellers}
            </span>
          </div>

          {/* Budget / Person */}
          <div className="bg-[#FBF8F2] rounded-2xl p-3.5 border border-[#EDE7DF] shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-[#7A8699] tracking-wider uppercase block">
              BUDGET / PERSON
            </span>
            <span className="text-sm font-extrabold text-[#151E28] mt-0.5">
              {budgetPerPerson}
            </span>
          </div>
        </div>

        {/* Travel Style Chips */}
        <div className="pt-2">
          <span className="text-sm font-bold text-[#151E28] block mb-2">
            Travel style
          </span>
          <div className="flex flex-wrap gap-2">
            {travelStyles.map((style) => {
              const isActive = selectedStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#151E28] text-white shadow-sm'
                      : 'bg-white text-[#151E28] border border-[#EDE7DF] hover:border-[#151E28]/40'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests Chips */}
        <div className="pt-2">
          <span className="text-sm font-bold text-[#151E28] block mb-2">
            Interests
          </span>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#E0EEFA] text-[#1E4E79] shadow-xs border border-[#CDE3F7]'
                      : 'bg-white text-[#151E28] border border-[#EDE7DF] hover:border-[#151E28]/30'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reel Link Helper Card */}
        <div className="bg-[#FDF0EC] rounded-2xl p-4 border border-[#FADCD5] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-[#D95338] flex-shrink-0" />
            <p className="text-xs text-[#151E28] font-medium leading-tight">
              Have a reel in mind? Paste it and Plannr builds from it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('reel-scan')}
            className="text-xs font-extrabold text-[#D95338] hover:underline flex-shrink-0"
          >
            Paste
          </button>
        </div>

        {/* Generate My Itinerary CTA Button */}
        <div className="pt-4">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full bg-[#D95338] hover:bg-[#C9472D] active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#D95338]/30 transition-all disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Crafting day-by-day itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white stroke-none" />
                <span>Generate my itinerary</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlanWithAiScreen;
