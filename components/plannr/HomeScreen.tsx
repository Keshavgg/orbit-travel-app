import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Mic, Bell, Heart, Users, Film, Check, Compass } from 'lucide-react';
import { PlannrScreen, PlannrPackage } from './types';
import {
  BaliVectorArt,
  VietnamVectorArt,
  ThailandVectorArt,
  JapanVectorArt,
} from './VectorArt';

interface HomeScreenProps {
  onNavigate: (screen: PlannrScreen, data?: any) => void;
  onSelectTrip?: (tripId: string) => void;
}

// ── Combined Recommender + Plannr Trip Database ──
const COMBINED_RECOMMENDER_PACKAGES: PlannrPackage[] = [
  // 1. Rishikesh Glamping & Rafting (< 3h road trip)
  {
    id: 'pkg_rishi_glamp',
    title: 'Rishikesh Ganga Riverfront Glamping',
    country: 'India',
    location: 'Rishikesh, Uttarakhand',
    days: 2,
    starting_price: 3499,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    vector_type: 'hills',
    tag: 'Weekend Escape',
    rating: 4.94,
    vibe: 'wellness',
    tagline: 'Luxury Swiss dome tents with 16km Ganga rafting',
    matchScore: 98,
    duration: '2 Days / 1 Night',
    inclusions: ['⛺ AC Swiss Tent', '🌊 16km Ganga Rafting', '🔥 Bonfire & Music', '🍲 All 3 Buffet Meals'],
    itinerary: [
      { day: 'Day 1', title: 'Expressway Drive & Campfire', desc: 'Scenic drive from Delhi, check-in to luxury river tents, evening music by Ganga.' },
      { day: 'Day 2', title: 'Grade-3 Rafting & Return', desc: '16km rapid rafting, cliff jumping, riverside lunch, afternoon return.' }
    ]
  },
  // 2. Samode Palace Royal Haveli (< 3h road trip)
  {
    id: 'pkg_samode_royal',
    title: 'Samode Palace Royal Haveli Escape',
    country: 'India',
    location: 'Samode, Rajasthan',
    days: 2,
    starting_price: 8999,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    vector_type: 'heritage',
    tag: 'Royal Heritage',
    rating: 4.96,
    vibe: 'heritage',
    tagline: '475-year-old Rajput royal palace with marble pool',
    matchScore: 95,
    duration: '2 Days / 1 Night',
    inclusions: ['🏰 Royal Heritage Suite', '🍽️ Royal Thali Dinner', '🏊 Marble Pool Access', '☕ High Tea'],
    itinerary: [
      { day: 'Day 1', title: 'Royal Welcome & Sheesh Mahal', desc: 'Scenic drive via NH48, traditional aarti welcome, Sheesh Mahal tour.' },
      { day: 'Day 2', title: 'Village Camel Safari & Return', desc: 'Camel cart ride, Rajasthani royal lunch, evening return.' }
    ]
  },
  // 3. Goa Party Villa & Beach Club
  {
    id: 'pkg_goa_party',
    title: 'Goa Coastal Villa & Beach Club Escape',
    country: 'India',
    location: 'Vagator, North Goa',
    days: 4,
    starting_price: 11499,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    vector_type: 'coastal',
    tag: 'Bestseller',
    rating: 4.99,
    vibe: 'party',
    tagline: 'Private pool villa with VIP beach club entry & 2 scooters',
    matchScore: 99,
    duration: '4 Days / 3 Nights',
    inclusions: ['✈️ Direct Flight', '🏡 3BHK Pool Villa', '🛵 2 Scooters', '🍳 Daily Breakfast'],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Sunset Poolside', desc: 'Direct flight to MOPA, private cab to Vagator villa, sundowner drinks.' },
      { day: 'Day 2', title: 'North Goa Beach Hopping', desc: 'Scooter ride across Anjuna & Ashvem, VIP entry to beachfront lounge.' },
      { day: 'Day 3', title: 'Watersports & Nightlife', desc: 'Jet ski at Calangute, followed by party night at Tito’s Lane.' },
      { day: 'Day 4', title: 'Brunch & Departure', desc: 'Lazy pool breakfast, souvenir shopping in Panjim, departure flight.' }
    ]
  },
  // 4. South Goa Secret Coves & Heritage
  {
    id: 'pkg_goa_heritage',
    title: 'South Goa Secret Coves & Heritage',
    country: 'India',
    location: 'Palolem & Cabo de Rama',
    days: 4,
    starting_price: 18500,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    vector_type: 'coastal',
    tag: 'Weekend Getaway',
    rating: 4.86,
    vibe: 'beach',
    tagline: 'Heritage Portuguese villa with private boat dolphin spotting',
    matchScore: 96,
    duration: '4 Days / 3 Nights',
    inclusions: ['🏡 Portuguese Villa', '🐬 Dolphin Boat Tour', '🏖️ Butterfly Beach Trail', '🍳 Traditional Breakfast'],
    itinerary: [
      { day: 'Day 1', title: 'Arrival in South Goa', desc: 'Airport cab to heritage villa, sunset at Palolem beach.' },
      { day: 'Day 2', title: 'Dolphins & Hidden Coves', desc: 'Private boat tour to Butterfly Beach & Honeymoon Island.' },
      { day: 'Day 3', title: 'Cabo de Rama Fort', desc: 'Cliff-top Portuguese fort exploration and coastal café brunch.' },
      { day: 'Day 4', title: 'Spice Plantation & Departure', desc: 'Organic spice plantation tour with lunch, transfer to airport.' }
    ]
  },
  // 5. Kashmir Dal Lake & Gulmarg Snow
  {
    id: 'pkg_kashmir_snow',
    title: 'Kashmir Dal Lake & Gulmarg Gondola',
    country: 'India',
    location: 'Srinagar & Gulmarg',
    days: 4,
    starting_price: 21999,
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    vector_type: 'hills',
    tag: 'Romantic Paradise',
    rating: 4.97,
    vibe: 'wellness',
    tagline: 'Cedar houseboat on Dal Lake with Gulmarg Gondola ski pass',
    matchScore: 97,
    duration: '4 Days / 3 Nights',
    inclusions: ['🏡 Cedar Houseboat', '🚠 Gulmarg Gondola Pass', '🛶 Sunset Shikara Ride', '☕ Kahwa & Dinner'],
    itinerary: [
      { day: 'Day 1', title: 'Touchdown Srinagar', desc: 'Airport pickup, check-in to luxury houseboat, sunset Shikara tour.' },
      { day: 'Day 2', title: 'Gulmarg Gondola & Snow', desc: 'Day trip to Gulmarg, Gondola Phase 1 & 2 to 14,000 ft snow line.' },
      { day: 'Day 3', title: 'Mughal Gardens & Old City', desc: 'Nishat & Shalimar Bagh, traditional saffron & pashmina shopping.' },
      { day: 'Day 4', title: 'Morning Kahwa & Return', desc: 'Floating vegetable market boat ride, airport transfer.' }
    ]
  },
  // 6. Thailand Phuket & Krabi Island Romance
  {
    id: 'pkg_thailand_5d',
    title: 'Thailand Phuket & Krabi Island Hopper',
    country: 'Thailand',
    location: 'Phuket & Phi Phi',
    days: 5,
    starting_price: 24999,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
    vector_type: 'thailand',
    tag: 'Flat ₹499 Visa',
    rating: 4.91,
    vibe: 'beach',
    tagline: 'Private speedboat island hopping with flat ₹499 eVisa cap',
    matchScore: 97,
    duration: '5 Days / 4 Nights',
    inclusions: ['✈️ Return Flights', '🏨 4-Star Sea Resort', '🛂 Flat ₹499 eVisa', '🚤 Maya Bay Speedboat'],
    itinerary: [
      { day: 'Day 1', title: 'Touchdown Phuket', desc: 'Direct flight, private transfer to Patong beachfront resort.' },
      { day: 'Day 2', title: 'Phi Phi & Maya Bay', desc: 'Speedboat cruise to Maya Bay & snorkel at Bamboo Island.' },
      { day: 'Day 3', title: 'Old Phuket Town & Cafés', desc: 'Sino-Portuguese street walk, night market street food.' },
      { day: 'Day 4', title: 'Thai Spa & Sundowner', desc: 'Authentic Thai massage and private beach sunset dinner.' },
      { day: 'Day 5', title: 'Duty Free & Return Flight', desc: 'Souvenir shopping, transfer to airport.' }
    ]
  },
  // 7. Dubai Luxury Dunes & Marina Skylines
  {
    id: 'pkg_dubai_5d',
    title: 'Dubai Luxury Dunes & Marina Skylines',
    country: 'United Arab Emirates',
    location: 'Downtown Dubai',
    days: 5,
    starting_price: 29999,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    vector_type: 'luxury',
    tag: 'Popular',
    rating: 4.93,
    vibe: 'luxury',
    tagline: 'Burj Khalifa Level 124, 4x4 desert safari & Marina yacht',
    matchScore: 96,
    duration: '5 Days / 4 Nights',
    inclusions: ['✈️ Direct Flight', '🏨 5-Star Hotel', '🛂 24h Express Visa', '🏜️ VIP Desert Safari'],
    itinerary: [
      { day: 'Day 1', title: 'Welcome to Dubai', desc: 'Private transfer, hotel check-in, Dubai Mall fountain show.' },
      { day: 'Day 2', title: 'Burj Khalifa & Future Museum', desc: 'Panoramic 124th floor entry, Museum of Future interactive tour.' },
      { day: 'Day 3', title: 'Red Dunes Safari & BBQ', desc: '4x4 dune bashing, camel rides, Arabian night buffet dinner.' },
      { day: 'Day 4', title: 'Palm Jumeirah Yacht Cruise', desc: '2-hour luxury yacht tour around Dubai Marina & Atlantis.' },
      { day: 'Day 5', title: 'Gold Souk & Departure', desc: 'Spice & gold souk shopping, private airport drop.' }
    ]
  },
  // 8. Bali Tropical Escapes & Jungle Villa
  {
    id: 'pkg_bali_7d',
    title: 'Bali Tropical Escapes & Jungle Villa',
    country: 'Indonesia',
    location: 'Ubud & Seminyak',
    days: 7,
    starting_price: 52000,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    vector_type: 'bali',
    tag: 'Bestseller',
    rating: 4.95,
    vibe: 'wellness',
    tagline: 'Private infinity pool villa, volcano sunrise trek & floating breakfast',
    matchScore: 98,
    duration: '7 Days / 6 Nights',
    inclusions: ['✈️ Flight Connection', '🌴 Private Pool Villa', '🍳 Floating Breakfast', '🌋 Volcano Trek'],
    itinerary: [
      { day: 'Day 1', title: 'Denpasar to Ubud Haven', desc: 'Private cab to Ubud lush jungle villa, herbal welcome drink.' },
      { day: 'Day 2', title: 'Tegalalang Rice Terraces', desc: 'Jungle swing, coffee tasting, sacred monkey forest walk.' },
      { day: 'Day 3', title: 'Mount Batur Sunrise Trek', desc: 'Early morning 4x4 jeep tour to volcano rim, hot springs.' },
      { day: 'Day 4', title: 'Nusa Penida Island Tour', desc: 'Speedboat to Kelingking T-Rex cliff and snorkeling.' },
      { day: 'Day 5', title: 'Seminyak Beach Club', desc: 'Check-in to Seminyak beachfront suite, Potato Head sunset.' },
      { day: 'Day 6', title: 'Uluwatu Sunset & Kecak', desc: 'Cliff-edge temple tour and seafood BBQ at Jimbaran bay.' },
      { day: 'Day 7', title: 'Art Market & Return Flight', desc: 'Traditional woodcraft market, airport transfer.' }
    ]
  },
  // 9. Vietnam Heritage & Ha Long Bay Cruise
  {
    id: 'pkg_vietnam_6d',
    title: 'Vietnam Heritage & Ha Long Bays',
    country: 'Vietnam',
    location: 'Hanoi & Ha Long Bay',
    days: 6,
    starting_price: 48000,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    vector_type: 'vietnam',
    tag: 'Trending',
    rating: 4.92,
    vibe: 'heritage',
    tagline: '5-star overnight cruise with balcony cabin & street food tour',
    matchScore: 95,
    duration: '6 Days / 5 Nights',
    inclusions: ['🚢 5-Star Cruise Cabin', '🍜 Street Food Walk', '🏮 Lantern Boat Ride', '✈️ Internal Flight'],
    itinerary: [
      { day: 'Day 1', title: 'Hanoi Old Quarter', desc: 'Arrive in Hanoi, check-in, guided evening street food walk.' },
      { day: 'Day 2', title: 'Ha Long Bay Cruise Boarding', desc: 'Transfer to bay, board 5-star cruise, kayak through emerald karst caves.' },
      { day: 'Day 3', title: 'Sunrise Tai Chi & Da Nang', desc: 'Morning deck Tai Chi, disembark, flight to Da Nang & Hoi An.' },
      { day: 'Day 4', title: 'Hoi An Lantern Festival', desc: 'Cycling through paddy fields, wooden lantern boat release on river.' },
      { day: 'Day 5', title: 'Ba Na Hills & Golden Bridge', desc: 'Cable car to iconic Giant Hands Bridge, French village.' },
      { day: 'Day 6', title: 'Coffee Tasting & Departure', desc: 'Famous Vietnamese egg coffee workshop, airport transfer.' }
    ]
  },
  // 10. Japan Golden Route (Tokyo & Kyoto)
  {
    id: 'pkg_japan_8d',
    title: 'Japan Golden Route (Tokyo & Kyoto)',
    country: 'Japan',
    location: 'Tokyo & Kyoto',
    days: 8,
    starting_price: 89000,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    vector_type: 'japan',
    tag: 'Popular',
    rating: 4.96,
    vibe: 'culture',
    tagline: '7-Day JR Shinkansen Bullet Train & boutique Ryokan onsen',
    matchScore: 97,
    duration: '8 Days / 7 Nights',
    inclusions: ['🚅 7-Day JR Shinkansen Pass', '♨️ Kyoto Ryokan Onsen', '🎨 TeamLab Planets Ticket', '📶 High-Speed Pocket Wi-Fi'],
    itinerary: [
      { day: 'Day 1', title: 'Welcome to Tokyo', desc: 'Narita express to Shinjuku, neon-lit alleyway dinner.' },
      { day: 'Day 2', title: 'TeamLab & Shibuya Crossing', desc: 'Immersive digital art museum, iconic Shibuya sky observatory.' },
      { day: 'Day 3', title: 'Akihabara & Asakusa Sensoji', desc: 'Historic temple visit, matcha tea ceremony, retro tech quarter.' },
      { day: 'Day 4', title: 'Shinkansen to Kyoto', desc: '300 km/h bullet train past Mt. Fuji, check-in to historic ryokan.' },
      { day: 'Day 5', title: 'Fushimi Inari & Arashiyama', desc: '10,000 torii gates walk, bamboo forest and monkey park.' },
      { day: 'Day 6', title: 'Nara Deer Park Day Trip', desc: 'Bow to friendly wild deer, giant bronze Buddha at Todaiji.' },
      { day: 'Day 7', title: 'Osaka Dotonbori Street Food', desc: 'Takoyaki food run, vibrant Dotonbori canal evening walk.' },
      { day: 'Day 8', title: 'Souvenir Shopping & Return', desc: 'Kansai airport transfer, flight back home.' }
    ]
  },
];

const VIBE_FILTERS = [
  { id: 'all', label: '✨ All Vibes' },
  { id: 'beach', label: '🏖️ Beach & Sun' },
  { id: 'party', label: '🎉 Party & Nightlife' },
  { id: 'wellness', label: '⛰️ Hills & Peace' },
  { id: 'heritage', label: '🏛️ Royal Heritage' },
  { id: 'luxury', label: '💎 Luxury & Dunes' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onSelectTrip,
}) => {
  const [budget, setBudget] = useState<number>(55000);
  const [selectedVibe, setSelectedVibe] = useState<string>('all');
  const [packages, setPackages] = useState<PlannrPackage[]>(COMBINED_RECOMMENDER_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch packages filtered by budget from backend or combine with curated recommender database
  const fetchPackages = useCallback(async (maxBudget: number) => {
    try {
      setLoadingPackages(true);
      const res = await fetch(`/api/plannr/packages?max_budget=${maxBudget}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.packages) && data.packages.length > 0) {
          // Merge backend packages with any extra rich recommender packages not in backend
          const backendIds = new Set(data.packages.map((p: any) => p.id));
          const extraCurated = COMBINED_RECOMMENDER_PACKAGES.filter(
            (cp) => !backendIds.has(cp.id) && cp.starting_price <= maxBudget
          );
          setPackages([...data.packages, ...extraCurated]);
          return;
        }
      }
      // Client-side fallback filter
      const filtered = COMBINED_RECOMMENDER_PACKAGES.filter(
        (p) => p.starting_price <= maxBudget
      );
      setPackages(filtered.length > 0 ? filtered : [COMBINED_RECOMMENDER_PACKAGES[0]]);
    } catch {
      const filtered = COMBINED_RECOMMENDER_PACKAGES.filter(
        (p) => p.starting_price <= maxBudget
      );
      setPackages(filtered.length > 0 ? filtered : [COMBINED_RECOMMENDER_PACKAGES[0]]);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages(budget);
  }, [budget, fetchPackages]);

  // Vibe filtering
  const filteredPackages = packages.filter((pkg) => {
    if (selectedVibe === 'all') return true;
    if (pkg.vibe === selectedVibe) return true;
    const t = (pkg.title + ' ' + (pkg.vector_type || '') + ' ' + (pkg.tag || '')).toLowerCase();
    if (selectedVibe === 'beach') return t.includes('beach') || t.includes('coves') || t.includes('goa') || t.includes('phuket') || t.includes('bali');
    if (selectedVibe === 'party') return t.includes('party') || t.includes('club') || t.includes('bestseller') || t.includes('goa');
    if (selectedVibe === 'wellness') return t.includes('wellness') || t.includes('hills') || t.includes('glamping') || t.includes('kashmir') || t.includes('rafting');
    if (selectedVibe === 'heritage') return t.includes('heritage') || t.includes('palace') || t.includes('haveli') || t.includes('vietnam') || t.includes('japan');
    if (selectedVibe === 'luxury') return t.includes('luxury') || t.includes('dubai') || pkg.starting_price >= 30000;
    return false;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('plan-ai', { initialIdea: searchQuery });
  };

  const renderVectorIllustration = (type?: string, title?: string, image?: string) => {
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
    if (t.includes('bali')) {
      return <BaliVectorArt />;
    }
    if (image) {
      return (
        <img
          src={image}
          alt={title || 'Trip'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      );
    }
    return <BaliVectorArt />;
  };

  // Format currency in Indian numbering (e.g. ₹55,000)
  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  // Calculate percentage for custom slider track fill
  const sliderMin = 3000;
  const sliderMax = 100000;
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
            Planning made easier · AI Trip Matcher
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
              placeholder="Tell Plannr your trip idea (mood, budget, group)..."
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

        {/* Interactive Budget Slider Card (Unified Recommender Engine) */}
        <section className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-base font-bold text-[#151E28] block">
                Set your budget
              </span>
              <span className="text-[11px] text-[#7A8699] font-medium">
                Live AI trip recommender filter
              </span>
            </div>
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
            <div className="w-full h-2.5 rounded-full bg-[#E5E0D8] relative overflow-hidden">
              {/* Terracotta progress fill */}
              <div
                className="h-full bg-gradient-to-r from-[#D95338] to-[#E86145] transition-[width] duration-75"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>

            {/* Native slider overlaid transparently for smooth touch handling */}
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={1000}
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
          <div className="flex items-center justify-between text-xs font-semibold text-[#7A8699]">
            <span>{formatINR(sliderMin)}</span>
            <span>{formatINR(sliderMax)}</span>
          </div>
        </section>

        {/* Vibe / Mood Selector Pills (Recommender Vibe Shifter) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#7A8699] uppercase tracking-wider">
              Filter by Vibe &amp; Mood
            </span>
            <span className="text-[11px] text-[#D95338] font-bold">
              {filteredPackages.length} matching trips
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
            {VIBE_FILTERS.map((vf) => {
              const isSelected = selectedVibe === vf.id;
              return (
                <button
                  key={vf.id}
                  type="button"
                  onClick={() => setSelectedVibe(vf.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#151E28] text-white border-[#151E28] shadow-sm'
                      : 'bg-white text-[#7A8699] border-[#EDE7DF] hover:bg-[#F2EDE4] hover:text-[#151E28]'
                  }`}
                >
                  {vf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Packages in your budget Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#151E28]">
              Packages in your budget
            </h2>
            <span className="bg-[#E7F3ED] text-[#1B8054] text-xs font-bold px-3 py-1 rounded-full">
              {filteredPackages.length} packages
            </span>
          </div>

          {/* Horizontal Scrolling Package Cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none snap-x snap-mandatory">
            {filteredPackages.map((pkg) => {
              const isFav = !!favorites[pkg.id];
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    if (onSelectTrip) onSelectTrip(pkg.id);
                    onNavigate('itinerary', { packageId: pkg.id, package: pkg });
                  }}
                  className="snap-start flex-shrink-0 w-[240px] sm:w-[260px] bg-white rounded-3xl p-3 border border-[#EDE7DF] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Vector or Photo Artwork Container */}
                    <div className="w-full h-32 rounded-2xl overflow-hidden relative shadow-inner bg-slate-100">
                      {renderVectorIllustration(pkg.vector_type, pkg.title, pkg.image)}

                      {/* Heart Bookmark Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(pkg.id, e)}
                        aria-label="Bookmark trip"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-90 transition-transform z-10"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFav
                              ? 'fill-[#D95338] text-[#D95338]'
                              : 'text-[#151E28]'
                          }`}
                        />
                      </button>

                      {/* Tag badge */}
                      {pkg.tag && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[9px] font-bold z-10">
                          {pkg.tag}
                        </span>
                      )}

                      {/* Match Score Badge */}
                      {pkg.matchScore && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-sm z-10">
                          {pkg.matchScore}% Match
                        </span>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="mt-3 px-1">
                      <h3 className="text-sm font-bold text-[#151E28] leading-snug group-hover:text-[#D95338] transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                      {pkg.duration && (
                        <p className="text-[11px] text-[#7A8699] font-medium mt-0.5">
                          {pkg.duration}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-xs text-[#7A8699] font-medium">
                          from
                        </span>
                        <span className="text-base font-extrabold text-[#D95338]">
                          {formatINR(pkg.starting_price)}
                        </span>
                        <span className="text-xs text-[#7A8699] font-medium">
                          pp
                        </span>
                      </div>

                      {pkg.inclusions && pkg.inclusions.length > 0 && (
                        <div className="mt-2 text-[10px] text-[#556987] font-medium truncate bg-[#FAF7F2] px-2 py-1 rounded-lg border border-[#EDE7DF]/60">
                          {pkg.inclusions.slice(0, 2).join(' · ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dark indicator bar at bottom of card */}
                  <div className="w-full h-1 bg-[#151E28]/15 rounded-full mt-3 overflow-hidden">
                    <div className="w-2/3 h-full bg-[#151E28] rounded-full" />
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

      {/* Note: Bottom navigation is rendered globally by PlannrApp.tsx to prevent duplicate navbars */}
    </div>
  );
};

export default HomeScreen;
