'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Minimize2, 
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
  HelpCircle,
  MessageSquare,
  Maximize2
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  crossQuestions?: string[];
  tripCard?: {
    title: string;
    cityKey: string;
    location: string;
    price: string;
    duration: string;
    airline: string;
    stay: string;
    image: string;
    inclusions: string[];
    itineraryDays?: { day: string; title: string; desc: string }[];
  };
  promptSuggestions?: string[];
}

interface OrbitAiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  isCartVisible?: boolean;
}

interface UserProfile {
  destination?: string;
  vibe?: string;
  groupType?: string;
  budget?: string;
  duration?: string;
  hotelPreference?: string;
  step: number;
}

export default function OrbitAiChatbot({
  isOpen,
  onClose,
  onOpen,
  onSelectToCart,
  onFocusCity,
  isCartVisible = false,
}: OrbitAiChatbotProps) {
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedItineraryCard, setSelectedItineraryCard] = useState<ChatMessage['tripCard'] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    step: 0,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Namaste Rahul! 🤖 I'm your Orbit AI Travel Copilot (GPT-4o Route Engine).\n\nMai koi basic search engine nahi hoon — mai aapse cross-questions poochunga taaki aapka budget, vibe aur squad ke hisab se exact perfect vacation design kar sakun!\n\nSabse pehle batao: Kaisi trip dhyan me hai?",
      time: 'Just now',
      crossQuestions: [
        'Beach chill & party (Goa)',
        'Hills & river rafting <3h (Rishikesh)',
        'International holiday with visa (Thailand/Dubai)',
        'Royal heritage haveli (Rajasthan)'
      ],
      promptSuggestions: [
        '🏖️ Goa beach vacation with squad',
        '⛰️ Weekend drive from Delhi <3h',
        '🇹🇭 Thailand with flat ₹499 visa',
        '🇦🇪 Dubai luxury desert trip'
      ]
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOpen = isOpen || internalOpen;

  const handleOpen = () => {
    if (onOpen) onOpen();
    else setInternalOpen(true);
  };

  const handleClose = () => {
    onClose();
    setInternalOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeOpen) {
      scrollToBottom();
    }
  }, [messages, activeOpen, isAiThinking]);

  const [sessionId, setSessionId] = useState<string | null>(null);

  // ─── CROSS-QUESTIONING MULTI-TURN CONVERSATION LOGIC (WITH REAL-TIME RAG) ───
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
        const serverMsg = data.message;
        const newAiMessage: ChatMessage = {
          id: serverMsg.id || `ai-${Date.now()}`,
          sender: 'ai',
          text: serverMsg.text,
          time: serverMsg.time || 'Just now',
          tripCard: serverMsg.trip_card || undefined,
          promptSuggestions: serverMsg.prompt_suggestions || undefined,
        };

        setMessages((prev) => [...prev, newAiMessage]);
        setIsAiThinking(false);
        return;
      }
    } catch (err) {
      console.warn('Backend /api/chat error, falling back to local copilot engine:', err);
    }

    setTimeout(() => {
      setIsAiThinking(false);
      const q = rawQuery.toLowerCase();
      let aiText = '';
      let card: ChatMessage['tripCard'] = undefined;
      let nextSuggestions: string[] | undefined = undefined;
      let newStep = profile.step + 1;

      // SCENARIO 1: GOA PATH
      if (q.includes('goa') || (profile.destination === 'goa' && profile.step < 3)) {
        if (!profile.destination) {
          setProfile((p) => ({ ...p, destination: 'goa', step: 1 }));
          aiText = "Goa is always epic! 🏖️ Lekin trip optimize karne ke liye mujhe 2 cheezein jaan-ni hain (Cross-Questions):\n\n1. Vibe kya chahiye: North Goa (Beach clubs, parties & shacks) ya South Goa (Peaceful, scenic white sands, luxury resorts)?\n2. Kiske sath ja rahe ho (Friends gang, couple, ya solo)?";
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

          aiText = `Got it! ${isNorth ? 'North Goa partying' : 'South Goa relaxation'} with ${isFriends ? 'your friends gang' : 'your partner'} locked! 🎯\n\nAb agla cross-question:\n1. Approximate budget per person kitna prefer karoge: Under ₹15,000 ya Premium Luxury ₹25k+?\n2. Stay me kya chahiye: Private Pool Villa ya 4-Star Beachfront Hotel?`;
          nextSuggestions = [
            '💰 Under ₹15,000 per person',
            '🏡 3BHK Private Pool Villa',
            '🏨 4-Star Beachfront Hotel',
            '💎 Premium Luxury ₹25,000+'
          ];
        } else {
          // Final synthesized solution
          setProfile((p) => ({ ...p, step: 3 }));
          aiText = "BOOM! 🚀 Maine tumhare saare answers cross-check karke tumhara customized package ready kar diya hai:\n\n• ✈️ Flight: IndiGo Direct DEL ➔ GOI (06:15 AM Non-stop, lowest in 30 days locked)\n• 🏡 Stay: Candolim 3BHK Sunset Private Pool Villa with garden gazebo\n• 🛵 Perks: 2 Activa Scooters included for beach hopping + Thalassa VIP access pass\n• 💰 Budget: ₹13,499 per person (₹1,500 budget bacha bhi liya!)\n\nYe lo direct booking card — 1-click me book kar sakte ho ya Day-by-Day schedule dekhna hai?";
          card = {
            title: 'Goa Coastal Villa & Beach Club Escape',
            cityKey: 'goa',
            location: 'Candolim & Vagator, North Goa',
            price: '₹13,499',
            duration: '4 Days / 3 Nights',
            airline: 'IndiGo Direct (DEL ➔ GOI)',
            stay: 'Candolim 3BHK Private Pool Villa',
            image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
            inclusions: ['✈️ Return Non-Stop Flight', '🏡 Private Pool Villa', '🛵 2 Scooters Included', '🍳 Daily Breakfast'],
            itineraryDays: [
              { day: 'Day 1', title: 'Touchdown MOPA & Sunset Villa Pool', desc: 'IndiGo flight arrival, private cab to Candolim villa, evening sundowner pool party.' },
              { day: 'Day 2', title: 'Beach Hopping & Water Sports', desc: 'Scooter ride across Anjuna, parasailing at Calangute, dinner at Thalassa.' },
              { day: 'Day 3', title: 'Old Goa & Tito\'s Lane Nightlife', desc: 'Heritage church stroll in morning, club hopping at Tito\'s Lane in evening.' },
              { day: 'Day 4', title: 'Poolside Brunch & Flight Home', desc: 'Leisurely brunch, souvenir shopping in Panjim, departure flight.' },
            ]
          };
          nextSuggestions = [
            '⚡ Book This Package in 1-Click',
            '📅 View Day-by-Day Schedule',
            '🔄 Change Hotel to Vagator',
            'Can we make it even cheaper?'
          ];
        }
      }

      // SCENARIO 2: RISHIKESH / WEEKEND PATH
      else if (q.includes('rishi') || q.includes('weekend') || q.includes('rafting') || (profile.destination === 'rishikesh' && profile.step < 3)) {
        if (!profile.destination) {
          setProfile((p) => ({ ...p, destination: 'rishikesh', step: 1 }));
          aiText = "Rishikesh weekend escape is only 2h 45m from Delhi NCR via Meerut Expressway! ⛰️\n\nCross-Question for you:\n1. Adventure chahiye (16km Grade-3 Ganga Rafting + Cliff Jump) ya peaceful yoga & Ganga Aarti?\n2. Tents me glamping pasand hai riverbed par, ya concrete luxury resort room?";
          nextSuggestions = [
            '🌊 Adventure: 16km Rafting + Cliff Jump',
            '🧘 Peaceful: Yoga & Ganga Aarti',
            '⛺ Luxury Swiss Beach Tents',
            '🏨 Resort Room with Pool'
          ];
        } else {
          setProfile((p) => ({ ...p, step: 3 }));
          aiText = "Perfect choice! Weekend glamping + rafting package lock kar diya hai:\n\n• 🚗 Distance: 2h 45m drive from Delhi NCR (Zero toll congestion)\n• ⛺ Stay: Air-cooled Swiss tents right on the white sand riverbed\n• 🌊 Activities: 16km Grade-3 Ganga rafting, cliff jumping, evening acoustic campfire & BBQ buffet\n• 💰 Total Price: ₹3,499 per person (All 3 meals included).\n\nCheck out the package below:";
          card = {
            title: 'Rishikesh Ganga Riverfront Glamping & Rafting',
            cityKey: 'rishikesh',
            location: 'Shivpuri, Rishikesh (< 3h Drive)',
            price: '₹3,499',
            duration: '2 Days / 1 Night',
            airline: 'Scenic Drive / Vande Bharat',
            stay: 'Luxury Swiss Air-Cooled Tents',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
            inclusions: ['⛺ AC Swiss Tent', '🌊 16km Ganga Rafting', '🔥 Evening Bonfire & Live Music', '🍲 All 3 Buffet Meals'],
            itineraryDays: [
              { day: 'Day 1 (Saturday)', title: 'Drive In, Rafting & Bonfire', desc: 'Scenic morning drive, tent check-in, 16km thrilling rafting, evening guitar campfire with snacks.' },
              { day: 'Day 2 (Sunday)', title: 'Cliff Jump & Aarti', desc: 'Sunrise yoga, cliff jump into river, Parmarth Niketan Ganga Aarti, evening return drive.' },
            ]
          };
          nextSuggestions = [
            '⚡ Book Weekend Glamping (₹3,499)',
            'Is rafting safe for non-swimmers?',
            'Show route on 3D Globe',
            'Can we book for 4 people?'
          ];
        }
      }

      // SCENARIO 3: THAILAND / INTERNATIONAL PATH
      else if (q.includes('thailand') || q.includes('international') || q.includes('phuket') || q.includes('dubai')) {
        const isDubai = q.includes('dubai');
        setProfile((p) => ({ ...p, destination: isDubai ? 'dubai' : 'thailand', step: 1 }));
        
        if (profile.step === 0) {
          aiText = `International ${isDubai ? 'Dubai' : 'Thailand'} plan is a brilliant idea! ✈️ Hamara flat ₹499 visa cap aur OCR pre-check already included hai.\n\nLekin mujhe customize karne ke liye 2 sawal poochne hain:\n1. Total kitne din ka trip socha hai (4 days express ya 6 days relaxed)?\n2. Kiske sath travel kar rahe ho (Family with kids, couple, ya friends)?`;
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
            duration: '4 Days / 3 Nights',
            airline: 'Emirates / SpiceJet Direct',
            stay: 'JW Marriott Marquis 5-Star Hotel',
            image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
            inclusions: ['✈️ Return Flights', '🏨 5-Star Hotel', '🛂 48h Express Visa', '🏜️ VIP Desert Safari']
          } : {
            title: 'Bangkok & Phuket Tropical Island Package',
            cityKey: 'thailand',
            location: 'Phuket & Bangkok, Thailand',
            price: '₹24,999',
            duration: '5 Days / 4 Nights',
            airline: 'Thai Airways Direct',
            stay: 'Anantara Riverside 5-Star Resort',
            image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
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

      // SCENARIO 4: PRICE REFINEMENT (Can we make it cheaper?)
      else if (q.includes('cheap') || q.includes('kam') || q.includes('budget') || q.includes('sasta')) {
        aiText = "Haan bhai, bilkul sasta kar sakte hain! 💡 Mere paas do direct hacks hain:\n\n1. Option A: Morning flight ki jagah afternoon/late-night flight choose kar lo (-₹1,400 per person save honge).\n2. Option B: 3BHK private pool villa ki jagah beachfront boutique resort le lo (-₹2,200 save honge).\n\nKaunsa option apply karun aapke plan me?";
        nextSuggestions = [
          '✈️ Apply Night Flight (-₹1,400)',
          '🏨 Change to Boutique Stay (-₹2,200)',
          'Keep current plan as it is'
        ];
      }

      // SCENARIO 5: GENERAL INQUIRY / FIRST CONTACT
      else {
        aiText = `Understood: "${rawQuery}". Isko exact design karne ke liye mujhe thoda aur batao:\n\n1. Kahan se start kar rahe ho (Delhi, Mumbai, Bangalore)?\n2. Trip ka primary motive kya hai (Relaxation, party, romance, ya adventure)?\n3. Max budget kitna soch kar chal rahe ho?`;
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
    }, 700);
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

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ─── 1. CYBER BLUE FLOATING AI COPILOT LAUNCHER (OPENS FULL NEW TAB) ─── */}
      <div 
        className={`fixed right-4 sm:right-6 z-[9990] transition-all duration-300 flex flex-col items-end pointer-events-auto ${
          isCartVisible ? 'bottom-24 sm:bottom-20' : 'bottom-6 sm:bottom-7'
        }`}
      >
        {/* Main Glowing Floating AI Pill Link */}
        <a
          href="/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 px-5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#0084FF] via-[#0A225C] to-[#0A1024] hover:from-[#0070db] hover:to-[#132d75] active:scale-95 text-white font-black text-sm rounded-full shadow-[0_12px_45px_rgba(0,132,255,0.65)] hover:shadow-[0_16px_55px_rgba(0,132,255,0.8)] transition-all duration-300 group cursor-pointer border-2 border-cyan-400/80 ring-4 ring-cyan-500/25 btn-press"
          aria-label="Open Orbit AI Travel Chatbot in New Tab"
        >
          {/* Robot Avatar with Cyan Glow */}
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-white shadow-md shadow-cyan-400/50">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-90"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0A1024]"></span>
          </div>
          
          {/* Text Label */}
          <div className="text-left leading-tight">
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-white tracking-tight">
              <span>✨ AI Recommender</span>
              <span className="px-1.5 py-0.2 bg-cyan-400 text-slate-950 text-[9px] rounded font-mono font-black">
                NEW TAB ↗
              </span>
            </div>
            <div className="text-[10.5px] text-cyan-200 font-medium">
              Tell AI &amp; Get Custom Trips
            </div>
          </div>
        </a>
      </div>

      {/* ─── 2. FULL INTERACTIVE AI CHATBOT TERMINAL DRAWER ─── */}
      {activeOpen && (
        <div 
          className={`fixed z-[9999] bg-[#0A1024] rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.85)] border-2 border-cyan-400/50 overflow-hidden flex flex-col select-none transition-all duration-300 ${
            isFullscreen
              ? 'inset-2 sm:inset-6 md:inset-8 max-w-6xl mx-auto h-[92vh]'
              : `right-3 sm:right-6 w-[95vw] sm:w-[460px] max-w-[480px] h-[660px] max-h-[90vh] ${
                  isCartVisible ? 'bottom-20 sm:bottom-20' : 'bottom-4 sm:bottom-6'
                }`
          }`}
        >
          {/* High-Tech Glowing Header */}
          <div className="bg-gradient-to-r from-[#0E1A3A] via-[#102A6B] to-[#0A1024] p-3.5 sm:p-4 flex items-center justify-between border-b border-cyan-400/25 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-400/40">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0A1024]"></span>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span>Orbit AI Travel Copilot</span>
                  <span className="px-1.5 py-0.2 bg-cyan-400/20 text-cyan-300 text-[9px] rounded font-mono font-bold border border-cyan-400/30">
                    GPT-4o CROSS-EXAMINER
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Active Conversation · Asking your exact preferences</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-full hover:bg-white/10 transition active:scale-90"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-full hover:bg-white/10 transition active:scale-90"
                aria-label="Toggle Fullscreen Pura Chat"
                title={isFullscreen ? "Exit Fullscreen" : "Pura Chat (Fullscreen)"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleClose} 
                className="text-slate-400 hover:text-white hover:rotate-90 active:scale-90 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
                aria-label="Close Chatbot"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Feature Pill */}
          <div className="bg-[#050B18] px-4 py-1.5 border-b border-white/[0.08] text-[10px] text-slate-400 flex items-center justify-between font-mono shrink-0">
            <span className="flex items-center gap-1 text-cyan-300 font-bold">
              <Sparkles className="w-3 h-3 text-cyan-300" /> Conversational Multi-Turn Architect
            </span>
            <span className="text-slate-400">Step {profile.step} / 3 Complete</span>
          </div>

          {/* Chat Messages Stream */}
          <div className="p-3.5 sm:p-4 bg-[#0A1024] space-y-4 flex-1 overflow-y-auto thin-scrollbar text-xs">
            
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className="space-y-2 animate-fade-in">
                  <div
                    className={`p-3.5 rounded-2xl shadow-lg text-xs space-y-2 ${
                      isUser
                        ? 'bg-[#0084FF] text-white ml-auto max-w-[85%] rounded-tr-none shadow-blue-500/20'
                        : 'bg-[#111C38] text-slate-100 max-w-[92%] rounded-tl-none border border-cyan-400/20'
                    }`}
                  >
                    <p className="leading-relaxed font-medium whitespace-pre-line text-[12px]">
                      {m.text}
                    </p>

                    {/* Embedded Rich Interactive Trip Card */}
                    {m.tripCard && (
                      <div className="mt-2.5 bg-[#0A1024] rounded-2xl border border-cyan-400/30 overflow-hidden shadow-xl space-y-2">
                        <div className="relative h-28 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.tripCard.image}
                            alt={m.tripCard.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1024] via-transparent to-transparent" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                            Tailored For You · 99% Match
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <div className="text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {m.tripCard.location}
                            </div>
                            <div className="text-xs font-black text-white truncate">
                              {m.tripCard.title}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                            <div>✈️ {m.tripCard.airline}</div>
                            <div>🏨 {m.tripCard.stay}</div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {m.tripCard.inclusions.map((inc, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-200 text-[9.5px]">
                                {inc}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <div>
                              <div className="text-base font-black text-cyan-300 font-mono">
                                {m.tripCard.price}
                              </div>
                              <div className="text-[9px] text-slate-400">Total all-inclusive per head</div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onFocusCity(m.tripCard!.cityKey)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-[10.5px] font-bold transition"
                              >
                                3D Globe
                              </button>
                              <button
                                onClick={() => onSelectToCart(m.tripCard!.title, m.tripCard!.price)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-cyan-500 hover:from-[#0070db] hover:to-cyan-400 text-white font-black text-[10.5px] shadow-md transition flex items-center gap-1 btn-press"
                              >
                                <span>Book Now</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-400 font-mono pt-1">
                      <span>{m.time}</span>
                      {isUser && <Check className="w-3 h-3 text-cyan-300" />}
                    </div>
                  </div>

                  {/* Contextual Clickable Follow-Up Suggestions / Cross-Question Answers */}
                  {m.promptSuggestions && m.promptSuggestions.length > 0 && (
                    <div className="space-y-1 pl-1 pt-1">
                      <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Quick 1-Tap Reply:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.promptSuggestions.map((promptText, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(promptText)}
                            className="px-3 py-1.5 rounded-xl bg-[#111C38] hover:bg-[#1C2C55] hover:border-cyan-400/50 text-cyan-200 text-[11px] font-bold border border-cyan-400/25 transition active:scale-95 text-left shadow-sm"
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
              <div className="bg-[#111C38] p-3 rounded-2xl rounded-tl-none shadow-md border border-cyan-400/30 max-w-[260px] space-y-1.5 animate-fade-in">
                <div className="text-[10px] text-cyan-300 font-mono font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Synthesizing cross-question answer...</span>
                </div>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Futuristic Message Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0E1A3A] border-t border-cyan-400/25 flex items-center space-x-2 shrink-0"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type your answer, ask to make it cheaper, change dates..."
              className="flex-1 bg-[#050B18] text-white placeholder-slate-400 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400/50 border border-cyan-400/30 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0084FF] to-cyan-500 hover:from-[#0070db] hover:to-cyan-400 disabled:opacity-40 disabled:hover:from-[#0084FF] active:scale-90 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-150 shrink-0 cursor-pointer btn-press"
              aria-label="Send message to Orbit AI"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}
