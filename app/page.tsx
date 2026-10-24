'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import PlannrApp from '../components/plannr/PlannrApp';
import Header from '../components/Header';
import StoriesCarousel, { StoryItem } from '../components/StoriesCarousel';
import ServiceNavigation from '../components/ServiceNavigation';
import ProductFeed, { VisaItem, VISA_ITEMS } from '../components/ProductFeed';
import DepartureBoard from '../components/DepartureBoard';
import GstSection from '../components/GstSection';
import StickyCartBar from '../components/StickyCartBar';
import CheckoutModal from '../components/CheckoutModal';
import StoryModal from '../components/StoryModal';
import OrbitAiChatbot from '../components/OrbitAiChatbot';
import CallbackModal from '../components/CallbackModal';
import FlightSearchBar from '../components/FlightSearchBar';
import VisaApplicationModal from '../components/VisaApplicationModal';
import FlyscanJetWipe from '../components/FlyscanJetWipe';
import MakeMyTripFlightBooking from '../components/MakeMyTripFlightBooking';
import MakeMyTripHotelBooking from '../components/MakeMyTripHotelBooking';
import MakeMyTripVillaBooking from '../components/MakeMyTripVillaBooking';
import MakeMyTripVisaBooking from '../components/MakeMyTripVisaBooking';
import MakeMyTripAuthModal from '../components/MakeMyTripAuthModal';
import OrbitAiCopilot from '../components/OrbitAiCopilot';
import TripDurationSplitSection from '../components/TripDurationSplitSection';
import TripRecommender from '../components/TripRecommender';
import ConcertsEventsFeed from '../components/ConcertsEventsFeed';
import TravelAlertsFeed from '../components/TravelAlertsFeed';
import { 
  ArrowRight, 
  Bot, 
  Check, 
  CheckCircle2, 
  RotateCw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Plane, 
  Flame, 
  Building2, 
  Clock, 
  Search,
  Globe2,
  Camera,
  UploadCloud,
  Compass,
  Star,
  Tag,
  MessageCircle
} from 'lucide-react';

// Dynamic import for Three.js Globe to avoid SSR canvas errors
const ThreeGlobe = dynamic(() => import('../components/ThreeGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] sm:h-[420px] rounded-3xl bg-[#0F172A] border border-slate-200 flex flex-col items-center justify-center text-white/70 text-xs font-mono space-y-3 relative overflow-hidden shadow-xl">
      <div className="w-10 h-10 rounded-full border-2 border-[#0084FF] border-t-transparent animate-spin"></div>
      <div className="text-center">
        <div className="font-bold text-white tracking-wide">Initializing 3D Route Engine...</div>
        <div className="text-[10px] text-cyan-400 mt-1">Rendering GPS Beacons &amp; Flight Telemetry</div>
      </div>
    </div>
  ),
});

interface Toast {
  id: string;
  type: 'success' | 'info';
  title: string;
  message: string;
}

const CITY_DESTINATIONS: Record<string, { city: string; country: string; bg: string }> = {
  delhi: {
    city: 'New Delhi',
    country: 'India',
    bg: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=70',
  },
  goa: {
    city: 'Goa',
    country: 'India',
    bg: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=70',
  },
  thailand: {
    city: 'Bangkok',
    country: 'Thailand',
    bg: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=70',
  },
  dubai: {
    city: 'Dubai',
    country: 'United Arab Emirates',
    bg: 'https://images.unsplash.com/photo-1652707228067-25672fa0b082?auto=format&fit=crop&w=1600&q=70',
  },
  rishikesh: {
    city: 'Rishikesh',
    country: 'Himalayas, India',
    bg: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=70',
  },
  bali: {
    city: 'Bali',
    country: 'Indonesia',
    bg: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=70',
  },
  vietnam: {
    city: 'Da Nang',
    country: 'Vietnam',
    bg: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=70',
  },
};

export default function Home() {
  const [appMode, setAppMode] = useState<'orbit' | 'plannr'>('orbit');
  const [currentLocation, setCurrentLocation] = useState('Delhi NCR (Hub)');
  const [activeCityKey, setActiveCityKey] = useState('delhi');
  const [activeTab, setActiveTab] = useState('flights'); // MakeMyTrip Default: Flights!
  const [searchPrompt, setSearchPrompt] = useState('');

  // Flyscan Supersonic Jet Wipe Animation State
  const [isJetWiping, setIsJetWiping] = useState(false);
  const [wipeData, setWipeData] = useState({
    city: 'Dubai',
    country: 'United Arab Emirates',
    bg: 'https://images.unsplash.com/photo-1652707228067-25672fa0b082?auto=format&fit=crop&w=1600&q=70',
  });

  // Cart & Checkout
  const [cartItem, setCartItem] = useState({
    name: 'IndiGo Delhi ➔ Goa (Non-Stop)',
    price: '₹2,899',
  });
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedVisaItem, setSelectedVisaItem] = useState<VisaItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Offers Category Filter
  const [offerCategory, setOfferCategory] = useState<'all' | 'flights' | 'hotels' | 'holidays' | 'visas'>('all');

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerFlyscanWipe = (cityKey: string) => {
    const dest = CITY_DESTINATIONS[cityKey] || CITY_DESTINATIONS.dubai;
    setWipeData(dest);
    setIsJetWiping(true);
  };

  const handleSelectToCart = (name: string, price: string) => {
    setCartItem({ name, price });
    setIsCartVisible(true);
    setIsCheckoutOpen(true);
    addToast('success', 'Selected for Booking', `${name} (${price}) loaded in 1-Click checkout.`);
  };

  const handleFocusCity = (cityKey: string, withWipe: boolean = false) => {
    setActiveCityKey(cityKey);
    if (withWipe) {
      triggerFlyscanWipe(cityKey);
    }
    addToast('info', '3D Globe Focused', `Route camera pivoted to ${cityKey.toUpperCase()}.`);
  };

  const handleTabChange = (newTab: string) => {
    if (newTab === 'plannr') {
      setAppMode('plannr');
      addToast('success', 'Plannr Studio Launched', '7-Screen AI Itinerary & Reel Builder loaded.');
      return;
    }
    setActiveTab(newTab);
    if (newTab === 'chat') {
      setIsWhatsAppOpen(true);
      addToast('success', '24/7 Live Chat Connected', 'Orbit Travel Desk is online and ready to assist.');
    }
    else if (newTab === 'recommender') addToast('info', 'AI Recommender Active', 'Tell Orbit AI your mood and budget for instant trip recommendations.');
    else if (newTab === 'events') addToast('info', 'Events & City Life (Evergreen)', 'Cafes, rooftops, nightlife & mega concerts loaded with time filters.');
    else if (newTab === 'visa') triggerFlyscanWipe('thailand');
    else if (newTab === 'flights') triggerFlyscanWipe('goa');
    else if (newTab === 'stays') triggerFlyscanWipe('rishikesh');
    else if (newTab === 'dirtcheap') triggerFlyscanWipe('goa');
    else if (newTab === 'weekend') triggerFlyscanWipe('rishikesh');
  };

  React.useEffect(() => {
    const handleOrbitNav = (e: any) => {
      const targetTab = e.detail?.tab;
      if (targetTab) {
        setAppMode('orbit');
        handleTabChange(targetTab);
        setTimeout(() => {
          const el = document.getElementById(`${targetTab}-section`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 150);
      }
    };

    window.addEventListener('orbit:navigate', handleOrbitNav);
    return () => window.removeEventListener('orbit:navigate', handleOrbitNav);
  }, []);

  const handleFlightSearch = (from: string, to: string) => {
    const toLower = to.toLowerCase();
    let target = 'goa';
    if (toLower.includes('goa')) target = 'goa';
    else if (toLower.includes('bangkok') || toLower.includes('thailand') || toLower.includes('bkk')) target = 'thailand';
    else if (toLower.includes('dubai') || toLower.includes('dxb')) target = 'dubai';
    else if (toLower.includes('bali') || toLower.includes('dps')) target = 'bali';
    else if (toLower.includes('kashmir') || toLower.includes('srinagar') || toLower.includes('sxr')) target = 'kashmir';
    else if (toLower.includes('jaipur') || toLower.includes('jai')) target = 'jaipur';
    else if (toLower.includes('mumbai') || toLower.includes('bom')) target = 'mumbai';
    else target = 'delhi';

    handleFocusCity(target, false);
    addToast('success', 'Flight Route Updated', `Searching direct flights: ${from} ➔ ${to}`);
  };

  const handleSmartSearch = () => {
    const q = searchPrompt.toLowerCase().trim();
    if (!q) return;

    // 1. Flights Priority Check
    if (q.includes('flight') || q.includes('ticket') || q.includes('fly') || q.includes('airline') || q.includes('indigo') || q.includes('vistara') || q.includes('bkk') || q.includes('dxb')) {
      setActiveTab('flights');
      let dest = 'Bangkok';
      let destKey = 'thailand';
      if (q.includes('goa')) { dest = 'Goa'; destKey = 'goa'; }
      else if (q.includes('dubai')) { dest = 'Dubai'; destKey = 'dubai'; }
      else if (q.includes('bali')) { dest = 'Bali'; destKey = 'bali'; }
      else if (q.includes('kashmir') || q.includes('srinagar')) { dest = 'Srinagar'; destKey = 'kashmir'; }
      else if (q.includes('mumbai')) { dest = 'Mumbai'; destKey = 'mumbai'; }
      else if (q.includes('bangkok') || q.includes('thailand')) { dest = 'Bangkok'; destKey = 'thailand'; }

      handleFocusCity(destKey, true);
      handleFlightSearch('Delhi', dest);
      addToast('success', 'Searching Flights', `Found live routes: Delhi ➔ ${dest}`);
      return;
    }

    // 2. Concerts & Mega Events & Evergreen City Life Check
    if (q.includes('coldplay') || q.includes('diljit') || q.includes('sunburn') || q.includes('concert') || q.includes('fest') || q.includes('event') || q.includes('cafe') || q.includes('restaurant') || q.includes('nightlife') || q.includes('party') || q.includes('club') || q.includes('food') || q.includes('evergreen')) {
      setActiveTab('events');
      addToast('info', 'Live Events & City Life', 'Opening Cafes, Nightlife & Concerts (Evergreen View)');
      return;
    }

    // 3. Visas Check
    if (q.includes('visa') || q.includes('passport') || q.includes('evisa') || q.includes('embassy')) {
      setActiveTab('visa');
      if (q.includes('thailand')) handleFocusCity('thailand', true);
      if (q.includes('dubai')) handleFocusCity('dubai', true);
      if (q.includes('vietnam')) handleFocusCity('vietnam', true);
      addToast('info', 'Visa Engine', 'Opening Flat ₹499 Visa Desk');
      return;
    }

    // 4. Stays, Hotels & Private Villas
    if (q.includes('hotel') || q.includes('stay') || q.includes('resort') || q.includes('villa') || q.includes('haveli') || q.includes('pool')) {
      setActiveTab('stays');
      if (q.includes('goa')) handleFocusCity('goa', true);
      if (q.includes('rishikesh')) handleFocusCity('rishikesh', true);
      if (q.includes('jaipur')) handleFocusCity('jaipur', true);
      addToast('info', '520+ Stays', 'Filtering curated hotels & villas');
      return;
    }

    // 5. Dirt Cheap Drops
    if (q.includes('dirt') || q.includes('cheap') || q.includes('drop') || q.includes('distressed') || q.includes('60%')) {
      setActiveTab('dirtcheap');
      handleFocusCity('goa', true);
      return;
    }

    // 6. GST & Finance
    if (q.includes('gst') || q.includes('tax') || q.includes('invoice') || q.includes('itc')) {
      setActiveTab('gst');
      return;
    }

    // 7. Fallback to Weekend / Stays
    setActiveTab('weekend');
    handleFocusCity('rishikesh', true);
  };

  const [bookingMeta, setBookingMeta] = useState<{ id: string; qrToken: string } | null>(null);

  const handleCompletePayment = async (method: string) => {
    setIsCheckoutOpen(false);
    const priceNum = parseInt(cartItem.price.replace(/[^0-9]/g, ''), 10) || 4999;
    let bId = `ORB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let qr = 'QR_VERIFIED_PASS_2026';
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_slug: activeCityKey || 'trip',
          trip_title: cartItem.name,
          destination_key: activeCityKey || 'delhi',
          travel_date: '2026-11-15',
          travelers_count: 1,
          total_amount: priceNum,
          payment_method: method || 'UPI_INSTANT',
          user_name: 'Rahul Sharma',
          user_email: 'rahul@travel.in',
          user_phone: '+91 98101 23456',
          gstin: '07AAAAA0000A1Z5',
          company_name: 'Sharma Tech Enterprises'
        })
      });
      if (res.ok) {
        const data = await res.json();
        bId = data.booking_id;
        qr = data.qr_token;
      }
    } catch (err) {
      console.warn('Booking API error, using local fallback:', err);
    }

    setBookingMeta({ id: bId, qrToken: qr });
    setSuccessMsg(
      `${cartItem.name} (${cartItem.price}) confirmed via ${method}. Booking Reference: ${bId}. Flight tickets, check-in QR code, and WhatsApp vouchers dispatched.`
    );
    setIsSuccessOpen(true);
    addToast('success', 'Booking Confirmed!', `PNR / Reference: ${bId}`);
  };

  const handleSelectOriginCity = (cityName: string) => {
    setCurrentLocation(cityName);
    addToast('info', 'Origin City Changed', `Departing hub updated to ${cityName}.`);
  };

  if (appMode === 'plannr') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#151E28] flex flex-col">
        {/* ── TOP SUPERAPP MODE SWITCHER BAR ── */}
        <div className="bg-[#0B132B] text-white px-4 py-2 sticky top-0 z-50 shadow-md border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
              Orbit Travel Superapp
            </span>
          </div>

          <div className="flex items-center bg-slate-900/90 rounded-full p-1 border border-slate-700/80 shadow-inner">
            <button
              type="button"
              onClick={() => setAppMode('orbit')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <span>✈️</span>
              <span>Orbit Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setAppMode('plannr')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-[#D95338] text-white shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Plannr AI</span>
              <span className="px-1.5 py-0.2 bg-white/20 text-[9px] rounded-full uppercase tracking-wider font-extrabold">
                Active
              </span>
            </button>
          </div>
        </div>

        <PlannrApp onExitToOrbit={() => setAppMode('orbit')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-28 text-slate-900 bg-[#F2F5FA] relative">
      {/* ── TOP SUPERAPP MODE SWITCHER BAR ── */}
      <div className="bg-[#0B132B] text-white px-4 py-2 sticky top-0 z-50 shadow-md border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
            Orbit Travel Superapp
          </span>
        </div>

        <div className="flex items-center bg-slate-900/90 rounded-full p-1 border border-slate-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => setAppMode('orbit')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-[#0084FF] text-white shadow-md flex items-center gap-1.5"
          >
            <span>✈️</span>
            <span>Orbit Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode('plannr')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Plannr AI</span>
            <span className="px-1.5 py-0.2 bg-[#D95338] text-white text-[9px] rounded-full uppercase tracking-wider font-extrabold">
              New
            </span>
          </button>
        </div>
      </div>
      
      {/* ── FLYSCAN.AI SIGNATURE JET WIPE TRANSITION OVERLAY ── */}
      <FlyscanJetWipe
        isActive={isJetWiping}
        destinationCity={wipeData.city}
        destinationCountry={wipeData.country}
        bgImageUrl={wipeData.bg}
        onComplete={() => setIsJetWiping(false)}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0084FF] flex items-center justify-center shrink-0 border border-blue-200">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#0084FF]" />
              )}
            </div>
            <div className="flex-1 pr-2">
              <div className="text-xs font-bold text-slate-900">{toast.title}</div>
              <div className="text-[11px] text-slate-500 line-clamp-1">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 1. Header Matching MakeMyTrip Screenshot */}
      <Header
        currentLocation={currentLocation}
        activeTab={activeTab}
        onSelectCity={handleSelectOriginCity}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
        onOpenWhatsAppDrawer={() => setIsWhatsAppOpen(true)}
        onSelectTab={handleTabChange}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* ── MAKEMYTRIP SCENIC HERO BACKGROUND CONTAINER ── */}
      <div className="mmt-hero-bg pt-4 pb-14 px-4 relative select-none">
        
        {/* 1.5 Orbit AI Travel Copilot & Smart Route Architect */}
        <OrbitAiCopilot
          onSelectToCart={handleSelectToCart}
          onFocusCity={(k) => handleFocusCity(k, true)}
          onSelectTab={handleTabChange}
          onOpenChatbot={() => setIsWhatsAppOpen(true)}
        />

        {/* 1.6 Top Recommender Section Banner */}
        <div className="max-w-6xl mx-auto pt-3">
          <div className="bg-gradient-to-r from-blue-900/70 via-indigo-900/70 to-slate-900/80 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg transition-all">
            <div className="flex items-center space-x-3 overflow-hidden">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-white font-black flex items-center justify-center text-base shadow-md shrink-0">
                ✨
              </span>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                    Orbit Smart Recommender
                  </span>
                  <span className="px-1.5 py-0.2 bg-cyan-400/20 text-cyan-300 text-[10px] font-mono rounded font-bold">
                    AI TRIP MATCHER
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate hidden sm:block">
                  Click and tell us what you want — mood, budget, or who&apos;s traveling — and get instant customized trip recommendations!
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTabChange('recommender')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 shrink-0 btn-press cursor-pointer ${
                activeTab === 'recommender'
                  ? 'bg-cyan-400 text-slate-900 shadow-md shadow-cyan-400/30'
                  : 'bg-[#0084FF] hover:bg-[#0070db] text-white shadow-md shadow-blue-500/30'
              }`}
            >
              <span>{activeTab === 'recommender' ? '✨ Recommender Active' : 'Tell Recommender ➔'}</span>
            </button>
          </div>
        </div>

        {/* 1.7 Plannr AI Featured Spotlight Card */}
        <div className="max-w-6xl mx-auto pt-3">
          <div className="bg-gradient-to-r from-[#D95338] via-[#C9472D] to-[#B3351C] rounded-2xl p-3 sm:p-3.5 text-white shadow-lg flex items-center justify-between gap-3 border border-white/20">
            <div className="flex items-center space-x-3 overflow-hidden">
              <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md text-white font-black flex items-center justify-center text-lg shadow-inner shrink-0">
                🎒
              </span>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                    Plannr AI Studio · 7-Screen Superapp
                  </span>
                  <span className="px-1.5 py-0.2 bg-white text-[#D95338] text-[10px] font-mono rounded font-black">
                    JUST LAUNCHED
                  </span>
                </div>
                <p className="text-[11px] text-white/90 font-medium truncate hidden sm:block">
                  Turn Instagram Reels into trips · AI Itinerary Timelines · Group Live Voting · Split 4 Ways &amp; Settle!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAppMode('plannr')}
              className="px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 shrink-0 bg-white text-[#D95338] hover:bg-slate-100 shadow-md shadow-black/10 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-[#D95338] stroke-none" />
              <span>Launch Plannr Studio ➔</span>
            </button>
          </div>
        </div>

        {/* 2. Floating MakeMyTrip Category Capsule Dock */}
        <ServiceNavigation activeTab={activeTab} onSelectTab={handleTabChange} />

        {/* 3. Main Hero Search Area */}
        <div className="max-w-6xl mx-auto mt-6">
          {activeTab === 'chat' && (
            <div className="bg-[#0A1024] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-cyan-400/50 space-y-6 animate-fade-in select-none text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#0084FF]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              {/* Main Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-400/20 pb-5 relative z-10">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-cyan-400/40">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Orbit AI Travel Copilot — Pura Interactive Chat
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">
                        GPT-4o CROSS-EXAMINER
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Ye chatbot aapse cross-questions poochta hai aur real-time me custom vacation package banata hai!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-[#0084FF] to-cyan-400 hover:from-[#0070db] hover:to-cyan-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-400/40 transition flex items-center space-x-2 shrink-0 btn-press cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Launch Pura AI Chat (New Tab) ↗</span>
                  </a>
                </div>
              </div>

              {/* 4 Interactive Cross-Question Conversation Launchers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <a 
                  href="/chat?q=Goa+beach+vacation+with+squad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-[#111C38] border border-cyan-400/25 hover:border-cyan-400/70 transition cursor-pointer space-y-2 group shadow-md block"
                >
                  <div className="text-2xl">🏖️</div>
                  <div className="font-black text-white text-sm group-hover:text-cyan-300">
                    Goa Squad Cross-Exam
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    AI cross-questions your vibe (North vs South Goa), budget &amp; pool villa for your squad.
                  </p>
                  <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 pt-1">
                    <span>Open in New Tab ↗</span>
                  </div>
                </a>

                <a 
                  href="/chat?q=Rishikesh+weekend+rafting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-[#111C38] border border-cyan-400/25 hover:border-cyan-400/70 transition cursor-pointer space-y-2 group shadow-md block"
                >
                  <div className="text-2xl">⛰️</div>
                  <div className="font-black text-white text-sm group-hover:text-cyan-300">
                    Rishikesh Weekend &lt;3h
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    AI cross-questions rafting rapids vs yoga, riverbed glamping &amp; budget under ₹5k.
                  </p>
                  <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 pt-1">
                    <span>Open in New Tab ↗</span>
                  </div>
                </a>

                <a 
                  href="/chat?q=Thailand+with+flat+499+visa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-[#111C38] border border-cyan-400/25 hover:border-cyan-400/70 transition cursor-pointer space-y-2 group shadow-md block"
                >
                  <div className="text-2xl">🇹🇭</div>
                  <div className="font-black text-white text-sm group-hover:text-cyan-300">
                    Thailand Flat ₹499 Visa
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    AI cross-questions family vs couple island hopping, baggage &amp; 24h OCR visa pre-check.
                  </p>
                  <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 pt-1">
                    <span>Open in New Tab ↗</span>
                  </div>
                </a>

                <a 
                  href="/chat?q=Dubai+48h+luxury+desert+trip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-[#111C38] border border-cyan-400/25 hover:border-cyan-400/70 transition cursor-pointer space-y-2 group shadow-md block"
                >
                  <div className="text-2xl">🇦🇪</div>
                  <div className="font-black text-white text-sm group-hover:text-cyan-300">
                    Dubai 48h Luxury Safari
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    AI cross-questions Burj Khalifa levels, 4x4 red dune desert safari &amp; 5-star hotel options.
                  </p>
                  <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 pt-1">
                    <span>Open in New Tab ↗</span>
                  </div>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'recommender' && (
            <TripRecommender
              onSelectToCart={handleSelectToCart}
              onFocusCity={(k) => handleFocusCity(k, true)}
              onSelectTab={handleTabChange}
            />
          )}

          {activeTab === 'events' && (
            <div id="events-section">
              <ConcertsEventsFeed
                onSelectToCart={handleSelectToCart}
                onFocusCity={(k) => handleFocusCity(k, true)}
              />
            </div>
          )}

          {activeTab === 'flights' && (
            <div id="flights-section">
              <MakeMyTripFlightBooking
                onSearchFlights={handleFlightSearch}
                onSelectToCart={handleSelectToCart}
                onFocusCity={(k) => handleFocusCity(k, false)}
                activeCityKey={activeCityKey}
                renderGlobe={
                  <ThreeGlobe
                    activeCityKey={activeCityKey}
                    onSelectCity={(key) => handleFocusCity(key, false)}
                    onBookItem={handleSelectToCart}
                  />
                }
              />
            </div>
          )}

          {activeTab === 'stays' && (
            <div id="stays-section">
              <MakeMyTripHotelBooking
                onSelectToCart={handleSelectToCart}
                onFocusCity={(k) => handleFocusCity(k, true)}
              />
            </div>
          )}

          {activeTab === 'weekend' && (
            <div id="weekend-section">
              <MakeMyTripVillaBooking
                onSelectToCart={handleSelectToCart}
                onFocusCity={(k) => handleFocusCity(k, true)}
                activeCityKey={activeCityKey}
              />
            </div>
          )}

          {activeTab === 'visa' && (
            <div id="visa-section">
              <MakeMyTripVisaBooking
                onSelectToCart={handleSelectToCart}
                onFocusCity={(k) => handleFocusCity(k, true)}
                activeCityKey={activeCityKey}
              />
            </div>
          )}

          {activeTab === 'dirtcheap' && (
            <div id="dirtcheap-section" className="space-y-6">
              <DepartureBoard
                onSelectToCart={handleSelectToCart}
                onSelectTab={handleTabChange}
              />
              <ProductFeed
                activeTab="dirtcheap"
                onSelectToCart={handleSelectToCart}
                onFocusCity={(k) => handleFocusCity(k, true)}
              />
            </div>
          )}

          {activeTab === 'gst' && (
            <div id="gst-section">
              <GstSection />
            </div>
          )}

          {activeTab === 'esim' && (
            <ProductFeed
              activeTab="esim"
              onSelectToCart={handleSelectToCart}
              onFocusCity={(k) => handleFocusCity(k, true)}
            />
          )}

          {activeTab === 'news' && (
            <TravelAlertsFeed
              onSelectToCart={handleSelectToCart}
              onFocusCity={(k) => handleFocusCity(k, true)}
            />
          )}
        </div>

      </div>

      {/* ── 3.3 TWO-COLUMN POWER SECTION: SHORT TRIPS (<3H) VS LONG TRIPS (4-7 DAYS) ── */}
      <TripDurationSplitSection
        onSelectToCart={handleSelectToCart}
        onFocusCity={(k) => handleFocusCity(k, true)}
        onSelectTab={handleTabChange}
      />

      {/* ── 3.5 TRENDING ESCAPES & STORY HIGHLIGHTS ── */}
      <section className="max-w-6xl mx-auto px-4 pt-6 w-full select-none">
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EB2026] animate-ping" />
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Trending Weekend Getaways &amp; Flash Deals
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#0084FF] hidden sm:inline">Tap story to view live deal</span>
          </div>
          <StoriesCarousel
            onSelectStory={(story) => {
              setSelectedStory(story);
              if (story.cityKey) handleFocusCity(story.cityKey, true);
            }}
          />
        </div>
      </section>

      {/* ── 4. MAKEMYTRIP AUTHENTIC OFFERS SECTION (MATCHING SCREENSHOT) ── */}
      <section className="max-w-6xl mx-auto px-4 py-8 w-full select-none">
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 space-y-5">
          
          {/* Section Header with Category Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Offers
              </h2>
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-bold">
                <button
                  onClick={() => setOfferCategory('all')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    offerCategory === 'all'
                      ? 'bg-[#0084FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Offers
                </button>
                <button
                  onClick={() => setOfferCategory('flights')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    offerCategory === 'flights'
                      ? 'bg-[#0084FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Flights
                </button>
                <button
                  onClick={() => setOfferCategory('hotels')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    offerCategory === 'hotels'
                      ? 'bg-[#0084FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hotels
                </button>
                <button
                  onClick={() => setOfferCategory('holidays')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    offerCategory === 'holidays'
                      ? 'bg-[#0084FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Holidays
                </button>
                <button
                  onClick={() => setOfferCategory('visas')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    offerCategory === 'visas'
                      ? 'bg-[#0084FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Visas
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs font-extrabold text-[#0084FF] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>VIEW ALL ➔</span>
            </button>
          </div>

          {/* 3-Column Offer Cards Matching Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Offer 1: Goa Stays (Direct from Screenshot) */}
            <div 
              onClick={() => {
                setActiveTab('stays');
                handleFocusCity('goa', true);
              }}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition cursor-pointer flex gap-3.5 group bg-slate-50/40"
            >
              <img
                src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&auto=format&fit=crop&q=80"
                alt="Goa Homestays"
                className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    VILLAS &amp; HOMESTAYS · T&amp;C APPLY
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-[#0084FF] transition-colors mt-0.5">
                    GET YOUR KINDA GOA STAYS: Grab FLAT 20% OFF*
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Code: GOASTAY20
                  </span>
                  <span className="text-xs font-bold text-[#0084FF] group-hover:translate-x-1 transition-transform">
                    BOOK NOW ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Offer 2: Holiday Packages */}
            <div 
              onClick={() => {
                setActiveTab('weekend');
                handleFocusCity('rishikesh', true);
              }}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition cursor-pointer flex gap-3.5 group bg-slate-50/40"
            >
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&auto=format&fit=crop&q=80"
                alt="Rishikesh Riverfront"
                className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    HOLIDAYS · T&amp;C APPLY
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-[#0084FF] transition-colors mt-0.5">
                    Get Up to ₹10,000 OFF* on Holiday Packages
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Code: HOLIDAY10K
                  </span>
                  <span className="text-xs font-bold text-[#0084FF] group-hover:translate-x-1 transition-transform">
                    BOOK NOW ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Offer 3: Orbit Direct Flights */}
            <div 
              onClick={() => {
                setActiveTab('flights');
                handleFocusCity('goa', true);
              }}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition cursor-pointer flex gap-3.5 group bg-slate-50/40"
            >
              <img
                src="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&auto=format&fit=crop&q=80"
                alt="Flights Zero Fee"
                className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    DOM FLIGHTS · NO HIDDEN FEES
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-[#0084FF] transition-colors mt-0.5">
                    Fly Non-Stop: Save ₹350 with Flat ₹0 Convenience Fee
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Code: ZEROFEES
                  </span>
                  <span className="text-xs font-bold text-[#0084FF] group-hover:translate-x-1 transition-transform">
                    BOOK NOW ➔
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sticky Quick Cart Bar (Only visible when user selects an item) */}
      {isCartVisible && (
        <StickyCartBar
          itemName={cartItem.name}
          itemPrice={cartItem.price}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onDismiss={() => setIsCartVisible(false)}
        />
      )}

      {/* MakeMyTrip Split-Card Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        itemName={cartItem.name}
        itemPrice={cartItem.price}
        onCompletePayment={handleCompletePayment}
      />

      {/* MakeMyTrip Login/Create Account Modal (From Screenshot) */}
      <MakeMyTripAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(phone, type) => {
          addToast('success', 'Logged In Successfully', `${phone} connected as ${type.toUpperCase()} account.`);
        }}
      />

      {/* Visa Studio Modal */}
      {selectedVisaItem && (
        <VisaApplicationModal
          isOpen={!!selectedVisaItem}
          onClose={() => setSelectedVisaItem(null)}
          country={selectedVisaItem.country}
          flag={selectedVisaItem.flag}
          govtFee={selectedVisaItem.govtFee}
          platformFee={selectedVisaItem.platformFee}
          timeline={selectedVisaItem.timeline}
          onComplete={(summary) => {
            setSelectedVisaItem(null);
            addToast('success', 'Visa Application Lodged!', summary);
          }}
        />
      )}

      {/* Story Modal */}
      <StoryModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onBookItem={handleSelectToCart}
      />

      {/* Orbit AI Travel Copilot Chatbot */}
      <OrbitAiChatbot
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onOpen={() => setIsWhatsAppOpen(true)}
        onSelectToCart={handleSelectToCart}
        onFocusCity={(k) => handleFocusCity(k, true)}
        isCartVisible={isCartVisible}
      />

      {/* 2-Min Callback Modal */}
      <CallbackModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />

      {/* Booking Confirmation Dialog */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Booking Confirmed!</h3>
            {bookingMeta && (
              <div className="inline-block px-3 py-1 bg-blue-50 text-[#0084FF] rounded-full text-xs font-mono font-black border border-blue-200">
                PNR: {bookingMeta.id}
              </div>
            )}
            <p className="text-xs text-slate-600 leading-relaxed">{successMsg}</p>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left text-xs space-y-1 font-mono">
              <div className="text-slate-500 font-bold font-sans">Milestone Status:</div>
              <div className="text-emerald-700 font-bold flex items-center space-x-1.5">
                <span>●</span>
                <span>WhatsApp Ticket &amp; QR ({bookingMeta?.qrToken || 'ISSUED'})</span>
              </div>
              <div className="text-[#0084FF] font-bold flex items-center space-x-1.5">
                <span>●</span>
                <span>Company GSTIN Synced (07AAAAA0000A1Z5)</span>
              </div>
            </div>
            <button
              onClick={() => setIsSuccessOpen(false)}
              className="w-full py-3 bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white text-xs font-black rounded-xl transition"
            >
              Done ➔
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
