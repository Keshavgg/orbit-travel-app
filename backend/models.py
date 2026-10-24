from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from database import Base


class Destination(Base):
    __tablename__ = "destinations"

    key = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    tagline = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    badge = Column(String, nullable=True)
    banner_img = Column(String, nullable=True)
    weather_temp = Column(String, nullable=True)
    weather_condition = Column(String, nullable=True)

    trips = relationship("Trip", back_populates="destination")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    destination_key = Column(String, ForeignKey("destinations.key"), nullable=False)
    category = Column(String, nullable=False)  # 'weekend', 'visa', 'flights', 'dirtcheap', 'stays'
    duration = Column(String, nullable=False)  # e.g., '2 Days / 1 Night'
    duration_days = Column(Integer, nullable=False)
    duration_type = Column(String, index=True, nullable=False)  # 'short' or 'long'
    price = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=False)
    discount_percent = Column(Integer, nullable=False)
    drive_time = Column(String, nullable=True)
    distance = Column(String, nullable=True)
    airline = Column(String, nullable=True)
    stay_name = Column(String, nullable=False)
    image = Column(String, nullable=False)
    highlights = Column(Text, nullable=False)  # JSON array string
    inclusions = Column(Text, nullable=False)  # JSON array string
    itinerary = Column(Text, nullable=False)  # JSON array string of {day, title, desc}
    tags = Column(Text, nullable=False)  # JSON array string
    available_slots = Column(Integer, default=10)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    destination = relationship("Destination", back_populates="trips")


class DistressedFlight(Base):
    __tablename__ = "distressed_flights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    flight_num = Column(String, nullable=False)
    airline = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    origin_code = Column(String, nullable=False)
    dest = Column(String, nullable=False)
    dest_code = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    original_price = Column(Integer, nullable=False)
    distressed_price = Column(Integer, nullable=False)
    discount_percent = Column(Integer, nullable=False)
    seats_remaining = Column(Integer, nullable=False)
    baggage = Column(String, nullable=False)
    tags = Column(Text, nullable=False)  # JSON array string


class Visa(Base):
    __tablename__ = "visas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    country_key = Column(String, unique=True, index=True, nullable=False)
    country_name = Column(String, nullable=False)
    flag = Column(String, nullable=False)
    processing_hours = Column(Integer, nullable=False)
    platform_fee = Column(Integer, default=499)
    govt_fee = Column(Integer, nullable=False)
    total_fee = Column(Integer, nullable=False)
    success_rate = Column(Float, default=99.4)
    express_available = Column(Boolean, default=True)
    requirements = Column(Text, nullable=False)  # JSON array string


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(String, unique=True, index=True, nullable=False)  # e.g. ORB-2026-X992
    trip_slug = Column(String, nullable=True)
    trip_title = Column(String, nullable=False)
    destination_key = Column(String, nullable=False)
    travel_date = Column(String, nullable=False)
    travelers_count = Column(Integer, default=1)
    total_amount = Column(Integer, nullable=False)
    payment_method = Column(String, nullable=False)  # 'UPI_INSTANT', 'CREDIT_CARD', 'GST_INVOICE'
    status = Column(String, default="CONFIRMED")
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_phone = Column(String, nullable=False)
    gstin = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    itc_eligible = Column(Boolean, default=False)
    itc_amount = Column(Integer, default=0)
    qr_token = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    destination = Column(String, nullable=True)
    vibe = Column(String, nullable=True)
    group_type = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    step = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(String, nullable=False)  # 'ai' or 'user'
    text = Column(Text, nullable=False)
    trip_card_json = Column(Text, nullable=True)
    prompt_suggestions_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class CallbackLead(Base):
    __tablename__ = "callback_leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String, nullable=False)
    name = Column(String, nullable=True)
    destination_interest = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    city_key = Column(String, index=True, nullable=False)
    location = Column(String, nullable=False)
    property_type = Column(String, index=True, nullable=False)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=120)
    price_per_night = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=False)
    discount_percent = Column(Integer, nullable=False)
    image = Column(String, nullable=False)
    amenities = Column(Text, nullable=False)  # JSON array
    badge = Column(String, nullable=True)
    rooms_left = Column(Integer, default=4)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class FlightTicket(Base):
    __tablename__ = "flight_tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    flight_num = Column(String, index=True, nullable=False)
    airline = Column(String, index=True, nullable=False)
    origin = Column(String, nullable=False)
    origin_code = Column(String, index=True, nullable=False)
    dest = Column(String, nullable=False)
    dest_code = Column(String, index=True, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    stops = Column(String, default="Non-Stop")
    price = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=False)
    discount_percent = Column(Integer, default=0)
    seats_available = Column(Integer, default=8)
    baggage = Column(String, default="15kg + 7kg")
    cabin_class = Column(String, default="Economy")
    is_distressed = Column(Boolean, default=False)
    tags = Column(Text, nullable=False)  # JSON array
    created_at = Column(DateTime, default=datetime.utcnow)


class EventConcert(Base):
    __tablename__ = "events_concerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    city_key = Column(String, index=True, nullable=False)
    venue = Column(String, nullable=False)
    date_str = Column(String, nullable=False)
    time_str = Column(String, nullable=False)
    headliner = Column(String, nullable=False)
    ticket_price = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=False)
    tickets_left = Column(Integer, default=50)
    image = Column(String, nullable=False)
    badge = Column(String, nullable=True)
    tags = Column(Text, nullable=False)  # JSON array
    includes_stay_combo = Column(Boolean, default=False)
    combo_price = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, default="Keshav Jindal")
    email = Column(String, nullable=True, default="keshav@orbit.travel")
    account_type = Column(String, default="personal")  # 'personal' | 'mybiz'
    tier = Column(String, default="Titanium Elite")
    avatar = Column(String, default="KJ")
    mybiz_gstin = Column(String, nullable=True, default="07AAACR5055K1Z4")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("SessionToken", back_populates="user", cascade="all, delete-orphan")


class SessionToken(Base):
    __tablename__ = "sessions"

    token = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")


# ============================================================================
# Plannr Superapp Models
# ============================================================================

class PlannrPackage(Base):
    __tablename__ = "plannr_packages"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    country = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    starting_price = Column(Integer, nullable=False)
    image = Column(String, nullable=False)
    vector_type = Column(String, nullable=True)
    tag = Column(String, nullable=False)
    rating = Column(Float, default=4.9)
    inclusions = Column(Text, nullable=False)  # JSON array string


class PlannrTrip(Base):
    __tablename__ = "plannr_trips"

    id = Column(String, primary_key=True, index=True)  # e.g. 'trip_bali_boys'
    title = Column(String, nullable=False)             # 'Bali with the boys'
    destination = Column(String, nullable=False)       # 'Bali'
    start_date = Column(String, nullable=False)        # '12 Nov' or '2026-11-12'
    end_date = Column(String, nullable=False)          # '18 Nov' or '2026-11-18'
    total_days = Column(Integer, nullable=False)
    budget_per_person = Column(Integer, nullable=False)
    total_budget = Column(Integer, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, default="active")          # 'active' | 'planning' | 'booked'
    created_at = Column(DateTime, default=datetime.utcnow)

    days = relationship("PlannrTripDay", back_populates="trip", cascade="all, delete-orphan", order_by="PlannrTripDay.day_number")
    members = relationship("PlannrTripMember", back_populates="trip", cascade="all, delete-orphan")
    polls = relationship("PlannrPoll", back_populates="trip", cascade="all, delete-orphan")
    matched_travelers = relationship("PlannrMatchedTraveler", back_populates="trip", cascade="all, delete-orphan")


class PlannrTripDay(Base):
    __tablename__ = "plannr_trip_days"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("plannr_trips.id"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    day_title = Column(String, nullable=False)        # 'Day 1 · Ubud'
    summary = Column(Text, nullable=True)

    trip = relationship("PlannrTrip", back_populates="days")
    stops = relationship("PlannrTripStop", back_populates="day", cascade="all, delete-orphan", order_by="PlannrTripStop.time_slot")


class PlannrTripStop(Base):
    __tablename__ = "plannr_trip_stops"

    id = Column(String, primary_key=True, index=True)
    trip_day_id = Column(String, ForeignKey("plannr_trip_days.id"), nullable=False, index=True)
    time_slot = Column(String, nullable=False)        # '07:30'
    place_name = Column(String, nullable=False)       # 'Tegallalang Rice Terrace'
    subtitle = Column(String, nullable=True)          # 'Sunrise walk · 2 hrs · from the reel'
    category = Column(String, nullable=False)         # 'Activity' | 'Food' | 'Culture' | 'Walk'
    price_per_person = Column(Integer, default=0)
    is_booked = Column(Boolean, default=False)
    is_reserve_only = Column(Boolean, default=False)
    is_from_reel = Column(Boolean, default=False)
    booking_ref = Column(String, nullable=True)

    day = relationship("PlannrTripDay", back_populates="stops")


class PlannrTripMember(Base):
    __tablename__ = "plannr_trip_members"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("plannr_trips.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    initials = Column(String, nullable=False)         # 'RS', 'AK', 'VJ', 'NK'
    status = Column(String, default="pending")        # 'paying' | 'paid' | 'reminded' | 'pending'
    share_amount = Column(Integer, nullable=False)
    is_current_user = Column(Boolean, default=False)

    trip = relationship("PlannrTrip", back_populates="members")


class PlannrPoll(Base):
    __tablename__ = "plannr_polls"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("plannr_trips.id"), nullable=False, index=True)
    question = Column(String, nullable=False)         # 'Day 3 — Nusa Penida or Uluwatu?'
    ends_in_hours = Column(Integer, default=24)
    options = Column(Text, nullable=False)            # JSON array with id, title, votes, voted_by

    trip = relationship("PlannrTrip", back_populates="polls")


class PlannrReel(Base):
    __tablename__ = "plannr_reels"

    id = Column(String, primary_key=True, index=True)
    reel_url = Column(String, nullable=False)
    creator_handle = Column(String, nullable=False)   # '@wander.with.nia'
    creator_name = Column(String, nullable=False)
    creator_avatar = Column(String, nullable=False)
    video_title = Column(String, nullable=False)      # "Bali's secret waterfall nobody talks about"
    caption = Column(Text, nullable=True)
    places_detected = Column(Text, nullable=False)    # JSON list of places with timestamp, tags, match_pct
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    video_poster_url = Column(String, nullable=False)


class PlannrMatchedTraveler(Base):
    __tablename__ = "plannr_matched_travelers"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("plannr_trips.id"), nullable=True, index=True)
    name = Column(String, nullable=False)             # 'Priya S.'
    city = Column(String, nullable=False)             # 'Delhi'
    match_pct = Column(Integer, nullable=False)       # 92
    trips_count = Column(Integer, default=0)          # 12
    interests = Column(Text, nullable=False)          # JSON array
    date_flexibility = Column(String, nullable=False) # 'Nov 10-22'
    invited = Column(Boolean, default=False)

    trip = relationship("PlannrTrip", back_populates="matched_travelers")


