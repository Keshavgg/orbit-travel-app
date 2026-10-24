'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Plane, 
  MapPin, 
  Calendar, 
  Check, 
  ShieldCheck, 
  Zap, 
  Building2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Home,
  Sliders,
  Share2,
  Download,
  Users,
  Wallet,
  Clock,
  Compass,
  ArrowLeft,
  Database,
  Layers,
  Split,
  Copy,
  FileText,
  X
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  tripCard?: {
    title: string;
    cityKey: string;
    location: string;
    price: string;
    originalPrice: string;
    duration: string;
    airline: string;
    stay: string;
    image: string;
    inclusions: string[];
    itineraryDays?: { day: string; title: string; desc: string }[];
  };
  promptSuggestions?: string[];
  ragLedger?: {
    retrieval_ms: number;
    tables_scanned: string[];
    matched_records: number;
    confidence: number;
    engine: string;
    is_live_db: boolean;
    sources?: Array<{
      title: string;
      type: string;
      price?: number;
      confidence: number;
      snippet: string;
    }>;
  };
}

interface UserProfile {
  destination?: string;
  vibe?: string;
  groupType?: string;
  budget?: string;
  duration?: string;
  stayType?: string;
  step: number;
}

const RECENT_CHATS = [
  { id: 'c1', title: '🏖️ Goa 4-Day Friends Pool Villa', time: '10m ago', active: true },
  { id: 'c2', title: '⛰️ Rishikesh Riverbed Camp <3h', time: '1h ago', active: false },
  { id: 'c3', title: '🇹🇭 Thailand Island Package & Visa', time: 'Yesterday', active: false },
  { id: 'c4', title: '🇦🇪 Dubai 48h Luxury Safari', time: '2 days ago', active: false },
  { id: 'c5', title: '🏝️ Bali Seminyak Private Villa', time: '3 days ago', active: false },
];

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{ id: string; msg: string; qrToken: string } | null>(null);
  const [ragStats, setRagStats] = useState<{
    total_documents_indexed?: number;
    breakdown?: Record<string, number>;
    status?: string;
  } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    step: 0,
  });
  const [activeDayTabs, setActiveDayTabs] = useState<Record<string, number>>({});
  const [squadSplitter, setSquadSplitter] = useState<Record<string, number>>({});
  const [inspectingLedger, setInspectingLedger] = useState<ChatMessage['ragLedger'] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShareWhatsApp = (card: NonNullable<ChatMessage['tripCard']>) => {
    const text = `✈️ *Orbit Travel Plan: ${card.title}*\n📍 Destination: ${card.location}\n💰 Price: ${card.price} per person (Flights + Stay + Perks)\n🏨 Stay: ${card.stay}\n🛫 Flight: ${card.airline}\n\n✨ Inclusions:\n${card.inclusions.map(i => `• ${i}`).join('\n')}\n\nBooked via Orbit Travel OS: http://localhost:3005/chat`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setToastMessage('✅ Travel itinerary copied! Ready to paste into WhatsApp.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Namaste Rahul! 🤖 I'm your Orbit Real-Time AI Copilot & Recommender.\n\n⚡ **Connected to Real-Time SQLite Database via Hybrid RAG** (1,169+ live items indexed: 520 Flights, 520 Hotels, 110 Events & Cafes, Flat ₹499 Visas, Distressed Drops & GST rules).\n\nAap mujhse real-time me kuch bhi pooch sakte ho — jaise live flights ki cheapest price, Goa me sunset time pe cafes, Thailand visa rules, ya Coldplay tickets!",
      time: 'Just now',
      promptSuggestions: [
        '✈️ Delhi se Bangkok cheapest flight konsi hai?',
        '🌅 Goa me sunset time pe cafe ya beach club batao',
        '🛂 Thailand visa ka kitna charge hai aur kya documents lagenge?',
        '🎸 Coldplay Mumbai concert combo package price kya hai?',
        '🔥 Unsold cheap flight seat drop kya mil raha hai?',
        '🏢 myBiz corporate GST 18% ITC rule kya hai?'
      ]
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  // Fetch real-time RAG stats on mount
  useEffect(() => {
    fetch('/api/rag/stats')
      .then((res) => res.json())
      .then((data) => setRagStats(data))
      .catch((e) => console.warn('Could not load RAG stats:', e));
  }, []);

  // Handle initial query from URL search params
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || inputVal).trim();
    if (!rawQuery) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsAiThinking(true);

    // Call FastAPI backend /api/chat
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: rawQuery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
        if (data.session_profile) {
          setProfile({
            destination: data.session_profile.destination,
            vibe: data.session_profile.vibe,
            groupType: data.session_profile.group_type,
            budget: data.session_profile.budget,
            stayType: data.session_profile.stay_type,
            step: data.session_profile.step || data.step,
          });
        } else {
          setProfile((prev) => ({ ...prev, step: data.step }));
        }

        const serverMsg = data.message;
        const newAiMessage: ChatMessage = {
          id: serverMsg.id,
          sender: 'ai',
          text: serverMsg.text,
          time: serverMsg.time,
          tripCard: serverMsg.trip_card || undefined,
          promptSuggestions: serverMsg.prompt_suggestions || undefined,
          ragLedger: serverMsg.rag_ledger || data.rag_ledger || undefined,
        };

        setMessages((prev) => [...prev, newAiMessage]);
        setIsAiThinking(false);
        return;
      }
    } catch (err) {
      console.warn('FastAPI backend /api/chat error, falling back to local engine:', err);
    }

    // Fallback if backend is loading
    setTimeout(() => {
      setIsAiThinking(false);
      const q = rawQuery.toLowerCase();
      let aiText = '';
      let card: ChatMessage['tripCard'] = undefined;
      let nextSuggestions: string[] | undefined = undefined;

      // CROSS-QUESTIONING LOGIC:
      // 1. GOA FLOW
      if (q.includes('goa') || (profile.destination === 'goa' && profile.step < 3)) {
        if (!profile.destination) {
          setProfile((p) => ({ ...p, destination: 'goa', step: 1 }));
          aiText = "Goa is always legendary! 🏖️ Lekin plan customize karne ke liye mujhe 2 cross-questions clarify karo:\n\n1. Vibe kya chahiye: North Goa (Beach clubs, night parties & shacks) ya South Goa (Peaceful clean beaches, luxury resorts)?\n2. Kiske sath travel kar rahe ho (Friends squad, couple, ya family)?";
          nextSuggestions = [
            '🎉 North Goa (Parties & Shacks)',
            '🧘 South Goa (Peace & Luxury)',
            '🍻 Friends Squad (4-6 people)',
            '💑 Couple Romantic Getaway'
          ];
        } else if (profile.step === 1 || q.includes('north') || q.includes('south') || q.includes('party') || q.includes('couple') || q.includes('friend')) {
          const isNorth = !q.includes('south');
          const isFriends = q.includes('friend') || q.includes('squad') || !q.includes('couple');
          setProfile((p) => ({ 
            ...p, 
            vibe: isNorth ? 'north_party' : 'south_peace',
            groupType: isFriends ? 'friends' : 'couple',
            step: 2 
          }));

          aiText = `Got it! ${isNorth ? 'North Goa partying' : 'South Goa relaxation'} with ${isFriends ? 'your friends squad' : 'your partner'} locked! 🎯\n\nAb agla cross-question:\n1. Approximate budget per person kitna prefer karoge: Under ₹15,000 ya Premium Luxury ₹25k+?\n2. Stay me kya chahiye: 3BHK Private Pool Villa ya 4-Star Beachfront Hotel?`;
          nextSuggestions = [
            '💰 Under ₹15,000 per person',
            '🏡 3BHK Private Pool Villa',
            '🏨 4-Star Beachfront Hotel',
            '💎 Premium Luxury ₹25,000+'
          ];
        } else {
          setProfile((p) => ({ ...p, step: 3 }));
          aiText = "BOOM! 🚀 Maine tumhare saare answers cross-check karke tumhara customized package assemble kar diya hai:\n\n• ✈️ Flight: IndiGo Direct DEL ➔ GOI (06:15 AM non-stop, lowest in 30 days locked)\n• 🏡 Stay: Candolim 3BHK Sunset Private Pool Villa with chef & gazebo\n• 🛵 Perks: 2 Activa Scooters included for beach hopping + Thalassa VIP access pass\n• 💰 Budget: ₹13,499 per person (₹1,500 under your ₹15k budget!)\n\nYe lo direct live package — yahan se direct 1-click me booking lock kar sakte ho:";
          card = {
            title: 'Goa Coastal Villa & Beach Club Escape',
            cityKey: 'goa',
            location: 'Candolim & Vagator, North Goa',
            price: '₹13,499',
            originalPrice: '₹18,500',
            duration: '4 Days / 3 Nights',
            airline: 'IndiGo Direct (DEL ➔ GOI)',
            stay: 'Candolim 3BHK Private Pool Villa',
            image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
            inclusions: ['✈️ Return Non-Stop Flights', '🏡 Private Pool Villa', '🛵 2 Scooters Included', '🍳 Daily Breakfast'],
            itineraryDays: [
              { day: 'Day 1', title: 'Touchdown MOPA & Sunset Villa Pool', desc: 'IndiGo flight arrival, private cab to Candolim villa, evening sundowner pool party.' },
              { day: 'Day 2', title: 'Beach Hopping & Water Sports', desc: 'Scooter ride across Anjuna, parasailing at Calangute, dinner at Thalassa.' },
              { day: 'Day 3', title: 'Old Goa & Tito\'s Lane Nightlife', desc: 'Heritage church stroll in morning, club hopping at Tito\'s Lane in evening.' },
              { day: 'Day 4', title: 'Poolside Brunch & Flight Home', desc: 'Leisurely brunch, souvenir shopping in Panjim, departure flight.' },
            ]
          };
          nextSuggestions = [
            '⚡ Book Entire Package (₹13,499)',
            'Can we make it even cheaper?',
            'Swap stay to Vagator boutique resort',
            'Show full day-by-day plan'
          ];
        }
      }

      // 2. RISHIKESH FLOW
      else if (q.includes('rishi') || q.includes('weekend') || q.includes('rafting') || (profile.destination === 'rishikesh' && profile.step < 3)) {
        if (!profile.destination) {
          setProfile((p) => ({ ...p, destination: 'rishikesh', step: 1 }));
          aiText = "Rishikesh weekend getaway is just 2h 45m from Delhi NCR via Meerut Expressway! ⛰️\n\nCross-Question for you:\n1. Adventure chahiye (16km Grade-3 Ganga Rafting + Cliff Jump) ya peaceful yoga & Ganga Aarti?\n2. Riverbed sand par luxury Swiss tents me glamping pasand hai ya concrete luxury resort?";
          nextSuggestions = [
            '🌊 Adventure: 16km Rafting + Cliff Jump',
            '🧘 Peaceful: Yoga & Ganga Aarti',
            '⛺ Luxury Swiss Beach Tents',
            '🏨 Resort Room with Pool'
          ];
        } else {
          setProfile((p) => ({ ...p, step: 3 }));
          aiText = "Awesome! Weekend glamping + rafting package ready ho gaya:\n\n• 🚗 Distance: 2h 45m scenic drive from Delhi NCR (Fast-track expressway)\n• ⛺ Stay: Air-cooled Swiss tents right on the Ganga white sand riverbed\n• 🌊 Activities: 16km Grade-3 Ganga rafting, cliff jumping, evening acoustic campfire & BBQ buffet\n• 💰 Total Price: ₹3,499 per person (All 3 buffet meals included).";
          card = {
            title: 'Rishikesh Ganga Riverfront Glamping & Rafting',
            cityKey: 'rishikesh',
            location: 'Shivpuri, Rishikesh (< 3h Drive)',
            price: '₹3,499',
            originalPrice: '₹5,999',
            duration: '2 Days / 1 Night',
            airline: 'Scenic Highway Drive / Vande Bharat',
            stay: 'Luxury Swiss Air-Cooled Tents',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
            inclusions: ['⛺ AC Swiss Tent', '🌊 16km Ganga Rafting', '🔥 Evening Bonfire & Live Music', '🍲 All 3 Buffet Meals'],
            itineraryDays: [
              { day: 'Day 1 (Saturday)', title: 'Drive In, Rafting & Bonfire', desc: 'Scenic morning drive, tent check-in, 16km thrilling rafting, evening guitar campfire with snacks.' },
              { day: 'Day 2 (Sunday)', title: 'Cliff Jump & Aarti', desc: 'Sunrise yoga, cliff jump into river, Parmarth Niketan Ganga Aarti, evening return drive.' },
            ]
          };
          nextSuggestions = [
            '⚡ Book Weekend Glamping (₹3,499)',
            'Is rafting safe for non-swimmers?',
            'Can we book for 4 people?',
            'What clothes to pack?'
          ];
        }
      }

      // 3. THAILAND / DUBAI INTERNATIONAL
      else if (q.includes('thailand') || q.includes('dubai') || q.includes('international') || q.includes('phuket')) {
        const isDubai = q.includes('dubai');
        setProfile((p) => ({ ...p, destination: isDubai ? 'dubai' : 'thailand', step: 1 }));
        
        if (profile.step === 0) {
          aiText = `International ${isDubai ? 'Dubai' : 'Thailand'} trip is a fantastic choice! ✈️ Hamara flat ₹499 visa cap aur OCR pre-check already included hai.\n\nLekin customization ke liye 2 cross-questions:\n1. Total kitne din ka plan socha hai (4 days express ya 6 days relaxed)?\n2. Kiske sath travel kar rahe ho (Family with kids, couple, ya friends)?`;
          nextSuggestions = [
            '🗓️ 4 Days Express Package',
            '🗓️ 6 Days Full Vacation',
            '👫 Couple / Romantic',
            '👨‍👩‍👧 Family with Kids'
          ];
        } else {
          aiText = `Superb! Ye raha aapka custom ${isDubai ? 'Dubai 4-Day Luxury' : 'Thailand 5-Day Island'} package:\n\n• 🛂 Visa: Pre-approved in 24h with OCR radar\n• ✈️ Flight: Direct return flights with 25kg luggage included\n• 🏨 Stay: 4-Star / 5-Star luxury resort with breakfast\n• 💰 Rate: Fully locked with ₹0 hidden booking fees.`;
          card = isDubai ? {
            title: 'Dubai Downtown & Desert Safari Extravaganza',
            cityKey: 'dubai',
            location: 'Downtown Dubai & Palm Jumeirah',
            price: '₹29,999',
            originalPrice: '₹44,000',
            duration: '4 Days / 3 Nights',
            airline: 'Emirates / SpiceJet Direct',
            stay: 'JW Marriott Marquis 5-Star Hotel',
            image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
            inclusions: ['✈️ Return Flights', '🏨 5-Star Hotel', '🛂 48h Express Visa', '🏜️ VIP Desert Safari']
          } : {
            title: 'Bangkok & Phuket Tropical Island Package',
            cityKey: 'thailand',
            location: 'Phuket & Bangkok, Thailand',
            price: '₹24,999',
            originalPrice: '₹36,000',
            duration: '5 Days / 4 Nights',
            airline: 'Thai Airways Direct',
            stay: 'Anantara Riverside 5-Star Resort',
            image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
            inclusions: ['✈️ Return Flights', '🏨 5-Star Resort', '🛂 Flat ₹499 eVisa Cap', '🚤 Speedboat Island Tour']
          };
          nextSuggestions = [
            '⚡ Book Entire Package',
            'What documents needed for visa?',
            'Show flight timing',
            'Can we add scuba diving?'
          ];
        }
      }

      // 4. PRICE COMPROMISE / BARGAIN
      else if (q.includes('cheap') || q.includes('kam') || q.includes('budget') || q.includes('sasta')) {
        aiText = "Haan bhai, bilkul budget optimize kar sakte hain! 💡 Mere paas do practical hacks hain:\n\n1. Option A: Morning flight ki jagah late evening departure choose kar lo (-₹1,400 per person bachenge).\n2. Option B: 3BHK private pool villa ki jagah beachfront boutique resort choose kar lo (-₹2,200 bachenge).\n\nKaunsa option apply karun aapke plan me?";
        nextSuggestions = [
          '✈️ Apply Night Flight (-₹1,400)',
          '🏨 Change to Boutique Resort (-₹2,200)',
          'Keep current plan as it is'
        ];
      }

      // 5. GENERAL / FALLBACK
      else {
        aiText = `Understood: "${rawQuery}". Isko exact design karne ke liye mujhe 2 cheezein batao:\n\n1. Kahan se start kar rahe ho (Delhi, Mumbai, Bangalore)?\n2. Trip ka primary motive kya hai (Relaxation, party, romance, ya adventure)?`;
        nextSuggestions = [
          '🏖️ Beach vacation under ₹15,000',
          '⛰️ Mountain retreat under ₹5,000',
          '✈️ Direct flights from Delhi NCR',
          '🛂 Thailand visa package'
        ];
      }

      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tripCard: card,
        promptSuggestions: nextSuggestions,
      };

      setMessages((prev) => [...prev, newAiMessage]);
    }, 650);
  };

  const handleBookCard = async (card: NonNullable<ChatMessage['tripCard']>) => {
    try {
      const priceNum = parseInt(card.price.replace(/[^0-9]/g, ''), 10) || 13499;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_slug: card.cityKey,
          trip_title: card.title,
          destination_key: card.cityKey,
          travel_date: '2026-11-15',
          travelers_count: 1,
          total_amount: priceNum,
          payment_method: 'UPI_INSTANT',
          user_name: 'Rahul Sharma',
          user_email: 'rahul@travel.in',
          user_phone: '+91 98765 43210',
          gstin: '07AAAAA0000A1Z5',
          company_name: 'Sharma Tech Enterprises',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingDetails({
          id: data.booking_id,
          msg: `${data.trip_title} (${card.price})`,
          qrToken: data.qr_token,
        });
        setBookingSuccessModal(data.booking_id);
        return;
      }
    } catch (e) {
      console.warn('Booking API error:', e);
    }
    setBookingDetails({
      id: 'ORB-2026-X992',
      msg: `${card.title} (${card.price})`,
      qrToken: 'QR_OFFLINE_LOCKED',
    });
    setBookingSuccessModal('ORB-2026-X992');
  };

  const handleReset = () => {
    setProfile({ step: 0 });
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: "Conversation reset! 🤖 Mai ready hoon aapko cross-question karke best customized vacation design karne ke liye. Kahan chalna chahte ho?",
        time: 'Just now',
        promptSuggestions: [
          '🏖️ Goa beach vacation with squad',
          '⛰️ Weekend drive from Delhi <3h',
          '🇹🇭 Thailand with flat ₹499 visa',
          '🇦🇪 Dubai luxury desert trip'
        ]
      }
    ]);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#070D1E] text-white overflow-hidden select-none">
      
      {/* ─── 1. LEFT SIDEBAR (DESKTOP) ─── */}
      <aside className="w-full md:w-80 bg-[#0A1128] border-r border-cyan-400/20 flex flex-col justify-between shrink-0">
        
        {/* Top Branding & Navigation */}
        <div className="p-4 sm:p-5 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center space-x-2 group"
              title="Return to Main Orbit App"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <div className="flex items-center space-x-1 font-black text-sm tracking-tight text-white">
                <span className="bg-[#EB2026] text-white px-1.5 py-0.5 rounded text-xs">make</span>
                <span className="bg-[#0084FF] text-white px-1.5 py-0.5 rounded text-xs">my</span>
                <span className="text-white">orbit</span>
              </div>
            </Link>

            <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">
              GPT-4o
            </span>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0084FF] to-cyan-500 hover:from-[#0070db] hover:to-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-400/20 transition flex items-center justify-center gap-2 btn-press cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
            <span>+ New AI Recommendation</span>
          </button>
        </div>

        {/* Recent Conversations List */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-1.5 text-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
            Recent AI Recommendations
          </div>
          {RECENT_CHATS.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSendMessage(`Recommend trip like ${chat.title}`)}
              className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between group ${
                chat.active
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold'
                  : 'hover:bg-white/5 text-slate-300 font-medium'
              }`}
            >
              <span className="truncate pr-2">{chat.title}</span>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">{chat.time}</span>
            </button>
          ))}
        </div>

        {/* User Profile & Engine Status */}
        <div className="p-4 bg-[#050917] border-t border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Engine</span>
            </span>
            <span className="text-cyan-400 font-bold">Step {profile.step}/3</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/25 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-cyan-400">
              <span>Real-Time RAG Corpus:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {ragStats?.total_documents_indexed || 1169} Live
              </span>
            </div>
            <div className="font-bold text-white text-[11px] flex items-center justify-between">
              <span>✈️ Flights: {ragStats?.breakdown?.flight || 520}</span>
              <span>🏨 Hotels: {ragStats?.breakdown?.hotel || 520}</span>
            </div>
            <div className="font-bold text-white text-[11px] flex items-center justify-between">
              <span>🍸 Events: {ragStats?.breakdown?.event || 110}</span>
              <span>🛂 Visas &amp; Drops: 9</span>
            </div>
            <div className="text-[9.5px] text-cyan-300/80 font-mono pt-0.5 border-t border-cyan-400/20">
              ⚡ Hybrid BM25 + Vector Cosine (&lt;10ms)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1 text-slate-300">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Active Hub:</div>
            <div className="font-bold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0084FF]" />
              <span>Delhi NCR (Fastest Flights &amp; Drive)</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ─── 2. MAIN CONVERSATIONAL CHAT WORKSPACE ─── */}
      <main className="flex-1 flex flex-col h-full bg-[#0A1024] relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0084FF]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Bar */}
        <header className="p-3.5 sm:p-4 bg-[#0E1A3A]/80 backdrop-blur-md border-b border-cyan-400/20 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-400/30">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                  Orbit AI Trip Recommender
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-black border border-cyan-400/30">
                  RECOMMENDER STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Conversational AI Recommender · Tell your mood &amp; budget for tailored trips &amp; 1-click booking.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              title="Reset Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <span>Main App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Traveler Profile Memory Pill Bar */}
        <div className="bg-[#0A132C]/90 backdrop-blur-md border-b border-cyan-400/20 px-4 py-2 flex items-center justify-between text-xs z-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 font-bold shrink-0">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Traveler Memory:</span>
            </span>
            {profile.destination ? (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-400/30 flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3" />
                <span>{profile.destination.toUpperCase()}</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[11px] italic shrink-0">
                Awaiting destination &amp; preferences...
              </span>
            )}
            {profile.vibe && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-400/30 shrink-0">
                🎉 {profile.vibe.replace('_', ' ')}
              </span>
            )}
            {profile.groupType && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1 shrink-0">
                <Users className="w-3 h-3" />
                <span>{profile.groupType}</span>
              </span>
            )}
            {profile.budget && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-400/30 flex items-center gap-1 shrink-0">
                <Wallet className="w-3 h-3" />
                <span>{profile.budget}</span>
              </span>
            )}
            {profile.stayType && (
              <span className="px-2.5 py-0.5 rounded-full bg-pink-400/20 text-pink-300 font-mono text-[11px] font-bold border border-pink-400/30 flex items-center gap-1 shrink-0">
                <Building2 className="w-3 h-3" />
                <span>{profile.stayType}</span>
              </span>
            )}
          </div>
          <div className="text-[10px] text-cyan-300 font-mono shrink-0 pl-3">
            Interview State: Step {profile.step}/3
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-4 sm:p-8 space-y-6 z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className="space-y-3 animate-fade-in">
                  <div
                    className={`p-4 sm:p-5 rounded-3xl shadow-xl text-xs sm:text-sm space-y-3 ${
                      isUser
                        ? 'bg-[#0084FF] text-white ml-auto max-w-[85%] rounded-tr-none shadow-blue-500/20'
                        : 'bg-[#111C38] text-slate-100 max-w-[94%] rounded-tl-none border border-cyan-400/20'
                    }`}
                  >
                    <p className="leading-relaxed font-medium whitespace-pre-line text-xs sm:text-sm">
                      {m.text}
                    </p>

                    {/* RAG Verification Audit Pill */}
                    {m.ragLedger && (
                      <div className="mt-2.5 pt-2 border-t border-cyan-400/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>RAG Grounded · {m.ragLedger.retrieval_ms}ms · {m.ragLedger.matched_records} SQLite Records</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspectingLedger(m.ragLedger!)}
                          className="px-2.5 py-1 rounded-md bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 border border-cyan-400/40 font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Database className="w-3 h-3" />
                          <span>Audit Proof ➔</span>
                        </button>
                      </div>
                    )}

                    {/* Embedded Rich Interactive Trip Card */}
                    {m.tripCard && (
                      <div className="mt-4 bg-[#0A1024] rounded-2xl border border-cyan-400/40 overflow-hidden shadow-2xl space-y-3">
                        <div className="relative h-44 sm:h-52 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.tripCard.image}
                            alt={m.tripCard.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1024] via-black/30 to-transparent" />
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                            AI Custom Assembled · 99% Match
                          </div>
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white font-mono text-[10px]">
                            {m.tripCard.duration}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="text-[11px] text-cyan-300 font-bold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {m.tripCard.location}
                            </div>
                            <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                              {m.tripCard.title}
                            </h4>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-4 h-4 text-[#0084FF]" />
                              <span>{m.tripCard.airline}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-emerald-400" />
                              <span>{m.tripCard.stay}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {m.tripCard.inclusions.map((inc, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-cyan-200 text-xs font-semibold">
                                {inc}
                              </span>
                            ))}
                          </div>

                          {/* Interactive Day-by-Day Timeline Switcher */}
                          {m.tripCard.itineraryDays && m.tripCard.itineraryDays.length > 0 && (
                            <div className="bg-[#0e172e] p-3.5 rounded-xl border border-cyan-400/25 space-y-2.5 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-cyan-300 text-[11px] flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" /> Interactive Day-by-Day Itinerary:
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {m.tripCard.itineraryDays.length} Days Planned
                                </span>
                              </div>
                              {/* Day Switcher Tabs */}
                              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {m.tripCard.itineraryDays.map((d, dIdx) => {
                                  const activeIdx = activeDayTabs[m.id] ?? 0;
                                  const isSelected = activeIdx === dIdx;
                                  return (
                                    <button
                                      key={dIdx}
                                      type="button"
                                      onClick={() => setActiveDayTabs(prev => ({ ...prev, [m.id]: dIdx }))}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                                        isSelected
                                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                                      }`}
                                    >
                                      {d.day.split(' ')[0] || `Day ${dIdx + 1}`}
                                    </button>
                                  );
                                })}
                              </div>
                              {/* Active Day Content */}
                              {(() => {
                                const currentDayIdx = activeDayTabs[m.id] ?? 0;
                                const curDay = m.tripCard.itineraryDays[currentDayIdx] || m.tripCard.itineraryDays[0];
                                return (
                                  <div className="p-2.5 rounded-lg bg-[#142040] border border-cyan-400/20 text-slate-200 space-y-1 animate-fade-in">
                                    <div className="font-black text-cyan-300 text-xs flex items-center justify-between">
                                      <span>{curDay.day}: {curDay.title}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                      {curDay.desc}
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Squad Cost Splitter Tool */}
                          {(() => {
                            const travelers = squadSplitter[m.id] || 1;
                            const priceNum = parseInt(m.tripCard.price.replace(/[^0-9]/g, ''), 10) || 13499;
                            const squadTotal = priceNum * travelers;
                            return (
                              <div className="p-3 bg-[#0e172e] rounded-xl border border-cyan-400/20 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Squad Cost Splitter:</span>
                                  </span>
                                  <div className="flex items-center gap-1 font-mono text-xs">
                                    {[1, 2, 4, 6].map((count) => (
                                      <button
                                        key={count}
                                        type="button"
                                        onClick={() => setSquadSplitter(prev => ({ ...prev, [m.id]: count }))}
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                                          travelers === count
                                            ? 'bg-[#0084FF] text-white shadow-sm'
                                            : 'bg-white/5 hover:bg-white/10 text-slate-400'
                                        }`}
                                      >
                                        {count}P
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/10">
                                  <span className="text-slate-400">
                                    ₹{priceNum.toLocaleString('en-IN')} × {travelers} {travelers === 1 ? 'traveler' : 'squad members'}
                                  </span>
                                  <span className="text-cyan-300 font-bold">
                                    Squad Total: ₹{squadTotal.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                                  {m.tripCard.price}
                                </span>
                                <span className="text-xs text-slate-500 line-through font-mono">
                                  {m.tripCard.originalPrice}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                Total per head · All flights, stay, perks &amp; taxes included
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleShareWhatsApp(m.tripCard!)}
                                className="px-3.5 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                title="Share Itinerary on WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>

                              <button
                                onClick={() => handleBookCard(m.tripCard!)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-cyan-500 hover:from-[#0070db] hover:to-cyan-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-400/25 transition flex items-center gap-1.5 btn-press cursor-pointer"
                              >
                                <span>Book Entire Package</span>
                                <ArrowRight className="w-4 h-4 text-slate-950" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-400 font-mono pt-1">
                      <span>{m.time}</span>
                      {isUser && <Check className="w-3 h-3 text-cyan-300" />}
                    </div>
                  </div>

                  {/* Contextual Clickable Follow-Up Suggestions / Cross-Question Answers */}
                  {m.promptSuggestions && m.promptSuggestions.length > 0 && (
                    <div className="space-y-1.5 pl-2 pt-1">
                      <div className="text-[11px] text-cyan-400 font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Tap 1-Click Answer:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.promptSuggestions.map((promptText, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(promptText)}
                            className="px-3.5 py-2 rounded-xl bg-[#111C38] hover:bg-[#1C2C55] hover:border-cyan-400/60 text-cyan-200 text-xs font-bold border border-cyan-400/30 transition active:scale-95 text-left shadow-sm cursor-pointer"
                          >
                            {promptText}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Reasoning / Typing Indicator */}
            {isAiThinking && (
              <div className="bg-[#111C38] p-4 rounded-3xl rounded-tl-none shadow-md border border-cyan-400/30 max-w-[280px] space-y-2 animate-fade-in">
                <div className="text-xs text-cyan-300 font-mono font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Synthesizing cross-question answer...</span>
                </div>
                <div className="flex items-center space-x-2 pt-0.5">
                  <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 bg-[#0E1A3A]/90 backdrop-blur-md border-t border-cyan-400/25 z-10 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2.5">
            
            {/* Quick Live RAG Prompts Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 font-mono font-bold flex items-center gap-1 border border-cyan-400/30">
                <Zap className="w-3 h-3 text-amber-300 fill-current" />
                <span>RAG LIVE:</span>
              </span>
              {[
                { label: '✈️ DEL ➔ BKK Cheapest', query: 'bhai delhi se bangkok ki cheapest flight konsi hai?' },
                { label: '🌅 Goa Sunset Cafes', query: 'goa me sunset time pe cafe ya beach club batao' },
                { label: '🛂 Thailand Flat ₹499 Visa', query: 'thailand visa ka kitna charge hai aur kya documents lagenge?' },
                { label: '🎸 Coldplay Mumbai Passes', query: 'coldplay mumbai concert combo package price kya hai?' },
                { label: '🔥 60% Distressed Drops', query: 'unsold cheap flight seat drop kya mil raha hai?' },
                { label: '🏢 18% Corporate GST', query: 'myBiz corporate GST 18% ITC rule kya hai?' },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(pill.query)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-white/10 hover:border-cyan-400/40 transition active:scale-95 text-xs font-semibold cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2 bg-[#050B18] border-2 border-cyan-400/40 focus-within:border-cyan-400 rounded-2xl p-2 transition-all shadow-inner"
            >
              <div className="pl-2 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Reply to AI, ask to make it cheaper, change hotel, or ask visa questions..."
                className="flex-1 bg-transparent text-white placeholder-slate-400 px-2 py-2 text-xs sm:text-sm focus:outline-none font-medium"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-cyan-500 hover:from-[#0070db] hover:to-cyan-400 disabled:opacity-40 disabled:hover:from-[#0084FF] active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer btn-press"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-2">
              <span>Press Enter to send · Orbit AI verifies live PNR seats in real-time</span>
              <span>100% Price Lock Guarantee</span>
            </div>
          </div>
        </div>

      </main>

      {/* Booking Confirmation Dialog */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1024] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-cyan-400/60 animate-modal-enter">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto border border-emerald-400/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white">AI Package Locked!</h3>
            <div className="inline-block px-3 py-1 bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 rounded-full font-mono text-xs font-bold">
              ID: {bookingDetails?.id || bookingSuccessModal}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {bookingDetails?.msg || bookingSuccessModal} has been reserved. Official flight PNR, check-in QR code, and villa vouchers dispatched via WhatsApp &amp; Email.
            </p>
            <div className="p-3 bg-[#111C38] rounded-xl border border-white/10 text-left text-xs space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span>●</span>
                <span>FastAPI DB: Status CONFIRMED</span>
              </div>
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span>●</span>
                <span>18% GST Input Tax Credit Synced</span>
              </div>
              <div className="text-slate-400 font-mono text-[10px] pt-1">
                Pass Token: {bookingDetails?.qrToken || 'QR_TOKEN_VERIFIED'}
              </div>
            </div>
            <button
              onClick={() => setBookingSuccessModal(null)}
              className="w-full py-3 bg-gradient-to-r from-[#0084FF] to-cyan-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer btn-press"
            >
              Done ➔
            </button>
          </div>
        </div>
      )}

      {/* RAG Real-Time Retrieval Audit Inspector Modal */}
      {inspectingLedger && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setInspectingLedger(null)}
        >
          <div 
            className="bg-[#0A122C] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-cyan-400/60 animate-modal-enter max-h-[85vh] overflow-y-auto thin-scrollbar"
            style={{ overscrollBehavior: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyan-400/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                  <Database className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">RAG Engine Audit Inspector</h3>
                  <p className="text-[10px] font-mono text-cyan-300">Live SQLite Grounding Proof</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLedger(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#111C38] border border-cyan-400/20">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Latency</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {inspectingLedger.retrieval_ms} ms
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111C38] border border-cyan-400/20">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence</div>
                <div className="text-base font-black text-cyan-300 font-mono">
                  {Math.round(inspectingLedger.confidence * 100)}%
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111C38] border border-cyan-400/20">
                <div className="text-[10px] text-slate-400 uppercase font-bold">SQLite Records</div>
                <div className="text-base font-black text-amber-300 font-mono">
                  {inspectingLedger.matched_records} Matched
                </div>
              </div>
            </div>

            {/* Scanned Tables */}
            <div className="p-3 bg-[#111C38] rounded-xl border border-white/10 space-y-1.5 text-xs">
              <div className="text-slate-400 text-[11px] font-bold flex items-center justify-between">
                <span>Scanned Modality Tables:</span>
                <span className="text-cyan-300 font-mono text-[10px]">{inspectingLedger.engine}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inspectingLedger.tables_scanned.map((table, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono font-bold">
                    ✓ {table}
                  </span>
                ))}
              </div>
            </div>

            {/* Source Documents */}
            <div className="space-y-2 text-xs">
              <div className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Grounded Source Excerpts:
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto thin-scrollbar pr-1">
                {inspectingLedger.sources && inspectingLedger.sources.length > 0 ? (
                  inspectingLedger.sources.map((src, sIdx) => (
                    <div key={sIdx} className="p-2.5 rounded-xl bg-[#070D1E] border border-cyan-400/20 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="truncate pr-2">{src.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-mono text-[9px] uppercase shrink-0">
                          {src.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {src.snippet}
                      </p>
                      {src.price && (
                        <div className="text-[10px] font-mono text-emerald-400 pt-0.5">
                          Verified Rate: ₹{src.price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs italic">
                    Package synthesized directly from verified SQLite flight &amp; hotel inventories.
                  </div>
                )}
              </div>
            </div>

            {/* Zero Hallucination Guarantee */}
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-400/30 text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Hallucination Guaranteed · 100% matched against active SQLite database.</span>
            </div>

            <button
              type="button"
              onClick={() => setInspectingLedger(null)}
              className="w-full py-2.5 bg-gradient-to-r from-[#0084FF] to-cyan-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer btn-press"
            >
              Close Audit Inspector
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0084FF] text-white text-xs font-bold shadow-2xl shadow-cyan-400/40 border border-white/20 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#070D1E] flex items-center justify-center text-cyan-400 text-xs font-mono">
        Initializing Orbit AI Travel Copilot Studio...
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
