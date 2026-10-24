'use client';

import React from 'react';

export interface StoryItem {
  id: string;
  author: string;
  tag: string;
  title: string;
  subtitle: string;
  oldPrice?: string;
  price: string;
  image: string;
  ringStyle: 'jet' | 'fire' | 'active';
  label: string;
  cityKey: string;
  isHot?: boolean;
}

export const STORIES_DATA: StoryItem[] = [
  {
    id: 'story_2h',
    author: 'Weekend in 2h',
    tag: 'WEEKEND GETAWAY',
    title: 'Rishikesh Riverside Glamping',
    subtitle: 'Swiss tent right on the Ganges. Includes 16km rafting + all meals.',
    oldPrice: '₹8,500',
    price: '₹3,499',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    ringStyle: 'jet',
    label: '⚡ <2h Trips',
    cityKey: 'rishikesh',
    isHot: true,
  },
  {
    id: 'story_goa',
    author: 'IndiGo Flash Seat',
    tag: 'DISTRESSED SEAT',
    title: 'Delhi ➔ Goa Direct Flight',
    subtitle: 'Tomorrow 6:15 AM departure. 3 unsold airline seats released at cost.',
    oldPrice: '₹7,200',
    price: '₹2,899',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    ringStyle: 'fire',
    label: '🔥 Goa ₹2,899',
    cityKey: 'goa',
    isHot: true,
  },
  {
    id: 'story_thailand',
    author: 'Atlys Disruption',
    tag: 'FAMILY VISA CAP',
    title: 'Thailand 30-Day Express Visa',
    subtitle: 'Entire family fee capped at flat ₹499. No embassy visits, 24h approval.',
    oldPrice: '₹4,800',
    price: '₹499 (Flat Fee)',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
    ringStyle: 'active',
    label: '🇹🇭 Thailand 24h',
    cityKey: 'thailand',
  },
  {
    id: 'story_palaces',
    author: 'Royal Heritage',
    tag: 'HAVELI SUITE',
    title: 'Jaipur 18th-Century Haveli Suite',
    subtitle: '1.8h on Vande Bharat Express. Rooftop fort-view breakfast included.',
    oldPrice: '₹11,000',
    price: '₹4,800',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    ringStyle: 'jet',
    label: '🏰 Jaipur Haveli',
    cityKey: 'delhi',
  },
  {
    id: 'story_dubai',
    author: 'Emirates Flash',
    tag: 'DUBAI SHOPPING',
    title: 'Dubai 24h Express Visa & Hotel',
    subtitle: 'Downtown 4-star stay + visa guarantee. Flat ₹499 service fee.',
    oldPrice: '₹14,500',
    price: '₹6,800',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    ringStyle: 'fire',
    label: '🇦🇪 Dubai 24h',
    cityKey: 'dubai',
  },
  {
    id: 'story_bali',
    author: 'Tropical Escape',
    tag: 'BALI RESORT',
    title: 'Ubud Private Pool Bamboo Villa',
    subtitle: 'Free airport transfer + floating breakfast + e-VoA assistance.',
    oldPrice: '₹19,000',
    price: '₹8,999',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    ringStyle: 'active',
    label: '🌴 Bali Villa',
    cityKey: 'bali',
  },
];

interface StoriesCarouselProps {
  onSelectStory: (story: StoryItem) => void;
}

export default function StoriesCarousel({ onSelectStory }: StoriesCarouselProps) {
  return (
    <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar scroll-smooth py-1">
      {STORIES_DATA.map((story) => {
        let ringClass = 'story-ring-active';
        if (story.ringStyle === 'jet') ringClass = 'story-ring-jet';
        if (story.ringStyle === 'fire') ringClass = 'story-ring-fire';

        return (
          <button
            key={story.id}
            className="flex flex-col items-center space-y-1.5 cursor-pointer shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0084FF] rounded-2xl p-1 -m-1"
            onClick={() => onSelectStory(story)}
          >
            <div className="relative">
              <div className={`${ringClass} transition-transform duration-300 group-hover:scale-105 group-active:scale-90 shadow-sm`}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-0.5 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              {story.isHot && (
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#EB2026] text-[8px] font-black text-white rounded-full border border-white shadow-md animate-pulse">
                  HOT
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#0084FF] transition-colors duration-150 tracking-tight">
              {story.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
