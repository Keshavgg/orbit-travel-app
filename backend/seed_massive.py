import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Hotel, FlightTicket, EventConcert

# Initialize tables
Base.metadata.create_all(bind=engine)

HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
]

CONCERT_IMAGES = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=80",
]

CITY_HOTEL_SEEDS = {
    "goa": {
        "areas": ["Vagator", "Candolim", "Anjuna", "Calangute", "Morjim", "Ashwem", "Palolem", "Baga", "Assagao", "Panaji Latin Quarter"],
        "types": ["Private Villa", "Beachfront Resort", "Boutique Hotel", "Luxury Villa with Pool", "Portuguese Heritage Home"],
        "prefixes": ["Casa", "Villa", "The Palm", "Sunset", "Oceanic", "Azure", "Sylvan", "Sol De", "Wanderlust", "Wildflower", "Boho", "Coconut Grove", "Coral Reef"],
        "suffixes": ["Suites", "Retreat & Spa", "Resort", "Haven", "Sanctuary", "Bayfront", "Private Pool Villa", "Boutique Estate"],
        "min_price": 2800,
        "max_price": 38000,
    },
    "delhi": {
        "areas": ["Aerocity Hub", "Connaught Place", "Lutyens Delhi", "South Extension", "Hauz Khas", "Chanakyapuri", "Gurgaon CyberHub", "Noida Expressway"],
        "types": ["5-Star Luxury", "Business Suite", "Heritage Haveli", "Design Loft", "Boutique Hotel"],
        "prefixes": ["The Grand", "Imperial", "Oberoi", "Leela", "Radisson", "Taj", "ITC", "Vivanta", "Claridges", "Metropolitan"],
        "suffixes": ["Palace", "Tower", "Executive Suites", "Manor", "Suites & Spa", "Residency"],
        "min_price": 3500,
        "max_price": 32000,
    },
    "jaipur": {
        "areas": ["Bani Park", "C-Scheme", "Amer Fort Road", "Mansarovar", "Civil Lines", "Johari Bazaar", "Kukas Royal Belt"],
        "types": ["Heritage Haveli", "Royal Palace", "Courtyard Boutique", "Luxury Desert Resort"],
        "prefixes": ["Raj", "Haveli", "Alsisar", "Shahpura", "Mandawa", "Jaigarh", "Amber", "Narain", "Samode", "Khandela", "Diggi"],
        "suffixes": ["Palace", "Haveli & Courtyard", "Heritage Hotel", "Niwas", "Kothi", "Royal Court"],
        "min_price": 2400,
        "max_price": 28000,
    },
    "rishikesh": {
        "areas": ["Shivpuri Riverbed", "Tapovan", "Laxman Jhula", "Neelkanth Road", "Mohanchatti", "Byasi"],
        "types": ["Riverside Camp", "Glamping Swiss Tent", "Yoga & Wellness Retreat", "Hilltop Resort"],
        "prefixes": ["Ganga", "Himalayan", "Aloha", "Misty", "Soul", "Divine", "Riverstone", "Zenith", "Brahmaputra", "Green Mount"],
        "suffixes": ["Glamping Camp", "Wellness Sanctuary", "River Lodge", "Eco Resort", "Nature Retreat"],
        "min_price": 1800,
        "max_price": 19000,
    },
    "mumbai": {
        "areas": ["Bandra West", "Juhu Beachfront", "Colaba & Gateway", "BKC Commercial Hub", "Marine Drive", "Powai Lake"],
        "types": ["5-Star Luxury", "Sea View Suite", "Heritage Hotel", "Designer Studio Loft"],
        "prefixes": ["The Sea Princess", "Bayview", "Trident", "JW", "St. Regis", "Soho", "Novotel", "Marine", "Boutique 40"],
        "suffixes": ["Towers", "Palace", "Residency", "Suites", "Club & Hotel"],
        "min_price": 4200,
        "max_price": 45000,
    },
    "bangalore": {
        "areas": ["Indiranagar", "Koramangala", "Whitefield Tech Hub", "UB City / Lavelle Road", "MG Road", "Hebbal Lake"],
        "types": ["Tech Boutique", "5-Star Luxury", "Garden Retreat", "Design Apartment"],
        "prefixes": ["The Silicon", "Garden City", "ITC", "The Chancery", "The Paul", "Zuri", "Sheraton", "Oakwood"],
        "suffixes": ["Pavilion", "Grand Hotel", "Suites", "Lodge & Spa"],
        "min_price": 3200,
        "max_price": 26000,
    },
    "kashmir": {
        "areas": ["Dal Lake (Srinagar)", "Nigeen Lake", "Gulmarg Apharwat Ridge", "Pahalgam Pine Valley", "Sonmarg"],
        "types": ["Handcrafted Cedar Houseboat", "Snow Mountain Resort", "Pine Forest Cottage", "Heritage Villa"],
        "prefixes": ["Dal Prince", "Khyber", "Gulmarg Heights", "Pine & Snow", "Chinar", "Saffron", "Pari Mahal", "Kohinoor"],
        "suffixes": ["Royal Houseboat", "Himalayan Resort", "Valley Chalet", "Alpine Retreat"],
        "min_price": 3500,
        "max_price": 34000,
    },
    "corbett": {
        "areas": ["Dhikala Zone", "Kosi Riverfront", "Bijrani Gate", "Marchula Valley", "Jhirna"],
        "types": ["Forest Lodge", "Wildlife Safari Resort", "Riverside Cottage", "Luxury Jungle Tent"],
        "prefixes": ["Tiger Kingdom", "Corbett Wilds", "Kosi River", "Sal Woods", "Roar", "Pugmark", "Baagh"],
        "suffixes": ["Safari Lodge", "Forest Sanctuary", "Jungle Resort", "Riverside Camp"],
        "min_price": 3200,
        "max_price": 22000,
    },
    "thailand": {
        "areas": ["Patong Beach (Phuket)", "Kata & Karon", "Railay Beach (Krabi)", "Bangkok Sukhumvit", "Phi Phi Islands", "Koh Samui Chaweng"],
        "types": ["5-Star Beachfront Resort", "Cliffside Pool Villa", "Island Bungalow", "Rooftop Luxury Hotel"],
        "prefixes": ["Andaman", "Siam", "Banyan", "Lotus", "Anantara", "Phuket Horizon", "Krabi Sunset", "Emerald"],
        "suffixes": ["Island Resort & Spa", "Cliffside Villa", "Bay Luxury Resort", "Palace & Lagoon"],
        "min_price": 4500,
        "max_price": 42000,
    },
    "dubai": {
        "areas": ["Downtown & Burj Khalifa", "Dubai Marina", "Palm Jumeirah", "JBR Beach", "Deira Creek", "Desert Dunes"],
        "types": ["5-Star Luxury Skyline", "Palatial Beach Resort", "Desert Luxury Oasis", "Marina Suite"],
        "prefixes": ["Burj", "Atlantis", "Address", "Jumeirah", "Emirates", "Marina Pearl", "Oasis", "Armani"],
        "suffixes": ["Sky Luxury", "Palace Hotel", "Resort & Beach Club", "Suites & Towers"],
        "min_price": 6500,
        "max_price": 55000,
    },
    "bali": {
        "areas": ["Seminyak", "Canggu", "Ubud Rainforest", "Uluwatu Clifftop", "Nusa Dua"],
        "types": ["Private Pool Villa", "Rainforest Eco Lodge", "Clifftop Surf Resort", "Boutique Beach Resort"],
        "prefixes": ["Villa Tirta", "Ayana", "Ubud Zen", "Batu", "Kayu", "Samaya", "Alila", "Wayan"],
        "suffixes": ["Private Pool Sanctuary", "Rainforest Haven", "Clifftop Villas", "Eco Luxury Estate"],
        "min_price": 5000,
        "max_price": 48000,
    },
}

ALL_AMENITIES = [
    "Private Swimming Pool", "Fast Wi-Fi (150 Mbps)", "In-House Chef & BBQ", "Free Airport Pickup",
    "Complimentary Royal Breakfast", "Beachfront Sea View", "Air Conditioning", "Bathtub with Jacuzzi",
    "Balcony with Mountain View", "24/7 Butler Service", "Scooter & Car Rental", "Bonfire & Acoustic Live Music",
    "Spa & Ayurvedic Massage", "Pet Friendly", "EV Charging Point"
]

ALL_BADGES = [
    "🔥 Best Seller", "⭐ 4.9 Superhost", "🏖️ Direct Beach Access", "🏡 Private Pool", 
    "👑 Royal Heritage", "⚡ Instant Confirmation", "💎 Ultra Luxury", "🌿 Eco-Friendly"
]

AIRLINES = [
    {"name": "IndiGo", "code": "6E", "baggage": "15kg check-in + 7kg cabin", "color": "blue"},
    {"name": "Air India", "code": "AI", "baggage": "25kg check-in + 7kg cabin + Hot Meal", "color": "red"},
    {"name": "Vistara", "code": "UK", "baggage": "20kg check-in + 7kg cabin + Gourmet Meal", "color": "purple"},
    {"name": "Akasa Air", "code": "QP", "baggage": "15kg check-in + 7kg cabin", "color": "orange"},
    {"name": "SpiceJet", "code": "SG", "baggage": "15kg check-in + 7kg cabin", "color": "red"},
    {"name": "Emirates", "code": "EK", "baggage": "30kg check-in + Hot Meals + WiFi", "color": "gold"},
]

AIRPORTS = [
    {"name": "Delhi NCR (Indira Gandhi)", "code": "DEL"},
    {"name": "Mumbai (Chhatrapati Shivaji)", "code": "BOM"},
    {"name": "Bangalore (Kempegowda)", "code": "BLR"},
    {"name": "Goa (MOPA Intl)", "code": "GOX"},
    {"name": "Goa (Dabolim)", "code": "GOI"},
    {"name": "Srinagar (Sheikh ul-Alam)", "code": "SXR"},
    {"name": "Jaipur (Sanganer)", "code": "JAI"},
    {"name": "Kolkata (Netaji Subhash)", "code": "CCU"},
    {"name": "Hyderabad (Rajiv Gandhi)", "code": "HYD"},
    {"name": "Chennai (Meenambakkam)", "code": "MAA"},
    {"name": "Dubai Intl Terminal 3", "code": "DXB"},
    {"name": "Bangkok Suvarnabhumi", "code": "BKK"},
    {"name": "Bali Denpasar Intl", "code": "DPS"},
]

EVENT_TEMPLATES = [
    ("Coldplay: Music of the Spheres World Tour", "Concert", "mumbai", "DY Patil Sports Stadium, Nerul, Mumbai", "Chris Martin & Coldplay", 6500, 18000, True),
    ("Diljit Dosanjh: Dil-Luminati Tour India", "Concert", "delhi", "Jawaharlal Nehru Stadium, Delhi NCR", "Diljit Dosanjh", 4999, 14000, True),
    ("Sunburn Goa 2026: Official 3-Day Beach Festival", "Music Festival", "goa", "Vagator Hilltop Beach Arena, North Goa", "David Guetta, Martin Garrix & Top 50 DJs", 7499, 22000, True),
    ("Lollapalooza India 2026: Multi-Stage Mega Fest", "Music Festival", "mumbai", "Mahalaxmi Racecourse, South Mumbai", "Sting, Jonas Brothers, Anoushka Shankar", 8999, 25000, True),
    ("DGTL Goa: Premier Underground Techno Festival", "Nightlife", "goa", "Miramar Shoreline Dunes, Goa", "Tale of Us, Boris Brejcha, Dixon", 4500, 12000, True),
    ("Zomaland Food, Comedy & Music Carnival", "Food & Carnival", "delhi", "JLN Ground & Stadium, Delhi", "King, Bhuvan Bam, Nucleya", 999, 3500, False),
    ("NH7 Weekender: The Happiest Music Festival", "Music Festival", "pune", "Mahalaxmi Lawns, Pune", "Prateek Kuhad, When Chai Met Toast, Seedhe Maut", 3200, 8500, True),
    ("Dua Lipa: Radical Optimism Stadium Tour", "Concert", "mumbai", "MMRDA Grounds, BKC Mumbai", "Dua Lipa", 5500, 16000, True),
    ("Udaipur World Music Festival & Lake Concerts", "Cultural", "udaipur", "Fateh Sagar Lake Palaces, Udaipur", "Global Folk & Mediterranean Artists", 1999, 5000, True),
    ("Rishikesh International Ganga Aarti & Sufi Nights", "Cultural", "rishikesh", "Parmarth Niketan Ghats, Rishikesh", "Kailash Kher & Wadali Brothers", 1499, 4000, False),
    ("Jaipur Royal Literature & Sitar Nights", "Cultural", "jaipur", "Diggi Palace Courtyard, Jaipur", "Shujaat Khan & World Authors", 1200, 3500, False),
    ("Karan Aujla: It Was All A Dream Arena Tour", "Concert", "delhi", "Indira Gandhi Indoor Arena, Delhi", "Karan Aujla", 3999, 11000, True),
    ("Alan Walker: Walkerworld India Tour", "Concert", "bangalore", "Sunburn Arena, Manpho Convention Centre, Bangalore", "Alan Walker", 2999, 8500, False),
    ("Boiler Room Goa: Underground Sunset Rave", "Nightlife", "goa", "Secret Clifftop Ruins, Vagator Goa", "Underground Techno Collective", 3500, 9000, True),
    ("Tomorrowland Presents: Garden of Madness Dubai", "Music Festival", "dubai", "Dubai Festival City Grounds", "Armin van Buuren, Dimitri Vegas & Like Mike", 8500, 24000, True),
    ("Full Moon Beach Party 2026", "Nightlife", "thailand", "Haad Rin Beach, Koh Phangan, Thailand", "International Fire Spinners & Beach DJs", 1500, 4500, True),
]


def seed_all_massive_data():
    db = SessionLocal()
    try:
        # Check current counts
        hotel_count = db.query(Hotel).count()
        flight_count = db.query(FlightTicket).count()
        event_count = db.query(EventConcert).count()

        print(f"Current DB state: {hotel_count} hotels, {flight_count} flights, {event_count} events.")

        # 1. GENERATE 520+ REALISTIC HOTELS
        if hotel_count < 500:
            print("🏨 Generating 520+ diverse luxury hotels, havelis, villas and camps...")
            hotels_to_add = []
            target_hotels = 520
            created = 0

            cities = list(CITY_HOTEL_SEEDS.keys())
            while created < target_hotels:
                city = cities[created % len(cities)]
                cfg = CITY_HOTEL_SEEDS[city]
                area = random.choice(cfg["areas"])
                ptype = random.choice(cfg["types"])
                prefix = random.choice(cfg["prefixes"])
                suffix = random.choice(cfg["suffixes"])
                name_num = (created // len(cities)) + 1

                # Generate clean unique hotel name
                hotel_name = f"{prefix} {suffix}"
                if name_num > 1:
                    hotel_name = f"{prefix} {suffix} {name_num}"

                slug = f"hotel-{city}-{created + 1}-{random.randint(100, 999)}"
                price = random.randint(cfg["min_price"] // 100, cfg["max_price"] // 100) * 100
                discount = random.choice([20, 25, 30, 35, 40, 45, 50])
                orig_price = int(price / (1 - discount / 100))

                rating = round(random.uniform(4.3, 4.95), 1)
                reviews = random.randint(45, 950)
                rooms = random.randint(2, 9)
                image = random.choice(HOTEL_IMAGES)
                amenities_sample = random.sample(ALL_AMENITIES, k=random.randint(5, 8))
                badge = random.choice(ALL_BADGES) if random.random() > 0.3 else None

                h = Hotel(
                    slug=slug,
                    name=hotel_name,
                    city_key=city,
                    location=f"{area}, {city.title()}",
                    property_type=ptype,
                    rating=rating,
                    review_count=reviews,
                    price_per_night=price,
                    original_price=orig_price,
                    discount_percent=discount,
                    image=image,
                    amenities=json.dumps(amenities_sample),
                    badge=badge,
                    rooms_left=rooms,
                    is_featured=created < 15,
                )
                hotels_to_add.append(h)
                created += 1

            db.bulk_save_objects(hotels_to_add)
            db.commit()
            print(f"✅ Successfully seeded {len(hotels_to_add)} hotels!")

        # 2. GENERATE 520+ REALISTIC FLIGHT TICKETS
        if flight_count < 500:
            print("✈️ Generating 520+ domestic and international flight tickets...")
            flights_to_add = []
            target_flights = 520
            created = 0

            # Core hubs
            origins = [a for a in AIRPORTS if a["code"] in ["DEL", "BOM", "BLR", "CCU", "HYD", "MAA"]]
            destinations = [a for a in AIRPORTS if a["code"] in ["GOX", "GOI", "SXR", "JAI", "DXB", "BKK", "DPS", "BOM", "BLR", "DEL"]]

            while created < target_flights:
                airline = random.choice(AIRLINES)
                origin = random.choice(origins)
                dest = random.choice([d for d in destinations if d["code"] != origin["code"]])

                flight_num = f"{airline['code']}-{random.randint(102, 988)}"
                dep_hour = random.randint(5, 23)
                dep_min = random.choice([0, 15, 20, 30, 45, 50])
                dep_str = f"{dep_hour:02d}:{dep_min:02d} {'AM' if dep_hour < 12 else 'PM'}"

                is_intl = dest["code"] in ["DXB", "BKK", "DPS"]
                flight_hours = random.randint(3, 5) if is_intl else random.randint(1, 2)
                flight_mins = random.choice([15, 25, 30, 45, 55])
                duration_str = f"{flight_hours}h {flight_mins}m"

                arr_hour = (dep_hour + flight_hours) % 24
                arr_min = (dep_min + flight_mins) % 60
                arr_str = f"{arr_hour:02d}:{arr_min:02d} {'AM' if arr_hour < 12 else 'PM'}"

                stops = "Non-Stop" if random.random() > 0.25 else "1-Stop (via BOM)"
                
                # Pricing
                base_price = random.randint(7500, 26000) if is_intl else random.randint(2200, 7800)
                is_distressed = random.random() < 0.25
                discount = random.randint(40, 62) if is_distressed else random.randint(10, 25)
                price = int(base_price * (1 - discount / 100))

                tags = ["Instant PNR", "Direct"] if stops == "Non-Stop" else ["1-Stop"]
                if is_distressed:
                    tags.append("Flash Seat Drop (60% Off)")
                if is_intl:
                    tags.append("Flat ₹499 Visa Cap")

                seats = random.randint(1, 9)
                cabin = "Business" if random.random() < 0.1 else "Economy"

                f = FlightTicket(
                    flight_num=flight_num,
                    airline=airline["name"],
                    origin=origin["name"],
                    origin_code=origin["code"],
                    dest=dest["name"],
                    dest_code=dest["code"],
                    departure_time=dep_str,
                    arrival_time=arr_str,
                    duration=duration_str,
                    stops=stops,
                    price=price,
                    original_price=base_price,
                    discount_percent=discount,
                    seats_available=seats,
                    baggage=airline["baggage"],
                    cabin_class=cabin,
                    is_distressed=is_distressed,
                    tags=json.dumps(tags),
                )
                flights_to_add.append(f)
                created += 1

            db.bulk_save_objects(flights_to_add)
            db.commit()
            print(f"✅ Successfully seeded {len(flights_to_add)} flights!")

        # 3. GENERATE 100+ CONCERTS, FESTIVALS & MEGA EVENTS
        if event_count < 100:
            print("🎸 Generating 110+ concerts, music festivals, food carnivals & parties...")
            events_to_add = []
            target_events = 110
            created = 0

            now = datetime.now()

            while created < target_events:
                template = EVENT_TEMPLATES[created % len(EVENT_TEMPLATES)]
                multiplier = (created // len(EVENT_TEMPLATES)) + 1
                
                days_ahead = random.randint(7, 120)
                event_date = (now + timedelta(days=days_ahead)).strftime("%b %d, %Y")
                time_str = random.choice(["05:00 PM", "06:30 PM", "07:00 PM", "08:00 PM", "09:30 PM"])

                title = template[0]
                if multiplier > 1:
                    title = f"{template[0]} (Day {multiplier} / Edition {multiplier})"

                slug = f"event-{template[2]}-{created + 1}-{random.randint(100, 999)}"
                price = template[5] + random.randint(-400, 800)
                orig_price = template[6]
                tickets = random.randint(6, 95)
                image = random.choice(CONCERT_IMAGES)
                badge = random.choice(["🔥 High Demand", "⚡ Selling Fast", "🎟️ Almost Sold Out", "👑 VIP Pass Available"])
                tags = [template[1], "Live Performance", "Stage Access"]
                if template[7]:
                    tags.append("Stay & Flight Combo Eligible")

                combo_price = int(price * 2.2 + 6500) if template[7] else None

                e = EventConcert(
                    slug=slug,
                    title=title,
                    category=template[1],
                    city_key=template[2],
                    venue=template[3],
                    date_str=event_date,
                    time_str=time_str,
                    headliner=template[4],
                    ticket_price=price,
                    original_price=orig_price,
                    tickets_left=tickets,
                    image=image,
                    badge=badge,
                    tags=json.dumps(tags),
                    includes_stay_combo=template[7],
                    combo_price=combo_price,
                )
                events_to_add.append(e)
                created += 1

            db.bulk_save_objects(events_to_add)
            db.commit()
            print(f"✅ Successfully seeded {len(events_to_add)} concerts and mega events!")

        print("🎉 MASSIVE DATA SEEDING COMPLETE!")
        
        # Verify final counts
        final_hotels = db.query(Hotel).count()
        final_flights = db.query(FlightTicket).count()
        final_events = db.query(EventConcert).count()
        print(f"📊 Final Counts: {final_hotels} Hotels, {final_flights} Flight Tickets, {final_events} Concerts/Events.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_all_massive_data()
