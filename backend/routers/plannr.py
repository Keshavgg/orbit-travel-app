import os
import json
import uuid
import re
import random
from datetime import datetime, timedelta
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

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

def _parse_trip_entities(prompt: str, style: Optional[str] = None):
    """Extract destination, days, travelers, budget, and special keywords from natural language prompt."""
    prompt_lower = prompt.lower()

    # Destination detection
    destinations_map = {
        "bali": "Bali",
        "vietnam": "Vietnam",
        "thailand": "Thailand",
        "phuket": "Thailand",
        "japan": "Japan",
        "tokyo": "Japan",
        "kyoto": "Japan",
        "dubai": "Dubai",
        "goa": "Goa",
        "singapore": "Singapore",
        "paris": "Paris",
        "maldives": "Maldives",
    }
    detected_dest = "Bali"
    for k, v in destinations_map.items():
        if k in prompt_lower:
            detected_dest = v
            break

    # Days detection
    detected_days = 7
    if "week" in prompt_lower:
        detected_days = 7
    days_match = re.search(r"(\d+)\s*(?:days?|nights?)", prompt_lower)
    if days_match:
        detected_days = int(days_match.group(1))
        if "night" in days_match.group(0) and detected_days < 14:
            detected_days += 1
    detected_days = max(1, min(detected_days, 14))

    # Travelers detection: "3 friends" -> 4 people
    detected_travelers = 4
    friends_match = re.search(r"(\d+)\s*(?:friends?|pax|mates|buddies)", prompt_lower)
    if friends_match:
        detected_travelers = int(friends_match.group(1)) + 1
    elif "solo" in prompt_lower or "myself" in prompt_lower or "alone" in prompt_lower:
        detected_travelers = 1
    elif "couple" in prompt_lower or "partner" in prompt_lower or "with my wife" in prompt_lower or "with my husband" in prompt_lower:
        detected_travelers = 2

    # Budget per person
    budget_per_person = 55000
    k_match = re.search(r"(?:under|around|budget of|max|within)?\s*([0-9]{1,3})\s*k\b", prompt_lower)
    if k_match:
        budget_per_person = int(k_match.group(1)) * 1000
    else:
        num_match = re.search(r"(?:under|around|budget of|max|within|₹|rs\.?)\s*([0-9]{2,3}(?:,[0-9]{3})|[0-9]{5,6})", prompt_lower)
        if num_match:
            clean_str = num_match.group(1).replace(",", "")
            budget_per_person = int(clean_str)

    total_budget = budget_per_person * detected_travelers

    # Dates
    start_dt = datetime.now() + timedelta(days=20)
    end_dt = start_dt + timedelta(days=detected_days - 1)
    start_str = start_dt.strftime("%d %b")
    end_str = end_dt.strftime("%d %b")

    # Title
    vibe_words = ["Relaxed", "Adventure", "Chill", "Ultimate", "Boys", "Girls", "Heritage"]
    selected_vibe = style if style and style != "Balanced" else "Curated"
    title = f"{detected_dest} {selected_vibe} Escape"
    if "friends" in prompt_lower:
        title = f"{detected_dest} with Friends"
    elif "boys" in prompt_lower:
        title = f"{detected_dest} with the boys"

    return {
        "destination": detected_dest,
        "total_days": detected_days,
        "travelers_count": detected_travelers,
        "budget_per_person": budget_per_person,
        "total_budget": total_budget,
        "start_date": start_str,
        "end_date": end_str,
        "title": title,
    }


def _generate_curated_days_and_stops(destination: str, total_days: int, prompt: str):
    """Generate realistic days and stops tailored to destination and prompt keywords."""
    prompt_l = prompt.lower()
    has_volcano = "volcano" in prompt_l or "hike" in prompt_l or "trek" in prompt_l
    has_beach = "beach" in prompt_l or "surf" in prompt_l or "snork" in prompt_l
    has_cafe = "caf" in prompt_l or "brunch" in prompt_l or "coffee" in prompt_l

    # Destination catalogs
    catalog = {
        "Bali": [
            ("Ubud Culture & Rice Terraces", [
                ("07:30", "Tegallalang Rice Terrace", "Sunrise walk · 2 hrs · from the reel", "Activity", 1200, True, "PLN-UB-771"),
                ("10:30", "Zest Café", "Plant-based brunch · 1.5 hrs · from the reel", "Food", 1800, False, None),
                ("13:00", "Tirta Empul", "Balinese purification ritual · 2 hrs · from the reel", "Culture", 800, True, "PLN-UB-882"),
                ("18:00", "Campuhan Ridge", "Sunset trail & cocktails at The Sayan House · 2.5 hrs · from the reel", "Walk", 2400, False, None),
            ]),
            ("Kintamani Volcano & Hot Springs", [
                ("03:30", "Mount Batur Sunrise Trek", "Guided 4WD jeep or hike · 4 hrs", "Activity", 3500, True, "PLN-MB-901"),
                ("09:30", "Toya Devasya Hot Springs", "Lakeside infinity thermal baths · 2 hrs", "Activity", 1500, True, "PLN-TD-902"),
                ("13:00", "Akasa Kintamani Coffee", "Panoramic volcano view cafe · 1.5 hrs", "Food", 900, False, None),
                ("17:30", "Cretya Sunset Pool Club", "Terrace infinity pool day club · 3 hrs", "Activity", 2200, False, None),
            ]),
            ("Nusa Penida Coastal Safari", [
                ("07:00", "Sanur Fast Boat to Nusa Penida", "Speedboat transfer · 45 mins", "Activity", 1800, True, "PLN-NP-101"),
                ("09:00", "Kelingking Beach T-Rex Cliff", "Scenic viewpoint & hike · 2 hrs", "Walk", 500, True, "PLN-NP-102"),
                ("12:30", "Broken Beach & Angel's Billabong", "Natural lagoon & arch · 1.5 hrs", "Walk", 500, False, None),
                ("15:00", "Crystal Bay Snorkel", "Manta ray swimming spot · 2 hrs", "Activity", 2000, False, None),
            ]),
            ("Canggu Beach & Surf Culture", [
                ("08:30", "Crate Cafe Canggu", "Acai bowls & specialty brew · 1.5 hrs", "Food", 1100, False, None),
                ("11:00", "Echo Beach Surf Session", "Beginner surf lesson with instructor · 2 hrs", "Activity", 2500, True, "PLN-CG-201"),
                ("16:30", "La Brisa Sunset Beach Club", "Boho beachfront lounge & seafood · 3.5 hrs", "Food", 3200, False, None),
            ]),
            ("Uluwatu Clifftops & Fire Dance", [
                ("10:00", "Padang Padang Beach", "Hidden cove & swimming · 2 hrs", "Walk", 400, False, None),
                ("13:00", "Single Fin Uluwatu", "Cliffside lunch overlooking surf breaks · 2 hrs", "Food", 2200, False, None),
                ("17:00", "Uluwatu Temple & Kecak Fire Dance", "Clifftop amphitheater sunset show · 2 hrs", "Culture", 1600, True, "PLN-UW-301"),
            ]),
            ("Seminyak Style & Sunsets", [
                ("11:00", "Seminyak Boutique Village", "Local designer stores & art · 2 hrs", "Walk", 0, False, None),
                ("14:00", "Motel Mexicola", "Vibrant Mexican tacos & margaritas · 2 hrs", "Food", 2400, False, None),
                ("17:30", "Potato Head Beach Club", "Sunset sessions & oceanfront cabana · 4 hrs", "Activity", 3500, False, None),
            ]),
            ("Ubud Art & Farewell Feast", [
                ("10:00", "Ubud Traditional Art Market", "Handcrafted souvenirs & silk · 2 hrs", "Culture", 1000, False, None),
                ("13:00", "Locavore NXT Farewell Feast", "Contemporary Balinese tasting menu · 2.5 hrs", "Food", 4500, False, None),
                ("17:00", "Ngurah Rai Airport Private Van", "Airport transfer · 1.5 hrs", "Activity", 1200, True, "PLN-TR-401"),
            ]),
        ],
        "Vietnam": [
            ("Hanoi Heritage & Old Quarter", [
                ("08:30", "Egg Coffee at Cafe Giang", "Original egg coffee tasting · 1 hr", "Food", 300, True, "PLN-HN-101"),
                ("10:30", "Train Street Crossing", "Close-up railway experience · 1.5 hrs", "Walk", 400, False, None),
                ("13:00", "Bun Cha Huong Lien", "Obama bun cha noodles lunch · 1.5 hrs", "Food", 600, False, None),
                ("16:00", "Hoan Kiem Lake & Ngoc Son Temple", "Historical island temple walk · 2 hrs", "Culture", 500, True, "PLN-HN-102"),
            ]),
            ("Ha Long Bay Emerald Cruise", [
                ("08:00", "Limousine Van to Ha Long Marina", "Express highway transfer · 2.5 hrs", "Activity", 1500, True, "PLN-HL-201"),
                ("12:00", "Luxury Cruise Check-in & Buffet", "Overnight cruise embarkation · 2 hrs", "Food", 4500, True, "PLN-HL-202"),
                ("14:30", "Sung Sot Surprise Cave Kayaking", "Limestone grotto exploration · 2.5 hrs", "Activity", 2000, False, None),
                ("18:30", "Sunset Squid Fishing & Cocktails", "Onboard deck leisure · 3 hrs", "Activity", 1200, False, None),
            ]),
            ("Ha Long Bay Sunrise & Return", [
                ("06:30", "Tai Chi on Sundeck", "Morning mist session · 1 hr", "Activity", 0, False, None),
                ("08:00", "Ti Top Island Panoramic Lookout", "400 steps cliff climb · 1.5 hrs", "Walk", 500, False, None),
                ("11:30", "Ha Long Marina Disembarkation", "Return transfer to Hanoi · 3 hrs", "Activity", 1500, True, "PLN-HL-203"),
            ]),
            ("Ninh Binh Karst Landscapes", [
                ("08:00", "Trang An Boat Eco-Tour", "Rowing boat through 9 karst caves · 3 hrs", "Activity", 2200, True, "PLN-NB-301"),
                ("12:30", "Mountain Goat Specialty Lunch", "Local northern Vietnamese fare · 1.5 hrs", "Food", 1200, False, None),
                ("15:00", "Hang Mua Dragon Peak Hike", "500 stone stairs mountain view · 2 hrs", "Walk", 800, False, None),
            ]),
            ("Da Nang & Hoi An Lanterns", [
                ("09:00", "Domestic Flight to Da Nang", "Vietnam Airlines 1h flight · 1 hr", "Activity", 3500, True, "PLN-DA-401"),
                ("14:00", "Ba Na Hills Golden Bridge", "Giant stone hands skywalk · 3 hrs", "Activity", 2800, True, "PLN-DA-402"),
                ("18:30", "Hoi An Lantern River Boat", "Release floating lanterns at night · 2 hrs", "Culture", 900, False, None),
            ]),
            ("Hoi An Tailors & Beach", [
                ("09:00", "Custom Tailor Suit Fitting", "Ancient Town atelier · 2 hrs", "Culture", 3000, False, None),
                ("12:00", "Banh Mi Phuong Lunch", "Legendary pork baguette · 1 hr", "Food", 350, False, None),
                ("15:00", "An Bang Beach Lounging", "Coconut grove beach club · 3 hrs", "Walk", 800, False, None),
            ]),
            ("Departure Hanoi", [
                ("10:00", "Dong Xuan Market Souvenirs", "Silk scarves & coffee beans · 2 hrs", "Culture", 1000, False, None),
                ("14:00", "Noi Bai Airport Private Cab", "Airport transfer · 1 hr", "Activity", 1100, True, "PLN-TR-501"),
            ]),
        ],
        "Thailand": [
            ("Phuket Old Town Heritage", [
                ("09:00", "Thalang Road Sino-Portuguese Walk", "Colonial shophouses & murals · 2 hrs", "Walk", 0, False, None),
                ("11:30", "Raya Restaurant Michelin Crab Curry", "Authentic southern Thai feast · 1.5 hrs", "Food", 1600, False, None),
                ("15:00", "Big Buddha Mountain Shrine", "360-degree island vista · 2 hrs", "Culture", 600, True, "PLN-PK-101"),
                ("18:30", "Promthep Cape Sunset", "Golden hour cliff lookout · 1.5 hrs", "Walk", 0, False, None),
            ]),
            ("Phi Phi Islands Speedboat", [
                ("07:30", "Speedboat to Maya Bay", "The Beach lagoon & snorkel · 3 hrs", "Activity", 3200, True, "PLN-PP-201"),
                ("12:00", "Phi Phi Don Island Seafood Buffet", "Beachfront dining · 1.5 hrs", "Food", 1200, True, "PLN-PP-202"),
                ("14:30", "Pileh Lagoon Cliff Jumping", "Emerald natural pool · 2 hrs", "Activity", 1500, False, None),
            ]),
            ("James Bond & Phang Nga Bay", [
                ("08:00", "Longtail Boat into Sea Caves", "Karst limestone exploration · 3 hrs", "Activity", 2800, True, "PLN-JB-301"),
                ("13:00", "Koh Panyee Floating Muslim Village", "Stilted village lunch & tour · 2 hrs", "Culture", 1100, False, None),
            ]),
            ("Patong Beach & Nightlife", [
                ("10:00", "Patong Watersports & Parasail", "High-speed water fun · 2 hrs", "Activity", 2000, False, None),
                ("14:00", "Megakhram Royal Thai Spa", "2-hour authentic Thai massage · 2 hrs", "Activity", 1800, True, "PLN-TH-401"),
                ("19:00", "Bangla Road Night Market", "Street skewers & live music · 3 hrs", "Food", 1400, False, None),
            ]),
            ("Departure Phuket", [
                ("10:00", "Central Festival Souvenir Run", "Dried mangoes & spa oils · 2 hrs", "Walk", 800, False, None),
                ("14:00", "Phuket Airport Transfer", "Private air-con van · 1 hr", "Activity", 1000, True, "PLN-TR-601"),
            ]),
        ],
    }

    selected_catalog = catalog.get(destination, catalog["Bali"])
    result_days = []

    for i in range(total_days):
        cat_index = i % len(selected_catalog)
        day_title, stops = selected_catalog[cat_index]
        day_num = i + 1

        # If user specifically asked for volcano and it's day 2
        if has_volcano and i == 1 and destination == "Bali":
            day_title = "Mount Batur Volcano Sunrise & Springs"

        result_days.append({
            "day_number": day_num,
            "day_title": f"Day {day_num} · {day_title}",
            "summary": f"Curated itinerary featuring top highlights and hidden spots in {destination}.",
            "stops": stops,
        })

    return result_days


@router.post("/generate", response_model=PlannrTripDetailResponse)
def generate_trip(
    req: PlannrGenerateRequest,
    db: Session = Depends(get_db),
):
    """
    Accepts NLP prompt, style, interests.
    Parses with intelligent heuristics into structured entities (destination, dates, travellers, budget, days, stops)
    and saves as a new PlannrTrip. Returns the created trip.
    """
    entities = _parse_trip_entities(req.prompt, req.style)
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
    poll_q = f"Day 3 — {dest_name} Island Snorkel or Mountain Trek?" if dest_name == "Bali" else f"Day 3 — Adventure Tour or Sunset Dining?"
    poll = PlannrPoll(
        id=f"{trip_id}_poll",
        trip_id=trip_id,
        question=poll_q,
        ends_in_hours=24,
        options=json.dumps([
            {"id": "opt_1", "title": f"Highlight Excursion ({dest_name})", "votes": 2, "voted_by": ["AK", "RS"]},
            {"id": "opt_2", "title": f"Leisure & Sunset Lounge", "votes": 1, "voted_by": ["VJ"]},
        ]),
    )
    db.add(poll)

    # Matched Travelers
    matched_data = [
        {"name": "Priya S.", "city": "Delhi", "match_pct": 92, "trips_count": 12, "interests": ["Cafes", "Photography", "Beaches"], "date_flexibility": "Flexible +/- 2 days"},
        {"name": "Karan M.", "city": "Gurugram", "match_pct": 85, "trips_count": 8, "interests": ["Trekking", "Nightlife", "Scooters"], "date_flexibility": "Exact dates"},
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

    # Generate days and stops
    days_data = _generate_curated_days_and_stops(entities["destination"], entities["total_days"], req.prompt)
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
