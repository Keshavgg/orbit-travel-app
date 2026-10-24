import React, { useState } from 'react';
import { ArrowLeft, Link2, CheckCircle2, X, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { PlannrScreen, DetectedPlace } from './types';
import { UbudWaterfallArt } from './VectorArt';

interface ReelToItineraryScreenProps {
  onNavigate: (screen: PlannrScreen, data?: any) => void;
  onItineraryBuilt?: (tripData: any) => void;
}

const DEFAULT_DETECTED_PLACES: DetectedPlace[] = [
  {
    name: 'Tegallalang Rice Terrace',
    timestamp: 'Seen at 0:04 · sunrise · 2 hrs',
    match_percent: 98,
    category: 'Activity',
    notes: 'Iconic stepped terraces with morning light',
    duration: '2 hrs',
  },
  {
    name: 'Tirta Empul Temple',
    timestamp: 'Seen at 0:11 · dress code · 1.5 hrs',
    match_percent: 95,
    category: 'Culture',
    notes: 'Holy water spring temple for purification',
    duration: '1.5 hrs',
  },
  {
    name: 'Zest Café, Ubud',
    timestamp: 'Seen at 0:19 · brunch · ₹900 for 2',
    match_percent: 91,
    category: 'Food',
    notes: 'Plant-powered café overlooking Ubud canopy',
    duration: '1.5 hrs',
  },
  {
    name: 'Campuhan Ridge Walk',
    timestamp: 'Seen at 0:26 · sunset · free',
    match_percent: 72,
    category: 'Activity',
    notes: 'Breezy panoramic hillside walking path',
    duration: '1.5 hrs',
  },
  {
    name: 'Tibumana Secret Waterfall',
    timestamp: 'Seen at 0:31 · swimming · 1.5 hrs',
    match_percent: 88,
    category: 'Activity',
    notes: 'Canyon pool surrounded by lush jungle ferns',
    duration: '1.5 hrs',
  },
];

export const ReelToItineraryScreen: React.FC<ReelToItineraryScreenProps> = ({
  onNavigate,
  onItineraryBuilt,
}) => {
  const [reelUrl, setReelUrl] = useState<string>(
    'instagram.com/reel/C9xkL4a_89s'
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [places, setPlaces] = useState<DetectedPlace[]>(DEFAULT_DETECTED_PLACES);
  const [removedPlaces, setRemovedPlaces] = useState<DetectedPlace[]>([]);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelUrl.trim()) return;

    setIsScanning(true);
    setScanMessage('Scanning audio transcription and location geocodes...');

    try {
      const res = await fetch('/api/plannr/reel/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reel_url: reelUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.places_detected) && data.places_detected.length > 0) {
          setPlaces(data.places_detected);
        }
      }
    } catch {
      // Fallback works seamlessly
    } finally {
      setIsScanning(false);
      setScanMessage(null);
    }
  };

  const handleRemovePlace = (indexToRemove: number) => {
    const removed = places[indexToRemove];
    setPlaces((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setRemovedPlaces((prev) => [removed, ...prev]);
  };

  const handleUndoRemove = () => {
    if (removedPlaces.length === 0) return;
    const [lastRemoved, ...rest] = removedPlaces;
    setPlaces((prev) => [...prev, lastRemoved]);
    setRemovedPlaces(rest);
  };

  const handleBuildItinerary = async () => {
    setIsBuilding(true);
    try {
      const res = await fetch('/api/plannr/reel/build-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reel_url: reelUrl,
          selected_places: places.map((p) => p.name),
        }),
      });

      if (res.ok) {
        const trip = await res.json();
        if (onItineraryBuilt) onItineraryBuilt(trip);
        onNavigate('itinerary', { trip });
        return;
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsBuilding(false);
    }

    // Default route to Bali Itinerary
    onNavigate('itinerary', {
      tripId: 'trip_reel_ac6cf6',
      title: 'Bali with the boys',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] pb-14 font-sans antialiased max-w-md mx-auto relative select-none">
      {/* Top Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3.5 mb-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white border border-[#EDE7DF] flex items-center justify-center shadow-sm hover:bg-[#F7F3EC] active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#151E28]" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#151E28] tracking-tight">
              Reel → Itinerary
            </h1>
            <p className="text-xs text-[#7A8699] font-medium">
              Paste any Instagram, TikTok or YouTube link
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 space-y-4">
        {/* URL Input Bar */}
        <form onSubmit={handleScan} className="relative">
          <div className="w-full bg-white rounded-2xl border-2 border-[#D95338] p-1.5 pl-4 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-[#D95338]/20">
            <Link2 className="w-5 h-5 text-[#D95338] flex-shrink-0" />
            <input
              type="text"
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder="Paste Instagram / TikTok reel URL..."
              className="w-full bg-transparent text-sm font-semibold text-[#151E28] placeholder-[#7A8699] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isScanning}
              className="flex-shrink-0 bg-[#151E28] hover:bg-[#232F3D] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                'Scan'
              )}
            </button>
          </div>
        </form>

        {scanMessage && (
          <div className="bg-[#E9F2F7] text-[#1E4E79] text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#D95338]" />
            <span>{scanMessage}</span>
          </div>
        )}

        {/* Scanned Reel Card */}
        <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-sm flex items-start gap-4">
          {/* Thumbnail preview */}
          <div className="w-24 sm:w-28 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-inner">
            <UbudWaterfallArt className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 bg-white text-[#151E28] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              0:34
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-[#7A8699] block truncate">
              @wander.with.nia
            </span>
            <h2 className="text-base font-extrabold text-[#151E28] leading-snug mt-1 mb-2">
              &quot;3 days in Ubud you can&apos;t miss&quot;
            </h2>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#151E28]">
                <span className="w-2 h-2 rounded-full bg-[#1B8054]" />
                <span>5 places detected</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#151E28]">
                <span className="w-2 h-2 rounded-full bg-[#1B8054]" />
                <span>Captions + audio read</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#151E28]">
                <span className="w-2 h-2 rounded-full bg-[#1B8054]" />
                <span>Suggested: 3 days · Ubud</span>
              </div>
            </div>
          </div>
        </div>

        {/* Places from this reel Section */}
        <section className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#151E28]">
              Places from this reel
            </h3>
            <div className="flex items-center gap-2">
              {removedPlaces.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndoRemove}
                  className="text-xs font-bold text-[#D95338] flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              )}
              <span className="text-xs font-medium text-[#7A8699]">
                Tap to remove
              </span>
            </div>
          </div>

          {/* Places List */}
          <div className="space-y-2.5">
            {places.map((place, index) => {
              const isHighMatch = place.match_percent >= 90;
              return (
                <div
                  key={`${place.name}-${index}`}
                  onClick={() => handleRemovePlace(index)}
                  className="bg-white rounded-2xl p-3.5 border border-[#EDE7DF] shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-[#D95338]/40 hover:bg-[#FFFDFB] transition-all group"
                  title="Click to remove from itinerary"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Index circle */}
                    <div className="w-7 h-7 rounded-full bg-[#E5F0FA] text-[#1E4E79] flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-[#151E28] truncate group-hover:text-[#D95338] transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-[#7A8699] font-medium truncate mt-0.5">
                        {place.timestamp}
                      </p>
                    </div>
                  </div>

                  {/* Match percentage pill */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        isHighMatch
                          ? 'bg-[#E7F6EE] text-[#1B8054]'
                          : 'bg-[#FEF7EC] text-[#B45309]'
                      }`}
                    >
                      {place.match_percent}%
                    </span>
                    <X className="w-4 h-4 text-[#7A8699] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action CTAs */}
        <div className="pt-4 space-y-3">
          <button
            type="button"
            disabled={isBuilding || places.length === 0}
            onClick={handleBuildItinerary}
            className="w-full bg-[#D95338] hover:bg-[#C9472D] active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#D95338]/30 transition-all disabled:opacity-60"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating optimized route...</span>
              </>
            ) : (
              'Build itinerary from this reel'
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('itinerary', { appendReelPlaces: true })}
            className="w-full text-center text-xs font-bold text-[#5A687C] hover:text-[#151E28] transition-colors py-1"
          >
            Add these places to Bali trip instead
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReelToItineraryScreen;
