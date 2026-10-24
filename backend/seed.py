import json
from sqlalchemy.orm import Session
from models import Destination, Trip, DistressedFlight, Visa, Booking


def seed_database(db: Session):
    # Check if destinations already seeded
    if db.query(Destination).first():
        return

    print("🌱 Seeding database with comprehensive travel data...")

    # 1. Seed Destinations
    destinations_data = [
        Destination(
            key="delhi",
            name="Delhi NCR Hub",
            country="India",
            tagline="Capital Departure Hub with Fast-Track Expressways",
            lat=28.6139,
            lng=77.2090,
            badge="Hub 01",
            banner_img="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80",
            weather_temp="26°C",
            weather_condition="Pleasant",
        ),
        Destination(
            key="rishikesh",
            name="Rishikesh Valley",
            country="India",
            tagline="Ganga White Water & High-Altitude Glamping",
            lat=30.0869,
            lng=78.2676,
            badge="<3h Drive",
            banner_img="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80",
            weather_temp="22°C",
            weather_condition="Misty Fresh",
        ),
        Destination(
            key="jaipur",
            name="Jaipur Heritage",
            country="India",
            tagline="Royal Havelis & Amber Fort Sunset Trail",
            lat=26.9124,
            lng=75.7873,
            badge="3h 30m Express",
            banner_img="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
            weather_temp="28°C",
            weather_condition="Sunny",
        ),
        Destination(
            key="goa",
            name="Goa Coastline",
            country="India",
            tagline="Direct IndiGo drops & Sunset Beachfront Villas",
            lat=15.2993,
            lng=74.1240,
            badge="Direct Flight",
            banner_img="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
            weather_temp="31°C",
            weather_condition="Tropical Sun",
        ),
        Destination(
            key="thailand",
            name="Thailand Islands",
            country="Thailand",
            tagline="Flat ₹499 Visa Cap & 24h Approval Guarantee",
            lat=13.7563,
            lng=100.5018,
            badge="Flat ₹499 Visa",
            banner_img="https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80",
            weather_temp="32°C",
            weather_condition="Warm Breeze",
        ),
        Destination(
            key="dubai",
            name="Dubai Skyline",
            country="UAE",
            tagline="Instant 24h eVisa & Desert Safari Overnights",
            lat=25.2048,
            lng=55.2708,
            badge="Instant 24h",
            banner_img="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
            weather_temp="29°C",
            weather_condition="Clear Sky",
        ),
        Destination(
            key="bali",
            name="Bali Seminyak",
            country="Indonesia",
            tagline="Private Pool Forest Villas & Cliff Sunsets",
            lat=-8.4095,
            lng=115.1889,
            badge="Visa on Arrival",
            banner_img="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
            weather_temp="29°C",
            weather_condition="Balmy Tropical",
        ),
        Destination(
            key="kashmir",
            name="Kashmir Valleys",
            country="India",
            tagline="Dal Lake Houseboats & Gulmarg Gondola Skiing",
            lat=34.0837,
            lng=74.7973,
            badge="Direct Flight",
            banner_img="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
            weather_temp="14°C",
            weather_condition="Crisp Mountain Air",
        ),
        Destination(
            key="corbett",
            name="Jim Corbett",
            country="India",
            tagline="Dense Sal Forest Lodges & Royal Bengal Tiger Safari",
            lat=29.5300,
            lng=78.7747,
            badge="4h Drive",
            banner_img="https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop&q=80",
            weather_temp="24°C",
            weather_condition="Forest Breeze",
        ),
    ]

    for d in destinations_data:
        db.add(d)
    db.commit()

    # 2. Seed Short and Long Trips
    trips_data = [
        # SHORT TRIPS
        Trip(
            slug="rishikesh-riverfront-glamping",
            title="Rishikesh Riverfront Glamping & 16km Rafting",
            destination_key="rishikesh",
            category="weekend",
            duration="2 Days / 1 Night",
            duration_days=2,
            duration_type="short",
            price=3499,
            original_price=5999,
            discount_percent=41,
            drive_time="2h 45m drive via Meerut Expressway",
            distance="240 km from Delhi NCR",
            airline="Scenic Self-Drive / Vande Bharat (Haridwar)",
            stay_name="Luxury Swiss Air-Cooled River Tents",
            image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "16km Grade-3 Ganga Rafting with experienced cliff guide",
                "Cliff jump from 25ft rock into emerald Ganga waters",
                "Evening acoustic campfire & live BBQ buffet",
                "Riverside sunrise yoga session"
            ]),
            inclusions=json.dumps([
                "AC Swiss Tent Stay on White Sand",
                "All 3 Buffet Meals (Breakfast, Lunch, Dinner)",
                "16km Rafting + Life Jackets & Helmets",
                "Evening Bonfire & Snacks"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1 (Saturday)", "title": "Express Drive, Check-in & Rafting", "desc": "Scenic morning drive, camp check-in, thrilling 16km rafting down Ganga rapids, evening acoustic campfire with snacks."},
                {"day": "Day 2 (Sunday)", "title": "Sunrise Yoga, Cliff Jump & Return", "desc": "Peaceful sunrise yoga by the riverbed, optional cliff jump, Parmarth Niketan Ganga Aarti visit, return drive to Delhi."}
            ]),
            tags=json.dumps(["Rafting", "Glamping", "Expressway", "Top Weekend"]),
            available_slots=14,
            is_featured=True,
        ),
        Trip(
            slug="jaipur-heritage-haveli-amber-fort",
            title="Jaipur Royal Haveli & Sunset Amber Fort Trail",
            destination_key="jaipur",
            category="weekend",
            duration="3 Days / 2 Nights",
            duration_days=3,
            duration_type="short",
            price=4299,
            original_price=7499,
            discount_percent=42,
            drive_time="3h 30m via Delhi-Mumbai Expressway",
            distance="270 km from Delhi NCR",
            airline="Expressway Highway / Vande Bharat (Jaipur)",
            stay_name="4-Star Heritage Haveli Courtyard with Pool",
            image="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "Private heritage courtyard stay with peacock garden",
                "Sunset watch from Nahargarh fort ridge overlooking Pink City",
                "Guided culinary trail in Johari Bazaar",
                "Rooftop pool & traditional Rajasthani puppet show"
            ]),
            inclusions=json.dumps([
                "Heritage Hotel Stay with Carved Archways",
                "Daily Royal Buffet Breakfast",
                "Amber Fort Sightseeing Fast-Track Pass",
                "Local Food Tasting Voucher"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1", "title": "Arrival via Expressway & Hawa Mahal", "desc": "Cruise down Delhi-Mumbai expressway, check into royal haveli, sunset stroll around Hawa Mahal and City Palace."},
                {"day": "Day 2", "title": "Amber Fort & Nahargarh Sunset", "desc": "Morning exploration of majestic Amber Fort, Rajasthani thali lunch, evening sunset cocktail at Nahargarh fort."},
                {"day": "Day 3", "title": "Bazaars & Smooth Return", "desc": "Johari Bazaar shopping for handicrafts and blue pottery, hearty lunch, smooth expressway return to Delhi."}
            ]),
            tags=json.dumps(["Heritage", "Royal Haveli", "Expressway", "Culture"]),
            available_slots=9,
            is_featured=True,
        ),
        Trip(
            slug="jim-corbett-sal-jungle-safari",
            title="Jim Corbett Dense Forest Lodge & Jeep Tiger Safari",
            destination_key="corbett",
            category="weekend",
            duration="3 Days / 2 Nights",
            duration_days=3,
            duration_type="short",
            price=5999,
            original_price=9500,
            discount_percent=37,
            drive_time="4h 15m scenic road route",
            distance="255 km from Delhi NCR",
            airline="Private AC Sedan / Self-Drive",
            stay_name="Riverside Kosi Forest Lodge",
            image="https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "Exclusive 4x4 open Gypsy morning tiger safari",
                "Kosi riverbed campfire & stargazing under deep canopy",
                "Naturalist guided birdwatching jungle trek",
                "Swimming pool amid deep mango orchards"
            ]),
            inclusions=json.dumps([
                "Forest Resort Stay",
                "Jeep Safari Permits Included",
                "Buffet Breakfast & Dinner",
                "Naturalist Guide"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1", "title": "Drive to Foothills & Kosi Stroll", "desc": "Morning scenic drive into Himalayan foothills, forest lodge check-in, evening stroll along rocky Kosi river."},
                {"day": "Day 2", "title": "4x4 Open Jeep Safari & Tiger Trails", "desc": "Early morning safari inside Corbett national park with experienced tracker, afternoon relaxation by pool, night campfire."},
                {"day": "Day 3", "title": "Sunrise Trek & Return Drive", "desc": "Gentle morning nature walk, heavy brunch, relaxed return drive back to Delhi NCR."}
            ]),
            tags=json.dumps(["Wildlife", "Tiger Safari", "Forest Lodge", "Adventure"]),
            available_slots=6,
            is_featured=True,
        ),

        # LONG TRIPS
        Trip(
            slug="goa-coastal-villa-beach-club",
            title="Goa Coastal Villa & Beach Club Escape",
            destination_key="goa",
            category="flights",
            duration="4 Days / 3 Nights",
            duration_days=4,
            duration_type="long",
            price=13499,
            original_price=18500,
            discount_percent=27,
            drive_time="2h 20m direct flight (IndiGo)",
            distance="1,850 km flight corridor",
            airline="IndiGo Direct Non-Stop (DEL ➔ GOI)",
            stay_name="Candolim 3BHK Sunset Private Pool Villa",
            image="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "IndiGo direct non-stop flights included with baggage",
                "3BHK private pool villa with chef & sun-lounger gazebo",
                "2 Activa scooters included for coastal beach hopping",
                "Thalassa & Curlies sunset VIP entry passes"
            ]),
            inclusions=json.dumps([
                "Return Direct Non-Stop Flights",
                "Private Pool Villa Stay (Candolim)",
                "2 Scooters for Full Duration",
                "Daily Villa Breakfast by In-House Chef",
                "Airport Cab Pick & Drop"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1", "title": "Touchdown MOPA & Villa Pool Party", "desc": "IndiGo direct morning flight, private cab pickup to Candolim villa, evening sundowner BBQ party by your private pool."},
                {"day": "Day 2", "title": "Scooter Beach Hopping & Thalassa", "desc": "Ride through coconut palm avenues of Anjuna, lunch at beachfront shacks, sunset dinner reservation at Thalassa Vagator."},
                {"day": "Day 3", "title": "Old Goa Latin Quarter & Tito's Lane", "desc": "Explore historic Fontainhas colorful Portuguese alleys, river cruise, thrilling nightlife party on Tito's lane."},
                {"day": "Day 4", "title": "Leisurely Brunch & Flight Back", "desc": "Lazy poolside breakfast, local souvenir shopping in Panaji, cab drop to airport for return flight."}
            ]),
            tags=json.dumps(["Flights Included", "Private Pool", "Beach Parties", "Trending"]),
            available_slots=12,
            is_featured=True,
        ),
        Trip(
            slug="thailand-phuket-krabi-island-hopper",
            title="Thailand Phuket & Krabi Island Hopper (Flat ₹499 Visa)",
            destination_key="thailand",
            category="visa",
            duration="5 Days / 4 Nights",
            duration_days=5,
            duration_type="long",
            price=24999,
            original_price=34000,
            discount_percent=26,
            drive_time="4h 15m direct international flight",
            distance="3,800 km direct corridor",
            airline="Vistara / Thai Airways Direct",
            stay_name="4-Star Cliffside Andaman Sea Resort",
            image="https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "Flat ₹499 family visa cap guarantee included",
                "Speedboat island hopping to Phi Phi & Maya Bay",
                "Patong nightlife & Bangla road explorer",
                "Complimentary 1GB international eSIM QR code"
            ]),
            inclusions=json.dumps([
                "Return International Flights",
                "4-Star Resort Stay with Ocean View",
                "Flat ₹499 Visa Processing & Insurance",
                "Speedboat Phi Phi Tour with Snorkeling",
                "Daily Buffet Breakfast",
                "Free 1GB eSIM QR"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1", "title": "Phuket Arrival & Patong Sunset", "desc": "Landing in Phuket, fast-track visa immigration, scenic transfer to cliffside sea resort, evening chill on Patong beach."},
                {"day": "Day 2", "title": "Phi Phi Islands & Maya Bay Speedboat", "desc": "Full-day catamaran speedboat excursion to Maya Bay, snorkeling among vibrant coral reefs, buffet lunch on Phi Phi Don."},
                {"day": "Day 3", "title": "Krabi Railay Beach & Sea Caves", "desc": "Long-tail boat excursion to limestone towering karst cliffs of Railay beach and sacred Phra Nang cave beach."},
                {"day": "Day 4", "title": "Old Phuket Town & Night Markets", "desc": "Sino-Portuguese heritage walking tour, night street food stalls with mango sticky rice and pad thai."},
                {"day": "Day 5", "title": "Duty Free & Return Flight", "desc": "Morning spa treatment, duty-free shopping at airport, direct flight back home."}
            ]),
            tags=json.dumps(["International", "Flat ₹499 Visa", "Speedboat", "Islands"]),
            available_slots=8,
            is_featured=True,
        ),
        Trip(
            slug="dubai-luxury-desert-safari-skyline",
            title="Dubai 48h Luxury Safari & Skyline Experience",
            destination_key="dubai",
            category="visa",
            duration="4 Days / 3 Nights",
            duration_days=4,
            duration_type="long",
            price=29999,
            original_price=41000,
            discount_percent=27,
            drive_time="3h 40m direct flight corridor",
            distance="2,200 km direct flight",
            airline="Emirates / Air India Express Direct",
            stay_name="5-Star Downtown Dubai Hotel with Burj Views",
            image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "24-Hour Express UAE Visa with flat ₹499 cap",
                "Red Dune 4x4 desert safari with BBQ dinner & show",
                "Burj Khalifa 124th floor observation deck tickets",
                "Dubai Marina luxury evening yacht cruise"
            ]),
            inclusions=json.dumps([
                "Direct Flights Included",
                "5-Star Downtown Stay",
                "24h Visa Pre-check Guarantee",
                "Red Dune Desert Safari",
                "Burj Khalifa Entry",
                "Airport Luxury Transfers"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1", "title": "Dubai Touchdown & Marina Yacht Cruise", "desc": "Arrival at DXB terminal, private sedan drop to downtown hotel, evening sunset luxury yacht cruise along Dubai Marina."},
                {"day": "Day 2", "title": "Burj Khalifa & Dubai Mall Fountains", "desc": "Elevate to 124th floor of Burj Khalifa, explore giant aquarium, spectacular choreographed fountain show."},
                {"day": "Day 3", "title": "Red Dune 4x4 Safari & Bedouin Camp", "desc": "Afternoon dune bashing in Land Cruiser, sandboarding, camel rides, and sumptuous Bedouin BBQ with fire shows."},
                {"day": "Day 4", "title": "Gold Souk Stroll & Departure", "desc": "Traditional Abra boat crossing to Deira Gold and Spice Souk, souvenir pickup, flight home."}
            ]),
            tags=json.dumps(["Dubai", "Luxury", "24h Visa", "Burj Khalifa"]),
            available_slots=10,
            is_featured=True,
        ),
        Trip(
            slug="kashmir-dal-lake-houseboat-gulmarg",
            title="Kashmir Dal Lake Royal Houseboat & Gulmarg Skiing",
            destination_key="kashmir",
            category="flights",
            duration="5 Days / 4 Nights",
            duration_days=5,
            duration_type="long",
            price=18999,
            original_price=26500,
            discount_percent=28,
            drive_time="1h 25m non-stop mountain flight",
            distance="810 km flight corridor",
            airline="IndiGo / SpiceJet Direct (DEL ➔ SXR)",
            stay_name="Cedar Wood Carved Houseboat on Nigeen Lake",
            image="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80",
            highlights=json.dumps([
                "Handcrafted walnut & cedar luxury houseboat stay",
                "Shikara sunset ride on serene Dal Lake",
                "Gulmarg Phase 1 & 2 Gondola cable car ride tickets",
                "Pahalgam Betaab valley scenic pine drive"
            ]),
            inclusions=json.dumps([
                "Direct Flights (DEL ➔ SXR)",
                "Houseboat & Luxury Hotel",
                "Gulmarg Gondola Pass",
                "Daily Kashmiri Breakfast & Dinner",
                "Private Heated Cab"
            ]),
            itinerary=json.dumps([
                {"day": "Day 1", "title": "Srinagar Arrival & Dal Lake Shikara", "desc": "Fly above snow-capped Pir Panjal mountains, check into traditional carved cedar houseboat, romantic sunset Shikara ride."},
                {"day": "Day 2", "title": "Gulmarg Gondola High Altitude Ascent", "desc": "Drive to snowy Gulmarg, ride world's second highest Gondola cable car to Apharwat peak, snow activities."},
                {"day": "Day 3", "title": "Pahalgam & Betaab Pine Valley", "desc": "Scenic drive along saffron fields of Pampore to Lidder river valley, pony rides through pristine Betaab valley pine woods."},
                {"day": "Day 4", "title": "Mughal Gardens & Old Bazaar Kahwa", "desc": "Visit Shalimar & Nishat royal Mughal gardens, sip steaming saffron Kahwa with walnut biscuits in old Lal Chowk."},
                {"day": "Day 5", "title": "Floating Flower Market & Departure", "desc": "Early morning floating market Shikara tour, souvenir shopping for Pashmina & dry fruits, departure flight."}
            ]),
            tags=json.dumps(["Snow & Mountains", "Houseboat", "Gondola", "Romantic"]),
            available_slots=7,
            is_featured=True,
        ),
    ]

    for t in trips_data:
        db.add(t)
    db.commit()

    # 3. Seed Distressed Flights
    flights_data = [
        DistressedFlight(
            flight_num="6E-2041",
            airline="IndiGo",
            origin="Delhi (DEL)",
            origin_code="DEL",
            dest="Goa MOPA (GOX)",
            dest_code="GOX",
            departure_time="06:15 AM",
            arrival_time="08:45 AM",
            original_price=7200,
            distressed_price=2899,
            discount_percent=60,
            seats_remaining=3,
            baggage="15kg check-in + 7kg cabin",
            tags=json.dumps(["Flash Drop", "Direct", "Lowest in 30 Days"]),
        ),
        DistressedFlight(
            flight_num="AI-915",
            airline="Air India",
            origin="Delhi (DEL)",
            origin_code="DEL",
            dest="Dubai (DXB)",
            dest_code="DXB",
            departure_time="08:40 AM",
            arrival_time="11:15 AM",
            original_price=18000,
            distressed_price=8499,
            discount_percent=53,
            seats_remaining=5,
            baggage="25kg check-in + Hot Meal",
            tags=json.dumps(["Hot Deal", "Direct", "Free Meal"]),
        ),
        DistressedFlight(
            flight_num="QP-1302",
            airline="Akasa Air",
            origin="Mumbai (BOM)",
            origin_code="BOM",
            dest="Bangalore (BLR)",
            dest_code="BLR",
            departure_time="07:00 AM",
            arrival_time="08:35 AM",
            original_price=4800,
            distressed_price=1999,
            discount_percent=58,
            seats_remaining=4,
            baggage="15kg check-in",
            tags=json.dumps(["Weekend Deal", "Non-Stop"]),
        ),
        DistressedFlight(
            flight_num="SG-8124",
            airline="SpiceJet",
            origin="Delhi (DEL)",
            origin_code="DEL",
            dest="Srinagar (SXR)",
            dest_code="SXR",
            departure_time="09:20 AM",
            arrival_time="10:50 AM",
            original_price=8100,
            distressed_price=3299,
            discount_percent=59,
            seats_remaining=2,
            baggage="15kg check-in",
            tags=json.dumps(["Mountain Flash", "Direct"]),
        ),
        DistressedFlight(
            flight_num="UK-121",
            airline="Vistara",
            origin="Delhi (DEL)",
            origin_code="DEL",
            dest="Bangkok (BKK)",
            dest_code="BKK",
            departure_time="01:30 PM",
            arrival_time="07:15 PM",
            original_price=22000,
            distressed_price=9999,
            discount_percent=55,
            seats_remaining=6,
            baggage="30kg + Hot Meal",
            tags=json.dumps(["Flat ₹499 Visa Cap Eligible", "Full Service"]),
        ),
    ]

    for f in flights_data:
        db.add(f)
    db.commit()

    # 4. Seed Visas
    visas_data = [
        Visa(
            country_key="thailand",
            country_name="Thailand Tourist eVisa",
            flag="🇹🇭",
            processing_hours=24,
            platform_fee=499,
            govt_fee=0,
            total_fee=499,
            success_rate=99.8,
            express_available=True,
            requirements=json.dumps([
                "Passport front & back scan (minimum 6 months validity)",
                "Passport size color photo with white background",
                "Confirmed return flight tickets",
                "Hotel booking confirmation"
            ]),
        ),
        Visa(
            country_key="dubai",
            country_name="Dubai / UAE 30-Day Express eVisa",
            flag="🇦🇪",
            processing_hours=24,
            platform_fee=499,
            govt_fee=6500,
            total_fee=6999,
            success_rate=99.4,
            express_available=True,
            requirements=json.dumps([
                "Passport bio page scan (6m validity)",
                "PAN Card copy of primary traveler",
                "White background passport photo"
            ]),
        ),
        Visa(
            country_key="vietnam",
            country_name="Vietnam 30-Day Multi-Entry eVisa",
            flag="🇻🇳",
            processing_hours=48,
            platform_fee=499,
            govt_fee=2100,
            total_fee=2599,
            success_rate=99.2,
            express_available=True,
            requirements=json.dumps([
                "Passport clear scan",
                "Portrait photo 4x6cm without glasses",
                "Entry & Exit airport selection"
            ]),
        ),
        Visa(
            country_key="bali",
            country_name="Indonesia / Bali 30-Day e-VOA",
            flag="🇮🇩",
            processing_hours=2,
            platform_fee=499,
            govt_fee=2700,
            total_fee=3199,
            success_rate=99.9,
            express_available=True,
            requirements=json.dumps([
                "Passport bio page photo",
                "Return ticket out of Indonesia"
            ]),
        ),
    ]

    for v in visas_data:
        db.add(v)
    db.commit()

    # 5. Seed Sample Bookings
    bookings_data = [
        Booking(
            booking_id="ORB-2026-X992",
            trip_slug="rishikesh-riverfront-glamping",
            trip_title="Rishikesh Riverfront Glamping & 16km Rafting",
            destination_key="rishikesh",
            travel_date="2026-11-01",
            travelers_count=2,
            total_amount=6998,
            payment_method="UPI_INSTANT",
            status="CONFIRMED",
            user_name="Rahul Sharma",
            user_email="rahul.sharma@travel.in",
            user_phone="+91 98765 43210",
            gstin="07AAAAA0000A1Z5",
            company_name="Sharma Tech Enterprises",
            itc_eligible=True,
            itc_amount=1260,
            qr_token="QR_TOKEN_RISHIKESH_992",
        ),
        Booking(
            booking_id="ORB-2026-X481",
            trip_slug="goa-coastal-villa-beach-club",
            trip_title="Goa Coastal Villa & Beach Club Escape",
            destination_key="goa",
            travel_date="2026-11-14",
            travelers_count=4,
            total_amount=53996,
            payment_method="UPI_INSTANT",
            status="CONFIRMED",
            user_name="Priya Mehta",
            user_email="priya.mehta@orbit.ai",
            user_phone="+91 98111 22334",
            gstin="27AABCM8821B1ZM",
            company_name="Mehta Creative Studios",
            itc_eligible=True,
            itc_amount=9719,
            qr_token="QR_TOKEN_GOA_481",
        ),
    ]

    for b in bookings_data:
        db.add(b)
    db.commit()

    print("✅ Seeding complete!")
