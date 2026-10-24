'use client';

import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { StoryItem } from './StoriesCarousel';

interface StoryModalProps {
  story: StoryItem | null;
  onClose: () => void;
  onBookItem: (name: string, price: string) => void;
}

export default function StoryModal({ story, onClose, onBookItem }: StoryModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!story) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // fills in 5 seconds

    return () => clearInterval(interval);
  }, [story]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 modal-backdrop-enter select-none">
      <div className="relative max-w-sm w-full h-[85vh] max-h-[720px] bg-[#0E1A3A] rounded-[32px] overflow-hidden flex flex-col justify-between text-white shadow-2xl border border-white/10 modal-panel-enter">
        {/* Top Progress Bars & Author */}
        <div className="p-4 space-y-2.5 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#1F5EFF] flex items-center justify-center text-xs font-bold shadow-md shadow-[#1F5EFF]/30">
                ⚡
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1">
                  {story.author}
                  <Sparkles className="w-3 h-3 text-[#FFC940]" />
                </div>
                <div className="text-[9px] text-white/70">Verified Travel Drop</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold hover:bg-white/30 hover:rotate-90 active:scale-90 transition-all duration-200"
              aria-label="Close story"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Full Image with subtle slow zoom */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover scale-105 transition-transform duration-7000 ease-out"
          />
        </div>

        {/* Story Bottom Action Banner */}
        <div className="p-5 z-10 bg-gradient-to-t from-black via-black/85 to-transparent space-y-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1F5EFF] text-white shadow-xs">
              {story.tag}
            </span>
            <h3 className="text-xl font-extrabold mt-1 leading-snug tracking-tight text-white drop-shadow-sm">{story.title}</h3>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">{story.subtitle}</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              {story.oldPrice && (
                <span className="text-[11px] text-white/60 line-through">{story.oldPrice}</span>
              )}
              <div className="text-2xl font-extrabold text-[#FFC940] leading-tight">{story.price}</div>
            </div>
            <button
              onClick={() => {
                onClose();
                onBookItem(story.title, story.price);
              }}
              className="px-6 py-3 bg-white text-[#0E1A3A] hover:bg-gray-100 active:scale-95 font-extrabold text-xs rounded-xl shadow-lg transition-all duration-150 flex items-center gap-1.5 group"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
