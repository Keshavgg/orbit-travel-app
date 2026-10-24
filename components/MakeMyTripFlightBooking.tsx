'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Luggage, 
  Coffee, 
  Check, 
  Sparkles, 
  ChevronDown, 
  Filter, 
  User, 
  MapPin, 
  Calendar,
  X,
  Compass,
  Zap,
  Loader2,
  RotateCcw
} from 'lucide-react';
import FlightSearchBar from './FlightSearchBar';

export interface FlightOption {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  fromCity: string;
  fromCode: string;
  fromTerminal: string;
  toCity: string;
  toCode: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  mmtPrice: number;
  baggage: string;
  cabinBaggage: string;
  meal: string;
  cityKey: string;
  aircraft: string;
  logoColor: string;
}

const FALLBACK_FLIGHTS: FlightOption[] = [
  {
    id: 'f1',
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E 2135',
    fromCity: 'Delhi',
    fromCode: 'DEL',
    fromTerminal: 'T1D',
    toCity: 'Bangkok',
    toCode: 'BKK',
    toTerminal: 'Suvarnabhumi',
    departureTime: '06:15 AM',
    arrivalTime: '11:45 AM',
    duration: '4h 30m',
    stops: 'Non Stop',
    price: 3499,
    mmtPrice: 7850,
    baggage: '20 kg included',
    cabinBaggage: '7 kg',
    meal: 'Available on-board (₹250)',
    cityKey: 'thailand',
    aircraft: 'Airbus A321neo',
    logoColor: 'bg-[#001B94] text-white'
  },
  {
    id: 'f2',
    airline: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI 883',
    fromCity: 'Delhi',
    fromCode: 'DEL',
    fromTerminal: 'T3',
    toCity: 'Goa',
    toCode: 'GOI',
    toTerminal: 'Dabolim T1',
    departureTime: '09:30 AM',
    arrivalTime: '12:05 PM',
    duration: '2h 35m',
    stops: 'Non Stop',
    price: 3499,
    mmtPrice: 3899,
    baggage: '25 kg included',
    cabinBaggage: '8 kg',
    meal: 'Complimentary Hot Meals Included',
    cityKey: 'goa',
    aircraft: 'Airbus A320neo',
    logoColor: 'bg-[#EB2026] text-white'
  },
  {
    id: 'f3',
    airline: 'Vistara',
    airlineCode: 'UK',
    flightNumber: 'UK 981',
    fromCity: 'Delhi',
    fromCode: 'DEL',
    fromTerminal: 'T3',
    toCity: 'Bangkok',
    toCode: 'BKK',
    toTerminal: 'Suvarnabhumi',
    departureTime: '08:15 AM',
    arrivalTime: '02:05 PM',
    duration: '4h 20m',
    stops: 'Non Stop',
    price: 4400,
    mmtPrice: 8800,
    baggage: '30 kg included',
    cabinBaggage: '7 kg',
    meal: 'Gourmet 3-Course Meal Included',
    cityKey: 'thailand',
    aircraft: 'Boeing 787-9 Dreamliner',
    logoColor: 'bg-[#581845] text-white'
  }
];

const AIRLINE_LOGOS: Record<string, { code: string; color: string }> = {
  'IndiGo': { code: '6E', color: 'bg-[#001B94] text-white' },
  'Air India': { code: 'AI', color: 'bg-[#EB2026] text-white' },
  'Vistara': { code: 'UK', color: 'bg-[#581845] text-white' },
  'Akasa Air': { code: 'QP', color: 'bg-[#FF6600] text-white' },
  'SpiceJet': { code: 'SG', color: 'bg-[#D61F26] text-white' },
  'Emirates': { code: 'EK', color: 'bg-[#D71921] text-white' },
};

function getCityKeyFromCode(code: string): string {
  const c = (code || '').toUpperCase();
  if (c === 'GOI' || c === 'GOX') return 'goa';
  if (c === 'BKK' || c === 'DMK') return 'thailand';
  if (c === 'DXB') return 'dubai';
  if (c === 'DPS') return 'bali';
  if (c === 'SXR') return 'kashmir';
  if (c === 'JAI') return 'jaipur';
  if (c === 'BOM') return 'mumbai';
  return 'delhi';
}

interface MakeMyTripFlightBookingProps {
  onSearchFlights: (from: string, to: string) => void;
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
  activeCityKey?: string;
  renderGlobe?: React.ReactNode;
}

export default function MakeMyTripFlightBooking({
  onSearchFlights,
  onSelectToCart,
  onFocusCity,
  activeCityKey = 'goa',
  renderGlobe,
}: MakeMyTripFlightBookingProps) {
  const [flights, setFlights] = useState<FlightOption[]>(FALLBACK_FLIGHTS);
  const [totalFlights, setTotalFlights] = useState(520);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  // Search filter state - Defaults to Delhi (DEL) -> Bangkok (BKK) matching FlightSearchBar
  const [searchFromCity, setSearchFromCity] = useState('Delhi');
  const [searchFromCode, setSearchFromCode] = useState('DEL');
  const [searchToCity, setSearchToCity] = useState(
    activeCityKey === 'dubai' ? 'Dubai' : (activeCityKey === 'goa' ? 'Goa' : 'Bangkok')
  );
  const [searchToCode, setSearchToCode] = useState(
    activeCityKey === 'dubai' ? 'DXB' : (activeCityKey === 'goa' ? 'GOI' : 'BKK')
  );
  const [isFilteredRoute, setIsFilteredRoute] = useState(true);
  const flightResultsRef = useRef<HTMLDivElement>(null);

  const [filterStop, setFilterStop] = useState<'all' | 'nonstop'>('all');
  const [filterAirline, setFilterAirline] = useState<string>('all');
  const [selectedFlightForModal, setSelectedFlightForModal] = useState<FlightOption | null>(null);
  
  // Passenger Details
  const [passengerName, setPassengerName] = useState('Rahul Sharma');
  const [selectedSeat, setSelectedSeat] = useState('12A');

  useEffect(() => {
    fetchFlights();
  }, [filterStop, filterAirline, page, searchToCode, searchFromCode, isFilteredRoute]);

  // Sync destination if parent activeCityKey changes (e.g. from 3D Globe or top search)
  useEffect(() => {
    if (activeCityKey) {
      if (activeCityKey === 'thailand') {
        setSearchToCity('Bangkok');
        setSearchToCode('BKK');
        setIsFilteredRoute(true);
      } else if (activeCityKey === 'dubai') {
        setSearchToCity('Dubai');
        setSearchToCode('DXB');
        setIsFilteredRoute(true);
      } else if (activeCityKey === 'bali') {
        setSearchToCity('Bali');
        setSearchToCode('DPS');
        setIsFilteredRoute(true);
      } else if (activeCityKey === 'kashmir') {
        setSearchToCity('Srinagar');
        setSearchToCode('SXR');
        setIsFilteredRoute(true);
      } else if (activeCityKey === 'goa') {
        setSearchToCity('Goa');
        setSearchToCode('GOI');
        setIsFilteredRoute(true);
      }
    }
  }, [activeCityKey]);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAirline !== 'all') {
        params.append('airline', filterAirline);
      }
      if (filterStop === 'nonstop') {
        params.append('stops', 'Non-Stop');
      }
      if (isFilteredRoute && searchToCode) {
        params.append('dest_code', searchToCode);
        if (searchFromCode) {
          params.append('origin_code', searchFromCode);
        }
      }
      params.append('skip', String(page * 20));
      params.append('limit', '20');

      let res = await fetch(`/api/flights?${params.toString()}`);
      let data = res.ok ? await res.json() : null;

      // Fallback: If 0 flights for exact origin + dest, search by destination city name
      if (isFilteredRoute && (!data || !data.flights || data.flights.length === 0)) {
        const fallbackParams = new URLSearchParams();
        fallbackParams.append('search', searchToCity);
        if (filterAirline !== 'all') fallbackParams.append('airline', filterAirline);
        if (filterStop === 'nonstop') fallbackParams.append('stops', 'Non-Stop');
        fallbackParams.append('skip', String(page * 20));
        fallbackParams.append('limit', '20');
        const res2 = await fetch(`/api/flights?${fallbackParams.toString()}`);
        if (res2.ok) data = await res2.json();
      }

      if (data && data.flights && data.flights.length > 0) {
        setTotalFlights(data.total || data.flights.length);
        const mapped: FlightOption[] = data.flights.map((f: any) => {
          const logo = AIRLINE_LOGOS[f.airline] || { code: f.airline.slice(0, 2).toUpperCase(), color: 'bg-slate-800 text-white' };
          const fromCity = f.origin.split('(')[0].trim();
          const toCity = f.dest.split('(')[0].trim();
          return {
            id: String(f.id),
            airline: f.airline,
            airlineCode: logo.code,
            flightNumber: f.flight_num,
            fromCity,
            fromCode: f.origin_code || 'DEL',
            fromTerminal: 'T1D',
            toCity,
            toCode: f.dest_code || 'GOI',
            toTerminal: 'MOPA T1',
            departureTime: f.departure_time,
            arrivalTime: f.arrival_time,
            duration: f.duration,
            stops: f.stops,
            price: f.price,
            mmtPrice: f.original_price,
            baggage: f.baggage || '15 kg check-in',
            cabinBaggage: '7 kg',
            meal: f.cabin_class === 'Business' ? 'Complimentary Gourmet Hot Meals' : 'Pre-book Meals Available',
            cityKey: getCityKeyFromCode(f.dest_code),
            aircraft: 'Airbus A321neo / Boeing 737 MAX',
            logoColor: logo.color,
          };
        });
        setFlights(mapped);
        setLoading(false);
        return;
      } else {
        // Explicitly set 0 flights for unmatched route
        setTotalFlights(0);
        setFlights([]);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to fetch flights from FastAPI:', e);
    }
    setTotalFlights(0);
    setFlights([]);
    setLoading(false);
  };

  const handleInternalSearch = (fromCity: string, toCity: string, fromCode?: string, toCode?: string) => {
    setSearchFromCity(fromCity);
    setSearchToCity(toCity);
    if (fromCode) setSearchFromCode(fromCode);
    if (toCode) setSearchToCode(toCode);
    setIsFilteredRoute(true);
    setPage(0);
    onSearchFlights?.(fromCity, toCity);
    const targetKey = getCityKeyFromCode(toCode || '');
    onFocusCity?.(targetKey);

    // Scroll smoothly to results
    setTimeout(() => {
      flightResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleClearRouteFilter = () => {
    setIsFilteredRoute(false);
    setPage(0);
  };

  const handleBookFlightClick = (flight: FlightOption) => {
    setSelectedFlightForModal(flight);
    onFocusCity(flight.cityKey);
  };

  const handleConfirmSeatAndPay = () => {
    if (!selectedFlightForModal) return;
    onSelectToCart(
      `${selectedFlightForModal.airline} Flight (${selectedFlightForModal.fromCode} ➔ ${selectedFlightForModal.toCode}) - Seat: ${selectedSeat}`,
      `₹${selectedFlightForModal.price.toLocaleString()}`
    );
    setSelectedFlightForModal(null);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ── 1. PROMINENT MAKEMYTRIP LOCATION SEARCH BAR (FRONT & CENTER) ── */}
      <FlightSearchBar 
        onSearchFlights={handleInternalSearch} 
        selectedCityKey={activeCityKey}
        onFocusCity={onFocusCity}
        isLoading={loading}
      />

      {/* ── 2. TWO-COLUMN POWER SECTION: FLIGHT CARDS (LEFT) + 3D GLOBE (RIGHT) ── */}
      <div ref={flightResultsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-6">
        
        {/* Left Column: Filters & Flight Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Route Search Banner */}
          {isFilteredRoute ? (
            <div className="bg-gradient-to-r from-[#0084FF] to-indigo-700 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 font-black">
                  ✈️
                </div>
                <div>
                  <div className="text-base font-black flex items-center gap-2">
                    <span>{searchFromCity} ({searchFromCode}) ➔ {searchToCity} ({searchToCode})</span>
                    <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {totalFlights} Flights Found
                    </span>
                  </div>
                  <div className="text-xs text-white/80 font-medium">
                    Lowest fare locked · 15kg baggage included · Flat ₹0 convenience fee
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearRouteFilter}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Flights</span>
              </button>
            </div>
          ) : null}

          {/* Header & Filter Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#0084FF]" />
              <span className="font-extrabold text-slate-800">
                {totalFlights}+ Flights Live:
              </span>
              
              <button
                type="button"
                onClick={() => {
                  setFilterStop(filterStop === 'nonstop' ? 'all' : 'nonstop');
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-full border transition font-bold cursor-pointer ${
                  filterStop === 'nonstop'
                    ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Non-Stop Only
              </button>

              <select
                value={filterAirline}
                onChange={(e) => {
                  setFilterAirline(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 font-bold focus:outline-none focus:border-[#0084FF] cursor-pointer"
              >
                <option value="all">All Airlines (IndiGo, Air India, Emirates...)</option>
                <option value="IndiGo">IndiGo</option>
                <option value="Air India">Air India</option>
                <option value="Vistara">Vistara</option>
                <option value="SpiceJet">SpiceJet</option>
                <option value="Akasa Air">Akasa Air</option>
                <option value="Emirates">Emirates</option>
              </select>
            </div>

            <div className="text-emerald-700 font-extrabold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>₹0 Convenience Fee</span>
            </div>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-extrabold text-slate-700">
              Showing page {page + 1} ({flights.length} flights)
              {loading && <Loader2 className="w-3.5 h-3.5 inline ml-2 animate-spin text-[#0084FF]" />}
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * 20 >= totalFlights}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* Luxury White Boarding Passes */}
          <div className="space-y-4">
            {flights.length === 0 && !loading && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0084FF] flex items-center justify-center text-2xl mx-auto font-black">
                  ✈️
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    No Direct Flights Scheduled for {searchFromCity} ({searchFromCode}) ➔ {searchToCity} ({searchToCode})
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    We scanned 520+ flights across IndiGo, Emirates, Vistara, SpiceJet, and Air India. Check out these live high-demand routes:
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleInternalSearch('Delhi', 'Bangkok', 'DEL', 'BKK')}
                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0084FF] border border-blue-200 transition cursor-pointer"
                  >
                    ✈️ Delhi (DEL) ➔ Bangkok (BKK) · ₹3,102
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInternalSearch('Delhi', 'Goa', 'DEL', 'GOI')}
                    className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                  >
                    🏖️ Delhi (DEL) ➔ Goa (GOI) · ₹2,899
                  </button>
                  <button
                    type="button"
                    onClick={handleClearRouteFilter}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                  >
                    🌐 Show All 520+ Flights
                  </button>
                </div>
              </div>
            )}

            {flights.map((flight) => {
              const savings = flight.mmtPrice - flight.price;

              return (
                <div
                  key={flight.id}
                  className="boarding-pass flex flex-col sm:flex-row items-stretch justify-between group"
                >
                  {/* Ticket Notches at the perforations */}
                  <div className="hidden sm:block ticket-notch-top right-[240px]"></div>
                  <div className="hidden sm:block ticket-notch-bottom right-[240px]"></div>

                  {/* Main Flight Data: Left Column */}
                  <div 
                    className="p-5 flex-1 space-y-3 cursor-pointer"
                    onClick={() => onFocusCity(flight.cityKey)}
                  >
                    {/* Airline Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-xl ${flight.logoColor} flex items-center justify-center font-black text-xs shadow-sm`}>
                          {flight.airlineCode}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-sm tracking-tight">{flight.airline}</span>
                            <span className="text-[10px] font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {flight.flightNumber}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Aircraft: <span className="text-slate-700 font-semibold">{flight.aircraft}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {flight.stops}
                        </span>
                      </div>
                    </div>

                    {/* Timings */}
                    <div className="grid grid-cols-12 gap-2 items-center pt-1">
                      <div className="col-span-4 space-y-0.5">
                        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                          {flight.departureTime}
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <span className="text-[#0084FF] font-black">{flight.fromCode}</span>
                          <span className="truncate">• {flight.fromCity}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Terminal {flight.fromTerminal}</div>
                      </div>

                      <div className="col-span-4 flex flex-col items-center justify-center py-1">
                        <span className="text-[10px] font-bold text-slate-500">{flight.duration}</span>
                        <div className="w-full h-1 bg-slate-200 rounded-full relative my-1 overflow-hidden">
                          <div className="flight-beam"></div>
                        </div>
                        <div className="flex items-center space-x-1 text-[9px] text-slate-400 uppercase font-bold">
                          <Plane className="w-2.5 h-2.5 text-[#0084FF]" />
                          <span>Direct</span>
                        </div>
                      </div>

                      <div className="col-span-4 space-y-0.5 text-right">
                        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                          {flight.arrivalTime}
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                          <span className="text-[#0084FF] font-black">{flight.toCode}</span>
                          <span className="truncate">• {flight.toCity}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Terminal {flight.toTerminal}</div>
                      </div>
                    </div>

                    {/* Inclusions & AI Fare Radar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] text-slate-600 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          <Luggage className="w-3 h-3 text-[#0084FF]" /> {flight.baggage} + {flight.cabinBaggage} cabin
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          <Coffee className="w-3 h-3 text-amber-600" /> {flight.meal}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" /> AI Radar: Lowest fare · Buy Now
                      </span>
                    </div>
                  </div>

                  {/* Right Ticket Stub */}
                  <div className="p-5 sm:w-[240px] bg-slate-50/70 sm:border-l sm:border-dashed sm:border-slate-200 border-t sm:border-t-0 flex flex-col justify-between space-y-3 shrink-0">
                    <div className="space-y-1 text-right sm:text-left">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 line-through text-[10px]">
                          ₹{flight.mmtPrice.toLocaleString()} MMT
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          Save ₹{savings}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        ₹{flight.price.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Per Adult · Billed to GSTIN for ITC
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookFlightClick(flight)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 btn-press cursor-pointer"
                    >
                      <span>Lock Seat in 1-Tap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: 3D Interactive WebGL Globe (5 cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0084FF] flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> Live Flight Route Engine
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Visual 3D Trajectory
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0084FF] font-mono font-bold text-[10px]">
                WebGL 60FPS
              </span>
            </div>

            {/* Embedded 3D Globe with active flight line */}
            <div className="w-full h-[480px] rounded-2xl overflow-hidden shadow-inner border border-slate-100">
              {renderGlobe}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Interactive route simulation</span>
              <span className="text-[#0084FF] font-bold">Tap cities on globe to filter</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. PASSENGER & SEAT SELECTION MODAL ── */}
      {selectedFlightForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 text-slate-900 shadow-2xl border border-slate-200 modal-panel-enter relative">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                  Instant Boarding Pass Issuance
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedFlightForModal.airline} ({selectedFlightForModal.flightNumber})
                </h3>
                <div className="text-xs text-slate-500">
                  {selectedFlightForModal.fromCity} ({selectedFlightForModal.fromCode}) ➔ {selectedFlightForModal.toCity} ({selectedFlightForModal.toCode})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlightForModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Passenger Info */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Lead Passenger Name (As on Govt ID)</label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0084FF]"
              />

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Select Preferred Seat</label>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  {['12A (Window)', '12B (Middle)', '12C (Aisle)', '14A (Extra Legroom)'].map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setSelectedSeat(seat.split(' ')[0])}
                      className={`p-2.5 rounded-xl border transition ${
                        selectedSeat === seat.split(' ')[0]
                          ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] font-black'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {seat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inclusions Check */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>₹0 Convenience fee applied automatically</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <Check className="w-3.5 h-3.5 text-[#0084FF]" />
                <span>WhatsApp QR boarding pass delivered in 30 seconds</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total All-Inclusive Fare:</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  ₹{selectedFlightForModal.price.toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmSeatAndPay}
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
