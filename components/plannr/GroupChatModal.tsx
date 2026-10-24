'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Users, Sparkles, MapPin, CheckCheck } from 'lucide-react';
import { usePlannr } from '@/lib/plannr-context';

interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  isMe: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Aman',
    initials: 'AK',
    color: 'bg-[#26855F]',
    text: 'Bros, flights Delhi to Denpasar look solid with IndiGo. Baggage is sorted.',
    time: '10:14 AM',
    isMe: false,
  },
  {
    id: 'm2',
    sender: 'Vikram',
    initials: 'VJ',
    color: 'bg-[#7B78D8]',
    text: 'Should we do Nusa Penida speedboat on Day 3 or stay in Uluwatu for sunset?',
    time: '10:18 AM',
    isMe: false,
  },
  {
    id: 'm3',
    sender: 'Rohit (You)',
    initials: 'RS',
    color: 'bg-[#D95338]',
    text: 'Put it up on the Plannr live poll! Vote ends in 6 hours.',
    time: '10:20 AM',
    isMe: true,
  },
  {
    id: 'm4',
    sender: 'Nikhil',
    initials: 'NK',
    color: 'bg-[#4CA7B7]',
    text: 'Voted for Nusa Penida. Kelingking cliff photos are unmissable!',
    time: '10:22 AM',
    isMe: false,
  },
];

export const GroupChatModal: React.FC = () => {
  const { isGroupChatOpen, setIsGroupChatOpen } = usePlannr();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGroupChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isGroupChatOpen, messages]);

  if (!isGroupChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'Rohit (You)',
      initials: 'RS',
      color: 'bg-[#D95338]',
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    // Simulate reply after 1.2s
    setTimeout(() => {
      const replies = [
        'Awesome, added to our notes!',
        'Sounds good bro, let’s lock it.',
        'Done! Checking villa details now.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'Aman',
          initials: 'AK',
          color: 'bg-[#26855F]',
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md h-[85vh] sm:h-[620px] bg-white rounded-t-3xl sm:rounded-3xl border border-[#EDE7DF] shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#EDE7DF] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#D95338] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                RS
              </div>
              <div className="w-8 h-8 rounded-full bg-[#26855F] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                AK
              </div>
              <div className="w-8 h-8 rounded-full bg-[#7B78D8] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                VJ
              </div>
              <div className="w-8 h-8 rounded-full bg-[#4CA7B7] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                NK
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#151E28]">Bali with the boys</h3>
              <p className="text-[11px] text-[#7A8699]">4 group members · Bali 12-18 Nov</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsGroupChatOpen(false)}
            className="w-8 h-8 rounded-full bg-white text-[#7A8699] hover:text-[#151E28] flex items-center justify-center border border-[#EDE7DF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/60">
          <div className="text-center my-2">
            <span className="text-[11px] font-semibold bg-white border border-[#EDE7DF] px-3 py-1 rounded-full text-[#7A8699]">
              Today · Trip Chat Active
            </span>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!m.isMe && (
                <div
                  className={`w-7 h-7 rounded-full ${m.color} text-white text-[10px] font-bold flex items-center justify-center shrink-0 self-end`}
                >
                  {m.initials}
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  m.isMe
                    ? 'bg-[#D95338] text-white rounded-br-none'
                    : 'bg-white text-[#151E28] border border-[#EDE7DF] rounded-bl-none'
                }`}
              >
                {!m.isMe && (
                  <p className="text-[10px] font-bold text-[#7A8699] mb-0.5">{m.sender}</p>
                )}
                <p>{m.text}</p>
                <div
                  className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                    m.isMe ? 'text-white/80' : 'text-[#A0AEC0]'
                  }`}
                >
                  <span>{m.time}</span>
                  {m.isMe && <CheckCheck className="w-3 h-3 inline" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#EDE7DF] bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Type message to the boys..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full border border-[#EDE7DF] bg-[#FAF7F2] text-xs text-[#151E28] placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#D95338]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-full bg-[#D95338] text-white flex items-center justify-center hover:bg-[#C4442B] active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
