'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PlannrScreen,
  PlannrTrip,
  PlannrTripDay,
  PlannrTripStop,
  PlannrTripMember,
  PlannrPoll,
} from '@/components/plannr/types';

export interface MatchedTraveler {
  id: string;
  name: string;
  city: string;
  match_pct: number;
  trips_count: number;
  interests: string[];
  date_flexibility: string;
  invited: boolean;
}

export interface PlannrContextType {
  currentScreen: PlannrScreen;
  navigate: (screen: PlannrScreen, data?: any) => void;
  goBack: () => void;
  activeTrip: PlannrTrip;
  activeDayNumber: number;
  setActiveDayNumber: (day: number) => void;
  isLoading: boolean;
  refreshTrip: () => Promise<void>;

  // Actions
  addStop: (stopData: {
    time_slot: string;
    place_name: string;
    subtitle?: string;
    category: string;
    price: number;
    day_number?: number;
  }) => Promise<boolean>;
  regenerateDayStops: (dayNumber: number) => Promise<boolean>;
  voteOnPoll: (optionId: string) => Promise<boolean>;
  inviteTravelerMember: (travelerId?: string, name?: string) => Promise<boolean>;
  requestPaymentShares: () => Promise<number>;
  payMyShare: (paymentMethod?: string) => Promise<any>;
  reserveTableStop: (stopId: string, restaurantName: string) => Promise<boolean>;

  // Matched travelers
  matchedTravelers: MatchedTraveler[];

  // Modals & Drawers
  isAddStopModalOpen: boolean;
  setIsAddStopModalOpen: (open: boolean) => void;
  isGroupChatOpen: boolean;
  setIsGroupChatOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  isBookingConfirmedModalOpen: boolean;
  setIsBookingConfirmedModalOpen: (open: boolean) => void;
  lastPaymentReceipt: any;

  // Toast notifications
  toastMessage: string | null;
  toastType: 'success' | 'info' | 'error';
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Pixel-perfect default data matching Page 4, 5, 6
const DEFAULT_BALI_TRIP: PlannrTrip = {
  id: 'trip_bali_boys',
  title: 'Bali with the boys',
  destination: 'Bali',
  start_date: '12 Nov',
  end_date: '18 Nov',
  total_days: 7,
  budget_per_person: 52400,
  total_budget: 190400,
  currency: 'INR',
  status: 'active',
  days: [
    {
      id: 'day_1_ubud',
      day_number: 1,
      day_title: 'Day 1 · Ubud',
      summary: 'Sunrise terraces, vegan brunch, holy water ritual & sunset walk',
      stops: [
        {
          id: 'stop_tegallalang',
          time_slot: '07:30',
          place_name: 'Tegallalang Rice Terrace',
          subtitle: 'Sunrise walk · 2 hrs · from the reel',
          category: 'Activity',
          price_per_person: 1200,
          is_booked: true,
          is_reserve_only: false,
          is_from_reel: true,
          booking_ref: 'PLN-UB-771',
        },
        {
          id: 'stop_zest',
          time_slot: '10:30',
          place_name: 'Brunch · Zest Café',
          subtitle: 'Vegan bowls · ₹900 for 2 · 12 min drive',
          category: 'Food',
          price_per_person: 900,
          is_booked: false,
          is_reserve_only: true,
          is_from_reel: true,
        },
        {
          id: 'stop_tirta',
          time_slot: '13:00',
          place_name: 'Tirta Empul Temple',
          subtitle: 'Water purification · sarong provided',
          category: 'Culture',
          price_per_person: 400,
          is_booked: false,
          is_reserve_only: false,
          is_from_reel: true,
        },
        {
          id: 'stop_campuhan',
          time_slot: '18:00',
          place_name: 'Campuhan Ridge sunset',
          subtitle: 'Easy walk · free · 1.5 hrs',
          category: 'Activity',
          price_per_person: 0,
          is_booked: true,
          is_reserve_only: false,
          is_from_reel: true,
        },
      ],
    },
    {
      id: 'day_2_kintamani',
      day_number: 2,
      day_title: 'Day 2 · Kintamani',
      summary: 'Mount Batur sunrise jeep trek and natural hot springs',
      stops: [
        {
          id: 'stop_batur',
          time_slot: '04:00',
          place_name: 'Mount Batur Sunrise Jeep Trek',
          subtitle: 'Black lava trail · hot breakfast at summit',
          category: 'Activity',
          price_per_person: 3500,
          is_booked: true,
          is_reserve_only: false,
        },
        {
          id: 'stop_springs',
          time_slot: '09:30',
          place_name: 'Toya Devasya Hot Springs',
          subtitle: 'Lakeside thermal infinity pools · 2 hrs',
          category: 'Activity',
          price_per_person: 1500,
          is_booked: false,
          is_reserve_only: false,
        },
        {
          id: 'stop_akasa',
          time_slot: '13:00',
          place_name: 'Akasa Specialty Coffee',
          subtitle: 'Panoramic caldera view lunch · 1.5 hrs',
          category: 'Food',
          price_per_person: 850,
          is_booked: false,
          is_reserve_only: true,
        },
      ],
    },
    {
      id: 'day_3_nusa',
      day_number: 3,
      day_title: 'Day 3 · Nusa Penida',
      summary: 'Kelingking cliff viewpoint & Manta Bay snorkeling',
      stops: [
        {
          id: 'stop_speed_boat',
          time_slot: '07:00',
          place_name: 'Sanur to Nusa Penida Fast Boat',
          subtitle: 'Reserved return ticket · 45 mins',
          category: 'Activity',
          price_per_person: 1800,
          is_booked: true,
          is_reserve_only: false,
        },
        {
          id: 'stop_kelingking',
          time_slot: '10:00',
          place_name: 'Kelingking T-Rex Cliff',
          subtitle: 'Iconic turquoise bay viewpoint · 2 hrs',
          category: 'Culture',
          price_per_person: 300,
          is_booked: true,
          is_reserve_only: false,
        },
        {
          id: 'stop_snorkelling',
          time_slot: '13:30',
          place_name: 'Manta Point Snorkeling',
          subtitle: 'Swim with giant manta rays · gear included',
          category: 'Activity',
          price_per_person: 2400,
          is_booked: false,
          is_reserve_only: false,
        },
      ],
    },
    {
      id: 'day_4_seminyak',
      day_number: 4,
      day_title: 'Day 4 · Seminyak',
      summary: 'Beach clubs, surfing lessons & sunset lounge',
      stops: [
        {
          id: 'stop_surf',
          time_slot: '08:30',
          place_name: 'Rip Curl Surf School',
          subtitle: 'Beginner waves at Double Six Beach · 2 hrs',
          category: 'Activity',
          price_per_person: 2200,
          is_booked: true,
          is_reserve_only: false,
        },
        {
          id: 'stop_revolver',
          time_slot: '12:00',
          place_name: 'Revolver Espresso Seminyak',
          subtitle: 'Artisanal cold brew & gourmet toast',
          category: 'Food',
          price_per_person: 700,
          is_booked: false,
          is_reserve_only: true,
        },
        {
          id: 'stop_potato_head',
          time_slot: '16:30',
          place_name: 'Potato Head Beach Club',
          subtitle: 'Daybed booking · beachfront sunset',
          category: 'Food',
          price_per_person: 3500,
          is_booked: false,
          is_reserve_only: true,
        },
      ],
    },
    {
      id: 'day_5_uluwatu',
      day_number: 5,
      day_title: 'Day 5 · Uluwatu',
      summary: 'Clifftop temple, Kecak fire dance & Jimbaran seafood',
      stops: [
        {
          id: 'stop_single_fin',
          time_slot: '11:00',
          place_name: 'Single Fin Clifftop Bar',
          subtitle: 'Suluban surfer viewpoint & lunch',
          category: 'Food',
          price_per_person: 1100,
          is_booked: false,
          is_reserve_only: true,
        },
        {
          id: 'stop_kecak',
          time_slot: '17:30',
          place_name: 'Uluwatu Temple Kecak Dance',
          subtitle: 'Amphitheatre oceanfront fire dance at dusk',
          category: 'Culture',
          price_per_person: 1200,
          is_booked: true,
          is_reserve_only: false,
        },
      ],
    },
  ],
  members: [
    {
      id: 'mem_rs',
      name: 'Rohit Sharma',
      initials: 'RS',
      role: 'organizer',
      status: 'confirmed',
      share_amount: 47600,
      has_paid: false,
    },
    {
      id: 'mem_ak',
      name: 'Aman Kapoor',
      initials: 'AK',
      role: 'member',
      status: 'confirmed',
      share_amount: 47600,
      has_paid: true,
    },
    {
      id: 'mem_vj',
      name: 'Vikram Joshi',
      initials: 'VJ',
      role: 'member',
      status: 'pending',
      share_amount: 47600,
      has_paid: false,
      is_reminded: true,
    },
    {
      id: 'mem_nk',
      name: 'Nikhil Kulkarni',
      initials: 'NK',
      role: 'member',
      status: 'pending',
      share_amount: 47600,
      has_paid: false,
      is_reminded: false,
    },
  ],
  poll: {
    id: 'poll_day_3',
    question: 'Day 3 — Nusa Penida or Uluwatu?',
    expires_in_hours: 6,
    options: [
      {
        id: 'opt_nusa',
        title: 'Nusa Penida day trip',
        votes: 2,
        voted_by: ['RS', 'AK'],
      },
      {
        id: 'opt_uluwatu',
        title: 'Uluwatu + Kecak dance',
        votes: 1,
        voted_by: ['VJ'],
      },
    ],
  },
};

const DEFAULT_MATCHED_TRAVELERS: MatchedTraveler[] = [
  {
    id: 'traveler_priya',
    name: 'Priya S.',
    city: 'Delhi',
    match_pct: 92,
    trips_count: 12,
    interests: ['Beaches', 'Cafés', 'Photography'],
    date_flexibility: 'Same dates',
    invited: false,
  },
  {
    id: 'traveler_karan',
    name: 'Karan M.',
    city: 'Gurugram',
    match_pct: 85,
    trips_count: 8,
    interests: ['Hiking', 'Nightlife', 'Scooters'],
    date_flexibility: '±2 days',
    invited: false,
  },
];

const PlannrContext = createContext<PlannrContextType | undefined>(undefined);

export const PlannrProvider: React.FC<{
  children: React.ReactNode;
  initialScreen?: PlannrScreen;
}> = ({ children, initialScreen = 'home' }) => {
  const [currentScreen, setCurrentScreen] = useState<PlannrScreen>(initialScreen);
  const [screenHistory, setScreenHistory] = useState<PlannrScreen[]>([initialScreen]);
  const [activeTrip, setActiveTrip] = useState<PlannrTrip>(DEFAULT_BALI_TRIP);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [matchedTravelers, setMatchedTravelers] = useState<MatchedTraveler[]>(DEFAULT_MATCHED_TRAVELERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals & Drawers
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState<boolean>(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isBookingConfirmedModalOpen, setIsBookingConfirmedModalOpen] = useState<boolean>(false);
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<any>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  const navigate = useCallback((screen: PlannrScreen, data?: any) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    if (data?.day) {
      setActiveDayNumber(data.day);
    }
    if (data?.package) {
      const p = data.package;
      setActiveTrip({
        id: p.id,
        title: p.title,
        destination: p.country || p.location || 'Selected Destination',
        start_date: '12 Nov',
        end_date: `${12 + (p.days || 4)} Nov`,
        total_days: p.days || 4,
        budget_per_person: p.starting_price,
        total_budget: p.starting_price * 4,
        currency: 'INR',
        status: 'active',
        days: p.itinerary && p.itinerary.length > 0 ? p.itinerary.map((it: any, idx: number) => ({
          id: `day_${idx + 1}`,
          day_number: idx + 1,
          day_title: `${it.day} · ${it.title}`,
          summary: it.desc,
          stops: [
            {
              id: `stop_${p.id}_${idx + 1}`,
              time_slot: idx === 0 ? '09:00 AM' : '11:30 AM',
              place_name: it.title,
              subtitle: it.desc,
              category: idx === 0 ? 'Stay' : 'Activity',
              price_per_person: Math.round(p.starting_price / (p.days || 4)),
              is_booked: true,
              is_reserve_only: false,
              is_from_reel: false,
              booking_ref: `PLN-${p.id.toUpperCase().slice(0, 5)}-${idx + 1}`,
            }
          ]
        })) : DEFAULT_BALI_TRIP.days,
        members: DEFAULT_BALI_TRIP.members,
        poll: DEFAULT_BALI_TRIP.poll,
      });
    }
    // Scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length <= 1) {
        setCurrentScreen('home');
        return ['home'];
      }
      const newHistory = [...prev];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1] || 'home';
      setCurrentScreen(prevScreen);
      return newHistory;
    });
  }, []);

  // Fetch initial trip from backend if available
  const refreshTrip = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/plannr/trips/trip_bali_boys');
      if (res.ok) {
        const data = await res.json();
        if (data && data.days) {
          // Normalize members
          const members: PlannrTripMember[] = (data.members || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            initials: m.initials,
            role: m.is_current_user ? 'organizer' : 'member',
            status: m.status === 'paid' ? 'confirmed' : 'pending',
            share_amount: m.share_amount || 47600,
            has_paid: m.status === 'paid',
            is_reminded: m.status === 'reminded',
          }));

          const poll: PlannrPoll | undefined = data.poll
            ? {
                id: data.poll.id,
                question: data.poll.question,
                expires_in_hours: data.poll.ends_in_hours || 6,
                options: (data.poll.options || []).map((o: any) => ({
                  id: o.id,
                  title: o.title,
                  votes: o.votes,
                  voted_by: o.voted_by || [],
                })),
              }
            : DEFAULT_BALI_TRIP.poll;

          setActiveTrip((prev) => ({
            ...prev,
            ...data,
            members: members.length > 0 ? members : prev.members,
            poll: poll || prev.poll,
          }));

          if (data.matched_travelers && data.matched_travelers.length > 0) {
            setMatchedTravelers(data.matched_travelers);
          }
        }
      }
    } catch {
      // Fallback is already DEFAULT_BALI_TRIP
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  // Action: Add stop
  const addStop = useCallback(
    async (stopData: {
      time_slot: string;
      place_name: string;
      subtitle?: string;
      category: string;
      price: number;
      day_number?: number;
    }): Promise<boolean> => {
      const targetDay = stopData.day_number || activeDayNumber;
      const newStop: PlannrTripStop = {
        id: `stop_${Date.now()}`,
        time_slot: stopData.time_slot,
        place_name: stopData.place_name,
        subtitle: stopData.subtitle || `Custom stop · ${stopData.category}`,
        category: stopData.category,
        price_per_person: stopData.price,
        is_booked: false,
        is_reserve_only: stopData.category === 'Food',
      };

      // Optimistic update
      setActiveTrip((prev) => {
        const updatedDays = prev.days.map((day) => {
          if (day.day_number === targetDay) {
            const stops = [...day.stops, newStop].sort((a, b) =>
              a.time_slot.localeCompare(b.time_slot)
            );
            return { ...day, stops };
          }
          return day;
        });
        return { ...prev, days: updatedDays };
      });

      showToast(`Added "${stopData.place_name}" to Day ${targetDay}!`, 'success');

      try {
        await fetch('/api/plannr/trips/trip_bali_boys/add-stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_number: targetDay,
            time_slot: stopData.time_slot,
            place_name: stopData.place_name,
            subtitle: stopData.subtitle,
            category: stopData.category,
            price: stopData.price,
          }),
        });
      } catch {
        // Optimistic update holds
      }
      return true;
    },
    [activeDayNumber, showToast]
  );

  // Action: Regenerate day
  const regenerateDayStops = useCallback(
    async (dayNumber: number): Promise<boolean> => {
      showToast(`Regenerating Day ${dayNumber} with AI curator...`, 'info');

      // AI fresh alternative stops
      const freshStops: Record<number, PlannrTripStop[]> = {
        1: [
          {
            id: `regen_1`,
            time_slot: '07:00',
            place_name: 'Campuhan Early Bird Walk',
            subtitle: 'Morning mist ridge trail · 1.5 hrs',
            category: 'Activity',
            price_per_person: 0,
            is_booked: true,
            is_reserve_only: false,
          },
          {
            id: `regen_2`,
            time_slot: '10:00',
            place_name: 'Brunch · Clear Café Ubud',
            subtitle: 'Raw cacao smoothies & bamboo spiral lounge',
            category: 'Food',
            price_per_person: 850,
            is_booked: false,
            is_reserve_only: true,
          },
          {
            id: `regen_3`,
            time_slot: '13:30',
            place_name: 'Goa Gajah Elephant Cave',
            subtitle: 'Ancient 9th-century holy sanctuary',
            category: 'Culture',
            price_per_person: 500,
            is_booked: false,
            is_reserve_only: false,
          },
          {
            id: `regen_4`,
            time_slot: '17:30',
            place_name: 'Sayan Valley Sunset Cocktails',
            subtitle: 'Ayung river panorama · 2 hrs',
            category: 'Food',
            price_per_person: 1400,
            is_booked: false,
            is_reserve_only: true,
          },
        ],
      };

      try {
        const res = await fetch('/api/plannr/trips/trip_bali_boys/regenerate-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day_number: dayNumber }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.trip) {
            refreshTrip();
            showToast(`Day ${dayNumber} refreshed with verified AI stops!`, 'success');
            return true;
          }
        }
      } catch {
        // Fallback to local alternate
      }

      const alt = freshStops[dayNumber] || freshStops[1];
      setActiveTrip((prev) => ({
        ...prev,
        days: prev.days.map((d) => (d.day_number === dayNumber ? { ...d, stops: alt } : d)),
      }));
      showToast(`Day ${dayNumber} refreshed with curated stops!`, 'success');
      return true;
    },
    [refreshTrip, showToast]
  );

  // Action: Vote on poll
  const voteOnPoll = useCallback(
    async (optionId: string): Promise<boolean> => {
      // Optimistic vote
      setActiveTrip((prev) => {
        if (!prev.poll) return prev;
        const options = prev.poll.options.map((opt) => {
          const isVoted = opt.id === optionId;
          const votedBy = opt.voted_by || [];
          if (isVoted) {
            if (!votedBy.includes('RS')) {
              return {
                ...opt,
                votes: opt.votes + 1,
                voted_by: [...votedBy, 'RS'],
              };
            }
          } else {
            if (votedBy.includes('RS')) {
              return {
                ...opt,
                votes: Math.max(0, opt.votes - 1),
                voted_by: votedBy.filter((v) => v !== 'RS'),
              };
            }
          }
          return opt;
        });
        return {
          ...prev,
          poll: {
            ...prev.poll,
            options,
          },
        };
      });

      showToast('Your vote has been cast!', 'success');

      try {
        await fetch('/api/plannr/trips/trip_bali_boys/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            option_id: optionId,
            voter_initials: 'RS',
          }),
        });
      } catch {
        // Optimistic state holds
      }
      return true;
    },
    [showToast]
  );

  // Action: Invite traveler
  const inviteTravelerMember = useCallback(
    async (travelerId?: string, name?: string): Promise<boolean> => {
      const travelerName = name || (travelerId === 'traveler_karan' ? 'Karan M.' : 'Priya S.');
      const initials = travelerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2);

      // Optimistic update
      setMatchedTravelers((prev) =>
        prev.map((t) => (t.id === travelerId || t.name === travelerName ? { ...t, invited: true } : t))
      );

      // Also add to members list as invited
      setActiveTrip((prev) => {
        const existing = prev.members?.find((m) => m.name === travelerName);
        if (existing) return prev;
        const newMember: PlannrTripMember = {
          id: `mem_${Date.now()}`,
          name: travelerName,
          initials,
          role: 'member',
          status: 'pending',
          share_amount: 38080,
          has_paid: false,
          is_reminded: true,
        };
        return {
          ...prev,
          members: [...(prev.members || []), newMember],
        };
      });

      showToast(`Invite sent to ${travelerName}!`, 'success');

      try {
        await fetch('/api/plannr/trips/trip_bali_boys/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            traveler_id: travelerId,
            name: travelerName,
          }),
        });
      } catch {
        // Optimistic state holds
      }
      return true;
    },
    [showToast]
  );

  // Action: Request Shares
  const requestPaymentShares = useCallback(async (): Promise<number> => {
    setActiveTrip((prev) => {
      const updatedMembers = (prev.members || []).map((m) => {
        if (!m.has_paid && m.initials !== 'RS') {
          return { ...m, is_reminded: true };
        }
        return m;
      });
      return { ...prev, members: updatedMembers };
    });

    showToast('Payment reminders dispatched to Vikram & Nikhil via UPI!', 'success');

    try {
      const res = await fetch('/api/plannr/trips/trip_bali_boys/request-shares', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return data.reminded_count || 2;
      }
    } catch {
      // Optimistic holds
    }
    return 2;
  }, [showToast]);

  // Action: Pay user share
  const payMyShare = useCallback(
    async (paymentMethod = 'UPI_INSTANT'): Promise<any> => {
      const txnId = `UPI-PLN-${Math.floor(100000 + Math.random() * 900000)}`;
      const receipt = {
        transaction_id: txnId,
        payment_method: paymentMethod,
        amount_paid: 47600,
        currency: 'INR',
        payer_name: 'Rohit Sharma (You)',
        payer_initials: 'RS',
        trip_title: 'Bali with the boys',
        timestamp: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'PAID_VERIFIED',
        pnr: 'IND-DPS-8842',
        villa_ref: 'SENJA-UB-6N',
      };

      setLastPaymentReceipt(receipt);

      // Optimistic update
      setActiveTrip((prev) => {
        const updatedMembers = (prev.members || []).map((m) => {
          if (m.initials === 'RS') {
            return { ...m, has_paid: true, status: 'confirmed' as const };
          }
          return m;
        });
        return { ...prev, members: updatedMembers };
      });

      setIsBookingConfirmedModalOpen(true);
      showToast('Payment of ₹47,600 verified via UPI Instant Pay!', 'success');

      try {
        await fetch('/api/plannr/trips/trip_bali_boys/pay-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_method: paymentMethod }),
        });
      } catch {
        // Optimistic holds
      }

      return receipt;
    },
    [showToast]
  );

  // Action: Reserve Table
  const reserveTableStop = useCallback(
    async (stopId: string, restaurantName: string): Promise<boolean> => {
      setActiveTrip((prev) => {
        const updatedDays = prev.days.map((day) => ({
          ...day,
          stops: day.stops.map((s) => (s.id === stopId ? { ...s, is_booked: true } : s)),
        }));
        return { ...prev, days: updatedDays };
      });

      showToast(`Table confirmed at ${restaurantName} (Pay at venue)`, 'success');
      return true;
    },
    [showToast]
  );

  return (
    <PlannrContext.Provider
      value={{
        currentScreen,
        navigate,
        goBack,
        activeTrip,
        activeDayNumber,
        setActiveDayNumber,
        isLoading,
        refreshTrip,
        addStop,
        regenerateDayStops,
        voteOnPoll,
        inviteTravelerMember,
        requestPaymentShares,
        payMyShare,
        reserveTableStop,
        matchedTravelers,
        isAddStopModalOpen,
        setIsAddStopModalOpen,
        isGroupChatOpen,
        setIsGroupChatOpen,
        isInviteModalOpen,
        setIsInviteModalOpen,
        isBookingConfirmedModalOpen,
        setIsBookingConfirmedModalOpen,
        lastPaymentReceipt,
        toastMessage,
        toastType,
        showToast,
      }}
    >
      {children}
    </PlannrContext.Provider>
  );
};

export const usePlannr = (): PlannrContextType => {
  const context = useContext(PlannrContext);
  if (!context) {
    throw new Error('usePlannr must be used within a PlannrProvider');
  }
  return context;
};

export const useOptionalPlannr = (): PlannrContextType | null => {
  return useContext(PlannrContext) || null;
};
