'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Calendar, 
  Users, 
  Plane, 
  Check, 
  ChevronDown, 
  Search, 
  ShieldCheck,
  Sparkles,
  MapPin,
  X,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';

export interface AirportItem {
  code: string;
  city: string;
  airport: string;
  cityKey: string;
  country: string;
}

export const AIRPORTS: AirportItem[] = [
  { code: 'DEL', city: 'Delhi', airport: 'DEL, Indira Gandhi Intl Airport T1/T2/T3', cityKey: 'delhi', country: 'India' },
  { code: 'BOM', city: 'Mumbai', airport: 'BOM, Chhatrapati Shivaji Intl T1/T2', cityKey: 'mumbai', country: 'India' },
  { code: 'BLR', city: 'Bengaluru', airport: 'BLR, Kempegowda Intl Airport T1/T2', cityKey: 'delhi', country: 'India' },
  { code: 'GOI', city: 'Goa', airport: 'GOI / GOX, Dabolim & MOPA Intl Airport', cityKey: 'goa', country: 'India' },
  { code: 'BKK', city: 'Bangkok', airport: 'BKK, Suvarnabhumi Airport (Thailand)', cityKey: 'thailand', country: 'Thailand' },
  { code: 'DXB', city: 'Dubai', airport: 'DXB, Dubai International Airport T1/T3', cityKey: 'dubai', country: 'UAE' },
  { code: 'DPS', city: 'Bali', airport: 'DPS, Ngurah Rai Denpasar (Indonesia)', cityKey: 'bali', country: 'Indonesia' },
  { code: 'SXR', city: 'Srinagar (Kashmir)', airport: 'SXR, Sheikh ul-Alam Intl Airport', cityKey: 'kashmir', country: 'India' },
  { code: 'JAI', city: 'Jaipur', airport: 'JAI, Jaipur International Airport', cityKey: 'jaipur', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', airport: 'HYD, Rajiv Gandhi Intl Airport', cityKey: 'delhi', country: 'India' },
  { code: 'MAA', city: 'Chennai', airport: 'MAA, Chennai International Airport', cityKey: 'delhi', country: 'India' },
  { code: 'CCU', city: 'Kolkata', airport: 'CCU, Netaji Subhash Chandra Bose Intl', cityKey: 'delhi', country: 'India' },
];

export interface FlightSearchBarProps {
  onSearchFlights: (fromCity: string, toCity: string, fromCode?: string, toCode?: string) => void;
  selectedCityKey?: string;
  onFocusCity?: (cityKey: string) => void;
  isLoading?: boolean;
}

export default function FlightSearchBar({ 
  onSearchFlights,
  selectedCityKey,
  onFocusCity,
  isLoading = false
}: FlightSearchBarProps) {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip' | 'multicity'>('oneway');
  const [fromAirport, setFromAirport] = useState<AirportItem>(AIRPORTS[0]); // Delhi DEL
  const [toAirport, setToAirport] = useState<AirportItem>(AIRPORTS[4]); // Default Bangkok BKK or Goa
  
  // Date State
  const [depDate, setDepDate] = useState('24 Oct 2026');
  const [depDay, setDepDay] = useState('Saturday');
  const [returnDate, setReturnDate] = useState('28 Oct 2026');
  const [returnDay, setReturnDay] = useState('Wednesday');

  // Travellers & Class State
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business'>('Economy');

  // Dropdown States
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTravellersOpen, setIsTravellersOpen] = useState(false);

  // Search keyword inside dropdowns
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');

  const [specialFare, setSpecialFare] = useState<'regular' | 'student' | 'senior' | 'armed' | 'corporate'>('regular');
  const [isSwapping, setIsSwapping] = useState(false);

  // Sync toAirport when selectedCityKey changes externally
  useEffect(() => {
    if (selectedCityKey) {
      const match = AIRPORTS.find(a => a.cityKey === selectedCityKey);
      if (match && match.code !== fromAirport.code) {
        setToAirport(match);
      }
    }
  }, [selectedCityKey]);

  const handleSwap = () => {
    setIsSwapping(true);
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
    setTimeout(() => setIsSwapping(false), 300);
    onFocusCity?.(temp.cityKey);
    onSearchFlights(toAirport.city, temp.city, toAirport.code, temp.code);
  };

  const handleSelectFrom = (apt: AirportItem) => {
    setFromAirport(apt);
    setIsFromOpen(false);
    setFromSearch('');
    // Instant search on origin change
    onSearchFlights(apt.city, toAirport.city, apt.code, toAirport.code);
  };

  const handleSelectTo = (apt: AirportItem) => {
    setToAirport(apt);
    setIsToOpen(false);
    setToSearch('');
    onFocusCity?.(apt.cityKey);
    // Instant search on selection
    onSearchFlights(fromAirport.city, apt.city, fromAirport.code, apt.code);
  };

  const handleTriggerSearch = () => {
    onSearchFlights(fromAirport.city, toAirport.city, fromAirport.code, toAirport.code);
  };

  // Filtered airport lists
  const filteredFromAirports = AIRPORTS.filter(a => {
    if (!fromSearch) return true;
    const q = fromSearch.toLowerCase();
    return a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.airport.toLowerCase().includes(q);
  });

  const filteredToAirports = AIRPORTS.filter(a => {
    if (!toSearch) return true;
    const q = toSearch.toLowerCase();
    return a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.airport.toLowerCase().includes(q);
  });

  return (
    <div className="relative z-30 select-none">
      {/* ── MakeMyTrip Authentic White Elevated Location Search Bar Card ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/10 border border-slate-200 space-y-6">
        
        {/* Top Header: Trip Types Radio & Zero Convenience Fee Guarantee */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm font-extrabold text-slate-700">
            <button
              type="button"
              onClick={() => setTripType('oneway')}
              className="flex items-center space-x-2 group cursor-pointer"
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                tripType === 'oneway' ? 'border-[#0084FF] bg-[#0084FF]' : 'border-slate-300'
              }`}>
                {tripType === 'oneway' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <span className={tripType === 'oneway' ? 'text-slate-900 font-black' : 'text-slate-600'}>One Way</span>
            </button>

            <button
              type="button"
              onClick={() => setTripType('roundtrip')}
              className="flex items-center space-x-2 group cursor-pointer"
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                tripType === 'roundtrip' ? 'border-[#0084FF] bg-[#0084FF]' : 'border-slate-300'
              }`}>
                {tripType === 'roundtrip' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <span className={tripType === 'roundtrip' ? 'text-slate-900 font-black' : 'text-slate-600'}>Round Trip</span>
            </button>

            <button
              type="button"
              onClick={() => setTripType('multicity')}
              className="flex items-center space-x-2 group cursor-pointer"
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                tripType === 'multicity' ? 'border-[#0084FF] bg-[#0084FF]' : 'border-slate-300'
              }`}>
                {tripType === 'multicity' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <span className={tripType === 'multicity' ? 'text-slate-900 font-black' : 'text-slate-600'}>Multi City</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium hidden md:flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Book International &amp; Domestic Flights with <strong className="text-emerald-700">₹0 Convenience Fee</strong></span>
          </div>
        </div>

        {/* ── Segmented Location Flight Input Grid: FROM ➔ SWAP ➔ TO ➔ DATES ➔ TRAVELLERS ── */}
        <div className="border border-slate-200 rounded-2xl overflow-visible grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/50 relative">
          
          {/* FROM City Box */}
          <div 
            className="md:col-span-3 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer relative group rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
            onClick={() => {
              setIsFromOpen(!isFromOpen);
              setIsToOpen(false);
              setIsDateOpen(false);
              setIsTravellersOpen(false);
            }}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>From</span>
              <span className="text-[10px] text-blue-600 group-hover:underline font-extrabold flex items-center gap-0.5">
                Change <ChevronDown className="w-3 h-3" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-baseline gap-2">
              <span>{fromAirport.city}</span>
              <span className="text-xs font-mono font-bold text-[#0084FF]">{fromAirport.code}</span>
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {fromAirport.airport}
            </div>

            {/* Dropdown Menu with Search */}
            {isFromOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Select Origin Airport</span>
                  <button onClick={() => setIsFromOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Search input */}
                <div className="relative my-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fromSearch}
                    onChange={(e) => setFromSearch(e.target.value)}
                    placeholder="Search city or code (e.g. DEL, BOM, GOI)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0084FF]"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {filteredFromAirports.map((apt) => (
                    <button
                      key={apt.code}
                      onClick={() => handleSelectFrom(apt)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                        fromAirport.code === apt.code ? 'bg-blue-50 text-[#0084FF]' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>{apt.city}</span>
                          <span className="text-[10px] font-mono text-[#0084FF] bg-blue-100/50 px-1 rounded">{apt.code}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal truncate max-w-[200px]">{apt.airport}</div>
                      </div>
                      {fromAirport.code === apt.code && <Check className="w-4 h-4 text-[#0084FF] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button (Floating Circle) */}
          <div className="relative md:w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSwap();
              }}
              title="Swap Origin and Destination"
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#0084FF] hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all duration-200 ${
                isSwapping ? 'rotate-180' : ''
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO City Box */}
          <div 
            className="md:col-span-3 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer relative group"
            onClick={() => {
              setIsToOpen(!isToOpen);
              setIsFromOpen(false);
              setIsDateOpen(false);
              setIsTravellersOpen(false);
            }}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>To</span>
              <span className="text-[10px] text-blue-600 group-hover:underline font-extrabold flex items-center gap-0.5">
                Change <ChevronDown className="w-3 h-3" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-baseline gap-2">
              <span>{toAirport.city}</span>
              <span className="text-xs font-mono font-bold text-[#0084FF]">{toAirport.code}</span>
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {toAirport.airport}
            </div>

            {/* Dropdown Menu with Search */}
            {isToOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Select Destination Airport</span>
                  <button onClick={() => setIsToOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search input */}
                <div className="relative my-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                    placeholder="Search city (e.g. Bangkok BKK, Goa, Dubai)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0084FF]"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {filteredToAirports.map((apt) => (
                    <button
                      key={apt.code}
                      onClick={() => handleSelectTo(apt)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                        toAirport.code === apt.code ? 'bg-blue-50 text-[#0084FF]' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>{apt.city}</span>
                          <span className="text-[10px] font-mono text-[#0084FF] bg-blue-100/50 px-1 rounded">{apt.code}</span>
                          <span className="text-[9px] text-slate-400 font-normal">({apt.country})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal truncate max-w-[200px]">{apt.airport}</div>
                      </div>
                      {toAirport.code === apt.code && <Check className="w-4 h-4 text-[#0084FF] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DEPARTURE Date Box */}
          <div 
            className="md:col-span-2 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer group relative"
            onClick={() => {
              setIsDateOpen(!isDateOpen);
              setIsFromOpen(false);
              setIsToOpen(false);
              setIsTravellersOpen(false);
            }}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Departure</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {depDate.split(' ')[0]} <span className="text-base font-bold text-slate-700">{depDate.split(' ')[1]}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              {depDay}
            </div>

            {/* Quick Date Selector Popup */}
            {isDateOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Select Departure Date</div>
                <div className="space-y-1 text-xs font-bold">
                  {[
                    { label: 'Today (24 Oct 2026)', day: 'Saturday' },
                    { label: 'Tomorrow (25 Oct 2026)', day: 'Sunday' },
                    { label: 'This Weekend (26 Oct 2026)', day: 'Monday' },
                    { label: 'Next Weekend (31 Oct 2026)', day: 'Saturday' },
                    { label: 'Next Month (15 Nov 2026)', day: 'Sunday' },
                  ].map((d) => (
                    <button
                      key={d.label}
                      onClick={() => {
                        setDepDate(d.label.split('(')[1].replace(')', ''));
                        setDepDay(d.day);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-[#0084FF] transition"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RETURN Date Box */}
          <div 
            className="md:col-span-2 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer group"
            onClick={() => {
              if (tripType !== 'roundtrip') {
                setTripType('roundtrip');
              }
            }}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Return</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>
            {tripType === 'roundtrip' ? (
              <>
                <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {returnDate.split(' ')[0]} <span className="text-base font-bold text-slate-700">{returnDate.split(' ')[1]}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {returnDay}
                </div>
              </>
            ) : (
              <div className="mt-2 text-xs text-slate-400 font-medium leading-tight">
                Tap to add return for <span className="text-emerald-600 font-bold">₹1,500 extra savings</span>
              </div>
            )}
          </div>

          {/* TRAVELLERS & CABIN CLASS */}
          <div 
            className="md:col-span-2 p-4 bg-white hover:bg-blue-50/40 transition cursor-pointer group relative rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none"
            onClick={() => {
              setIsTravellersOpen(!isTravellersOpen);
              setIsFromOpen(false);
              setIsToOpen(false);
              setIsDateOpen(false);
            }}
          >
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Travellers &amp; Class</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {adults + children} <span className="text-base font-bold text-slate-700">Traveller{adults + children > 1 ? 's' : ''}</span>
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {cabinClass}
            </div>

            {/* Travellers & Cabin Class Selector Popup */}
            {isTravellersOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-fade-in space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-900">Select Travellers</span>
                  <button onClick={() => setIsTravellersOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Adults Counter */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900">Adults</div>
                    <div className="text-[10px] text-slate-400">12+ years</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm w-4 text-center">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(9, adults + 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Children Counter */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900">Children</div>
                    <div className="text-[10px] text-slate-400">2-12 years</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm w-4 text-center">{children}</span>
                    <button
                      onClick={() => setChildren(Math.min(6, children + 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Cabin Class */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Cabin Class</span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    {(['Economy', 'Premium Economy', 'Business'] as const).map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setCabinClass(cls)}
                        className={`py-1.5 px-1 text-[11px] rounded-lg border transition ${
                          cabinClass === cls
                            ? 'border-[#0084FF] bg-blue-50 text-[#0084FF]'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {cls.replace(' Economy', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsTravellersOpen(false)}
                  className="w-full py-2 bg-[#0084FF] text-white text-xs font-black rounded-xl hover:bg-blue-600 transition"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Special Fares Radio Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="font-extrabold text-slate-700 text-xs mr-1">Select a special fare:</span>

            <button
              type="button"
              onClick={() => setSpecialFare('regular')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 ${
                specialFare === 'regular'
                  ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>Regular Fares</span>
            </button>

            <button
              type="button"
              onClick={() => setSpecialFare('student')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 ${
                specialFare === 'student'
                  ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>Student Fares</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">+10kg Bags</span>
            </button>

            <button
              type="button"
              onClick={() => setSpecialFare('senior')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 ${
                specialFare === 'senior'
                  ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>Senior Citizen</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Up to ₹600 Off</span>
            </button>

            <button
              type="button"
              onClick={() => setSpecialFare('armed')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 ${
                specialFare === 'armed'
                  ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>Armed Forces</span>
            </button>

            <button
              type="button"
              onClick={() => setSpecialFare('corporate')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 ${
                specialFare === 'corporate'
                  ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>Corporate / myBiz</span>
              <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-black">18% ITC</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Centered SEARCH FLIGHTS Button (Iconic MakeMyTrip Style) */}
      <div className="flex justify-center -mt-6 mb-3 relative z-30">
        <button
          type="button"
          onClick={handleTriggerSearch}
          disabled={isLoading}
          className="px-14 py-4 rounded-full bg-gradient-to-r from-[#0084FF] via-[#0066CC] to-[#004B99] hover:from-[#0070db] hover:to-[#003d80] active:scale-95 text-white font-black text-lg tracking-wider uppercase shadow-2xl shadow-blue-600/50 hover:shadow-blue-500/70 transition-all duration-200 flex items-center gap-3 btn-press group cursor-pointer disabled:opacity-80 border-2 border-white/80 ring-4 ring-blue-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>SEARCHING FLIGHTS...</span>
            </>
          ) : (
            <>
              <span>SEARCH FLIGHTS</span>
              <ArrowLeftRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
