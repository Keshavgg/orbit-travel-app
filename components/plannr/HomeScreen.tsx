import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Mic, Bell, Heart, Users, Film } from 'lucide-react';
import { PlannrScreen, PlannrPackage } from './types';
import {
  BaliVectorArt,
  VietnamVectorArt,
  ThailandVectorArt,
  JapanVectorArt,
} from './VectorArt';
import { PlannrBottomNav } from './PlannrBottomNav';

interface HomeScreenProps {
  onNavigate: (screen: PlannrScreen, data?: any) => void;
  onSelectTrip?: (tripId: string) => void;
}

// Fallback packages matching the design
const DEFAULT_PACKAGES: PlannrPackage[] = [
  {
    id: 'pkg_bali_7d',
    title: 'Bali · 7 days',
    country: 'Indonesia',
    days: 7,
    starting_price: 52000,
    vector_type: 'bali',
    tag: 'Bestseller',
    rating: 4.95,
  },
  {
    id: 'pkg_vietnam_6d',
    title: 'Vietnam · 6 days',
    country: 'Vietnam',
    days: 6,
    starting_price: 48000,
    vector_type: 'vietnam',
    tag: 'Trending',
    rating: 4.92,
  },
  {
    id: 'pkg_thailand_5d',
    title: 'Thailand · 5 days',
    country: 'Thailand',
    days: 5,
    starting_price: 36000,
    vector_type: 'thailand',
    tag: 'Budget Friendly',
    rating: 4.88,
  },
  {
    id: 'pkg_japan_8d',
    title: 'Japan · 8 days',
    country: 'Japan',
    days: 8,
    starting_price: 89000,
    vector_type: 'japan',
    tag: 'Popular',
    rating: 4.96,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onSelectTrip,
}) => {
  const [budget, setBudget] = useState<number>(55000);
  const [packages, setPackages] = useState<PlannrPackage[]>(DEFAULT_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch packages filtered by budget from backend
  const fetchPackages = useCallback(async (maxBudget: number) => {
    try {
      setLoadingPackages(true);
      const res = await fetch(`/api/plannr/packages?max_budget=${maxBudget}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages);
          return;
        }
      }
      // Client-side fallback filter
      const filtered = DEFAULT_PACKAGES.filter(
        (p) => p.starting_price <= maxBudget
      );
      setPackages(filtered.length > 0 ? filtered : [DEFAULT_PACKAGES[0]]);
    } catch {
      const filtered = DEFAULT_PACKAGES.filter(
        (p) => p.starting_price <= maxBudget
      );
      setPackages(filtered.length > 0 ? filtered : [DEFAULT_PACKAGES[0]]);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages(budget);
  }, [budget, fetchPackages]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('plan-ai', { initialIdea: searchQuery });
  };

  const renderVectorIllustration = (type?: string, title?: string) => {
    const t = (type || title || '').toLowerCase();
    if (t.includes('vietnam')) {
      return <VietnamVectorArt />;
    }
    if (t.includes('thailand') || t.includes('phuket')) {
      return <ThailandVectorArt />;
    }
    if (t.includes('japan') || t.includes('tokyo')) {
      return <JapanVectorArt />;
    }
    return <BaliVectorArt />;
  };

  // Format currency in Indian numbering (e.g. ₹55,000)
  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  // Calculate percentage for custom slider track fill
  const sliderMin = 15000;
  const sliderMax = 150000;
  const sliderPercent = Math.min(
    100,
    Math.max(0, ((budget - sliderMin) / (sliderMax - sliderMin)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] pb-28 font-sans antialiased max-w-md mx-auto relative select-none">
      {/* Top Header */}
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#D95338] tracking-tight font-serif sm:font-sans">
            Plannr
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8699] font-medium mt-0.5">
            Planning made easier
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-[#EDE7DF] flex items-center justify-center relative shadow-sm hover:bg-[#F7F3EC] active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#151E28]" />
            <span className="w-2.5 h-2.5 bg-[#D95338] rounded-full absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {/* User Avatar Circle */}
          <div className="w-10 h-10 rounded-full bg-[#151E28] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#EDE7DF]">
            RS
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="px-5 space-y-5">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div
            onClick={() => onNavigate('plan-ai')}
            className="w-full bg-white rounded-2xl sm:rounded-full border border-[#EDE7DF] px-4 py-3.5 flex items-center gap-3 shadow-sm cursor-pointer hover:border-[#D95338]/40 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-[#D95338] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tell Plannr your trip idea..."
              className="w-full bg-transparent text-sm text-[#151E28] placeholder-[#7A8699] font-medium focus:outline-none"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('plan-ai');
              }}
              className="p-1 rounded-full text-[#151E28] hover:bg-[#F2EDE4] transition-colors"
              aria-label="Voice Search"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* 3 Quick Action Pills in a Row */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Plan with AI */}
          <button
            type="button"
            onClick={() => onNavigate('plan-ai')}
            className="bg-[#FDEEE9] hover:bg-[#FBDCD3] active:scale-95 transition-all rounded-2xl p-3 flex flex-col items-start justify-between min-h-[78px] border border-[#F9DBD1]/60 text-left shadow-xs"
          >
            <Sparkles className="w-5 h-5 text-[#D95338]" />
            <span className="text-[13px] font-bold text-[#151E28] leading-tight">
              Plan with AI
            </span>
          </button>

          {/* Paste a reel */}
          <button
            type="button"
            onClick={() => onNavigate('reel-scan')}
            className="bg-[#E9F2F7] hover:bg-[#D9E9F3] active:scale-95 transition-all rounded-2xl p-3 flex flex-col items-start justify-between min-h-[78px] border border-[#D5E6F1]/60 text-left shadow-xs"
          >
            <Film className="w-5 h-5 text-[#2B5B84]" />
            <span className="text-[13px] font-bold text-[#151E28] leading-tight">
              Paste a reel
            </span>
          </button>

          {/* Join a trip */}
          <button
            type="button"
            onClick={() => onNavigate('group')}
            className="bg-[#E7F3ED] hover:bg-[#D4EADE] active:scale-95 transition-all rounded-2xl p-3 flex flex-col items-start justify-between min-h-[78px] border border-[#CFE8DB]/60 text-left shadow-xs"
          >
            <Users className="w-5 h-5 text-[#1B8054]" />
            <span className="text-[13px] font-bold text-[#151E28] leading-tight">
              Join a trip
            </span>
          </button>
        </div>

        {/* Interactive Budget Slider Card */}
        <section className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm sm:text-base font-bold text-[#151E28]">
              Set your budget
            </span>
            <div className="text-right">
              <span className="text-lg font-extrabold text-[#D95338]">
                {formatINR(budget)}
              </span>
              <span className="text-xs text-[#7A8699] font-medium ml-1">
                / person
              </span>
            </div>
          </div>

          {/* Custom Styled Slider */}
          <div className="relative flex items-center py-2">
            {/* Background Track */}
            <div className="w-full h-2 rounded-full bg-[#E5E0D8] relative overflow-hidden">
              {/* Terracotta progress fill */}
              <div
                className="h-full bg-[#D95338] transition-[width] duration-75"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>

            {/* Native slider overlaid transparently for smooth touch handling */}
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer z-10"
              aria-label="Set your budget"
            />

            {/* Custom Thumb handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#D95338] border-2 border-white shadow-md pointer-events-none transition-[left] duration-75 -ml-3"
              style={{ left: `${sliderPercent}%` }}
            />
          </div>

          {/* Slider Min/Max Labels */}
          <div className="flex items-center justify-between mt-2 text-xs font-semibold text-[#7A8699]">
            <span>{formatINR(sliderMin)}</span>
            <span>{formatINR(sliderMax)}</span>
          </div>
        </section>

        {/* Packages in your budget Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#151E28]">
              Packages in your budget
            </h2>
            <span className="bg-[#E7F3ED] text-[#1B8054] text-xs font-bold px-3 py-1 rounded-full">
              {packages.length} packages
            </span>
          </div>

          {/* Horizontal Scrolling Package Cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none snap-x snap-mandatory">
            {packages.map((pkg) => {
              const isFav = !!favorites[pkg.id];
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    if (onSelectTrip) onSelectTrip(pkg.id);
                    onNavigate('itinerary', { packageId: pkg.id });
                  }}
                  className="snap-start flex-shrink-0 w-[240px] sm:w-[260px] bg-white rounded-3xl p-3 border border-[#EDE7DF] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Vector Artwork Container */}
                  <div className="w-full h-32 rounded-2xl overflow-hidden relative shadow-inner">
                    {renderVectorIllustration(pkg.vector_type, pkg.title)}

                    {/* Heart Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(pkg.id, e)}
                      aria-label="Bookmark trip"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav
                            ? 'fill-[#D95338] text-[#D95338]'
                            : 'text-[#151E28]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Info */}
                  <div className="mt-3 px-1">
                    <h3 className="text-base font-bold text-[#151E28] leading-tight group-hover:text-[#D95338] transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xs text-[#7A8699] font-medium">
                        from
                      </span>
                      <span className="text-sm font-extrabold text-[#D95338]">
                        {formatINR(pkg.starting_price)}
                      </span>
                      <span className="text-xs text-[#7A8699] font-medium">
                        pp
                      </span>
                    </div>

                    {/* Dark indicator bar at bottom of card */}
                    <div className="w-full h-1 bg-[#151E28]/15 rounded-full mt-2.5 overflow-hidden">
                      <div className="w-2/3 h-full bg-[#151E28] rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Holiday Season Promo Banner */}
        <section className="bg-gradient-to-r from-[#D95338] to-[#C9472D] rounded-3xl p-5 text-white shadow-md flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5 text-white">
              Holiday season is here! <span role="img" aria-label="sun">☀️</span>
            </h3>
            <p className="text-xs text-white/90 font-medium">
              Up to 30% off on group trips · limited time
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            className="flex-shrink-0 bg-white text-[#D95338] font-extrabold text-xs px-4 py-2.5 rounded-full shadow hover:bg-[#FAF7F2] active:scale-95 transition-all"
          >
            Book now
          </button>
        </section>
      </main>

      {/* Bottom Navigation */}
      <PlannrBottomNav currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
};

export default HomeScreen;
