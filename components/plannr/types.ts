export interface PlannrPackage {
  id: string;
  title: string;
  country: string;
  days: number;
  starting_price: number;
  image?: string;
  vector_type?: string;
  tag?: string;
  rating?: number;
  inclusions?: string[];
}

export interface PlannrTripStop {
  id: string;
  trip_day_id?: string;
  time_slot: string;
  place_name: string;
  subtitle: string;
  category: 'Activity' | 'Food' | 'Culture' | 'Stay' | 'Flight' | string;
  price_per_person: number;
  is_booked: boolean;
  is_reserve_only: boolean;
  is_from_reel?: boolean;
  booking_ref?: string;
}

export interface PlannrTripDay {
  id: string;
  trip_id?: string;
  day_number: number;
  day_title: string;
  summary?: string;
  stops: PlannrTripStop[];
}

export interface PlannrTripMember {
  id: string;
  name: string;
  initials: string;
  role: 'organizer' | 'member' | string;
  status: 'confirmed' | 'pending' | 'declined';
  share_amount: number;
  has_paid: boolean;
  is_reminded?: boolean;
}

export interface PlannrPollOption {
  id: string;
  title: string;
  votes: number;
  voted_by: string[];
}

export interface PlannrPoll {
  id: string;
  trip_id?: string;
  question: string;
  expires_in_hours: number;
  options: PlannrPollOption[];
}

export interface PlannrTrip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  budget_per_person: number;
  total_budget: number;
  currency: string;
  status: string;
  days: PlannrTripDay[];
  members?: PlannrTripMember[];
  poll?: PlannrPoll;
}

export interface DetectedPlace {
  id?: string;
  name: string;
  timestamp: string;
  match_percent: number;
  category: string;
  notes: string;
  price_estimate?: string;
  duration?: string;
}

export interface PlannrReel {
  id: string;
  reel_url: string;
  creator_handle: string;
  creator_name: string;
  creator_avatar: string;
  video_title: string;
  caption: string;
  places_detected: DetectedPlace[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  destination_tag: string;
}

export type PlannrScreen =
  | 'home' // Screen 1
  | 'plan-ai' // Screen 2
  | 'reel-scan' // Screen 3
  | 'itinerary' // Screen 4
  | 'group' // Screen 5
  | 'checkout' // Screen 6
  | 'reels'; // Screen 7
