import os
import json
import uuid
import re
import random
from datetime import datetime, timedelta
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger("orbit.plannr")

try:
    from claude_agent import (
        run_claude_travel_agent,
        is_claude_available,
        get_anthropic_api_key,
    )
except Exception:
    run_claude_travel_agent = None
    is_claude_available = lambda *args, **kwargs: False
    get_anthropic_api_key = lambda *args, **kwargs: None

from database import get_db
from models import (
    PlannrPackage,
    PlannrTrip,
    PlannrTripDay,
    PlannrTripStop,
    PlannrTripMember,
    PlannrPoll,
    PlannrReel,
    PlannrMatchedTraveler,
)
from schemas import (
    PlannrPackageResponse,
    PlannrPackagesListResponse,
    PlannrTripDetailResponse,
    PlannrTripDayResponse,
    PlannrTripStopResponse,
    PlannrTripMemberResponse,
    PlannrPollResponse,
    PlannrPollOption,
    PlannrMatchedTravelerResponse,
    PlannrCartBreakdown,
    PlannrReelResponse,
    PlannrReelPlace,
    PlannrGenerateRequest,
    PlannrReelScanRequest,
    PlannrReelBuildItineraryRequest,
    PlannrAddStopRequest,
    PlannrRegenerateDayRequest,
    PlannrVoteRequest,
    PlannrInviteRequest,
    PlannrPayShareRequest,
)

router = APIRouter(prefix="/api/plannr", tags=["Plannr Travel Superapp"])


# ─────────────────────────────────────────────────────────────────────────────
# Helper Serializers
# ─────────────────────────────────────────────────────────────────────────────

def _safe_json_loads(val: Any, default=None):
    if val is None:
        return default if default is not None else []
    if isinstance(val, (list, dict)):
        return val
    try:
        return json.loads(val)
    except Exception:
        return default if default is not None else []


def serialize_package(p: PlannrPackage) -> PlannrPackageResponse:
    inclusions = _safe_json_loads(p.inclusions, [])
    return PlannrPackageResponse(
        id=p.id,
        title=p.title,
        country=p.country,
        days=p.days,
        starting_price=p.starting_price,
        image=p.image,
        vector_type=p.vector_type,
        tag=p.tag,
        rating=p.rating,
        inclusions=inclusions,
    )


def serialize_stop(s: PlannrTripStop) -> PlannrTripStopResponse:
    return PlannrTripStopResponse(
        id=s.id,
        trip_day_id=s.trip_day_id,
        time_slot=s.time_slot,
        place_name=s.place_name,
        subtitle=s.subtitle,
        category=s.category,
        price_per_person=s.price_per_person,
        is_booked=bool(s.is_booked),
        is_reserve_only=bool(s.is_reserve_only),
        is_from_reel=bool(s.is_from_reel),
        booking_ref=s.booking_ref,
    )


def serialize_day(d: PlannrTripDay) -> PlannrTripDayResponse:
    stops = [serialize_stop(s) for s in sorted(d.stops, key=lambda x: x.time_slot)]
    return PlannrTripDayResponse(
        id=d.id,
        trip_id=d.trip_id,
        day_number=d.day_number,
        day_title=d.day_title,
        summary=d.summary,
        stops=stops,
    )


def serialize_member(m: PlannrTripMember) -> PlannrTripMemberResponse:
    return PlannrTripMemberResponse(
        id=m.id,
        trip_id=m.trip_id,
        name=m.name,
        initials=m.initials,
        status=m.status,
        share_amount=m.share_amount,
        is_current_user=bool(m.is_current_user),
    )


def serialize_poll(p: Optional[PlannrPoll]) -> Optional[PlannrPollResponse]:
    if not p:
        return None
    raw_opts = _safe_json_loads(p.options, [])
    options = [
        PlannrPollOption(
            id=str(o.get("id", f"opt_{idx}")),
            title=str(o.get("title", "")),
            votes=int(o.get("votes", 0)),
            voted_by=list(o.get("voted_by", [])),
        )
        for idx, o in enumerate(raw_opts)
    ]
    return PlannrPollResponse(
        id=p.id,
        trip_id=p.trip_id,
        question=p.question,
        ends_in_hours=p.ends_in_hours,
        options=options,
    )


def serialize_traveler(t: PlannrMatchedTraveler) -> PlannrMatchedTravelerResponse:
    interests = _safe_json_loads(t.interests, [])
    return PlannrMatchedTravelerResponse(
        id=t.id,
        trip_id=t.trip_id,
        name=t.name,
        city=t.city,
        match_pct=t.match_pct,
        trips_count=t.trips_count,
        interests=interests,
        date_flexibility=t.date_flexibility,
        invited=bool(t.invited),
    )


def serialize_reel(r: PlannrReel) -> PlannrReelResponse:
    raw_places = _safe_json_loads(r.places_detected, [])
    places = [
        PlannrReelPlace(
            name=p.get("name", "Scenic Location"),
            match_pct=int(p.get("match_pct", 90)),
            timestamp=p.get("timestamp"),
            duration=p.get("duration"),
            tag=p.get("tag"),
        )
        for p in raw_places
    ]
    return PlannrReelResponse(
        id=r.id,
        reel_url=r.reel_url,
        creator_handle=r.creator_handle,
        creator_name=r.creator_name,
        creator_avatar=r.creator_avatar,
        video_title=r.video_title,
        caption=r.caption,
        places_detected=places,
        likes_count=r.likes_count,
        comments_count=r.comments_count,
        video_poster_url=r.video_poster_url,
    )


def compute_cart_breakdown(trip: PlannrTrip) -> PlannrCartBreakdown:
    all_stops = []
    for day in trip.days:
        all_stops.extend(day.stops)

    total_stops = len(all_stops)
    booked_stops_count = sum(1 for s in all_stops if s.is_booked)
    unbooked_stops_count = total_stops - booked_stops_count
    total_cost = sum(s.price_per_person for s in all_stops)

    categories_breakdown: Dict[str, int] = {}
    for s in all_stops:
        cat = s.category or "Activity"
        categories_breakdown[cat] = categories_breakdown.get(cat, 0) + (s.price_per_person or 0)

    # Share per member
    member_count = len(trip.members) if trip.members else 1
    share_per_person = trip.budget_per_person or (total_cost // member_count if member_count else total_cost)

    return PlannrCartBreakdown(
        total_stops=total_stops,
        booked_stops_count=booked_stops_count,
        unbooked_stops_count=unbooked_stops_count,
        total_cost=total_cost,
        categories_breakdown=categories_breakdown,
        share_per_person=share_per_person,
    )


def serialize_trip(trip: PlannrTrip) -> PlannrTripDetailResponse:
    days = [serialize_day(d) for d in sorted(trip.days, key=lambda x: x.day_number)]
    members = [serialize_member(m) for m in trip.members]
    poll = serialize_poll(trip.polls[0]) if trip.polls else None
    matched_travelers = [serialize_traveler(t) for t in trip.matched_travelers]
    cart_breakdown = compute_cart_breakdown(trip)

    return PlannrTripDetailResponse(
        id=trip.id,
        title=trip.title,
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        total_days=trip.total_days,
        budget_per_person=trip.budget_per_person,
        total_budget=trip.total_budget,
        currency=trip.currency or "INR",
        status=trip.status or "active",
        days=days,
        members=members,
        poll=poll,
        matched_travelers=matched_travelers,
        cart_breakdown=cart_breakdown,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. Packages Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/packages", response_model=PlannrPackagesListResponse)
def get_packages(
    max_budget: Optional[int] = Query(None, description="Filter packages with starting_price <= max_budget"),
    db: Session = Depends(get_db),
):
    """Filter packages by max_budget query param or return all packages."""
    query = db.query(PlannrPackage)
    if max_budget is not None and max_budget > 0:
        query = query.filter(PlannrPackage.starting_price <= max_budget)

    packages = query.order_by(PlannrPackage.starting_price.asc()).all()
    return PlannrPackagesListResponse(
        total=len(packages),
        packages=[serialize_package(p) for p in packages],
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Trip Generation via NLP Prompt
# ─────────────────────────────────────────────────────────────────────────────

def _parse_trip_entities(
    prompt: str,
    style: Optional[str] = None,
    destination_hint: Optional[str] = None,
    budget_hint: Optional[int] = None,
    travellers_hint: Optional[str] = None,
):
    """Extract destination, days, travelers, budget, micro-hours and special keywords from natural language prompt."""
    prompt_lower = prompt.lower()

    # 1. Micro-trip / transit hours detection (e.g. "agar mai bahar jao 3 ghante", "3 hours in Delhi", "2 hr layover")
    is_micro_trip = False
    micro_hours = 3
    hours_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:ghanta|ghante|hours?|hrs?)\b", prompt_lower)
    if hours_match:
        is_micro_trip = True
        try:
            micro_hours = int(float(hours_match.group(1)))
        except Exception:
            micro_hours = 3
    elif any(k in prompt_lower for k in ["bahar jao", "bhar jao", "micro", "layover", "transit", "short escape", "quick escape", "layover escape"]):
        is_micro_trip = True
        micro_hours = 3

    # 2. Comprehensive Destination Detection
    destinations_map = {
        "delhi": "Delhi",
        "ncr": "Delhi",
        "aerocity": "Delhi",
        "connaught": "Delhi",
        "bangla sahib": "Delhi",
        "gurgaon": "Delhi",
        "gurugram": "Delhi",
        "noida": "Delhi",
        "mumbai": "Mumbai",
        "bandra": "Mumbai",
        "bombay": "Mumbai",
        "bangalore": "Bangalore",
        "bengaluru": "Bangalore",
        "koramangala": "Bangalore",
        "indiranagar": "Bangalore",
        "goa": "Goa",
        "vagator": "Goa",
        "anjuna": "Goa",
        "calangute": "Goa",
        "palolem": "Goa",
        "rishikesh": "Rishikesh",
        "haridwar": "Rishikesh",
        "tapovan": "Rishikesh",
        "kashmir": "Kashmir",
        "srinagar": "Kashmir",
        "gulmarg": "Kashmir",
        "pahalgam": "Kashmir",
        "jaipur": "Jaipur",
        "samode": "Jaipur",
        "rajasthan": "Jaipur",
        "udaipur": "Udaipur",
        "manali": "Manali",
        "kasol": "Manali",
        "himachal": "Manali",
        "ladakh": "Ladakh",
        "leh": "Ladakh",
        "amritsar": "Amritsar",
        "agra": "Agra",
        "kerala": "Kerala",
        "munnar": "Kerala",
        "dubai": "Dubai",
        "abu dhabi": "Dubai",
        "thailand": "Thailand",
        "phuket": "Thailand",
        "bangkok": "Thailand",
        "krabi": "Thailand",
        "vietnam": "Vietnam",
        "hanoi": "Vietnam",
        "da nang": "Vietnam",
        "bali": "Bali",
        "ubud": "Bali",
        "canggu": "Bali",
        "japan": "Japan",
        "tokyo": "Japan",
        "kyoto": "Japan",
        "singapore": "Singapore",
        "paris": "Paris",
        "london": "London",
        "maldives": "Maldives",
    }

    detected_dest = None
    if destination_hint and destination_hint.strip() and destination_hint.lower() not in ["bali", "destination"]:
        detected_dest = destination_hint.strip()

    if not detected_dest:
        for k, v in destinations_map.items():
            if k in prompt_lower:
                detected_dest = v
                break

    if not detected_dest:
        # Check regex for "in <City>" or "to <City>" or "for <City>"
        city_match = re.search(r"\b(?:in|to|for|at|visit|explore)\s+([A-Z][a-zA-Z]+)", prompt)
        if city_match:
            candidate = city_match.group(1)
            if candidate.lower() not in ["days", "hours", "friends", "the", "a", "an", "under", "with"]:
                detected_dest = candidate

    if not detected_dest:
        if is_micro_trip:
            detected_dest = "Delhi"
        elif "beach" in prompt_lower or "party" in prompt_lower:
            detected_dest = "Goa"
        elif "rafting" in prompt_lower or "glamping" in prompt_lower:
            detected_dest = "Rishikesh"
        elif "snow" in prompt_lower or "houseboat" in prompt_lower:
            detected_dest = "Kashmir"
        else:
            detected_dest = "Goa"

    # 3. Days Detection
    if is_micro_trip:
        detected_days = 1
    else:
        detected_days = 4
        if "weekend" in prompt_lower:
            detected_days = 2
        elif "week" in prompt_lower:
            detected_days = 7
        days_match = re.search(r"(\d+)\s*(?:days?|nights?)", prompt_lower)
        if days_match:
            detected_days = int(days_match.group(1))
            if "night" in days_match.group(0) and detected_days < 14:
                detected_days += 1
        detected_days = max(1, min(detected_days, 14))

    # 4. Travelers Detection
    detected_travelers = 4
    if travellers_hint:
        trav_num = re.search(r"(\d+)", travellers_hint)
        if trav_num:
            detected_travelers = int(trav_num.group(1))
    friends_match = re.search(r"(\d+)\s*(?:friends?|pax|mates|buddies|people)", prompt_lower)
    if friends_match:
        detected_travelers = int(friends_match.group(1)) + 1
    elif "solo" in prompt_lower or "myself" in prompt_lower or "alone" in prompt_lower:
        detected_travelers = 1
    elif "couple" in prompt_lower or "partner" in prompt_lower or "with my wife" in prompt_lower or "with my husband" in prompt_lower:
        detected_travelers = 2

    # 5. Budget Detection
    if budget_hint and budget_hint > 0:
        budget_per_person = budget_hint
    elif is_micro_trip:
        budget_per_person = 499
        num_match = re.search(r"(?:under|around|budget of|max|within|₹|rs\.?)\s*([0-9]{2,5})", prompt_lower)
        if num_match:
            budget_per_person = int(num_match.group(1))
    else:
        k_match = re.search(r"(?:under|around|budget of|max|within)?\s*([0-9]{1,3})\s*k\b", prompt_lower)
        if k_match:
            budget_per_person = int(k_match.group(1)) * 1000
        else:
            num_match = re.search(r"(?:under|around|budget of|max|within|₹|rs\.?)\s*([0-9]{2,3}(?:,[0-9]{3})|[0-9]{4,6})", prompt_lower)
            if num_match:
                clean_str = num_match.group(1).replace(",", "")
                budget_per_person = int(clean_str)
            else:
                default_budgets = {
                    "Rishikesh": 4999,
                    "Jaipur": 8999,
                    "Goa": 12500,
                    "Kashmir": 21999,
                    "Thailand": 25000,
                    "Dubai": 32000,
                    "Vietnam": 45000,
                    "Bali": 52000,
                    "Japan": 95000,
                }
                budget_per_person = default_budgets.get(detected_dest, 15000)

    total_budget = budget_per_person * detected_travelers

    # 6. Dates Formatting
    if is_micro_trip:
        start_str = "Today"
        end_str = "Today"
    else:
        start_dt = datetime.now() + timedelta(days=15)
        end_dt = start_dt + timedelta(days=detected_days - 1)
        start_str = start_dt.strftime("%d %b")
        end_str = end_dt.strftime("%d %b")

    # 7. Title Construction
    selected_vibe = style if style and style != "Balanced" else "Curated"
    if is_micro_trip:
        title = f"{detected_dest} {micro_hours}-Hour Micro-Escape"
    elif "friends" in prompt_lower:
        title = f"{detected_dest} with Friends"
    elif "boys" in prompt_lower:
        title = f"{detected_dest} with the boys"
    else:
        title = f"{detected_dest} {selected_vibe} Escape"

    return {
        "destination": detected_dest,
        "total_days": detected_days,
        "is_micro_trip": is_micro_trip,
        "micro_hours": micro_hours,
        "travelers_count": detected_travelers,
        "budget_per_person": budget_per_person,
        "total_budget": total_budget,
        "start_date": start_str,
        "end_date": end_str,
        "title": title,
    }


def _generate_curated_days_and_stops(destination: str, total_days: int, prompt: str, is_micro_trip: bool = False, micro_hours: int = 3):
    """Generate realistic days and stops tailored to destination, time bounds, and prompt keywords."""
    prompt_l = prompt.lower()

    # ── SPECIAL CASE: 1-3 Hour Micro-Trips / Transit Layover ──
    if is_micro_trip:
        if destination == "Mumbai":
            stops = [
                ("00:00", "Bandra-Worli Sea Link Cab", "Express coastal sea-link drive · 25 mins", "Activity", 240, True, "CAB-MUM-01"),
                ("00:30", "Bandstand & Castella Fort", "Arabian sea panoramic view & sea breeze · 45 mins", "Walk", 0, False, None),
                ("01:20", "Subko Specialty Coffee & Craftery", "Sourdough toast & artisanal iced pour-over · 45 mins", "Food", 380, False, None),
                ("02:10", "Fast Return Cab with Flight Buffer", "Guaranteed arrival with 50 min terminal clearance", "Activity", 240, True, "CAB-MUM-02"),
            ]
        elif destination == "Bangalore":
            stops = [
                ("00:00", "Purple Line Namma Metro / Cab", "Fast-track bypass to Indiranagar 12th Main · 25 mins", "Activity", 150, True, "BLR-MET-01"),
                ("00:30", "Third Wave Roasters / Glen's Bakehouse", "Cold brew coffee & signature red velvet slice · 45 mins", "Food", 320, False, None),
                ("01:20", "Defence Colony Canopy Walk & Boutiques", "Shaded boulevard stroll & bookshops · 45 mins", "Walk", 0, False, None),
                ("02:10", "Stress-Free Express Return", "Guaranteed terminal arrival with safety buffer", "Activity", 150, True, "BLR-MET-02"),
            ]
        else: # Default Delhi NCR Micro-Trip (Bangla Sahib + Wenger's + Airport Express)
            stops = [
                ("00:00", "Airport Express Orange Metro Line", "High-speed 135 km/h train from T3 to Shivaji Stadium · 20 mins", "Activity", 60, True, "DMRC-OR-01"),
                ("00:30", "Gurudwara Bangla Sahib Sarovar", "Peaceful marble parikrama, golden dome & holy sarovar · 45 mins", "Culture", 0, False, None),
                ("01:25", "Wenger's Deli & Blue Tokai Coffee", "Famous Delhi mutton patty & artisanal nitro cold brew · 45 mins", "Food", 350, False, None),
                ("02:15", "Airport Express Return & Buffer", "Express return train to T3 with 45 mins security clearance buffer", "Activity", 60, True, "DMRC-OR-02"),
            ]

        return [{
            "day_number": 1,
            "day_title": f"{destination} {micro_hours}-Hour Micro-Escape",
            "summary": f"High-precision {micro_hours}-hour micro-itinerary designed with 0-stress transit timing, iconic cultural anchor, artisanal coffee, and guaranteed return buffer.",
            "stops": stops,
        }]

    # ── MULTI-DAY CATALOGS FOR TOP DESTINATIONS ──
    catalog = {
        "Delhi": [
            ("Old Delhi Heritage & Culinary Soul", [
                ("09:00", "Jama Masjid & Chandni Chowk", "Historic Mughal mosque & electric cycle rickshaw · 2 hrs", "Culture", 200, True, "PLN-DEL-101"),
                ("11:30", "Karim's Historic Kebab Feast", "Mutton seekh, burra & roomali roti · 1.5 hrs", "Food", 850, False, None),
                ("14:00", "Red Fort (Lal Qila) Walk", "UNESCO World Heritage fortress walk · 2 hrs", "Culture", 500, True, "PLN-DEL-102"),
                ("17:30", "Connaught Place & Wenger's Deli", "Colonial Georgian colonnades & artisanal brew · 2 hrs", "Food", 400, False, None),
            ]),
            ("Mughal Splendour & Sunder Nursery", [
                ("09:30", "Humayun's Tomb Garden", "Precursor to Taj Mahal in red sandstone · 2 hrs", "Culture", 500, True, "PLN-DEL-201"),
                ("12:00", "Sunder Nursery Heritage Walk & Fabcafe", "Mughal monuments, lakeside stroll & thali · 2.5 hrs", "Food", 1200, False, None),
                ("16:00", "National Gallery of Modern Art", "Contemporary Indian art exhibitions · 1.5 hrs", "Culture", 150, False, None),
                ("18:30", "India Gate & Kartavya Path Sunset", "Illuminated boulevard stroll & ice cream · 1.5 hrs", "Walk", 0, False, None),
            ]),
            ("Hauz Khas Village & Lodhi Art District", [
                ("10:00", "Lodhi Art District Open Murals", "India's first public open-air art district · 2 hrs", "Walk", 0, False, None),
                ("13:00", "Dilli Haat Food Courts & Crafts", "Regional state pavilions & handcrafted shawls · 2.5 hrs", "Food", 600, False, None),
                ("17:00", "Hauz Khas Social & Deer Park Lake", "Sunset lake terrace cocktails & medieval ruins · 3 hrs", "Activity", 1500, True, "PLN-DEL-301"),
            ]),
        ],
        "Goa": [
            ("Vagator Pool Villa & Sunset Sundowner", [
                ("12:00", "Vagator Boutique Pool Villa Check-in", "Welcome coconut water & private pool plunge · 2 hrs", "Stay", 3500, True, "PLN-GOA-101"),
                ("15:00", "Burger Factory Anjuna", "Famous gourmet avocado beef burger & craft beer · 1.5 hrs", "Food", 800, False, None),
                ("17:30", "Thalassa / Titlie Sunset Cliff", "Clifftop Greek sunset lounge & cocktails · 3 hrs", "Food", 2200, True, "PLN-GOA-102"),
                ("22:00", "HillTop / Curlies Night Session", "Psytrance beachfront vibes · 3 hrs", "Activity", 1500, False, None),
            ]),
            ("Coastal Scooter Run & Watersports", [
                ("09:00", "Scooter Rental & Ashvem Coastal Ride", "Open-air scenic coastal highway run · 2 hrs", "Activity", 400, True, "PLN-GOA-201"),
                ("11:30", "Calangute Jet Ski & Parasailing", "Tandem parasail over Arabian Sea · 2 hrs", "Activity", 2200, True, "PLN-GOA-202"),
                ("14:30", "Gunpowder Assagao Southern Feast", "Kerala beef fry, appams & kokum cooler · 1.5 hrs", "Food", 1200, False, None),
                ("17:30", "Anjuna Flea Market & Beach Sunset", "Handmade silver jewellery & sundowner · 2.5 hrs", "Walk", 0, False, None),
            ]),
            ("South Goa Secret Coves & Dolphin Boat", [
                ("08:30", "South Goa Scenic Drive to Palolem", "Coconut plantation road · 1.5 hrs", "Activity", 1200, True, "PLN-GOA-301"),
                ("10:30", "Private Boat to Butterfly Beach", "Dolphin spotting & secret cove swimming · 2 hrs", "Activity", 1800, True, "PLN-GOA-302"),
                ("13:30", "Cola Beach Freshwater Lagoon", "Kayaking where fresh river meets the sea · 2 hrs", "Activity", 800, False, None),
                ("17:00", "Cabo De Rama Fort Clifftop Sunset", "Portuguese fortress over infinite ocean · 2 hrs", "Walk", 0, False, None),
            ]),
            ("Mandovi River Catamaran & Casino", [
                ("10:30", "Fontainhas Latin Quarter Walk", "Heritage colourful Portuguese villas & bakeries · 2 hrs", "Walk", 300, False, None),
                ("13:00", "Viva Panjim Traditional Seafood", "Goan fish curry thali & prawn balchão · 1.5 hrs", "Food", 900, False, None),
                ("17:00", "Sunset Catamaran Cruise on Mandovi", "Live music & drinks on the river · 2 hrs", "Activity", 1500, True, "PLN-GOA-401"),
                ("20:30", "Majestic Pride Casino Experience", "Unlimited dinner buffet, drinks & live shows · 3 hrs", "Activity", 3000, True, "PLN-GOA-402"),
            ]),
            ("Dudhsagar Waterfalls & Spice Plantation", [
                ("07:30", "4x4 Jungle Jeep Safari to Dudhsagar", "Gushing multi-tiered waterfall swimming · 4 hrs", "Activity", 2400, True, "PLN-GOA-501"),
                ("13:30", "Sahakari Organic Spice Plantation Lunch", "Traditional buffet on banana leaf & spice tour · 2 hrs", "Food", 700, True, "PLN-GOA-502"),
                ("17:30", "Miramar Beach Farewell Sunset", "Relaxed beach walk & cashew feni tasting · 2 hrs", "Walk", 0, False, None),
            ]),
        ],
        "Rishikesh": [
            ("Tapovan Glamping & Triveni Ghat Aarti", [
                ("11:00", "Swiss Dome Riverside Glamping Check-in", "Luxury dome tent on the Ganga bank · 1.5 hrs", "Stay", 2500, True, "PLN-RSH-101"),
                ("13:30", "The Beatles (Chaurasi Kutiya) Ashram", "Graffiti domes & meditation hall in Rajaji forest · 2 hrs", "Culture", 600, True, "PLN-RSH-102"),
                ("17:30", "Triveni Ghat Maha Aarti", "Flutes, conch shells & floating Ganga diyas · 2 hrs", "Culture", 0, False, None),
                ("20:00", "Chotiwala Traditional Thali", "Legendary North Indian feast · 1 hr", "Food", 450, False, None),
            ]),
            ("16km Grade-3 Ganga Rafting & Cliff Jump", [
                ("08:30", "Marine Drive to NIM Beach Rafting", "16km thrilling rapids: Three Blind Mice, Roller Coaster · 3 hrs", "Activity", 1500, True, "PLN-RSH-201"),
                ("12:00", "Maggi & Tea at Rafting Cliff Jump Spot", "30-foot plunge into holy Ganga waters · 1 hr", "Food", 150, False, None),
                ("14:30", "Campfire & Riverside Volleyball", "Evening snacks, barbecue & acoustic music · 3 hrs", "Activity", 0, False, None),
            ]),
            ("Waterfall Hike & Riverside Cafe Trail", [
                ("08:00", "Neer Garh Waterfall Hike", "Trek through cascading limestone pools · 2.5 hrs", "Activity", 200, False, None),
                ("11:30", "Little Buddha Riverside Cafe", "Wood-fired pizza, falafel platter & river view · 2 hrs", "Food", 750, False, None),
                ("15:00", "Laxman Jhula Suspension Bridge & Ghats", "Local spice, rudraksha & singing bowls walk · 2 hrs", "Walk", 0, False, None),
            ]),
        ],
        "Kashmir": [
            ("Dal Lake Cedar Houseboat & Sunset Shikara", [
                ("11:30", "Nigeen Lake Handcrafted Houseboat Check-in", "Carved walnut wood suite with shikara access · 2 hrs", "Stay", 4500, True, "PLN-KSH-101"),
                ("14:00", "Ahdoos Wazwan Feast", "Rista, Rogan Josh & Gushtaba with saffron rice · 1.5 hrs", "Food", 1200, False, None),
                ("17:00", "Golden Hour Shikara Ride to Char Chinar", "Floating gardens & sunset over Zabarwan mountains · 2 hrs", "Activity", 1000, True, "PLN-KSH-102"),
            ]),
            ("Gulmarg Gondola & Snow Peaks", [
                ("08:00", "Private Cab Drive to Gulmarg", "Scenic alpine pine route · 1.5 hrs", "Activity", 1800, True, "PLN-KSH-201"),
                ("10:00", "Gulmarg Gondola Phase 1 & Phase 2", "Cable car to 14,000 ft Apharwat peak snow line · 3.5 hrs", "Activity", 2200, True, "PLN-KSH-202"),
                ("14:30", "Highland Park Kehwa & Hot Chocolate", "Classic 1960s ski lodge lounge · 1.5 hrs", "Food", 600, False, None),
            ]),
            ("Pahalgam Betaab Valley & Pine Trails", [
                ("08:30", "Drive to Valley of Shepherds (Pahalgam)", "Along Lidder river and apple orchards · 2.5 hrs", "Activity", 2000, True, "PLN-KSH-301"),
                ("11:30", "Betaab Valley & Aru Valley Pony Trail", "Lush meadows where Bollywood blockbusters were shot · 3 hrs", "Activity", 1500, False, None),
                ("16:00", "Lidder River Trout Fish Tasting", "Freshly grilled river trout · 1.5 hrs", "Food", 900, False, None),
            ]),
            ("Mughal Gardens & Saffron Market", [
                ("09:30", "Nishat & Shalimar Bagh Terraced Fountains", "Royal 17th century Mughal water gardens · 2.5 hrs", "Culture", 300, True, "PLN-KSH-401"),
                ("13:00", "Lal Chowk Saffron & Dry Fruit Shopping", "Direct saffron, walnuts & pure pashmina shawls · 2.5 hrs", "Walk", 1500, False, None),
            ]),
        ],
        "Dubai": [
            ("Burj Khalifa & Downtown Fountains", [
                ("10:00", "At The Top Burj Khalifa (124th & 125th Floor)", "World's tallest observatory deck vista · 2 hrs", "Activity", 4200, True, "PLN-DXB-101"),
                ("13:00", "Time Out Market Downtown Dubai", "Artisanal food hall overlooking Burj Lake · 1.5 hrs", "Food", 1600, False, None),
                ("16:00", "Dubai Mall & Underwater Aquarium", "Massive shark tunnel & luxury boulevard · 2 hrs", "Culture", 1800, True, "PLN-DXB-102"),
                ("19:30", "Dubai Fountain Spectacle & Dinner", "Choreographed water show at the lake · 2 hrs", "Food", 2500, False, None),
            ]),
            ("VIP Red Dunes 4x4 Desert Safari", [
                ("14:30", "Luxury Land Cruiser Desert Pickup", "Transfer to Lahbab high red dunes · 1 hr", "Activity", 0, True, "PLN-DXB-201"),
                ("16:00", "Dune Bashing, Sandboarding & Quad Biking", "Adrenaline 4x4 dune ride & sunset photo stop · 2.5 hrs", "Activity", 3500, True, "PLN-DXB-202"),
                ("19:00", "Bedouin Royal Camp BBQ & Fire Show", "Tanoura dance, belly show & Arabian buffet · 3 hrs", "Food", 1200, True, "PLN-DXB-203"),
            ]),
            ("Dubai Marina Luxury Yacht & Palm Jumeirah", [
                ("10:00", "Private 50-Foot Yacht Cruise", "Cruising past Ain Dubai, Marina & Atlantis · 2 hrs", "Activity", 3200, True, "PLN-DXB-301"),
                ("13:00", "The Pointe Palm Jumeirah Seafood Lunch", "Scenic oceanfront seafood dining · 2 hrs", "Food", 2400, False, None),
                ("16:30", "Aura Skypool 360-Degree Infinity Pool", "World's highest 360 panoramic infinity pool · 3 hrs", "Activity", 4500, True, "PLN-DXB-302"),
            ]),
        ],
        "Jaipur": [
            ("Amber Fort & Royal Sheesh Mahal", [
                ("09:00", "Amber Fort Hilltop Palace Tour", "Mirror palace (Sheesh Mahal) & Rajput architecture · 2.5 hrs", "Culture", 500, True, "PLN-JAI-101"),
                ("12:30", "1135 AD Royal Fine Dining", "Dine inside fort ramparts with royal recipes · 2 hrs", "Food", 2200, False, None),
                ("15:30", "Jal Mahal (Water Palace) Photo Stop", "Floating palace in Man Sagar lake · 45 mins", "Walk", 0, False, None),
                ("18:30", "Chokhi Dhani Ethnic Rajasthani Village", "Puppet show, camel ride & royal thali buffet · 3 hrs", "Culture", 1200, True, "PLN-JAI-102"),
            ]),
            ("Nahargarh Fort Sunset & Pink City Bazaars", [
                ("10:00", "Hawa Mahal (Palace of Winds) & City Palace", "953 jharokhas & royal museum artifacts · 2.5 hrs", "Culture", 700, True, "PLN-JAI-201"),
                ("13:00", "Rawat Mishthan Bhandar Pyaaz Kachori", "Legendary onion kachori & lassi · 1 hr", "Food", 250, False, None),
                ("15:00", "Johari Bazaar Gem & Blue Pottery Walk", "Traditional lac bangles & Jaipur quilts · 2 hrs", "Walk", 0, False, None),
                ("17:30", "Nahargarh Fort Padao Sunset Lookout", "Panoramic golden hour view over the entire Pink City · 2 hrs", "Activity", 300, False, None),
            ]),
        ],
        "Japan": [
            ("Tokyo Shibuya & Digital Art Wonders", [
                ("09:30", "TeamLab Planets Immersive Digital Art", "Walk through water and infinite crystal universes · 2.5 hrs", "Culture", 2800, True, "PLN-TYO-101"),
                ("13:00", "Tsukiji Outer Market Fresh Sushi", "Fresh otoro tuna, wagyu skewers & tamagoyaki · 1.5 hrs", "Food", 2200, False, None),
                ("16:00", "Shibuya Crossing & Shibuya Sky 360", "Iconic scramble crossing & glass rooftop deck · 2 hrs", "Activity", 2000, True, "PLN-TYO-102"),
                ("19:00", "Omoide Yokocho Yakitori Alleys", "Atmospheric lantern-lit charcoal skewers in Shinjuku · 2 hrs", "Food", 1800, False, None),
            ]),
            ("Shinkansen Bullet Train to Kyoto Heritage", [
                ("08:30", "Tokaido Shinkansen to Kyoto (300 km/h)", "Scenic bullet train journey past Mount Fuji · 2.5 hrs", "Activity", 8500, True, "PLN-KYO-201"),
                ("12:00", "Gion Historic Ryokan Onsen Check-in", "Traditional tatami suite & cedar thermal bath · 2 hrs", "Stay", 6500, True, "PLN-KYO-202"),
                ("15:00", "Fushimi Inari 10,000 Vermilion Gates", "Sacred mountain path of red torii gates · 2.5 hrs", "Culture", 0, False, None),
                ("18:30", "Gion Geisha District Evening Walk & Kaiseki", "Multi-course seasonal Kyoto dining · 2 hrs", "Food", 4500, False, None),
            ]),
        ],
        "Bali": [
            ("Ubud Culture & Rice Terraces", [
                ("07:30", "Tegallalang Rice Terrace", "Sunrise walk · 2 hrs", "Activity", 1200, True, "PLN-UB-771"),
                ("10:30", "Zest Café Ubud", "Plant-based artisanal brunch · 1.5 hrs", "Food", 1800, False, None),
                ("13:00", "Tirta Empul Water Purification", "Balinese sacred spring ritual · 2 hrs", "Culture", 800, True, "PLN-UB-882"),
                ("18:00", "Campuhan Ridge & Sunset Cocktails", "Ridge trail & sunset at Sayan House · 2.5 hrs", "Walk", 2400, False, None),
            ]),
            ("Mount Batur Volcano Sunrise Trek", [
                ("03:30", "Mount Batur 4WD Jeep Sunrise", "Guided volcanic sunrise above clouds · 3.5 hrs", "Activity", 3500, True, "PLN-MB-901"),
                ("09:30", "Toya Devasya Thermal Hot Springs", "Lakeside mineral infinity pools · 2 hrs", "Activity", 1500, True, "PLN-TD-902"),
                ("13:00", "Akasa Kintamani Crater Cafe", "Panoramic volcano view coffee · 1.5 hrs", "Food", 900, False, None),
                ("17:30", "Cretya Sunset Pool Club", "Tiered jungle infinity pool · 3 hrs", "Activity", 2200, False, None),
            ]),
            ("Nusa Penida Coastal Safari", [
                ("07:00", "Sanur Fast Boat to Nusa Penida", "Speedboat transfer across ocean · 45 mins", "Activity", 1800, True, "PLN-NP-101"),
                ("09:00", "Kelingking Beach T-Rex Cliff", "Dramatic ocean viewpoint & trail · 2 hrs", "Walk", 500, True, "PLN-NP-102"),
                ("12:30", "Broken Beach & Angel's Billabong", "Natural limestone sea arch & tidal pool · 1.5 hrs", "Walk", 500, False, None),
                ("15:00", "Crystal Bay Manta Snorkel", "Swimming with giant manta rays · 2 hrs", "Activity", 2000, False, None),
            ]),
            ("Canggu Beach & Surf Culture", [
                ("08:30", "Crate Cafe Canggu", "Organic acai bowls & specialty brew · 1.5 hrs", "Food", 1100, False, None),
                ("11:00", "Echo Beach Surf Session", "Guided wave surfing with local pro · 2 hrs", "Activity", 2500, True, "PLN-CG-201"),
                ("16:30", "La Brisa Sunset Beachfront Lounge", "Boho beachfront cabana & seafood BBQ · 3.5 hrs", "Food", 3200, False, None),
            ]),
        ],
        "Vietnam": [
            ("Hanoi Heritage & Old Quarter", [
                ("08:30", "Egg Coffee at Cafe Giang", "Original egg coffee tasting · 1 hr", "Food", 300, True, "PLN-HN-101"),
                ("10:30", "Train Street Railway Crossing", "Famous railway cafe experience · 1.5 hrs", "Walk", 400, False, None),
                ("13:00", "Bun Cha Huong Lien", "Legendary grilled pork noodles lunch · 1.5 hrs", "Food", 600, False, None),
                ("16:00", "Hoan Kiem Lake & Ngoc Son Temple", "Historical island temple walk · 2 hrs", "Culture", 500, True, "PLN-HN-102"),
            ]),
            ("Ha Long Bay Emerald Cruise", [
                ("08:00", "Limousine Van to Ha Long Marina", "Express highway transfer · 2.5 hrs", "Activity", 1500, True, "PLN-HL-201"),
                ("12:00", "Luxury Cruise Check-in & Buffet", "Overnight cruise embarkation · 2 hrs", "Food", 4500, True, "PLN-HL-202"),
                ("14:30", "Sung Sot Surprise Cave Kayaking", "Limestone grotto exploration · 2.5 hrs", "Activity", 2000, False, None),
                ("18:30", "Sunset Squid Fishing & Cocktails", "Onboard deck sunset lounge · 3 hrs", "Activity", 1200, False, None),
            ]),
        ],
        "Thailand": [
            ("Phuket Old Town Heritage & Sunsets", [
                ("09:00", "Thalang Road Sino-Portuguese Walk", "Colonial shophouses & murals · 2 hrs", "Walk", 0, False, None),
                ("11:30", "Raya Restaurant Michelin Crab Curry", "Authentic southern Thai feast · 1.5 hrs", "Food", 1600, False, None),
                ("15:00", "Big Buddha Mountain Shrine", "360-degree island vista · 2 hrs", "Culture", 600, True, "PLN-PK-101"),
                ("18:30", "Promthep Cape Golden Hour Lookout", "Golden cliff lookout over Andaman sea · 1.5 hrs", "Walk", 0, False, None),
            ]),
            ("Phi Phi Islands & Maya Bay Speedboat", [
                ("07:30", "Speedboat to Maya Bay Lagoon", "The Beach iconic cove & snorkeling · 3 hrs", "Activity", 3200, True, "PLN-PP-201"),
                ("12:00", "Phi Phi Don Island Seafood Buffet", "Beachfront dining · 1.5 hrs", "Food", 1200, True, "PLN-PP-202"),
                ("14:30", "Pileh Lagoon Cliff Jumping", "Emerald natural lagoon swim · 2 hrs", "Activity", 1500, False, None),
            ]),
        ]
    }

    # If destination is in curated catalog, use it!
    if destination in catalog:
        selected_catalog = catalog[destination]
    else:
        # Procedural fallback for any arbitrary destination (Paris, Manali, Ladakh, Kerala, Rome, etc.)
        selected_catalog = [
            (f"{destination} Iconic Highlights & Heritage", [
                ("09:30", f"{destination} Landmark Exploration", f"Signature landmark & guided historical walk · 2 hrs", "Culture", 1200, True, f"PLN-{destination[:3].upper()}-101"),
                ("12:30", f"Signature Local Tasting & Artisanal Cafe", f"Curated regional delicacies & specialty brew · 1.5 hrs", "Food", 1400, False, None),
                ("15:00", f"{destination} Scenic Viewpoint Trail", f"Panoramic viewpoints & local boutique alleys · 2 hrs", "Walk", 400, False, None),
                ("18:30", f"Golden Hour Sunset Dining", f"Atmospheric sunset lounge with live music · 2.5 hrs", "Food", 2200, False, None),
            ]),
            (f"{destination} Adventure & Hidden Trails", [
                ("09:00", f"{destination} Guided Outdoor Safari / Excursion", f"Immersive adventure excursion into nature · 3 hrs", "Activity", 2800, True, f"PLN-{destination[:3].upper()}-201"),
                ("13:00", f"Riverside / Coastal Farm-to-Table Lunch", f"Fresh seasonal tasting menu · 1.5 hrs", "Food", 1100, False, None),
                ("16:00", f"Local Arts, Crafts & Market Walk", f"Authentic souvenirs & handicraft ateliers · 2 hrs", "Walk", 0, False, None),
            ]),
        ]

    result_days = []
    for i in range(total_days):
        cat_index = i % len(selected_catalog)
        day_title, stops = selected_catalog[cat_index]
        day_num = i + 1

        result_days.append({
            "day_number": day_num,
            "day_title": f"Day {day_num} · {day_title}",
            "summary": f"Curated itinerary featuring top highlights, authentic eateries, and hidden spots in {destination}.",
            "stops": stops,
        })

    return result_days


@router.post("/generate", response_model=PlannrTripDetailResponse)
def generate_trip(
    req: PlannrGenerateRequest,
    x_anthropic_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    Accepts NLP prompt, style, interests, hints.
    Integrates Claude 3.5 deep reasoning travel brain if key is available.
    Parses entities with intelligent heuristics, creates full PlannrTrip with days and stops,
    and returns serialized trip detail.
    """
    entities = _parse_trip_entities(
        prompt=req.prompt,
        style=req.style,
        destination_hint=req.destination,
        budget_hint=req.budget_per_person,
        travellers_hint=req.travellers,
    )
    trip_id = f"trip_{entities['destination'].lower()}_{uuid.uuid4().hex[:6]}"

    trip = PlannrTrip(
        id=trip_id,
        title=entities["title"],
        destination=entities["destination"],
        start_date=entities["start_date"],
        end_date=entities["end_date"],
        total_days=entities["total_days"],
        budget_per_person=entities["budget_per_person"],
        total_budget=entities["total_budget"],
        currency="INR",
        status="active",
        created_at=datetime.utcnow(),
    )
    db.add(trip)
    db.flush()

    # Members: Current user RS + friends
    share_per_member = entities["total_budget"] // entities["travelers_count"]
    sample_members = [
        ("Rohit Sharma", "RS", "paying", True),
        ("Aman Kapoor", "AK", "paid", False),
        ("Vikram Joshi", "VJ", "reminded", False),
        ("Nikhil Kulkarni", "NK", "pending", False),
        ("Siddharth Rao", "SR", "pending", False),
    ]

    for idx in range(min(entities["travelers_count"], len(sample_members))):
        name, initials, status_val, is_curr = sample_members[idx]
        mem = PlannrTripMember(
            id=f"{trip_id}_mem_{idx+1}",
            trip_id=trip_id,
            name=name,
            initials=initials,
            status=status_val,
            share_amount=share_per_member,
            is_current_user=is_curr,
        )
        db.add(mem)

    # Active Poll
    dest_name = entities["destination"]
    poll_q = f"{dest_name} — High-energy adventure or relaxed sunset dining?"
    poll = PlannrPoll(
        id=f"{trip_id}_poll",
        trip_id=trip_id,
        question=poll_q,
        ends_in_hours=24,
        options=json.dumps([
            {"id": "opt_1", "title": f"Adventure Tour in {dest_name}", "votes": 2, "voted_by": ["AK", "RS"]},
            {"id": "opt_2", "title": f"Leisure & Sunset Lounge", "votes": 1, "voted_by": ["VJ"]},
        ]),
    )
    db.add(poll)

    # Matched Travelers
    matched_data = [
        {"name": "Priya S.", "city": "Delhi", "match_pct": 94, "trips_count": 12, "interests": ["Cafes", "Photography", "Beaches"], "date_flexibility": "Flexible +/- 2 days"},
        {"name": "Karan M.", "city": "Gurugram", "match_pct": 88, "trips_count": 8, "interests": ["Trekking", "Nightlife", "Scooters"], "date_flexibility": "Exact dates"},
    ]
    for idx, mt in enumerate(matched_data, 1):
        traveler = PlannrMatchedTraveler(
            id=f"{trip_id}_match_{idx}",
            trip_id=trip_id,
            name=mt["name"],
            city=mt["city"],
            match_pct=mt["match_pct"],
            trips_count=mt["trips_count"],
            interests=json.dumps(mt["interests"]),
            date_flexibility=mt["date_flexibility"],
            invited=False,
        )
        db.add(traveler)

    # ── CLAUDE DEEP REASONING AGENT HOOK ──
    claude_used = False
    resolved_api_key = get_anthropic_api_key(req.api_key, x_anthropic_api_key)
    if resolved_api_key and run_claude_travel_agent:
        try:
            logger.info("Executing Anthropic Claude travel agent for Plannr generation...")
            claude_res = run_claude_travel_agent(
                query=req.prompt,
                api_key=resolved_api_key,
                duration_hours=float(entities.get("micro_hours", 3)) if entities.get("is_micro_trip") else None,
                destination=entities["destination"],
                vibe=req.style,
                budget=str(entities["budget_per_person"]),
            )
            if claude_res.get("success") and claude_res.get("timeline_steps"):
                tc = claude_res.get("trip_card") or {}
                if tc.get("title"):
                    trip.title = tc["title"]

                day_id = f"{trip_id}_d1"
                day = PlannrTripDay(
                    id=day_id,
                    trip_id=trip_id,
                    day_number=1,
                    day_title=tc.get("title") or f"Day 1 · {entities['destination']} Tailored Itinerary",
                    summary=claude_res.get("thinking") or "Curated via Anthropic Claude 3.5 deep spatial reasoning.",
                )
                db.add(day)
                db.flush()

                for s_idx, step in enumerate(claude_res["timeline_steps"], 1):
                    raw_time = step.get("time_window") or step.get("time") or f"{s_idx * 2}:00"
                    slot = raw_time.split("-")[0].strip() if "-" in raw_time else raw_time
                    title = step.get("title") or "Curated Stop"
                    act = step.get("activity") or step.get("mode") or ""
                    raw_cost = step.get("cost", "₹0")
                    cost_int = int(re.sub(r"[^0-9]", "", str(raw_cost)) or "0")
                    cat = "Food" if any(w in (title + act).lower() for w in ["cafe", "food", "eat", "brew", "patty", "dinner", "lunch"]) else ("Walk" if "walk" in (title + act).lower() else "Activity")

                    stop = PlannrTripStop(
                        id=f"{day_id}_s{s_idx}",
                        trip_day_id=day_id,
                        time_slot=slot,
                        place_name=title,
                        subtitle=act[:120],
                        category=cat,
                        price_per_person=cost_int,
                        is_booked=(s_idx == 1),
                        is_reserve_only=(cat == "Food"),
                        is_from_reel=False,
                        booking_ref=f"PLN-CL-{s_idx:03d}",
                    )
                    db.add(stop)

                claude_used = True
        except Exception as e:
            logger.error(f"Claude agent execution failed during plannr generate: {e}")

    # Fallback to our deep curated engine if Claude is not active or did not output steps
    if not claude_used:
        days_data = _generate_curated_days_and_stops(
            destination=entities["destination"],
            total_days=entities["total_days"],
            prompt=req.prompt,
            is_micro_trip=entities.get("is_micro_trip", False),
            micro_hours=entities.get("micro_hours", 3),
        )
        for day_info in days_data:
            day_id = f"{trip_id}_d{day_info['day_number']}"
            day = PlannrTripDay(
                id=day_id,
                trip_id=trip_id,
                day_number=day_info["day_number"],
                day_title=day_info["day_title"],
                summary=day_info["summary"],
            )
            db.add(day)
            db.flush()

            for s_idx, stop_tuple in enumerate(day_info["stops"], 1):
                time_slot, place_name, subtitle, category, price, is_booked, b_ref = stop_tuple
                stop = PlannrTripStop(
                    id=f"{day_id}_s{s_idx}",
                    trip_day_id=day_id,
                    time_slot=time_slot,
                    place_name=place_name,
                    subtitle=subtitle,
                    category=category,
                    price_per_person=price,
                    is_booked=is_booked,
                    is_reserve_only=(price > 0 and not is_booked and category == "Food"),
                    is_from_reel=False,
                    booking_ref=b_ref,
                )
                db.add(stop)

    db.commit()
    db.refresh(trip)
    return serialize_trip(trip)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Reel Scanner
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/reel/scan", response_model=PlannrReelResponse)
def scan_reel(
    req: PlannrReelScanRequest,
    db: Session = Depends(get_db),
):
    """
    Accepts { url: string }. Analyzes reel, extracts creator, places, timestamps, durations,
    and match confidence (like Tegallalang Rice Terrace 98%, Tirta Empul 95%, Zest Café 91%, Campuhan Ridge 72%).
    """
    clean_url = req.url.strip()

    # Check existing reel by exact or partial URL match
    existing = db.query(PlannrReel).filter(
        (PlannrReel.reel_url == clean_url) | (PlannrReel.id.contains(clean_url.split("/")[-1]))
    ).first()

    if existing:
        return serialize_reel(existing)

    # If URL contains keywords or is a generic new reel URL, dynamically extract and save
    url_l = clean_url.lower()
    if "vietnam" in url_l or "halong" in url_l:
        reel_id = f"reel_scanned_{uuid.uuid4().hex[:6]}"
        new_reel = PlannrReel(
            id=reel_id,
            reel_url=clean_url,
            creator_handle="@vietnam.uncovered",
            creator_name="Tuan Nguyen",
            creator_avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            video_title="Ha Long Bay Hidden Grottoes & Karsts",
            caption="Crystal emerald waters and secret caves revealed! #vietnam",
            places_detected=json.dumps([
                {"name": "Sung Sot Surprise Cave", "match_pct": 96, "timestamp": "0:06", "duration": "1.5 hrs", "tag": "Cave"},
                {"name": "Ti Top Island Lookout", "match_pct": 92, "timestamp": "0:18", "duration": "1 hr", "tag": "Panoramic View"},
                {"name": "Luon Cave Kayak", "match_pct": 89, "timestamp": "0:30", "duration": "2 hrs", "tag": "Water Sport"},
            ]),
            likes_count=18200,
            comments_count=430,
            video_poster_url="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
        )
    elif "kyoto" in url_l or "japan" in url_l:
        reel_id = f"reel_scanned_{uuid.uuid4().hex[:6]}"
        new_reel = PlannrReel(
            id=reel_id,
            reel_url=clean_url,
            creator_handle="@kyotowalks",
            creator_name="Kenji Sato",
            creator_avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
            video_title="Quiet Kyoto: Hidden Zen Gardens",
            caption="Serene moss shrines before morning rush. #kyoto #japan",
            places_detected=json.dumps([
                {"name": "Otagi Nenbutsu-ji", "match_pct": 97, "timestamp": "0:05", "duration": "1.5 hrs", "tag": "Stone Sculptures"},
                {"name": "Gio-ji Moss Temple", "match_pct": 94, "timestamp": "0:16", "duration": "1 hr", "tag": "Moss Garden"},
                {"name": "Arabica Coffee Arashiyama", "match_pct": 90, "timestamp": "0:28", "duration": "45 mins", "tag": "Riverside Brew"},
            ]),
            likes_count=32900,
            comments_count=780,
            video_poster_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
        )
    else:
        # Default high-fidelity Bali reel scan as in screenshot
        reel_id = f"reel_scanned_{uuid.uuid4().hex[:6]}"
        new_reel = PlannrReel(
            id=reel_id,
            reel_url=clean_url,
            creator_handle="@wander.with.nia",
            creator_name="Nia Sharma",
            creator_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            video_title="Bali's secret waterfall nobody talks about",
            caption="Hidden deep inside northern Ubud. Pristine canyon pools without the tourist crowds! #balisecrets #ubudwaterfall",
            places_detected=json.dumps([
                {"name": "Tegallalang Rice Terrace", "match_pct": 98, "timestamp": "0:04", "duration": "2 hrs", "tag": "Scenic Walk"},
                {"name": "Tirta Empul", "match_pct": 95, "timestamp": "0:14", "duration": "1.5 hrs", "tag": "Temple"},
                {"name": "Zest Café", "match_pct": 91, "timestamp": "0:25", "duration": "1 hr", "tag": "Plant-based Food"},
                {"name": "Campuhan Ridge", "match_pct": 72, "timestamp": "0:38", "duration": "2 hrs", "tag": "Sunset Trail"},
            ]),
            likes_count=24800,
            comments_count=842,
            video_poster_url="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80",
        )

    db.add(new_reel)
    db.commit()
    db.refresh(new_reel)
    return serialize_reel(new_reel)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Reel to Itinerary Builder
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/reel/build-itinerary")
def build_itinerary_from_reel(
    req: PlannrReelBuildItineraryRequest,
    db: Session = Depends(get_db),
):
    """
    Accepts { places: list, trip_name?: string }.
    Creates a full 3-day or 7-day trip from the reel places and returns the trip ID and itinerary.
    """
    places = req.places or []
    total_days = req.total_days or (3 if len(places) <= 4 else 7)
    trip_id = f"trip_reel_{uuid.uuid4().hex[:6]}"
    trip_title = req.trip_name or "Reel Inspired Bali Itinerary"

    start_dt = datetime.now() + timedelta(days=15)
    end_dt = start_dt + timedelta(days=total_days - 1)

    trip = PlannrTrip(
        id=trip_id,
        title=trip_title,
        destination="Bali",
        start_date=start_dt.strftime("%d %b"),
        end_date=end_dt.strftime("%d %b"),
        total_days=total_days,
        budget_per_person=48000,
        total_budget=192000,
        currency="INR",
        status="active",
        created_at=datetime.utcnow(),
    )
    db.add(trip)
    db.flush()

    # Add Default Members
    members = [
        ("Rohit Sharma", "RS", "paying", True, 48000),
        ("Aman Kapoor", "AK", "paid", False, 48000),
        ("Vikram Joshi", "VJ", "reminded", False, 48000),
        ("Nikhil Kulkarni", "NK", "pending", False, 48000),
    ]
    for idx, (name, initials, status_val, is_curr, share) in enumerate(members, 1):
        mem = PlannrTripMember(
            id=f"{trip_id}_mem_{idx}",
            trip_id=trip_id,
            name=name,
            initials=initials,
            status=status_val,
            share_amount=share,
            is_current_user=is_curr,
        )
        db.add(mem)

    # Active Poll
    poll = PlannrPoll(
        id=f"{trip_id}_poll",
        trip_id=trip_id,
        question="Day 2 — Private Jeep or Guided Hike?",
        ends_in_hours=24,
        options=json.dumps([
            {"id": "opt_1", "title": "4WD Sunrise Jeep Tour", "votes": 2, "voted_by": ["AK", "RS"]},
            {"id": "opt_2", "title": "Guided Trek on Foot", "votes": 1, "voted_by": ["VJ"]},
        ]),
    )
    db.add(poll)

    # Matched Travelers
    traveler = PlannrMatchedTraveler(
        id=f"{trip_id}_match_1",
        trip_id=trip_id,
        name="Priya S.",
        city="Delhi",
        match_pct=94,
        trips_count=12,
        interests=json.dumps(["Reels", "Photography", "Cafes"]),
        date_flexibility="Flexible dates",
        invited=False,
    )
    db.add(traveler)

    # Standard reel time-slots
    time_slots = ["07:30", "10:30", "13:00", "18:00"]

    # Day 1: Build directly from reel places
    day_1_id = f"{trip_id}_d1"
    day_1 = PlannrTripDay(
        id=day_1_id,
        trip_id=trip_id,
        day_number=1,
        day_title="Day 1 · Reel Highlights Ubud",
        summary="Exact locations extracted and verified from the travel reel.",
    )
    db.add(day_1)
    db.flush()

    for idx, place in enumerate(places[:4]):
        place_name = place.get("name") if isinstance(place, dict) else str(place)
        time_slot = time_slots[idx] if idx < len(time_slots) else f"{14+idx}:00"
        tag = place.get("tag", "Activity") if isinstance(place, dict) else "Activity"

        category = "Food" if "caf" in place_name.lower() or "restaurant" in place_name.lower() else (
            "Walk" if "ridge" in place_name.lower() or "walk" in place_name.lower() or "beach" in place_name.lower() else (
                "Culture" if "temple" in place_name.lower() or "tirta" in place_name.lower() else "Activity"
            )
        )

        stop = PlannrTripStop(
            id=f"{day_1_id}_s{idx+1}",
            trip_day_id=day_1_id,
            time_slot=time_slot,
            place_name=place_name,
            subtitle=f"Directly synced from viral reel · {place.get('duration', '1.5 hrs') if isinstance(place, dict) else '1.5 hrs'}",
            category=category,
            price_per_person=1200 + (idx * 300),
            is_booked=idx % 2 == 0,
            is_reserve_only=category == "Food",
            is_from_reel=True,
            booking_ref=f"PLN-RL-{idx+101}" if idx % 2 == 0 else None,
        )
        db.add(stop)

    # Populate remaining days if total_days > 1
    for day_num in range(2, total_days + 1):
        day_id = f"{trip_id}_d{day_num}"
        day = PlannrTripDay(
            id=day_id,
            trip_id=trip_id,
            day_number=day_num,
            day_title=f"Day {day_num} · Island Explorer",
            summary=f"Curated island itinerary complementing reel stops.",
        )
        db.add(day)
        db.flush()

        complementary_stops = [
            ("09:00", f"Day {day_num} Coastal Viewpoint", "Scenic scenic spot · 2 hrs", "Walk", 500, True, f"PLN-EXP-{day_num}01"),
            ("12:30", f"Authentic Local Warung", "Curated organic lunch · 1.5 hrs", "Food", 1100, False, None),
            ("16:00", f"Sunset Lounge & Beach Club", "Oceanfront cabana · 3 hrs", "Activity", 2200, False, None),
        ]
        for s_idx, (t_slot, p_name, sub, cat, prc, bkd, ref) in enumerate(complementary_stops, 1):
            c_stop = PlannrTripStop(
                id=f"{day_id}_s{s_idx}",
                trip_day_id=day_id,
                time_slot=t_slot,
                place_name=p_name,
                subtitle=sub,
                category=cat,
                price_per_person=prc,
                is_booked=bkd,
                is_reserve_only=(cat == "Food"),
                is_from_reel=False,
                booking_ref=ref,
            )
            db.add(c_stop)

    db.commit()
    db.refresh(trip)

    return {
        "success": True,
        "trip_id": trip.id,
        "message": f"Successfully created {total_days}-day itinerary from reel places",
        "trip": serialize_trip(trip),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. Trips Read & Details
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/trips", response_model=List[PlannrTripDetailResponse])
def list_trips(db: Session = Depends(get_db)):
    """List all plannr trips."""
    trips = db.query(PlannrTrip).order_by(PlannrTrip.created_at.desc()).all()
    return [serialize_trip(t) for t in trips]


@router.get("/trips/{trip_id}", response_model=PlannrTripDetailResponse)
def get_trip(
    trip_id: str,
    db: Session = Depends(get_db),
):
    """Returns full trip with days, stops, members, poll, and cart breakdown."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")
    return serialize_trip(trip)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Add Custom Stop to Day
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/add-stop")
def add_stop_to_trip(
    trip_id: str,
    req: PlannrAddStopRequest,
    db: Session = Depends(get_db),
):
    """Adds custom stop to a day (day_number, time_slot, place_name, subtitle, category, price)."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    target_day = None
    if req.trip_day_id:
        target_day = db.query(PlannrTripDay).filter(PlannrTripDay.id == req.trip_day_id, PlannrTripDay.trip_id == trip_id).first()
    elif req.day_number:
        target_day = db.query(PlannrTripDay).filter(PlannrTripDay.trip_id == trip_id, PlannrTripDay.day_number == req.day_number).first()

    if not target_day:
        # Create day if it doesn't exist
        day_num = req.day_number or 1
        day_id = f"{trip_id}_d{day_num}"
        target_day = PlannrTripDay(
            id=day_id,
            trip_id=trip_id,
            day_number=day_num,
            day_title=f"Day {day_num} · Customized",
            summary="Custom planned day with user-added activities.",
        )
        db.add(target_day)
        db.flush()

    stop_id = f"{target_day.id}_stop_{uuid.uuid4().hex[:6]}"
    price = req.price if req.price is not None else req.price_per_person
    price_val = price or 0

    new_stop = PlannrTripStop(
        id=stop_id,
        trip_day_id=target_day.id,
        time_slot=req.time_slot,
        place_name=req.place_name,
        subtitle=req.subtitle or f"Custom addition · {req.category}",
        category=req.category,
        price_per_person=price_val,
        is_booked=False,
        is_reserve_only=(req.category == "Food"),
        is_from_reel=bool(req.is_from_reel),
        booking_ref=None,
    )
    db.add(new_stop)
    db.commit()
    db.refresh(trip)

    return {
        "success": True,
        "message": f"Stop '{req.place_name}' added to {target_day.day_title}",
        "stop": serialize_stop(new_stop),
        "trip": serialize_trip(trip),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 7. Regenerate Day Stops
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/regenerate-day")
def regenerate_day(
    trip_id: str,
    req: PlannrRegenerateDayRequest,
    db: Session = Depends(get_db),
):
    """Regenerates a specific day's stops using AI (returns updated stops)."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    day = db.query(PlannrTripDay).filter(
        PlannrTripDay.trip_id == trip_id,
        PlannrTripDay.day_number == req.day_number,
    ).first()

    if not day:
        raise HTTPException(status_code=404, detail=f"Day {req.day_number} not found for trip '{trip_id}'.")

    # Delete existing stops for this day
    for s in day.stops:
        db.delete(s)
    db.flush()

    # Curate regenerated stops
    fresh_curations = [
        ("08:00", f"Hidden Gem Morning Oasis ({trip.destination})", "Secluded tranquil morning walk · 2 hrs", "Walk", 600, False),
        ("11:00", f"Artisanal Brew & Brunch", "Specialty roast & farm-to-table brunch · 1.5 hrs", "Food", 1400, False),
        ("14:00", f"Exclusive Guided Workshop", "Local craft & cultural masterclass · 2 hrs", "Culture", 1800, True),
        ("18:30", f"Clifftop Sunset Cocktail Lounge", "Panoramic sunset view & tapas · 3 hrs", "Activity", 2600, False),
    ]

    new_stops = []
    for idx, (t_slot, p_name, sub, cat, prc, bkd) in enumerate(fresh_curations, 1):
        s_id = f"{day.id}_regen_{idx}_{uuid.uuid4().hex[:4]}"
        stop = PlannrTripStop(
            id=s_id,
            trip_day_id=day.id,
            time_slot=t_slot,
            place_name=p_name,
            subtitle=sub,
            category=cat,
            price_per_person=prc,
            is_booked=bkd,
            is_reserve_only=(cat == "Food"),
            is_from_reel=False,
            booking_ref=f"PLN-REG-{idx+50}" if bkd else None,
        )
        db.add(stop)
        new_stops.append(stop)

    db.commit()
    db.refresh(day)

    return {
        "success": True,
        "message": f"Regenerated {len(new_stops)} stops for {day.day_title}",
        "day_number": day.day_number,
        "day_title": day.day_title,
        "stops": [serialize_stop(s) for s in sorted(day.stops, key=lambda x: x.time_slot)],
    }


# ─────────────────────────────────────────────────────────────────────────────
# 8. Poll Voting
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/vote", response_model=PlannrPollResponse)
def vote_on_poll(
    trip_id: str,
    req: PlannrVoteRequest,
    db: Session = Depends(get_db),
):
    """Records user's vote on option in the trip's active poll. Recalculates and returns updated poll."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    poll = None
    if req.poll_id:
        poll = db.query(PlannrPoll).filter(PlannrPoll.id == req.poll_id, PlannrPoll.trip_id == trip_id).first()
    elif trip.polls:
        poll = trip.polls[0]

    if not poll:
        raise HTTPException(status_code=404, detail="No active poll found for this trip.")

    options = _safe_json_loads(poll.options, [])
    voter = req.voter_initials or "RS"

    for opt in options:
        voted_by = list(opt.get("voted_by", []))
        opt_id = str(opt.get("id", "")).lower()
        req_id = str(req.option_id).lower()
        is_match = (
            opt_id == req_id
            or req_id in opt_id
            or opt_id in req_id
            or ("nusa" in req_id and ("1" in opt_id or "nusa" in opt_id))
            or ("uluwatu" in req_id and ("2" in opt_id or "uluwatu" in opt_id))
        )
        if is_match:
            if voter not in voted_by:
                voted_by.append(voter)
                opt["voted_by"] = voted_by
                opt["votes"] = len(voted_by)
        else:
            # Remove vote from other options if single vote policy
            if voter in voted_by:
                voted_by.remove(voter)
                opt["voted_by"] = voted_by
                opt["votes"] = len(voted_by)

    poll.options = json.dumps(options)
    db.commit()
    db.refresh(poll)

    return serialize_poll(poll)


# ─────────────────────────────────────────────────────────────────────────────
# 9. Invite Traveler
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/invite")
def invite_traveler(
    trip_id: str,
    req: PlannrInviteRequest,
    db: Session = Depends(get_db),
):
    """Accepts traveler id or email/phone, marks as invited and returns updated member list."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    matched_traveler = None
    if req.traveler_id:
        matched_traveler = db.query(PlannrMatchedTraveler).filter(
            PlannrMatchedTraveler.id == req.traveler_id,
        ).first()

    member_name = req.name
    if matched_traveler:
        matched_traveler.invited = True
        matched_traveler.trip_id = trip_id
        if not member_name:
            member_name = matched_traveler.name

    if not member_name:
        member_name = req.email.split("@")[0].title() if req.email else (req.phone or "Guest Traveler")

    # Generate initials
    words = member_name.strip().split()
    initials = ("".join(w[0] for w in words[:2])).upper() if words else "GT"

    # Check if already a member
    existing_mem = db.query(PlannrTripMember).filter(
        PlannrTripMember.trip_id == trip_id,
        PlannrTripMember.name == member_name,
    ).first()

    if not existing_mem:
        current_members = len(trip.members) + 1
        share_per_member = trip.total_budget // current_members if current_members else trip.budget_per_person
        new_mem = PlannrTripMember(
            id=f"{trip_id}_mem_{uuid.uuid4().hex[:5]}",
            trip_id=trip_id,
            name=member_name,
            initials=initials,
            status="pending",
            share_amount=share_per_member,
            is_current_user=False,
        )
        db.add(new_mem)

    db.commit()
    db.refresh(trip)

    return {
        "success": True,
        "message": f"Traveler '{member_name}' invited successfully",
        "members": [serialize_member(m) for m in trip.members],
        "matched_travelers": [serialize_traveler(t) for t in trip.matched_travelers],
    }


# ─────────────────────────────────────────────────────────────────────────────
# 10. Request Shares (Send Payment Reminders)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/request-shares")
def request_shares(
    trip_id: str,
    db: Session = Depends(get_db),
):
    """Sends reminders to all pending/reminded split members (sets status to 'reminded' and returns share summary)."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    reminded_count = 0
    shares_summary = []

    for m in trip.members:
        if not m.is_current_user and m.status in ["pending", "reminded"]:
            m.status = "reminded"
            reminded_count += 1
            shares_summary.append({
                "member_name": m.name,
                "initials": m.initials,
                "status": "reminded",
                "share_amount": m.share_amount,
                "action": "UPI payment reminder ping sent",
            })
        else:
            shares_summary.append({
                "member_name": m.name,
                "initials": m.initials,
                "status": m.status,
                "share_amount": m.share_amount,
                "action": "Up to date",
            })

    db.commit()
    db.refresh(trip)

    return {
        "success": True,
        "reminded_count": reminded_count,
        "message": f"Sent payment reminders to {reminded_count} pending members via UPI / WhatsApp",
        "shares_summary": shares_summary,
        "members": [serialize_member(m) for m in trip.members],
    }


# ─────────────────────────────────────────────────────────────────────────────
# 11. Pay Share
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/pay-share")
def pay_share(
    trip_id: str,
    req: Optional[PlannrPayShareRequest] = None,
    db: Session = Depends(get_db),
):
    """Marks current user (RS) share as 'paid' with transaction ID, returns receipt."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    user_member = db.query(PlannrTripMember).filter(
        PlannrTripMember.trip_id == trip_id,
        (PlannrTripMember.is_current_user == True) | (PlannrTripMember.initials == "RS"),
    ).first()

    if not user_member:
        # Default to first member
        user_member = trip.members[0] if trip.members else None

    if not user_member:
        raise HTTPException(status_code=400, detail="No member found to pay for this trip.")

    user_member.status = "paid"
    db.commit()
    db.refresh(user_member)

    txn_id = f"UPI-PLN-{random.randint(100000, 999999)}"
    now_str = datetime.utcnow().strftime("%d %b %Y, %I:%M %p UTC")

    receipt = {
        "transaction_id": txn_id,
        "payment_method": (req.payment_method if req else None) or "UPI_INSTANT",
        "upi_id": (req.upi_id if req else None) or "rohit@okhdfcbank",
        "amount_paid": user_member.share_amount,
        "currency": trip.currency or "INR",
        "payer_name": user_member.name,
        "payer_initials": user_member.initials,
        "trip_title": trip.title,
        "timestamp": now_str,
        "status": "PAID_VERIFIED",
    }

    return {
        "success": True,
        "message": f"Share of ₹{user_member.share_amount:,} successfully paid via UPI instant verification!",
        "transaction_id": txn_id,
        "amount_paid": user_member.share_amount,
        "receipt": receipt,
        "member": serialize_member(user_member),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 12. Book All Stops
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/book-all")
def book_all_stops(
    trip_id: str,
    db: Session = Depends(get_db),
):
    """Marks all unbooked items as booked."""
    trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found.")

    booked_count = 0
    total_booked_amount = 0

    for day in trip.days:
        for stop in day.stops:
            if not stop.is_booked:
                stop.is_booked = True
                stop.booking_ref = f"PLN-{uuid.uuid4().hex[:6].upper()}"
                booked_count += 1
                total_booked_amount += stop.price_per_person

    db.commit()
    db.refresh(trip)

    return {
        "success": True,
        "message": f"Successfully confirmed bookings for {booked_count} itinerary stops!",
        "booked_count": booked_count,
        "total_booked_amount": total_booked_amount,
        "trip": serialize_trip(trip),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 13. Reels List
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/reels", response_model=List[PlannrReelResponse])
def get_reels(db: Session = Depends(get_db)):
    """Returns list of travel reels with video posters, tags, and places."""
    reels = db.query(PlannrReel).all()
    return [serialize_reel(r) for r in reels]


# ─────────────────────────────────────────────────────────────────────────────
# 14. Like Reel
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/reels/{reel_id}/like")
def like_reel(
    reel_id: str,
    db: Session = Depends(get_db),
):
    """Increments like count and returns { success: true, likes: count }."""
    reel = db.query(PlannrReel).filter(PlannrReel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail=f"Reel '{reel_id}' not found.")

    reel.likes_count = (reel.likes_count or 0) + 1
    db.commit()
    db.refresh(reel)

    return {
        "success": True,
        "reel_id": reel.id,
        "likes": reel.likes_count,
    }
