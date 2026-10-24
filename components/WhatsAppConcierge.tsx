'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Send, 
  Bot, 
  CheckCheck, 
  Sparkles, 
  MessageCircle, 
  Phone, 
  FileText, 
  Plane, 
  ShieldCheck, 
  ExternalLink,
  Minimize2,
  Zap,
  ArrowRight
} from 'lucide-react';

interface WhatsAppConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  isCartVisible?: boolean;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionPill?: {
    label: string;
    action: string;
  };
}

const QUICK_ACTIONS = [
  { id: 'visa', label: '🛂 Check Visa Status', prompt: 'What is the status of my Thailand eVisa application #TH-89124?' },
  { id: 'reschedule', label: '✈️ Reschedule Flight', prompt: 'I want to reschedule my Delhi to Goa flight with zero airline penalty.' },
  { id: 'gst', label: '🏢 18% GST Invoice', prompt: 'How do I download the B2B tax invoice with my company GSTIN for ITC?' },
  { id: 'callback', label: '📞 Request 2-Min Callback', prompt: 'Please arrange a priority callback from the Senior Travel Desk.' },
  { id: 'deals', label: '⚡ Flash Flight Drops', prompt: 'Show me today’s unsold distressed airline seats under ₹3,000.' },
];

export default function WhatsAppConcierge({ 
  isOpen, 
  onClose, 
  onOpen, 
  isCartVisible = false 
}: WhatsAppConciergeProps) {
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Namaste Rahul! 🌟 Welcome to Orbit 24/7 Travel Desk. All your flights, curated stays, and flat ₹499 visas are linked in real-time right here.',
      time: '10:00 AM',
    },
    {
      id: 'm2',
      sender: 'bot',
      text: '🎉 Milestone Update: Thailand eVisa (Ref: TH-89124) has passed Embassy Pre-Verification! Official PDF document will arrive directly on this chat.',
      time: '10:02 AM',
      actionPill: {
        label: 'View Embassy Tracking Link ➔',
        action: 'track_visa',
      },
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal state with external isOpen prop
  const activeOpen = isOpen || internalOpen;

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    } else {
      setInternalOpen(true);
    }
    setShowTooltip(false);
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
  }, [messages, activeOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // Generate intelligent dynamic response based on query
    setTimeout(async () => {
      const lower = text.toLowerCase();
      let replyText = '';
      let pill: { label: string; action: string } | undefined = undefined;

      if (lower.includes('visa') || lower.includes('thailand') || lower.includes('dubai')) {
        replyText = '🛂 Thailand eVisa Radar (#TH-89124):\n• Status: Embassy Pre-Approved 🟢\n• Milestone: Biometrics verified via OCR\n• Estimated Delivery: Tomorrow 11:30 AM IST\n• Flat ₹499 family cap guarantee applied.';
        pill = { label: 'Download Visa Slip 📄', action: 'download_slip' };
      } else if (lower.includes('reschedule') || lower.includes('flight') || lower.includes('cancel')) {
        replyText = '✈️ IndiGo Delhi ➔ Goa (6E 214):\n• Orbit Zero-Fee Flex window is active for 2 hours.\n• You can reschedule to any morning departure or claim 100% UPI refund to your account with zero penalty.';
        pill = { label: 'Pick New Departure Slot ➔', action: 'reschedule_slot' };
      } else if (lower.includes('gst') || lower.includes('tax') || lower.includes('invoice') || lower.includes('itc')) {
        replyText = '🏢 GST B2B Desk:\n• Input Tax Credit (ITC) rate: 18% on Air Tickets, 12% on Premium Villas.\n• Enter your 15-digit GSTIN (e.g., 07AAAAA0000A1Z5) to generate an instant IRN-verified tax invoice.';
        pill = { label: 'Sync GSTIN Profile ➔', action: 'sync_gstin' };
      } else if (lower.includes('callback') || lower.includes('call') || lower.includes('phone')) {
        replyText = '📞 Priority Callback Queued!\n• Assigned Specialist: Ananya Sengupta (Senior Operations Lead)\n• Expected ring: Within 120 seconds on your verified mobile.';
        pill = { label: 'Confirm Phone Number 📞', action: 'confirm_phone' };
      } else if (lower.includes('cheap') || lower.includes('seat') || lower.includes('deal') || lower.includes('drop')) {
        replyText = '⚡ Distressed Seat Radar:\n• IndiGo DEL ➔ GOI: ₹2,899 (3 seats left)\n• Air India DEL ➔ BOM: ₹3,149 (Flash drop)\n• SpiceJet DEL ➔ DXB: ₹6,499 (Midnight release)';
        pill = { label: 'Lock Seat at Cost ➔', action: 'lock_deal' };
      } else {
        // Query Orbit AI engine via FastAPI
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
          });
          if (res.ok) {
            const data = await res.json();
            replyText = data.message?.text || 'Received! Orbit Travel Operations desk is reviewing your ticket and live PNR.';
          } else {
            replyText = 'Received your inquiry! Orbit Travel Operations desk is reviewing your request.';
          }
        } catch {
          replyText = 'Received your inquiry! Orbit Travel Operations desk is reviewing your ticket and live PNR. Expect an update momentarily.';
        }
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionPill: pill,
        },
      ]);
    }, 600);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ─── 1. FLOATING CHAT LAUNCHER BUTTON (FAB) ─── */}
      {!activeOpen && (
        <div 
          className={`fixed right-4 sm:right-6 z-[9990] transition-all duration-300 flex flex-col items-end pointer-events-auto ${
            isCartVisible ? 'bottom-24 sm:bottom-20' : 'bottom-6 sm:bottom-7'
          }`}
        >
          {/* Tooltip Greeting Pill */}
          {showTooltip && (
            <div className="flex items-center gap-2 mb-2 bg-[#0A1024] text-white text-xs font-bold py-2 px-4 rounded-2xl shadow-2xl border border-emerald-400/40 animate-fade-in-up">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>💬 24/7 Travel Desk &amp; Visa Chat Active</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                className="text-white/60 hover:text-white ml-2 p-0.5 text-xs font-bold"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main FAB Button with ALWAYS VISIBLE Bold Text */}
          <button
            onClick={handleOpen}
            className="flex items-center space-x-3 px-5 py-3.5 sm:px-6 sm:py-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-slate-900 font-black text-sm rounded-full shadow-[0_12px_40px_rgba(37,211,102,0.6)] transition-all duration-300 group cursor-pointer border-2 border-white ring-4 ring-emerald-500/30 btn-press"
            aria-label="Open 24/7 Live Travel Chat"
          >
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-slate-900 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-90"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
            </div>
            
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-950 uppercase tracking-tight">
                <span>💬 24/7 Live Chat</span>
                <span className="px-1.5 py-0.2 bg-black text-white text-[9px] rounded font-mono font-bold">
                  ONLINE
                </span>
              </div>
              <div className="text-[10.5px] text-emerald-950 font-bold">
                WhatsApp &amp; AI Travel Desk
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ─── 2. ACTIVE CHAT CONCIERGE DRAWER (PORTALED WITH Z-[9999]) ─── */}
      {activeOpen && (
        <div 
          className={`fixed right-3 sm:right-6 z-[9999] w-[94vw] sm:w-[420px] max-w-[430px] h-[600px] max-h-[88vh] bg-[#0B141A] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] border-2 border-emerald-500/40 overflow-hidden flex flex-col slide-up-enter select-none transition-all duration-300 ${
            isCartVisible ? 'bottom-20 sm:bottom-20' : 'bottom-4 sm:bottom-6'
          }`}
        >
          {/* WhatsApp Dark Theme Header */}
          <div className="bg-[#1F2C34] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-white/[0.1] shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="relative w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center text-base font-bold shadow-inner">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1F2C34]"></span>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                  <span>Orbit Travel Concierge</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[9px] rounded font-mono font-bold">
                    VERIFIED ✓
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Now · Average response &lt; 15s</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <a
                href="https://wa.me/919999999999?text=Hi%20Orbit%20Travel%20Desk%2C%20I%20need%20assistance%20with%20my%20booking"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-full hover:bg-white/10 transition"
                title="Continue on WhatsApp Web / Mobile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button 
                onClick={handleClose} 
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition active:scale-90"
                aria-label="Minimize Chat"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleClose} 
                className="text-slate-400 hover:text-white hover:rotate-90 active:scale-90 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
                aria-label="Close WhatsApp Concierge"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trust & Channel Badge */}
          <div className="bg-[#111B21] px-4 py-1.5 border-b border-white/[0.06] text-[10px] text-slate-400 flex items-center justify-between font-mono shrink-0">
            <span className="flex items-center gap-1 text-emerald-400/90 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> End-to-end encrypted
            </span>
            <span className="text-slate-400">Sync ID: #OB-8821</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="p-3.5 sm:p-4 bg-[#0B141A] space-y-3 flex-1 overflow-y-auto thin-scrollbar text-xs">
            <div className="text-center my-1">
              <span className="bg-white/[0.06] border border-white/[0.08] text-slate-400 text-[9.5px] px-3 py-1 rounded-full font-mono font-bold shadow-2xs">
                TODAY · OFFICIAL TRAVEL DESK VOUCHERS DISPATCHED
              </span>
            </div>

            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl shadow-md text-xs space-y-1.5 animate-fade-in ${
                    isUser
                      ? 'bg-[#005C4B] text-white ml-auto max-w-[85%] rounded-tr-none border border-emerald-500/30'
                      : 'bg-[#1F2C34] text-slate-100 max-w-[88%] rounded-tl-none border border-white/[0.08]'
                  }`}
                >
                  <p className="leading-relaxed font-medium whitespace-pre-line">{m.text}</p>
                  
                  {m.actionPill && (
                    <div className="pt-1">
                      <button 
                        onClick={() => handleSendMessage(m.actionPill!.label)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10.5px] border border-emerald-400/30 transition flex items-center gap-1 active:scale-95"
                      >
                        <span>{m.actionPill.label}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-400 font-mono">
                    <span>{m.time}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="bg-[#1F2C34] p-3 rounded-2xl rounded-tl-none shadow-md border border-white/[0.08] max-w-[80px] flex items-center space-x-1.5 animate-fade-in">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="bg-[#111B21] px-3 py-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleSendMessage(action.prompt)}
                  className="px-2.5 py-1 rounded-full bg-[#1F2C34] hover:bg-[#2A3942] active:scale-95 text-slate-200 text-[10.5px] font-bold border border-white/10 transition shrink-0"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Style Input Box */}
          <div className="p-3 bg-[#1F2C34] border-t border-white/[0.1] flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask e.g. 'Status of Thailand eVisa'..."
              className="flex-1 bg-[#111B21] text-white placeholder-slate-400 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-white/[0.1] transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim()}
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-50 disabled:hover:bg-[#00A884] active:scale-90 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(0,168,132,0.4)] transition-all duration-150 shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
