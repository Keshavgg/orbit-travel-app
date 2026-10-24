import json
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
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


def seed_plannr_data(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Create all tables first
        Base.metadata.create_all(bind=engine)

        # ---------------------------------------------------------
        # 1. SEED PACKAGES
        # ---------------------------------------------------------
        packages_data = [
            {
                "id": "pkg_bali_7d",
                "title": "Bali Tropical Escapes",
                "country": "Indonesia",
                "days": 7,
                "starting_price": 52000,
                "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
                "vector_type": "island",
                "tag": "Bestseller",
                "rating": 4.95,
                "inclusions": [
                    "Private Villa Ubud with Infinity Pool",
                    "Fast Boat to Nusa Penida & Snorkel Gear",
                    "Mount Batur Sunrise Trek with 4WD Option",
                    "All Airport & Intercity Private Transfers",
                    "Daily Floating Breakfast & Café Vouchers",
                ],
            },
            {
                "id": "pkg_vietnam_6d",
                "title": "Vietnam Heritage & Bays",
                "country": "Vietnam",
                "days": 6,
                "starting_price": 48000,
                "image": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
                "vector_type": "heritage",
                "tag": "Trending",
                "rating": 4.92,
                "inclusions": [
                    "5-Star Ha Long Overnight Cruise with Balcony Cabin",
                    "Hanoi Old Quarter Street Food Guided Walk",
                    "Hoi An Ancient Town Lantern Boat Ride",
                    "Domestic Flight Hanoi to Da Nang Included",
                    "All Daily Meals on Board Cruise",
                ],
            },
            {
                "id": "pkg_thailand_5d",
                "title": "Phuket & Phi Phi Island Hopper",
                "country": "Thailand",
                "days": 5,
                "starting_price": 36000,
                "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
                "vector_type": "beach",
                "tag": "Budget Friendly",
                "rating": 4.88,
                "inclusions": [
                    "Beachfront 4-Star Resort in Patong",
                    "Full Day Speedboat to Maya Bay & Phi Phi",
                    "James Bond Island Sea Canoe Tour",
                    "Airport VIP Fast-track Pick & Drop",
                    "Daily Buffet Breakfast & Thai Cooking Class",
                ],
            },
            {
                "id": "pkg_japan_8d",
                "title": "Japan Golden Route (Tokyo & Kyoto)",
                "country": "Japan",
                "days": 8,
                "starting_price": 89000,
                "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
                "vector_type": "culture",
                "tag": "Premium",
                "rating": 4.98,
                "inclusions": [
                    "7-Day JR Shinkansen Bullet Train Pass",
                    "Boutique Ryokan Stay with Onsen in Kyoto",
                    "Ginza & Shibuya Hidden Backstreet Walk",
                    "TeamLab Planets All-access Entry",
                    "High-speed Unlimited Pocket Wi-Fi Device",
                ],
            },
            {
                "id": "pkg_dubai_5d",
                "title": "Dubai Luxury Dunes & Skylines",
                "country": "United Arab Emirates",
                "days": 5,
                "starting_price": 44000,
                "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
                "vector_type": "luxury",
                "tag": "Popular",
                "rating": 4.91,
                "inclusions": [
                    "5-Star Marina Hotel with Sky Lounge Access",
                    "Desert Safari with Premium BBQ & Dune Bashing",
                    "Burj Khalifa 124th Floor At the Top Ticket",
                    "Marina Dhow Luxury Cruise Dinner",
                    "Private Mercedes Airport Transfers",
                ],
            },
            {
                "id": "pkg_goa_4d",
                "title": "South Goa Secret Coves & Heritage",
                "country": "India",
                "days": 4,
                "starting_price": 18500,
                "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
                "vector_type": "coastal",
                "tag": "Weekend Getaway",
                "rating": 4.86,
                "inclusions": [
                    "Heritage Portuguese Villa Stay with Courtyard Pool",
                    "Private Boat Dolphin Spotting & Butterfly Beach",
                    "South Goa Hidden Waterfall Secret Trail",
                    "Airport Cab Pick & Drop",
                    "Daily Traditional Goan Breakfast",
                ],
            },
        ]

        for p_data in packages_data:
            existing = db.query(PlannrPackage).filter(PlannrPackage.id == p_data["id"]).first()
            if not existing:
                pkg = PlannrPackage(
                    id=p_data["id"],
                    title=p_data["title"],
                    country=p_data["country"],
                    days=p_data["days"],
                    starting_price=p_data["starting_price"],
                    image=p_data["image"],
                    vector_type=p_data["vector_type"],
                    tag=p_data["tag"],
                    rating=p_data["rating"],
                    inclusions=json.dumps(p_data["inclusions"]),
                )
                db.add(pkg)
            else:
                existing.title = p_data["title"]
                existing.country = p_data["country"]
                existing.days = p_data["days"]
                existing.starting_price = p_data["starting_price"]
                existing.image = p_data["image"]
                existing.vector_type = p_data["vector_type"]
                existing.tag = p_data["tag"]
                existing.rating = p_data["rating"]
                existing.inclusions = json.dumps(p_data["inclusions"])

        # ---------------------------------------------------------
        # 2. SEED TRIP `trip_bali_boys`
        # ---------------------------------------------------------
        trip_id = "trip_bali_boys"
        existing_trip = db.query(PlannrTrip).filter(PlannrTrip.id == trip_id).first()
        if existing_trip:
            # Delete existing trip to cleanly re-populate all relationships
            db.delete(existing_trip)
            db.commit()

        trip = PlannrTrip(
            id=trip_id,
            title="Bali with the boys",
            destination="Bali",
            start_date="12 Nov",
            end_date="18 Nov",
            total_days=7,
            budget_per_person=52400,
            total_budget=190400,  # 47,600 * 4
            currency="INR",
            status="active",
            created_at=datetime.utcnow(),
        )
        db.add(trip)
        db.flush()

        # Members: RS, AK, VJ, NK
        members_data = [
            {"id": f"{trip_id}_mem_rs", "name": "Rohit Sharma", "initials": "RS", "status": "paying", "share_amount": 47600, "is_current_user": True},
            {"id": f"{trip_id}_mem_ak", "name": "Aman Kapoor", "initials": "AK", "status": "paid", "share_amount": 47600, "is_current_user": False},
            {"id": f"{trip_id}_mem_vj", "name": "Vikram Joshi", "initials": "VJ", "status": "reminded", "share_amount": 47600, "is_current_user": False},
            {"id": f"{trip_id}_mem_nk", "name": "Nikhil Kulkarni", "initials": "NK", "status": "pending", "share_amount": 47600, "is_current_user": False},
        ]
        for m in members_data:
            member = PlannrTripMember(
                id=m["id"],
                trip_id=trip_id,
                name=m["name"],
                initials=m["initials"],
                status=m["status"],
                share_amount=m["share_amount"],
                is_current_user=m["is_current_user"],
            )
            db.add(member)

        # Active Poll
        poll = PlannrPoll(
            id=f"{trip_id}_poll_1",
            trip_id=trip_id,
            question="Day 3 — Nusa Penida or Uluwatu?",
            ends_in_hours=18,
            options=json.dumps([
                {"id": "opt_1", "title": "Nusa Penida Day Trip (Speedboat + Snorkel)", "votes": 2, "voted_by": ["AK", "RS"]},
                {"id": "opt_2", "title": "Uluwatu Clifftop Day (Single Fin + Kecak)", "votes": 1, "voted_by": ["VJ"]},
            ]),
        )
        db.add(poll)

        # Matched Travelers
        matched_travelers_data = [
            {
                "id": f"{trip_id}_match_priya",
                "name": "Priya S.",
                "city": "Delhi",
                "match_pct": 92,
                "trips_count": 12,
                "interests": ["Cafes", "Photography", "Beaches", "Surfing"],
                "date_flexibility": "Nov 10-22",
                "invited": False,
            },
            {
                "id": f"{trip_id}_match_karan",
                "name": "Karan M.",
                "city": "Gurugram",
                "match_pct": 85,
                "trips_count": 8,
                "interests": ["Trekking", "Volcano Hikes", "Nightlife", "Scooter Trips"],
                "date_flexibility": "Nov 12-20",
                "invited": False,
            },
        ]
        for mt in matched_travelers_data:
            traveler = PlannrMatchedTraveler(
                id=mt["id"],
                trip_id=trip_id,
                name=mt["name"],
                city=mt["city"],
                match_pct=mt["match_pct"],
                trips_count=mt["trips_count"],
                interests=json.dumps(mt["interests"]),
                date_flexibility=mt["date_flexibility"],
                invited=mt["invited"],
            )
            db.add(traveler)

        # 7 Days and Stops
        days_stops_data = [
            {
                "day_number": 1,
                "day_title": "Day 1 · Ubud",
                "summary": "Sunrise terraces, holy water temple & cliffside sunset",
                "stops": [
                    {
                        "time_slot": "07:30",
                        "place_name": "Tegallalang Rice Terrace",
                        "subtitle": "Sunrise walk · 2 hrs · from the reel",
                        "category": "Activity",
                        "price_per_person": 1200,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": True,
                        "booking_ref": "PLN-UB-771",
                    },
                    {
                        "time_slot": "10:30",
                        "place_name": "Zest Café",
                        "subtitle": "Plant-based brunch · 1.5 hrs · from the reel",
                        "category": "Food",
                        "price_per_person": 1800,
                        "is_booked": False,
                        "is_reserve_only": True,
                        "is_from_reel": True,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "13:00",
                        "place_name": "Tirta Empul",
                        "subtitle": "Balinese purification ritual · 2 hrs · from the reel",
                        "category": "Culture",
                        "price_per_person": 800,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": True,
                        "booking_ref": "PLN-UB-882",
                    },
                    {
                        "time_slot": "18:00",
                        "place_name": "Campuhan Ridge",
                        "subtitle": "Sunset trail & cocktails at The Sayan House · 2.5 hrs · from the reel",
                        "category": "Walk",
                        "price_per_person": 2400,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": True,
                        "booking_ref": None,
                    },
                ],
            },
            {
                "day_number": 2,
                "day_title": "Day 2 · Kintamani Volcano & Springs",
                "summary": "Mount Batur early jeep trek and natural lakeside thermal baths",
                "stops": [
                    {
                        "time_slot": "03:30",
                        "place_name": "Mount Batur Sunrise Trek",
                        "subtitle": "Guided 4WD jeep or hike · 4 hrs",
                        "category": "Activity",
                        "price_per_person": 3500,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-MB-901",
                    },
                    {
                        "time_slot": "09:30",
                        "place_name": "Toya Devasya Hot Springs",
                        "subtitle": "Lakeside infinity thermal baths · 2 hrs",
                        "category": "Activity",
                        "price_per_person": 1500,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-TD-902",
                    },
                    {
                        "time_slot": "13:00",
                        "place_name": "Akasa Kintamani Coffee",
                        "subtitle": "Panoramic volcano view cafe · 1.5 hrs",
                        "category": "Food",
                        "price_per_person": 900,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "17:30",
                        "place_name": "Cretya Sunset Pool Club",
                        "subtitle": "Terrace infinity pool day club · 3 hrs",
                        "category": "Activity",
                        "price_per_person": 2200,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                ],
            },
            {
                "day_number": 3,
                "day_title": "Day 3 · Nusa Penida Island",
                "summary": "Speedboat across Badung strait, T-Rex cliff and manta bay snorkel",
                "stops": [
                    {
                        "time_slot": "07:00",
                        "place_name": "Sanur Fast Boat to Nusa Penida",
                        "subtitle": "Speedboat transfer · 45 mins",
                        "category": "Activity",
                        "price_per_person": 1800,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-NP-101",
                    },
                    {
                        "time_slot": "09:00",
                        "place_name": "Kelingking Beach T-Rex Cliff",
                        "subtitle": "Scenic viewpoint & hike · 2 hrs",
                        "category": "Walk",
                        "price_per_person": 500,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-NP-102",
                    },
                    {
                        "time_slot": "12:30",
                        "place_name": "Broken Beach & Angel's Billabong",
                        "subtitle": "Natural lagoon & arch · 1.5 hrs",
                        "category": "Walk",
                        "price_per_person": 500,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "15:00",
                        "place_name": "Crystal Bay Snorkel",
                        "subtitle": "Manta ray swimming spot · 2 hrs",
                        "category": "Activity",
                        "price_per_person": 2000,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                ],
            },
            {
                "day_number": 4,
                "day_title": "Day 4 · Canggu Surf & Beach Clubs",
                "summary": "Surf lessons at Echo Beach and bohemian sunset chill",
                "stops": [
                    {
                        "time_slot": "08:30",
                        "place_name": "Crate Cafe Canggu",
                        "subtitle": "Acai bowls & specialty brew · 1.5 hrs",
                        "category": "Food",
                        "price_per_person": 1100,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "11:00",
                        "place_name": "Echo Beach Surf Session",
                        "subtitle": "Beginner surf lesson with instructor · 2 hrs",
                        "category": "Activity",
                        "price_per_person": 2500,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-CG-201",
                    },
                    {
                        "time_slot": "16:30",
                        "place_name": "La Brisa Sunset Beach Club",
                        "subtitle": "Boho beachfront lounge & seafood · 3.5 hrs",
                        "category": "Food",
                        "price_per_person": 3200,
                        "is_booked": False,
                        "is_reserve_only": True,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                ],
            },
            {
                "day_number": 5,
                "day_title": "Day 5 · Uluwatu Clifftops",
                "summary": "Hidden surfing beaches and sunset Kecak fire dance over the Indian Ocean",
                "stops": [
                    {
                        "time_slot": "10:00",
                        "place_name": "Padang Padang Beach",
                        "subtitle": "Hidden cove & swimming · 2 hrs",
                        "category": "Walk",
                        "price_per_person": 400,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "13:00",
                        "place_name": "Single Fin Uluwatu",
                        "subtitle": "Cliffside lunch overlooking surf breaks · 2 hrs",
                        "category": "Food",
                        "price_per_person": 2200,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "17:00",
                        "place_name": "Uluwatu Temple & Kecak Fire Dance",
                        "subtitle": "Clifftop amphitheater sunset show · 2 hrs",
                        "category": "Culture",
                        "price_per_person": 1600,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-UW-301",
                    },
                ],
            },
            {
                "day_number": 6,
                "day_title": "Day 6 · Seminyak Style & Sunset",
                "summary": "Boutique shopping, Mexican fiesta and Potato Head cabana",
                "stops": [
                    {
                        "time_slot": "11:00",
                        "place_name": "Seminyak Boutique Village",
                        "subtitle": "Local designer stores & art · 2 hrs",
                        "category": "Walk",
                        "price_per_person": 0,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "14:00",
                        "place_name": "Motel Mexicola",
                        "subtitle": "Vibrant Mexican tacos & margaritas · 2 hrs",
                        "category": "Food",
                        "price_per_person": 2400,
                        "is_booked": False,
                        "is_reserve_only": True,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "17:30",
                        "place_name": "Potato Head Beach Club",
                        "subtitle": "Sunset sessions & oceanfront cabana · 4 hrs",
                        "category": "Activity",
                        "price_per_person": 3500,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                ],
            },
            {
                "day_number": 7,
                "day_title": "Day 7 · Ubud Markets & Farewell",
                "summary": "Handcrafted art shopping, fine-dining feast and airport drop",
                "stops": [
                    {
                        "time_slot": "10:00",
                        "place_name": "Ubud Traditional Art Market",
                        "subtitle": "Handcrafted souvenirs & silk · 2 hrs",
                        "category": "Culture",
                        "price_per_person": 1000,
                        "is_booked": False,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "13:00",
                        "place_name": "Locavore NXT Farewell Feast",
                        "subtitle": "Contemporary Balinese tasting menu · 2.5 hrs",
                        "category": "Food",
                        "price_per_person": 4500,
                        "is_booked": False,
                        "is_reserve_only": True,
                        "is_from_reel": False,
                        "booking_ref": None,
                    },
                    {
                        "time_slot": "17:00",
                        "place_name": "Ngurah Rai Airport Private Van",
                        "subtitle": "Airport transfer · 1.5 hrs",
                        "category": "Activity",
                        "price_per_person": 1200,
                        "is_booked": True,
                        "is_reserve_only": False,
                        "is_from_reel": False,
                        "booking_ref": "PLN-TR-401",
                    },
                ],
            },
        ]

        for day_data in days_stops_data:
            day_id = f"{trip_id}_day_{day_data['day_number']}"
            day = PlannrTripDay(
                id=day_id,
                trip_id=trip_id,
                day_number=day_data["day_number"],
                day_title=day_data["day_title"],
                summary=day_data["summary"],
            )
            db.add(day)
            db.flush()

            for idx, stop_data in enumerate(day_data["stops"], start=1):
                stop_id = f"{day_id}_stop_{idx}"
                stop = PlannrTripStop(
                    id=stop_id,
                    trip_day_id=day_id,
                    time_slot=stop_data["time_slot"],
                    place_name=stop_data["place_name"],
                    subtitle=stop_data["subtitle"],
                    category=stop_data["category"],
                    price_per_person=stop_data["price_per_person"],
                    is_booked=stop_data["is_booked"],
                    is_reserve_only=stop_data["is_reserve_only"],
                    is_from_reel=stop_data["is_from_reel"],
                    booking_ref=stop_data["booking_ref"],
                )
                db.add(stop)

        # ---------------------------------------------------------
        # 3. SEED 4 REELS
        # ---------------------------------------------------------
        reels_data = [
            {
                "id": "reel_bali_waterfall",
                "reel_url": "https://instagram.com/reel/C8baliwaterfall",
                "creator_handle": "@wander.with.nia",
                "creator_name": "Nia Sharma",
                "creator_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                "video_title": "Bali's secret waterfall nobody talks about",
                "caption": "Hidden deep inside northern Ubud. Pristine canyon pools without the tourist crowds! #balisecrets #ubudwaterfall",
                "video_poster_url": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80",
                "likes_count": 24800,
                "comments_count": 842,
                "places_detected": [
                    {"name": "Tegallalang Rice Terrace", "match_pct": 98, "timestamp": "0:04", "duration": "2 hrs", "tag": "Scenic Walk"},
                    {"name": "Tirta Empul", "match_pct": 95, "timestamp": "0:14", "duration": "1.5 hrs", "tag": "Temple"},
                    {"name": "Zest Café", "match_pct": 91, "timestamp": "0:25", "duration": "1 hr", "tag": "Plant-based Food"},
                    {"name": "Campuhan Ridge", "match_pct": 72, "timestamp": "0:38", "duration": "2 hrs", "tag": "Sunset Trail"},
                ],
            },
            {
                "id": "reel_vietnam_halong",
                "reel_url": "https://instagram.com/reel/C8halongcaves",
                "creator_handle": "@vietnam.uncovered",
                "creator_name": "Tuan Nguyen",
                "creator_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                "video_title": "Kayaking through Ha Long Bay's luminescent sea caves",
                "caption": "Emerald waters, limestone pinnacles, and local floating villages. 3 nights on an overnight junk boat! #vietnam #halongbay",
                "video_poster_url": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
                "likes_count": 31200,
                "comments_count": 1105,
                "places_detected": [
                    {"name": "Sung Sot Surprise Cave", "match_pct": 96, "timestamp": "0:06", "duration": "1.5 hrs", "tag": "Cave"},
                    {"name": "Ti Top Island Lookout", "match_pct": 92, "timestamp": "0:18", "duration": "1 hr", "tag": "Panoramic View"},
                    {"name": "Luon Cave Kayak", "match_pct": 89, "timestamp": "0:30", "duration": "2 hrs", "tag": "Water Sport"},
                ],
            },
            {
                "id": "reel_japan_kyoto",
                "reel_url": "https://instagram.com/reel/C8kyotohidden",
                "creator_handle": "@kyotowalks",
                "creator_name": "Kenji Sato",
                "creator_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
                "video_title": "Quiet Kyoto: 4 shrines tourists don't visit before 8 AM",
                "caption": "Skip the Fushimi Inari peak crowd. These hidden Zen gardens in Arashiyama and Higashiyama feel like 18th century Japan. #kyoto #japan",
                "video_poster_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
                "likes_count": 54100,
                "comments_count": 1920,
                "places_detected": [
                    {"name": "Otagi Nenbutsu-ji", "match_pct": 97, "timestamp": "0:05", "duration": "1.5 hrs", "tag": "Stone Sculptures"},
                    {"name": "Gio-ji Moss Temple", "match_pct": 94, "timestamp": "0:16", "duration": "1 hr", "tag": "Moss Garden"},
                    {"name": "Arabica Coffee Arashiyama", "match_pct": 90, "timestamp": "0:28", "duration": "45 mins", "tag": "Riverside Brew"},
                ],
            },
            {
                "id": "reel_goa_coves",
                "reel_url": "https://instagram.com/reel/C8goasecrets",
                "creator_handle": "@goabeachhopper",
                "creator_name": "Alisha Pinto",
                "creator_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
                "video_title": "Secret south Goa beach coves accessible only by cliff stairs",
                "caption": "Turquoise Arabian sea, dolphin watching from cliffs, and beach shacks serving grilled pomfret. #goahidden #southgoa",
                "video_poster_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
                "likes_count": 18900,
                "comments_count": 673,
                "places_detected": [
                    {"name": "Butterfly Beach Cove", "match_pct": 95, "timestamp": "0:08", "duration": "2.5 hrs", "tag": "Secluded Beach"},
                    {"name": "Cabo de Rama Fort", "match_pct": 93, "timestamp": "0:20", "duration": "1.5 hrs", "tag": "Historic Cliff"},
                    {"name": "Fisherman's Wharf Mobor", "match_pct": 88, "timestamp": "0:35", "duration": "2 hrs", "tag": "Goan Seafood"},
                ],
            },
        ]

        for r_data in reels_data:
            existing_reel = db.query(PlannrReel).filter(PlannrReel.id == r_data["id"]).first()
            if not existing_reel:
                reel = PlannrReel(
                    id=r_data["id"],
                    reel_url=r_data["reel_url"],
                    creator_handle=r_data["creator_handle"],
                    creator_name=r_data["creator_name"],
                    creator_avatar=r_data["creator_avatar"],
                    video_title=r_data["video_title"],
                    caption=r_data["caption"],
                    places_detected=json.dumps(r_data["places_detected"]),
                    likes_count=r_data["likes_count"],
                    comments_count=r_data["comments_count"],
                    video_poster_url=r_data["video_poster_url"],
                )
                db.add(reel)
            else:
                existing_reel.reel_url = r_data["reel_url"]
                existing_reel.creator_handle = r_data["creator_handle"]
                existing_reel.creator_name = r_data["creator_name"]
                existing_reel.creator_avatar = r_data["creator_avatar"]
                existing_reel.video_title = r_data["video_title"]
                existing_reel.caption = r_data["caption"]
                existing_reel.places_detected = json.dumps(r_data["places_detected"])
                existing_reel.likes_count = r_data["likes_count"]
                existing_reel.comments_count = r_data["comments_count"]
                existing_reel.video_poster_url = r_data["video_poster_url"]

        db.commit()
        print("✅ Plannr database seeded successfully with 6 packages, trip_bali_boys, 4 members, poll, matched travelers, and 4 reels.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding Plannr data: {e}")
        raise e
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_plannr_data()
