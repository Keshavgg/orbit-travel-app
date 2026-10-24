'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Coffee, 
  Sparkles, 
  Utensils, 
  Wifi, 
  Flame, 
  X,
  Compass,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

export interface HotelProperty {
  id: string;
  name: string;
  location: string;
  distance: string;
  category: string;
  rating: string;
  reviewsCount: string;
  image: string;
  pricePerNight: number;
  oldPricePerNight: number;
  inclusions: string[];
  cityKey: string;
  badge?: string;
  roomTypes: {
    name: string;
    description: string;
    price: number;
  }[];
}

const FALLBACK_HOTELS: HotelProperty[] = [
  {
    id: 'h1',
    name: 'Rishikesh Ganga Riverfront Glamping & Luxury Retreat',
    location: 'Shivpuri, Rishikesh',
    distance: 'Right on the riverbank · Private beach access',
    category: 'LUXURY GLAMPING & RAFTING',
    rating: '4.9',
    reviewsCount: '1,240',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 3499,
    oldPricePerNight: 8500,
    badge: '🌊 Riverbank',
    inclusions: ['All 3 Buffet Meals (Breakfast, Lunch, Dinner)', '16km River Rafting with certified guide', 'Evening Bonfire & Live Acoustic Music', 'Free High-speed Wi-Fi'],
    cityKey: 'rishikesh',
    roomTypes: [
      { name: 'Luxury Swiss Air-Cooled Tent', description: 'River-facing veranda, plush double bed, attached washroom', price: 3499 },
      { name: 'Presidential River Cottage with Plunge Pool', description: 'Private deck overlooking the Ganges, bathtub, butler service', price: 5499 }
    ]
  },
  {
    id: 'h2',
    name: 'W Goa Luxury Beachfront Resort & Spa',
    location: 'Vagator Beach, Goa',
    distance: 'Direct access to Vagator Beach · Chapora Fort view',
    category: '5-STAR BEACHFRONT LUXURY',
    rating: '4.8',
    reviewsCount: '3,410',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 11999,
    oldPricePerNight: 22000,
    badge: '⭐ 5-Star Luxury',
    inclusions: ['Sumptuous Buffet Breakfast at The Kitchen Table', 'Access to Rock Pool Sunset Deck', 'FIT Gym & Spa discounts', 'Zero cancellation fee up to 48h'],
    cityKey: 'goa',
    roomTypes: [
      { name: 'Wonderful King Room with Balcony', description: 'Tropical garden view, plush king bed, deep soaking tub', price: 11999 },
      { name: 'WOW Ocean Villa with Private Plunge Pool', description: 'Direct ocean view, private sun loungers & deck', price: 21500 }
    ]
  },
  {
    id: 'h3',
    name: 'Samode Palace & Royal Haveli',
    location: 'Samode, Jaipur',
    distance: '35 mins from Jaipur City · 475-year-old regal fort',
    category: 'ROYAL HERITAGE PALACE',
    rating: '4.9',
    reviewsCount: '2,150',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    pricePerNight: 7499,
    oldPricePerNight: 14000,
    badge: '👑 Royal Heritage',
    inclusions: ['Royal Rajasthani Thali Dinner included', 'Traditional Folk Dance & Puppet Show', 'Heated infinity rooftop pool', 'Heritage Fort Walking Tour'],
    cityKey: 'jaipur',
    roomTypes: [
      { name: 'Royal Heritage Deluxe Room', description: 'Hand-painted fresco ceilings, antique four-poster bed', price: 7499 },
      { name: 'Maharaja Suite with Private Courtyard', description: 'Historical royal suite with marble bath & courtyard', price: 12500 }
    ]
  }
];

const PROPERTY_TYPES = [
  'All Types',
  'Private Pool Villa',
  'Luxury Glamping',
  '5-Star Resort',
  'Royal Palace',
  'Boutique Hotel',
];

interface MakeMyTripHotelBookingProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
}

export default function MakeMyTripHotelBooking({
  onSelectToCart,
  onFocusCity,
}: MakeMyTripHotelBookingProps) {
  const [hotels, setHotels] = useState<HotelProperty[]>(FALLBACK_HOTELS);
  const [totalCount, setTotalCount] = useState(520);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [page, setPage] = useState(0);

  const [selectedProperty, setSelectedProperty] = useState<HotelProperty | null>(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('24 Oct 2026');
  const [checkOutDate, setCheckOutDate] = useState('26 Oct 2026 (2 Nights)');
  const [guestName, setGuestName] = useState('Rahul Sharma');

  useEffect(() => {
    fetchHotels();
  }, [selectedDestination, selectedType, searchQuery, page]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDestination !== 'All') {
        params.append('city', selectedDestination.toLowerCase());
      }
      if (selectedType !== 'All Types') {
        params.append('property_type', selectedType);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      params.append('skip', String(page * 36));
      params.append('limit', '36');

      const res = await fetch(`/api/hotels?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTotalCount(data.total || 520);
        if (data.hotels && data.hotels.length > 0) {
          const mapped: HotelProperty[] = data.hotels.map((h: any) => ({
            id: String(h.id),
            name: h.name,
            location: h.location,
            distance: `${h.property_type} · ${h.badge || 'Verified Stay'}`,
            category: h.property_type.toUpperCase(),
            rating: String(h.rating),
            reviewsCount: `${h.review_count || 320}`,
            image: h.image,
            pricePerNight: h.price_per_night,
            oldPricePerNight: h.original_price,
            badge: h.badge,
            inclusions: h.amenities && h.amenities.length > 0 ? h.amenities.slice(0, 4) : [
              'Complimentary Breakfast',
              'Fast Wi-Fi',
              'Air Conditioning',
              'Zero Cancellation Fee'
            ],
            cityKey: h.city_key,
            roomTypes: [
              {
                name: 'Deluxe Room / Suite',
                description: 'King bed, garden/mountain view, complimentary buffet breakfast',
                price: h.price_per_night
              },
              {
                name: 'Premium Luxury Pool Suite',
                description: 'Private plunge pool, bathtub, airport transfers included',
                price: Math.round(h.price_per_night * 1.45)
              }
            ]
          }));
          setHotels(mapped);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch hotels from FastAPI:', e);
    }
    setHotels(FALLBACK_HOTELS);
    setLoading(false);
  };

  const filteredHotels = hotels.filter((h) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (h.pricePerNight > maxPrice) return false;
    return true;
  });

  const handleBookRoom = (hotel: HotelProperty) => {
    setSelectedProperty(hotel);
    setSelectedRoomIndex(0);
    onFocusCity(hotel.cityKey);
  };

  const handleConfirmBooking = () => {
    if (!selectedProperty) return;
    const room = selectedProperty.roomTypes[selectedRoomIndex] || selectedProperty.roomTypes[0];
    onSelectToCart(
      `${selectedProperty.name} (${room.name}) - ${checkOutDate}`,
      `₹${room.price.toLocaleString()}`
    );
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. MMT-Style Stays Search Cockpit */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-extrabold shadow-sm">
              🏨 Curated Stays &amp; Villas ({totalCount}+ Properties)
            </span>
            <span className="text-emerald-700 font-extrabold hidden sm:inline">
              ✓ 100% Verified · Zero Hidden Resort Fees · Direct ITC Invoices
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Live availability synced with FastAPI SQLite Database
          </div>
        </div>

        {/* Search Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Destination */}
          <div className="lg:col-span-4 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
              <span>City / Destination</span>
              <MapPin className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <select
              value={selectedDestination}
              onChange={(e) => {
                setSelectedDestination(e.target.value);
                setPage(0);
                if (e.target.value !== 'All') {
                  onFocusCity(e.target.value);
                }
              }}
              className="w-full bg-transparent font-extrabold text-slate-900 text-sm focus:outline-none cursor-pointer mt-1"
            >
              <option value="All">All 520+ Destinations</option>
              <option value="goa">Goa (Candolim, Vagator, Morjim)</option>
              <option value="rishikesh">Rishikesh (Ganges Valley, Tapovan)</option>
              <option value="jaipur">Jaipur (Royal Havelis &amp; Palaces)</option>
              <option value="mumbai">Mumbai (Bandra, Juhu Beach)</option>
              <option value="kashmir">Kashmir (Dal Lake Houseboats &amp; Gulmarg)</option>
              <option value="dubai">Dubai (Downtown &amp; Marina Penthouses)</option>
              <option value="thailand">Thailand (Phuket &amp; Krabi Beachfront)</option>
              <option value="bali">Bali (Seminyak &amp; Ubud Forest Villas)</option>
            </select>
          </div>

          {/* Search keyword input */}
          <div className="lg:col-span-5 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
              <span>Search Stay Name or Feature</span>
              <Search className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 'Private Pool', 'Beachfront', 'Camp', 'Havelis'..."
              className="w-full bg-transparent font-extrabold text-slate-900 text-sm focus:outline-none mt-1 placeholder-slate-400"
            />
          </div>

          {/* Price Range Slider */}
          <div className="lg:col-span-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
              <span>Max Budget: ₹{maxPrice.toLocaleString()}</span>
              <Filter className="w-3.5 h-3.5 text-[#0084FF]" />
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full mt-2 accent-[#0084FF] cursor-pointer"
            />
          </div>
        </div>

        {/* Property Type Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-1 text-xs font-bold">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 shrink-0">Filter Type:</span>
          {PROPERTY_TYPES.map((type) => {
            const active = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  active
                    ? 'bg-[#0E1A3A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-extrabold text-slate-800">
          Showing {filteredHotels.length} Stays {selectedDestination !== 'All' ? `in ${selectedDestination.toUpperCase()}` : ''}
          {loading && <Loader2 className="w-4 h-4 inline ml-2 animate-spin text-[#0084FF]" />}
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold hover:bg-slate-50"
          >
            ← Previous
          </button>
          <span className="font-mono text-slate-500 font-bold">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * 24 >= totalCount}
            className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold hover:bg-slate-50"
          >
            Next →
          </button>
        </div>
      </div>

      {/* 2. Hotel Property Listings in Clean White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="fs-card p-5 space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              {/* Photo & Rating Pill */}
              <div 
                className="relative rounded-2xl overflow-hidden h-52 cursor-pointer"
                onClick={() => onFocusCity(hotel.cityKey)}
              >
                <img 
                  src={hotel.image} 
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-extrabold text-slate-800 shadow-md">
                  {hotel.badge || hotel.category}
                </span>

                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-300" /> {hotel.rating} ({hotel.reviewsCount})
                </span>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0084FF] transition-colors tracking-tight leading-snug line-clamp-1">
                  {hotel.name}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0084FF] shrink-0" />
                  <span className="truncate">{hotel.location}</span>
                </div>
              </div>

              {/* Inclusions List */}
              <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-700">
                {hotel.inclusions.slice(0, 3).map((inc, idx) => (
                  <div key={idx} className="flex items-center space-x-2 truncate">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span className="truncate">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Book Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 line-through font-mono">
                  ₹{hotel.oldPricePerNight.toLocaleString()}
                </div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  ₹{hotel.pricePerNight.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal">/ night</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">GST Billed · Free Cancellation</div>
              </div>

              <button
                onClick={() => handleBookRoom(hotel)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition flex items-center gap-1.5 btn-press"
              >
                <span>Book Stay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 3. Room Category Selector Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 text-slate-900 shadow-2xl border border-slate-200 modal-panel-enter relative my-auto max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0084FF] bg-blue-50 px-2.5 py-0.5 rounded">
                  {selectedProperty.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedProperty.name}
                </h3>
                <div className="text-xs text-slate-500">{selectedProperty.location}</div>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room Options */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">Choose Room Category:</div>
              {selectedProperty.roomTypes.map((room, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRoomIndex(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedRoomIndex === idx
                      ? 'border-[#0084FF] bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{room.name}</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      ₹{room.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ night</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{room.description}</p>
                </div>
              ))}
            </div>

            {/* Guest Info */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Primary Guest Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0084FF]"
              />
            </div>

            {/* Confirm Button */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Selected Room Rate:</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  ₹{selectedProperty.roomTypes[selectedRoomIndex]?.price.toLocaleString()}
                </div>
              </div>
              <button
                onClick={handleConfirmBooking}
                className="px-6 py-3 rounded-xl bg-[#0084FF] hover:bg-[#0070db] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 transition flex items-center gap-2 btn-press cursor-pointer"
              >
                <span>Add to Cart &amp; Book</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
