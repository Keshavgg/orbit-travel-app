from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class ItineraryDay(BaseModel):
    day: str
    title: str
    desc: str


class DestinationResponse(BaseModel):
    key: str
    name: str
    country: str
    tagline: Optional[str] = None
    lat: float
    lng: float
    badge: Optional[str] = None
    banner_img: Optional[str] = None
    weather_temp: Optional[str] = None
    weather_condition: Optional[str] = None

    class Config:
        from_attributes = True


class TripResponse(BaseModel):
    id: int
    slug: str
    title: str
    destination_key: str
    category: str
    duration: str
    duration_days: int
    duration_type: str  # 'short' or 'long'
    price: int
    original_price: int
    discount_percent: int
    drive_time: Optional[str] = None
    distance: Optional[str] = None
    airline: Optional[str] = None
    stay_name: str
    image: str
    highlights: List[str]
    inclusions: List[str]
    itinerary: List[ItineraryDay]
    tags: List[str]
    available_slots: int
    is_featured: bool

    class Config:
        from_attributes = True


class DistressedFlightResponse(BaseModel):
    id: int
    flight_num: str
    airline: str
    origin: str
    origin_code: str
    dest: str
    dest_code: str
    departure_time: str
    arrival_time: str
    original_price: int
    distressed_price: int
    discount_percent: int
    seats_remaining: int
    baggage: str
    tags: List[str]

    class Config:
        from_attributes = True


class VisaResponse(BaseModel):
    id: int
    country_key: str
    country_name: str
    flag: str
    processing_hours: int
    platform_fee: int
    govt_fee: int
    total_fee: int
    success_rate: float
    express_available: bool
    requirements: List[str]

    class Config:
        from_attributes = True


class BookingCreateRequest(BaseModel):
    trip_slug: Optional[str] = None
    trip_title: str
    destination_key: str
    travel_date: str
    travelers_count: int = Field(default=1, ge=1)
    total_amount: int = Field(gt=0)
    payment_method: str = Field(default="UPI_INSTANT")  # 'UPI_INSTANT', 'CREDIT_CARD', 'GST_INVOICE'
    user_name: str = Field(default="Rahul Sharma")
    user_email: Optional[str] = Field(default="rahul@travel.in")
    user_phone: Optional[str] = Field(default="+91 98101 23456")
    gstin: Optional[str] = None
    company_name: Optional[str] = None


class BookingResponse(BaseModel):
    booking_id: str
    trip_title: str
    destination_key: str
    travel_date: str
    travelers_count: int
    total_amount: int
    payment_method: str
    status: str
    user_name: str
    user_email: str
    user_phone: str
    gstin: Optional[str] = None
    company_name: Optional[str] = None
    itc_eligible: bool
    itc_amount: int
    qr_token: str
    created_at: datetime

    class Config:
        from_attributes = True


class TripCardSchema(BaseModel):
    title: str
    cityKey: str
    location: str
    price: str
    originalPrice: str
    duration: str
    airline: str
    stay: str
    image: str
    inclusions: List[str]
    itineraryDays: Optional[List[Dict[str, str]]] = None


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    destination: Optional[str] = None
    vibe: Optional[str] = None
    group_type: Optional[str] = None
    budget: Optional[str] = None
    api_key: Optional[str] = None
    duration_hours: Optional[float] = None


class SessionProfileSchema(BaseModel):
    destination: Optional[str] = None
    vibe: Optional[str] = None
    group_type: Optional[str] = None
    budget: Optional[str] = None
    stay_type: Optional[str] = None
    step: int = 0


class RAGLedgerRecord(BaseModel):
    title: str
    type: str
    price: Optional[int] = None
    confidence: float
    snippet: str


class RAGLedgerSchema(BaseModel):
    retrieval_ms: float = 4.2
    tables_scanned: List[str] = ["flight_tickets", "hotels", "events_concerts"]
    matched_records: int = 3
    confidence: float = 0.96
    engine: str = "Hybrid BM25 + Vector Cosine + Qwen2.5 Metal"
    is_live_db: bool = True
    sources: Optional[List[RAGLedgerRecord]] = None


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    sender: str
    text: str
    time: str
    trip_card: Optional[TripCardSchema] = None
    prompt_suggestions: Optional[List[str]] = None
    rag_ledger: Optional[RAGLedgerSchema] = None
    thinking: Optional[str] = None
    timeline_steps: Optional[List[Dict[str, Any]]] = None


class ChatResponse(BaseModel):
    session_id: str
    step: int
    session_profile: Optional[SessionProfileSchema] = None
    message: ChatMessageResponse
    rag_ledger: Optional[RAGLedgerSchema] = None
    thinking: Optional[str] = None
    engine: Optional[str] = None


class CallbackCreateRequest(BaseModel):
    phone: str
    name: Optional[str] = "Traveler"
    destination_interest: Optional[str] = "General Inquiry"


class CallbackResponse(BaseModel):
    id: int
    phone: str
    name: Optional[str]
    destination_interest: Optional[str]
    status: str
    message: str


class GstVerifyRequest(BaseModel):
    gstin: str
    amount: int


class GstVerifyResponse(BaseModel):
    valid: bool
    gstin: str
    business_name: Optional[str] = None
    state: Optional[str] = None
    gst_rate_percent: int
    gst_amount: int
    net_tax_credit_claimable: int
    message: str


class HotelResponse(BaseModel):
    id: int
    slug: str
    name: str
    city_key: str
    location: str
    property_type: str
    rating: float
    review_count: int
    price_per_night: int
    original_price: int
    discount_percent: int
    image: str
    amenities: List[str]
    badge: Optional[str] = None
    rooms_left: int
    is_featured: bool

    class Config:
        from_attributes = True


class HotelListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    hotels: List[HotelResponse]


class FlightTicketResponse(BaseModel):
    id: int
    flight_num: str
    airline: str
    origin: str
    origin_code: str
    dest: str
    dest_code: str
    departure_time: str
    arrival_time: str
    duration: str
    stops: str
    price: int
    original_price: int
    discount_percent: int
    seats_available: int
    baggage: str
    cabin_class: str
    is_distressed: bool
    tags: List[str]

    class Config:
        from_attributes = True


class FlightTicketListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    flights: List[FlightTicketResponse]


class EventConcertResponse(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    city_key: str
    venue: str
    date_str: str
    time_str: str
    headliner: str
    ticket_price: int
    original_price: int
    tickets_left: int
    image: str
    badge: Optional[str] = None
    tags: List[str]
    includes_stay_combo: bool
    combo_price: Optional[int] = None

    class Config:
        from_attributes = True


class EventConcertListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    events: List[EventConcertResponse]


# ── Auth Schemas ──
class OtpSendRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None


class OtpSendResponse(BaseModel):
    success: bool
    message: str
    demo_otp: str


class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str
    account_type: Optional[str] = "personal"
    name: Optional[str] = None


class UserProfile(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    account_type: str = "personal"
    tier: str = "Titanium Elite"
    avatar: str = "KJ"
    mybiz_gstin: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserProfile


class MeResponse(BaseModel):
    user: UserProfile


class LogoutResponse(BaseModel):
    success: bool
    message: str


# ── Plannr Superapp Schemas ──

class PlannrPackageResponse(BaseModel):
    id: str
    title: str
    country: str
    days: int
    starting_price: int
    image: str
    vector_type: Optional[str] = None
    tag: str
    rating: float
    inclusions: List[str]

    class Config:
        from_attributes = True


class PlannrPackagesListResponse(BaseModel):
    total: int
    packages: List[PlannrPackageResponse]


class PlannrTripStopResponse(BaseModel):
    id: str
    trip_day_id: str
    time_slot: str
    place_name: str
    subtitle: Optional[str] = None
    category: str
    price_per_person: int
    is_booked: bool
    is_reserve_only: bool
    is_from_reel: bool
    booking_ref: Optional[str] = None

    class Config:
        from_attributes = True


class PlannrTripDayResponse(BaseModel):
    id: str
    trip_id: str
    day_number: int
    day_title: str
    summary: Optional[str] = None
    stops: List[PlannrTripStopResponse] = []

    class Config:
        from_attributes = True


class PlannrTripMemberResponse(BaseModel):
    id: str
    trip_id: str
    name: str
    initials: str
    status: str
    share_amount: int
    is_current_user: bool

    class Config:
        from_attributes = True


class PlannrPollOption(BaseModel):
    id: str
    title: str
    votes: int
    voted_by: List[str]


class PlannrPollResponse(BaseModel):
    id: str
    trip_id: str
    question: str
    ends_in_hours: int
    options: List[PlannrPollOption]

    class Config:
        from_attributes = True


class PlannrMatchedTravelerResponse(BaseModel):
    id: str
    trip_id: Optional[str] = None
    name: str
    city: str
    match_pct: int
    trips_count: int
    interests: List[str]
    date_flexibility: str
    invited: bool

    class Config:
        from_attributes = True


class PlannrCartBreakdown(BaseModel):
    total_stops: int
    booked_stops_count: int
    unbooked_stops_count: int
    total_cost: int
    categories_breakdown: Dict[str, int]
    share_per_person: int


class PlannrTripDetailResponse(BaseModel):
    id: str
    title: str
    destination: str
    start_date: str
    end_date: str
    total_days: int
    budget_per_person: int
    total_budget: int
    currency: str
    status: str
    days: List[PlannrTripDayResponse]
    members: List[PlannrTripMemberResponse]
    poll: Optional[PlannrPollResponse] = None
    matched_travelers: List[PlannrMatchedTravelerResponse] = []
    cart_breakdown: Optional[PlannrCartBreakdown] = None

    class Config:
        from_attributes = True


class PlannrReelPlace(BaseModel):
    name: str
    match_pct: int
    timestamp: Optional[str] = None
    duration: Optional[str] = None
    tag: Optional[str] = None


class PlannrReelResponse(BaseModel):
    id: str
    reel_url: str
    creator_handle: str
    creator_name: str
    creator_avatar: str
    video_title: str
    caption: Optional[str] = None
    places_detected: List[PlannrReelPlace]
    likes_count: int
    comments_count: int
    video_poster_url: str

    class Config:
        from_attributes = True


class PlannrGenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = "Balanced"
    interests: Optional[List[str]] = None
    destination: Optional[str] = None
    budget_per_person: Optional[int] = None
    travellers: Optional[str] = None
    api_key: Optional[str] = None


class PlannrReelScanRequest(BaseModel):
    url: str


class PlannrReelBuildItineraryRequest(BaseModel):
    places: List[Any]
    trip_name: Optional[str] = "Reel Inspired Trip"
    total_days: Optional[int] = 3


class PlannrAddStopRequest(BaseModel):
    day_number: Optional[int] = 1
    trip_day_id: Optional[str] = None
    time_slot: str = "14:00"
    place_name: str
    subtitle: Optional[str] = None
    category: str = "Activity"
    price: Optional[int] = None
    price_per_person: Optional[int] = 0
    is_from_reel: Optional[bool] = False


class PlannrRegenerateDayRequest(BaseModel):
    day_number: int = 1
    theme: Optional[str] = None


class PlannrVoteRequest(BaseModel):
    poll_id: Optional[str] = None
    option_id: str
    voter_initials: Optional[str] = "RS"
    voter_name: Optional[str] = "Rohit Sharma"


class PlannrInviteRequest(BaseModel):
    traveler_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None


class PlannrPayShareRequest(BaseModel):
    payment_method: Optional[str] = "UPI_INSTANT"
    upi_id: Optional[str] = "rohit@okhdfcbank"



