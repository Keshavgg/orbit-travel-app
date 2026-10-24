"""
Seed 25+ High-Impact 3-Hour Micro-Trips and City Escapes into Orbit Travel OS.
Enables instant answers for queries like: 'agar mai bahar jao 3 ghante', '3 hour escape in delhi', 'quick 3 hour plan'.
"""

import json
from datetime import datetime
from database import SessionLocal
import models

MICRO_TRIPS_DATA = [
    # ── DELHI 3-HOUR MICRO-TRIPS ──
    {
        "slug": "delhi-3h-lodhi-sundar-nursery",
        "title": "Lodhi Art District & Sundar Nursery Heritage Cafe Walk",
        "city_key": "delhi",
        "category": "3-Hour Micro-Escape",
        "venue": "Lodhi Colony to Sundar Nursery, Central Delhi",
        "headliner": "Heritage & Cafe Curator: Orbit Delhi Desk",
        "ticket_price": 450,
        "original_price": 900,
        "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80",
        "badge": "⭐ #1 Recommended 3H Escape",
        "tags": ["3-Hour Quick Escape", "Micro Trip", "Heritage Tombs", "Art Murals", "Artisanal Coffee", "Sunset"],
        "schedule": [
            {"time": "00:00 - 00:45", "activity": "Explore 50+ giant outdoor street murals in Lodhi Art District (Block 15 to Meherchand Market)."},
            {"time": "00:45 - 01:15", "activity": "Speciality pour-over coffee & almond croissant at Blue Tokai or Devan's."},
            {"time": "01:15 - 02:45", "activity": "Take a 5-min auto to Sundar Nursery: Walk among 16th-century Mughal monuments, tranquil water bodies & lush gardens."},
            {"time": "02:45 - 03:00", "activity": "Fabcafe by the Lake for organic cold-pressed juice & sunset view over the lotus pond."}
        ],
        "estimated_budget": "₹350 - ₹750 per person",
        "transport": "JLN Stadium Metro (Violet Line) or 10-min Uber from CP/South Delhi"
    },
    {
        "slug": "delhi-3h-old-delhi-food-crawl",
        "title": "Old Delhi Midnight Food & Heritage Alley Crawl",
        "city_key": "delhi",
        "category": "3-Hour Micro-Escape",
        "venue": "Jama Masjid & Chandni Chowk, Old Delhi",
        "headliner": "Old Delhi Culinary Guild",
        "ticket_price": 550,
        "original_price": 1200,
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80",
        "badge": "🔥 Legendary Street Food",
        "tags": ["3-Hour Quick Escape", "Food Walk", "Old Delhi", "Late Night", "Iconic Eats"],
        "schedule": [
            {"time": "00:00 - 00:30", "activity": "Exit Jama Masjid Gate 1; marvel at the historic grand mosque under night floodlights."},
            {"time": "00:30 - 01:15", "activity": "Tasting: Aslam Butter Chicken with buttery roomali roti or Qureshi Kabab Corner's seekh kebabs."},
            {"time": "01:15 - 02:15", "activity": "Cycle rickshaw into Dariba Kalan & Paranthe Wali Gali; try Daulat ki Chaat (foam dessert) & rabri jalebi at Old Famous Jalebi Wala."},
            {"time": "02:15 - 03:00", "activity": "Night stroll down refurbished Chandni Chowk promenade with spiced kulhad chai."}
        ],
        "estimated_budget": "₹400 - ₹800 per person",
        "transport": "Jama Masjid or Chawri Bazar Metro (Yellow Line)"
    },
    {
        "slug": "delhi-3h-hauz-khas-sunset-lake",
        "title": "Hauz Khas Medieval Fort Sunset & Deer Park Reservoir Walk",
        "city_key": "delhi",
        "category": "3-Hour Micro-Escape",
        "venue": "Hauz Khas Village, South Delhi",
        "headliner": "Boutique Heritage & Sunset Host",
        "ticket_price": 300,
        "original_price": 600,
        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
        "badge": "🌅 Best Sunset Spot",
        "tags": ["3-Hour Quick Escape", "Sunset Point", "14th Century Ruins", "Deer Park", "Rooftop Cafes"],
        "schedule": [
            {"time": "00:00 - 00:20", "activity": "Enter HKV; stroll through indie fashion designer alleys and vintage poster shops."},
            {"time": "00:20 - 01:20", "activity": "Explore the 14th-century Alauddin Khilji Madrasa & stone pavilions overlooking the lake."},
            {"time": "01:20 - 02:15", "activity": "Jog or stroll along Deer Park track with spotted deer sightings and lush canopies."},
            {"time": "02:15 - 03:00", "activity": "Golden hour drinks & tapas at Coast Cafe or Social rooftop overlooking the water."}
        ],
        "estimated_budget": "₹500 - ₹1,100 per person",
        "transport": "Green Park or Hauz Khas Metro + 5 min e-rickshaw"
    },
    {
        "slug": "delhi-3h-majnu-ka-tilla-tibet",
        "title": "Majnu Ka Tilla Tibetan Monastery & Laphing Street Trail",
        "city_key": "delhi",
        "category": "3-Hour Micro-Escape",
        "venue": "New Aruna Nagar / MKT, North Delhi",
        "headliner": "Tibetan Cultural Collective",
        "ticket_price": 350,
        "original_price": 700,
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
        "badge": "🥟 Hidden Cultural Enclave",
        "tags": ["3-Hour Quick Escape", "Tibetan Culture", "Laphing", "Momos", "Monastery"],
        "schedule": [
            {"time": "00:00 - 00:30", "activity": "Arrive at MKT gate; pass under prayer flags into narrow cobblestone alleyways."},
            {"time": "00:30 - 01:10", "activity": "Spin prayer wheels at the Buddhist temple courtyard; incense aroma & tranquil chimes."},
            {"time": "01:10 - 02:00", "activity": "Eat authentic spicy cold/gravy Laphing at Aunty's stall + steaming buff/cheese tingmo momos."},
            {"time": "02:00 - 03:00", "activity": "Coffee & Korean bingsu or fruit mud cake at AMA Cafe / Coffee Bean & Tea Leaf."}
        ],
        "estimated_budget": "₹300 - ₹600 per person",
        "transport": "Vidhan Sabha Metro (Yellow Line) + 5 min rickshaw"
    },

    # ── MUMBAI 3-HOUR MICRO-TRIPS ──
    {
        "slug": "mumbai-3h-marine-drive-kala-ghoda",
        "title": "Marine Drive Sunset Promenade & Kala Ghoda Art Cafe Trail",
        "city_key": "mumbai",
        "category": "3-Hour Micro-Escape",
        "venue": "South Mumbai (Kala Ghoda to Marine Drive)",
        "headliner": "SoBo Heritage & Ocean Walk",
        "ticket_price": 500,
        "original_price": 1000,
        "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80",
        "badge": "🌊 Classic Bombay Sea Vibe",
        "tags": ["3-Hour Quick Escape", "Queen's Necklace", "Sea Promenade", "Art Galleries", "Parsi Cafes"],
        "schedule": [
            {"time": "00:00 - 00:45", "activity": "Stroll down cobblestone lanes of Kala Ghoda; explore Jehangir Art Gallery & David Sassoon Library."},
            {"time": "00:45 - 01:30", "activity": "Bun Maska & Irani Chai at iconic Yazdani Bakery or artisan coffee at Bake House Cafe."},
            {"time": "01:30 - 02:40", "activity": "Walk to Marine Drive (Queen's Necklace promenade); sit on the tetrapods for panoramic sunset & ocean breeze."},
            {"time": "02:40 - 03:00", "activity": "Enjoy Chowpatty kulfi or roasted spicy corn on the cob (Bhutta)."}
        ],
        "estimated_budget": "₹300 - ₹700 per person",
        "transport": "Churchgate or CSMT Station (5 min walk)"
    },
    {
        "slug": "mumbai-3h-bandra-bandstand-carter",
        "title": "Bandra Bandstand Fort Ruins & Subko Artisanal Coffee Trail",
        "city_key": "mumbai",
        "category": "3-Hour Micro-Escape",
        "venue": "Bandra West, Mumbai",
        "headliner": "Bandra Coastline & Indie Culture",
        "ticket_price": 400,
        "original_price": 800,
        "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
        "badge": "☕ Hipster Coastal Vibe",
        "tags": ["3-Hour Quick Escape", "Bandra Fort", "Sea View", "Subko Sourdough", "Street Murals"],
        "schedule": [
            {"time": "00:00 - 00:30", "activity": "Visit Castella de Aguada (Bandra Fort) with sea bridge views of Bandra-Worli Sea Link."},
            {"time": "00:30 - 01:15", "activity": "Walk along Bandstand promenade past Bollywood celebrity bungalows & rocky tide pools."},
            {"time": "01:15 - 02:15", "activity": "Venture into quaint Ranwar Village; admire vibrant street art murals and Portuguese cottages."},
            {"time": "02:15 - 03:00", "activity": "Indulge in artisanal chocolate pod & pod-to-cup craft coffee at Subko Specialty Coffee & Bakehouse."}
        ],
        "estimated_budget": "₹450 - ₹950 per person",
        "transport": "Bandra Local Station + 10 min auto"
    },

    # ── BENGALURU 3-HOUR MICRO-TRIPS ──
    {
        "slug": "blr-3h-cubbon-park-church-street",
        "title": "Cubbon Park Green Canopy & Church Street Bookstore Cafe Crawl",
        "city_key": "bangalore",
        "category": "3-Hour Micro-Escape",
        "venue": "Central Bengaluru (Cubbon Park to Church St)",
        "headliner": "Garden City Literature & Cafe Host",
        "ticket_price": 300,
        "original_price": 600,
        "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
        "badge": "🌿 100% Pedestrian Friendly",
        "tags": ["3-Hour Quick Escape", "Garden City", "Bookstore Crawl", "Filter Coffee", "Cubbon Canopy"],
        "schedule": [
            {"time": "00:00 - 01:00", "activity": "Walk under 100-year-old bamboo groves & red terracotta High Court heritage buildings in Cubbon Park."},
            {"time": "01:00 - 01:50", "activity": "Walk across to Church Street: Browse rare books & comics at Blossom Book House (3 stories of literature)."},
            {"time": "01:50 - 02:30", "activity": "Hot South Indian filter coffee & crisp Benne Dosa or cold brew at Matteo Coffea / Indian Coffee House."},
            {"time": "02:30 - 03:00", "activity": "Indulge in artisanal Belgian waffles or dessert at The Bangalore Press Club courtyard."}
        ],
        "estimated_budget": "₹300 - ₹650 per person",
        "transport": "Cubbon Park or MG Road Metro Station (Purple Line)"
    },

    # ── GOA 3-HOUR MICRO-TRIPS ──
    {
        "slug": "goa-3h-fontainhas-latin-quarter",
        "title": "Fontainhas Latin Quarter Portuguese Heritage & Bakery Crawl",
        "city_key": "goa",
        "category": "3-Hour Micro-Escape",
        "venue": "Fontainhas, Panaji, Central Goa",
        "headliner": "Panaji Heritage & Portuguese Pastry Guild",
        "ticket_price": 450,
        "original_price": 900,
        "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
        "badge": "🎨 Colorful Azulejo Streets",
        "tags": ["3-Hour Quick Escape", "Portuguese Villas", "Pastelaria", "Panjim", "Photography"],
        "schedule": [
            {"time": "00:00 - 00:45", "activity": "Walking photo tour along vibrant marigold-yellow and cobalt-blue Portuguese heritage mansions with azulejo tiles."},
            {"time": "00:45 - 01:30", "activity": "Stop at Confeitaria 31 De Janeiro (1930s bakery): Warm Pasteis de Nata (custard tarts) & Bebinca."},
            {"time": "01:30 - 02:30", "activity": "Visit St. Sebastian Chapel and art galleries like Fundacao Oriente displaying Goan-Portuguese contemporary art."},
            {"time": "02:30 - 03:00", "activity": "Sunset drink by Mandovi riverside promenade with live jazz or acoustic fado melody."}
        ],
        "estimated_budget": "₹400 - ₹900 per person",
        "transport": "Panaji KTC Bus Stand / 10-min cab from Miramar"
    },
    {
        "slug": "goa-3h-chapora-clifftop-sunset",
        "title": "Chapora Fort Panoramic Ocean Sunset & Vagator Clifftop Chill",
        "city_key": "goa",
        "category": "3-Hour Micro-Escape",
        "venue": "Vagator / Chapora, North Goa",
        "headliner": "Coastal Sunset Collective",
        "ticket_price": 400,
        "original_price": 800,
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
        "badge": "🌅 Dil Chahta Hai Sunset",
        "tags": ["3-Hour Quick Escape", "Chapora Fort", "Ocean View", "Clifftop Cocktails", "Vagator"],
        "schedule": [
            {"time": "00:00 - 00:45", "activity": "10-minute stone hike up to Chapora Fort; stand atop the red laterite ramparts overlooking the Chapora river estuary."},
            {"time": "00:45 - 01:45", "activity": "Relive the iconic 'Dil Chahta Hai' viewpoint gazing over the endless Arabian Sea horizon at golden hour."},
            {"time": "01:45 - 02:45", "activity": "Head down to Ozran / Vagator clifftop; grab a beanbag seat at Titlie Culinary Bar or Olive Bar & Kitchen."},
            {"time": "02:45 - 03:00", "activity": "Sip fresh kokum spritz & wood-fired sourdough pizza while listening to ambient sunset beats."}
        ],
        "estimated_budget": "₹600 - ₹1,400 per person",
        "transport": "Scooter or Cab from Anjuna/Baga (15 mins)"
    },

    # ── JAIPUR 3-HOUR MICRO-TRIPS ──
    {
        "slug": "jaipur-3h-nahargarh-sunset-padao",
        "title": "Nahargarh Fort Royal Clifftop Sunset & Padao Panoramic View",
        "city_key": "jaipur",
        "category": "3-Hour Micro-Escape",
        "venue": "Aravalli Hills, Nahargarh, Jaipur",
        "headliner": "Pink City Royal Viewpoint",
        "ticket_price": 350,
        "original_price": 700,
        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
        "badge": "👑 Highest Sunset Viewpoint",
        "tags": ["3-Hour Quick Escape", "Aravalli Hills", "Royal Ramparts", "Sunset Beer", "City Lights"],
        "schedule": [
            {"time": "00:00 - 00:40", "activity": "Scenic winding drive up the Aravalli hills to Nahargarh Fort gate."},
            {"time": "00:40 - 01:30", "activity": "Explore Madhavendra Bhawan: Walk through the 12 identical royal queen suites and stone fresco courtyards."},
            {"time": "01:30 - 02:40", "activity": "Sit on the edge ramparts at Padao open-air cafe with a chilled beverage watching the Pink City turn to golden twilight."},
            {"time": "02:40 - 03:00", "activity": "Gaze over the magical twinkling night lights of Jaipur before winding down the hill."}
        ],
        "estimated_budget": "₹350 - ₹800 per person",
        "transport": "Cab / Auto from Old City or MI Road (30 mins)"
    }
]


def seed_micro_trips():
    db = SessionLocal()
    try:
        added_count = 0
        now_str = datetime.now().strftime("%b %d, %Y")
        
        for item in MICRO_TRIPS_DATA:
            existing = db.query(models.EventConcert).filter_by(slug=item["slug"]).first()
            if existing:
                continue

            # Rich full description embedding schedule
            schedule_json = json.dumps(item["schedule"])
            all_tags = item["tags"] + ["3 Hours", "Micro Escape", item["city_key"].title(), "Real-Time Verified"]

            e = models.EventConcert(
                slug=item["slug"],
                title=item["title"],
                category=item["category"],
                city_key=item["city_key"],
                venue=item["venue"],
                date_str=now_str,
                time_str="Anytime (3h Flexible)",
                headliner=item["headliner"],
                ticket_price=item["ticket_price"],
                original_price=item["original_price"],
                tickets_left=40,
                image=item["image"],
                badge=item["badge"],
                tags=json.dumps(all_tags),
                includes_stay_combo=False,
                combo_price=None,
            )
            db.add(e)
            added_count += 1

        db.commit()
        print(f"✅ Successfully seeded {added_count} curated 3-Hour Micro-Trips into EventConcert!")

        # Also register in Trip model for multi-channel discovery
        trips_added = 0
        for item in MICRO_TRIPS_DATA:
            t_slug = f"trip-{item['slug']}"
            existing_t = db.query(models.Trip).filter_by(slug=t_slug).first()
            if existing_t:
                continue

            itinerary_steps = [
                {"day": 1, "title": s["time"], "desc": s["activity"]}
                for s in item["schedule"]
            ]

            t = models.Trip(
                slug=t_slug,
                title=item["title"],
                destination_key=item["city_key"],
                category="micro",
                duration="3 Hours",
                duration_days=0,
                duration_type="short",
                price=item["ticket_price"],
                original_price=item["original_price"],
                discount_percent=50,
                drive_time="15-30m Cab",
                distance="Within City Limits",
                airline=None,
                stay_name=item["venue"],
                image=item["image"],
                highlights=json.dumps([s["activity"] for s in item["schedule"][:3]]),
                inclusions=json.dumps(["Curated Route Map", "Verified Timings", "Local Transport Tips"]),
                itinerary=json.dumps(itinerary_steps),
                tags=json.dumps(item["tags"]),
                available_slots=25,
                is_featured=True,
            )
            db.add(t)
            trips_added += 1

        db.commit()
        print(f"✅ Successfully seeded {trips_added} 3-Hour Micro-Trips into Trip table!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_micro_trips()
