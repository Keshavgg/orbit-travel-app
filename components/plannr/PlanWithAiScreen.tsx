import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (initialIdea && initialIdea.trim()) {
      setTripIdea(initialIdea);
      const lower = initialIdea.toLowerCase();
      if (lower.includes('3 ghant') || lower.includes('3 hour') || lower.includes('layover') || lower.includes('micro') || lower.includes('bahar jao') || lower.includes('bhar jao')) {
        setDestination('Delhi');
        setDates('Today');
        setTravellers('1 · Solo');
        setBudgetPerPerson('₹499');
      } else if (lower.includes('goa')) {
        setDestination('Goa');
        setBudgetPerPerson('₹15,000');
        setDates('15 – 19 Nov');
      } else if (lower.includes('rishikesh')) {
        setDestination('Rishikesh');
        setBudgetPerPerson('₹4,999');
        setDates('Weekend Escape');
      } else if (lower.includes('kashmir')) {
        setDestination('Kashmir');
        setBudgetPerPerson('₹21,999');
        setDates('18 – 22 Nov');
      } else if (lower.includes('dubai')) {
        setDestination('Dubai');
        setBudgetPerPerson('₹32,000');
        setDates('20 – 25 Nov');
      } else if (lower.includes('thailand') || lower.includes('phuket')) {
        setDestination('Thailand');
        setBudgetPerPerson('₹25,000');
        setDates('10 – 15 Dec');
      } else if (lower.includes('japan') || lower.includes('tokyo')) {
        setDestination('Japan');
        setBudgetPerPerson('₹95,000');
        setDates('01 – 08 Dec');
      } else if (lower.includes('vietnam')) {
        setDestination('Vietnam');
        setBudgetPerPerson('₹45,000');
        setDates('12 – 18 Nov');
      } else if (lower.includes('delhi')) {
        setDestination('Delhi');
        setBudgetPerPerson('₹3,500');
        setDates('Today');
      }
    }
  }, [initialIdea]);

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
        style: selectedStyle,
        interests: selectedInterests,
        destination: destination,
        budget_per_person: parseInt(budgetPerPerson.replace(/[^0-9]/g, '')) || 60000,
        travellers: travellers,
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
    } catch (e) {
      console.error('Failed to generate itinerary via backend:', e);
    } finally {
      setIsGenerating(false);
    }

    // Dynamic Client-side Fallback generator based on tripIdea
    const lower = tripIdea.toLowerCase();
    const isMicro = lower.includes('3 ghant') || lower.includes('3 hour') || lower.includes('micro') || lower.includes('layover') || lower.includes('bahar jao') || lower.includes('bhar jao');
    const dest = isMicro ? 'Delhi' : (lower.includes('goa') ? 'Goa' : lower.includes('thailand') ? 'Thailand' : lower.includes('dubai') ? 'Dubai' : lower.includes('rishikesh') ? 'Rishikesh' : lower.includes('kashmir') ? 'Kashmir' : lower.includes('japan') ? 'Japan' : destination || 'Goa');

    let fallbackTrip: PlannrTrip;

    if (isMicro) {
      fallbackTrip = {
        id: `trip_micro_${Date.now()}`,
        title: 'Delhi 3-Hour Transit & Cafe Escape',
        destination: 'Delhi',
        start_date: 'Today',
        end_date: 'Today',
        total_days: 1,
        budget_per_person: 499,
        total_budget: 499,
        currency: 'INR',
        status: 'active',
        days: [
          {
            id: 'day_1_micro',
            day_number: 1,
            day_title: 'Delhi 3-Hour Micro-Escape',
            summary: 'High-speed metro connection, peaceful golden temple parikrama, Wenger\'s mutton patty & specialty brew.',
            stops: [
              {
                id: 'ms_1',
                time_slot: '00:00',
                place_name: 'Airport Express Orange Metro Line',
                subtitle: 'High-speed 135 km/h train from T3 to Shivaji Stadium · 20 mins',
                category: 'Activity',
                price_per_person: 60,
                is_booked: true,
                is_reserve_only: false,
              },
              {
                id: 'ms_2',
                time_slot: '00:30',
                place_name: 'Gurudwara Bangla Sahib Sarovar',
                subtitle: 'Peaceful holy sarovar parikrama & Karah Prasad · 45 mins',
                category: 'Culture',
                price_per_person: 0,
                is_booked: false,
                is_reserve_only: false,
              },
              {
                id: 'ms_3',
                time_slot: '01:25',
                place_name: 'Wenger\'s Deli & Blue Tokai Coffee',
                subtitle: 'Famous mutton patty & artisanal nitro cold brew · 45 mins',
                category: 'Food',
                price_per_person: 350,
                is_booked: false,
                is_reserve_only: true,
              },
              {
                id: 'ms_4',
                time_slot: '02:15',
                place_name: 'Airport Express Return & Buffer',
                subtitle: 'Express train return to T3 with 45 mins security buffer',
                category: 'Activity',
                price_per_person: 60,
                is_booked: true,
                is_reserve_only: false,
              }
            ]
          }
        ],
        members: [
          {
            id: 'mem_1',
            name: 'Rohit Sharma',
            initials: 'RS',
            role: 'organizer',
            status: 'confirmed',
            share_amount: 499,
            has_paid: true,
            is_current_user: true
          }
        ]
      };
    } else {
      fallbackTrip = {
        id: `trip_${Date.now()}`,
        title: `${dest} Adventure (${selectedStyle})`,
        destination: dest,
        start_date: dates.split('–')[0]?.trim() || '12 Nov',
        end_date: dates.split('–')[1]?.trim() || '18 Nov',
        total_days: 4,
        budget_per_person: parseInt(budgetPerPerson.replace(/[^0-9]/g, '')) || 25000,
        total_budget: (parseInt(budgetPerPerson.replace(/[^0-9]/g, '')) || 25000) * 4,
        currency: 'INR',
        status: 'active',
        days: [
          {
            id: 'day_1',
            day_number: 1,
            day_title: `Day 1 · Arrival & Check-in at ${dest}`,
            summary: `Touchdown in ${dest}, private airport cab transfer to luxury stay, evening sunset sundowner.`,
            stops: [
              {
                id: 's1_1',
                time_slot: '11:00 AM',
                place_name: `${dest} Boutique Stay Check-in`,
                subtitle: 'Private pool suite · Welcome drink',
                category: 'Stay',
                price_per_person: 4500,
                is_booked: true,
                is_reserve_only: false,
              },
              {
                id: 's1_2',
                time_slot: '04:00 PM',
                place_name: `${dest} Scenic Sunset Trail`,
                subtitle: 'Breezy golden hour views & photography',
                category: 'Activity',
                price_per_person: 1200,
                is_booked: true,
                is_reserve_only: false,
              },
              {
                id: 's1_3',
                time_slot: '08:00 PM',
                place_name: 'Welcome Dinner & Cocktails',
                subtitle: 'Curated local cuisine dining',
                category: 'Food',
                price_per_person: 1800,
                is_booked: false,
                is_reserve_only: true,
              }
            ]
          },
          {
            id: 'day_2',
            day_number: 2,
            day_title: `Day 2 · ${selectedInterests[0] || 'Adventure'} & Signature Highlights`,
            summary: `Exploring the top rated landmarks and scenic hotspots in ${dest}.`,
            stops: [
              {
                id: 's2_1',
                time_slot: '09:00 AM',
                place_name: `${dest} Landmark Guided Exploration`,
                subtitle: 'Priority VIP fast-track entry pass',
                category: 'Activity',
                price_per_person: 2400,
                is_booked: true,
                is_reserve_only: false,
              },
              {
                id: 's2_2',
                time_slot: '01:30 PM',
                place_name: 'Artisanal Brunch & Coffee',
                subtitle: 'High-rated neighborhood cafe',
                category: 'Food',
                price_per_person: 1100,
                is_booked: false,
                is_reserve_only: true,
              },
              {
                id: 's2_3',
                time_slot: '06:00 PM',
                place_name: 'Nightlife & Cultural Walk',
                subtitle: 'Vibrant local bazaar & live music',
                category: 'Culture',
                price_per_person: 800,
                is_booked: false,
                is_reserve_only: false,
              }
            ]
          },
          {
            id: 'day_3',
            day_number: 3,
            day_title: `Day 3 · ${selectedInterests[1] || 'Scenic'} Getaway & Cruise`,
            summary: `Exclusive day excursion with private boat/cab and group memories.`,
            stops: [
              {
                id: 's3_1',
                time_slot: '08:30 AM',
                place_name: `${dest} Island & Coastal Excursion`,
                subtitle: 'Speedboat cruise & scenic viewpoints included',
                category: 'Activity',
                price_per_person: 3200,
                is_booked: true,
                is_reserve_only: false,
              },
              {
                id: 's3_2',
                time_slot: '07:30 PM',
                place_name: 'Farewell Beachside Feast',
                subtitle: 'Live local feast & group celebration',
                category: 'Food',
                price_per_person: 2500,
                is_booked: false,
                is_reserve_only: true,
              }
            ]
          }
        ]
      };
    }

    if (onTripGenerated) {
      onTripGenerated(fallbackTrip);
    }
    onNavigate('itinerary', { trip: fallbackTrip });
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
