import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'orbit.db');

// Global singleton to prevent multiple connections during dev hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var _orbitDb: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (process.env.NODE_ENV === 'production') {
    return initDatabase(new Database(dbPath));
  }
  if (!global._orbitDb) {
    global._orbitDb = initDatabase(new Database(dbPath));
  }
  return global._orbitDb;
}

function initDatabase(db: Database.Database): Database.Database {
  // WAL mode for fast concurrent reads and writes
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      tagline TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      badge TEXT,
      banner_img TEXT,
      weather_temp TEXT,
      weather_condition TEXT
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      destination_key TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      duration_type TEXT NOT NULL, -- 'short' or 'long'
      price INTEGER NOT NULL,
      original_price INTEGER NOT NULL,
      discount_percent INTEGER NOT NULL,
      drive_time TEXT,
      distance TEXT,
      airline TEXT,
      stay_name TEXT NOT NULL,
      image TEXT NOT NULL,
      highlights TEXT NOT NULL, -- JSON array
      inclusions TEXT NOT NULL, -- JSON array
      itinerary TEXT NOT NULL, -- JSON array of {day, title, desc}
      tags TEXT NOT NULL, -- JSON array
      available_slots INTEGER DEFAULT 10,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (destination_key) REFERENCES destinations(key)
    );

    CREATE TABLE IF NOT EXISTS distressed_flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flight_num TEXT NOT NULL,
      airline TEXT NOT NULL,
      origin TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      dest TEXT NOT NULL,
      dest_code TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      original_price INTEGER NOT NULL,
      distressed_price INTEGER NOT NULL,
      discount_percent INTEGER NOT NULL,
      seats_remaining INTEGER NOT NULL,
      baggage TEXT NOT NULL,
      tags TEXT NOT NULL -- JSON array
    );

    CREATE TABLE IF NOT EXISTS visas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_key TEXT UNIQUE NOT NULL,
      country_name TEXT NOT NULL,
      flag TEXT NOT NULL,
      processing_hours INTEGER NOT NULL,
      platform_fee INTEGER DEFAULT 499,
      govt_fee INTEGER NOT NULL,
      total_fee INTEGER NOT NULL,
      success_rate REAL DEFAULT 99.4,
      express_available INTEGER DEFAULT 1,
      requirements TEXT NOT NULL -- JSON array
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE NOT NULL,
      trip_slug TEXT,
      trip_title TEXT NOT NULL,
      destination_key TEXT NOT NULL,
      travel_date TEXT NOT NULL,
      travelers_count INTEGER NOT NULL DEFAULT 1,
      total_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL, -- 'UPI_INSTANT', 'CREDIT_CARD', 'GST_INVOICE'
      status TEXT NOT NULL DEFAULT 'CONFIRMED',
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT NOT NULL,
      gstin TEXT,
      company_name TEXT,
      itc_eligible INTEGER DEFAULT 0,
      itc_amount INTEGER DEFAULT 0,
      qr_token TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT,
      vibe TEXT,
      group_type TEXT,
      budget TEXT,
      step INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL, -- 'ai' or 'user'
      text TEXT NOT NULL,
      trip_card_json TEXT, -- Optional JSON
      prompt_suggestions_json TEXT, -- Optional JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS callback_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      name TEXT,
      destination_interest TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_trips_duration_type ON trips(duration_type);
    CREATE INDEX IF NOT EXISTS idx_trips_destination_key ON trips(destination_key);
    CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
  `);

  // Seed data if empty
  seedDatabaseIfEmpty(db);

  return db;
}

function seedDatabaseIfEmpty(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM destinations').get() as { count: number };
  if (count.count > 0) return;

  const insertDest = db.prepare(`
    INSERT INTO destinations (key, name, country, tagline, lat, lng, badge, banner_img, weather_temp, weather_condition)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const destinations = [
    ['delhi', 'Delhi NCR Hub', 'India', 'Capital Departure Hub with Fast-Track Expressways', 28.6139, 77.2090, 'Hub 01', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80', '26°C', 'Pleasant'],
    ['rishikesh', 'Rishikesh Valley', 'India', 'Ganga White Water & High-Altitude Glamping', 30.0869, 78.2676, '<3h Drive', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80', '22°C', 'Misty Fresh'],
    ['jaipur', 'Jaipur Heritage', 'India', 'Royal Havelis & Amber Fort Sunset Trail', 26.9124, 75.7873, '3h 30m Express', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80', '28°C', 'Sunny'],
    ['goa', 'Goa Coastline', 'India', 'Direct IndiGo drops & Sunset Beachfront Villas', 15.2993, 74.1240, 'Direct Flight', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80', '31°C', 'Tropical Sun'],
    ['thailand', 'Thailand Islands', 'Thailand', 'Flat ₹499 Visa Cap & 24h Approval Guarantee', 13.7563, 100.5018, 'Flat ₹499 Visa', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80', '32°C', 'Warm Breeze'],
    ['dubai', 'Dubai Skyline', 'UAE', 'Instant 24h eVisa & Desert Safari Overnights', 25.2048, 55.2708, 'Instant 24h', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80', '29°C', 'Clear Sky'],
    ['bali', 'Bali Seminyak', 'Indonesia', 'Private Pool Forest Villas & Cliff Sunsets', -8.4095, 115.1889, 'Visa on Arrival', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80', '29°C', 'Balmy Tropical'],
    ['kashmir', 'Kashmir Valleys', 'India', 'Dal Lake Houseboats & Gulmarg Gondola Skiing', 34.0837, 74.7973, 'Direct Flight', 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80', '14°C', 'Crisp Mountain Air'],
    ['corbett', 'Jim Corbett', 'India', 'Dense Sal Forest Lodges & Royal Bengal Tiger Safari', 29.5300, 78.7747, '4h Drive', 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop&q=80', '24°C', 'Forest Breeze'],
  ];

  for (const d of destinations) {
    insertDest.run(...d);
  }

  // Seed Trips
  const insertTrip = db.prepare(`
    INSERT INTO trips (
      slug, title, destination_key, category, duration, duration_days, duration_type,
      price, original_price, discount_percent, drive_time, distance, airline,
      stay_name, image, highlights, inclusions, itinerary, tags, available_slots, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const trips = [
    // SHORT TRIPS (<= 3 Days)
    [
      'rishikesh-riverfront-glamping',
      'Rishikesh Riverfront Glamping & 16km Rafting',
      'rishikesh',
      'weekend',
      '2 Days / 1 Night',
      2,
      'short',
      3499,
      5999,
      41,
      '2h 45m drive via Meerut Expressway',
      '240 km from Delhi NCR',
      'Scenic Self-Drive / Vande Bharat (Haridwar)',
      'Luxury Swiss Air-Cooled River Tents',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['16km Grade-3 Ganga Rafting', 'Cliff jump into emerald waters', 'Evening acoustic campfire & live BBQ buffet', 'Riverside sunrise yoga session']),
      JSON.stringify(['AC Swiss Tent Stay', 'All 3 Buffet Meals', '16km Rafting + Life Jackets', 'Bonfire Snacks']),
      JSON.stringify([
        { day: 'Day 1 (Saturday)', title: 'Express Drive, Check-in & Rafting', desc: 'Scenic morning drive, camp check-in, thrilling 16km rafting down Ganga rapids, evening acoustic campfire with snacks.' },
        { day: 'Day 2 (Sunday)', title: 'Sunrise Yoga, Cliff Jump & Return', desc: 'Peaceful sunrise yoga by the riverbed, optional cliff jump, Parmarth Niketan Ganga Aarti visit, return drive to Delhi.' },
      ]),
      JSON.stringify(['Rafting', 'Glamping', 'Expressway', 'Top Weekend']),
      14,
      1
    ],
    [
      'jaipur-heritage-haveli-amber-fort',
      'Jaipur Royal Haveli & Sunset Amber Fort Trail',
      'jaipur',
      'weekend',
      '3 Days / 2 Nights',
      3,
      'short',
      4299,
      7499,
      42,
      '3h 30m via Delhi-Mumbai Expressway',
      '270 km from Delhi NCR',
      'Expressway Highway / Vande Bharat (Jaipur)',
      '4-Star Heritage Haveli Courtyard with Pool',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['Private heritage courtyard stay', 'Sunset watch from Nahargarh fort ridge', 'Guided culinary trail in Johari Bazaar', 'Rooftop pool & puppet show dinner']),
      JSON.stringify(['Heritage Hotel Stay', 'Daily Royal Breakfast', 'Fort Sightseeing Pass', 'Local Food Voucher']),
      JSON.stringify([
        { day: 'Day 1', title: 'Arrival via Expressway & Hawa Mahal', desc: 'Cruise down Delhi-Mumbai expressway, check into royal haveli, sunset stroll around Hawa Mahal and City Palace.' },
        { day: 'Day 2', title: 'Amber Fort & Nahargarh Sunset', desc: 'Morning exploration of majestic Amber Fort, Rajasthani thali lunch, evening sunset cocktail at Nahargarh fort.' },
        { day: 'Day 3', title: 'Bazaars & Smooth Return', desc: 'Johari Bazaar shopping for handicrafts and blue pottery, hearty lunch, smooth expressway return to Delhi.' },
      ]),
      JSON.stringify(['Heritage', 'Royal Haveli', 'Expressway', 'Culture']),
      9,
      1
    ],
    [
      'jim-corbett-sal-jungle-safari',
      'Jim Corbett Dense Forest Lodge & Jeep Tiger Safari',
      'corbett',
      'weekend',
      '3 Days / 2 Nights',
      3,
      'short',
      5999,
      9500,
      37,
      '4h 15m scenic road route',
      '255 km from Delhi NCR',
      'Private AC Sedan / Self-Drive',
      'Riverside Kosi Forest Lodge',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['Exclusive 4x4 open Gypsy morning tiger safari', 'Kosi riverbed bonfire & stargazing', 'Naturalist guided birdwatching trek', 'Swimming pool amid deep mango orchards']),
      JSON.stringify(['Forest Resort Stay', 'Jeep Safari Permits Included', 'Buffet Breakfast & Dinner', 'Naturalist Guide']),
      JSON.stringify([
        { day: 'Day 1', title: 'Drive to Foothills & Kosi Stroll', desc: 'Morning scenic drive into the Himalayan foothills, forest lodge check-in, evening stroll along rocky Kosi river.' },
        { day: 'Day 2', title: '4x4 Open Jeep Safari & Tiger Trails', desc: 'Early morning safari inside Corbett national park with experienced tracker, afternoon relaxation by the pool, night campfire.' },
        { day: 'Day 3', title: 'Sunrise Trek & Return Drive', desc: 'Gentle morning nature walk, heavy brunch, relaxed return drive back to Delhi NCR.' },
      ]),
      JSON.stringify(['Wildlife', 'Tiger Safari', 'Forest Lodge', 'Adventure']),
      6,
      1
    ],

    // LONG TRIPS (>= 4 Days)
    [
      'goa-coastal-villa-beach-club',
      'Goa Coastal Villa & Beach Club Escape',
      'goa',
      'flights',
      '4 Days / 3 Nights',
      4,
      'long',
      13499,
      18500,
      27,
      '2h 20m direct flight (IndiGo)',
      '1,850 km flight corridor',
      'IndiGo Direct Non-Stop (DEL ➔ GOI)',
      'Candolim 3BHK Sunset Private Pool Villa',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['IndiGo direct non-stop flights included', '3BHK private pool villa with chef & gazebo', '2 Activa scooters included for beach hopping', 'Thalassa & Curlies sunset VIP entry pass']),
      JSON.stringify(['Return Direct Flights', 'Private Pool Villa Stay', '2 Scooters for 4 Days', 'Daily Villa Breakfast', 'Airport Cab Transfers']),
      JSON.stringify([
        { day: 'Day 1', title: 'Touchdown MOPA & Villa Pool Party', desc: 'IndiGo direct morning flight, private cab pickup to Candolim villa, evening sundowner BBQ party by your private pool.' },
        { day: 'Day 2', title: 'Scooter Beach Hopping & Thalassa', desc: 'Ride through coconut palm avenues of Anjuna, lunch at beachfront shacks, sunset dinner reservation at Thalassa Vagator.' },
        { day: 'Day 3', title: 'Old Goa Latin Quarter & Tito\'s Lane', desc: 'Explore historic Fontainhas colorful Portuguese alleys, river cruise, thrilling nightlife party on Tito\'s lane.' },
        { day: 'Day 4', title: 'Leisurely Brunch & Flight Back', desc: 'Lazy poolside breakfast, local souvenir shopping in Panaji, cab drop to airport for return flight.' },
      ]),
      JSON.stringify(['Flights Included', 'Private Pool', 'Beach Parties', 'Trending']),
      12,
      1
    ],
    [
      'thailand-phuket-krabi-island-hopper',
      'Thailand Phuket & Krabi Island Hopper (Flat ₹499 Visa)',
      'thailand',
      'visa',
      '5 Days / 4 Nights',
      5,
      'long',
      24999,
      34000,
      26,
      '4h 15m direct international flight',
      '3,800 km direct corridor',
      'Vistara / Thai Airways Direct',
      '4-Star Cliffside Andaman Sea Resort',
      'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['Flat ₹499 family visa cap guarantee included', 'Speedboat island hopping to Phi Phi & Maya Bay', 'Patong nightlife & Bangla road explorer', 'Complimentary 1GB international eSIM QR code']),
      JSON.stringify(['Return International Flights', '4-Star Resort Stay', 'Flat ₹499 Visa Processing', 'Speedboat Phi Phi Tour', 'Daily Buffet Breakfast', 'Free 1GB eSIM QR']),
      JSON.stringify([
        { day: 'Day 1', title: 'Phuket Arrival & Patong Sunset', desc: 'Landing in Phuket, fast-track visa immigration, scenic transfer to cliffside sea resort, evening chill on Patong beach.' },
        { day: 'Day 2', title: 'Phi Phi Islands & Maya Bay Speedboat', desc: 'Full-day catamaran speedboat excursion to Maya Bay, snorkeling among vibrant coral reefs, buffet lunch on Phi Phi Don.' },
        { day: 'Day 3', title: 'Krabi Railay Beach & Sea Caves', desc: 'Long-tail boat excursion to limestone towering karst cliffs of Railay beach and sacred Phra Nang cave beach.' },
        { day: 'Day 4', title: 'Old Phuket Town & Night Markets', desc: 'Sino-Portuguese heritage walking tour, night street food stalls with mango sticky rice and pad thai.' },
        { day: 'Day 5', title: 'Duty Free & Return Flight', desc: 'Morning spa treatment, duty-free shopping at airport, direct flight back home.' },
      ]),
      JSON.stringify(['International', 'Flat ₹499 Visa', 'Speedboat', 'Islands']),
      8,
      1
    ],
    [
      'dubai-luxury-desert-safari-skyline',
      'Dubai 48h Luxury Safari & Skyline Experience',
      'dubai',
      'visa',
      '4 Days / 3 Nights',
      4,
      'long',
      29999,
      41000,
      27,
      '3h 40m direct flight corridor',
      '2,200 km direct flight',
      'Emirates / Air India Express Direct',
      '5-Star Downtown Dubai Hotel with Burj Views',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['24-Hour Express UAE Visa with flat ₹499 cap', 'Red Dune 4x4 desert safari with BBQ dinner & show', 'Burj Khalifa 124th floor observation deck tickets', 'Dubai Marina luxury evening yacht cruise']),
      JSON.stringify(['Direct Flights Included', '5-Star Downtown Stay', '24h Visa Pre-check', 'Red Dune Desert Safari', 'Burj Khalifa Entry', 'Airport Luxury Transfers']),
      JSON.stringify([
        { day: 'Day 1', title: 'Dubai Touchdown & Marina Yacht Cruise', desc: 'Arrival at DXB terminal, private sedan drop to downtown hotel, evening sunset luxury yacht cruise along Dubai Marina.' },
        { day: 'Day 2', title: 'Burj Khalifa & Dubai Mall Fountains', desc: 'Elevate to 124th floor of Burj Khalifa, explore giant aquarium, spectacular choreographed fountain show.' },
        { day: 'Day 3', title: 'Red Dune 4x4 Safari & Bedouin Camp', desc: 'Afternoon dune bashing in Land Cruiser, sandboarding, camel rides, and sumptuous Bedouin BBQ with fire shows.' },
        { day: 'Day 4', title: 'Gold Souk Stroll & Departure', desc: 'Traditional Abra boat crossing to Deira Gold and Spice Souk, souvenir pickup, flight home.' },
      ]),
      JSON.stringify(['Dubai', 'Luxury', '24h Visa', 'Burj Khalifa']),
      10,
      1
    ],
    [
      'kashmir-dal-lake-houseboat-gulmarg',
      'Kashmir Dal Lake Royal Houseboat & Gulmarg Skiing',
      'kashmir',
      'flights',
      '5 Days / 4 Nights',
      5,
      'long',
      18999,
      26500,
      28,
      '1h 25m non-stop mountain flight',
      '810 km flight corridor',
      'IndiGo / SpiceJet Direct (DEL ➔ SXR)',
      'Cedar Wood Carved Houseboat on Nigeen Lake',
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop&q=80',
      JSON.stringify(['Handcrafted walnut & cedar luxury houseboat stay', 'Shikara sunset ride on serene Dal Lake', 'Gulmarg Phase 1 & 2 Gondola cable car ride tickets', 'Pahalgam Betaab valley scenic pine drive']),
      JSON.stringify(['Direct Flights (DEL ➔ SXR)', 'Houseboat & Luxury Hotel', 'Gulmarg Gondola Pass', 'Daily Kashmiri Breakfast & Dinner', 'Private Heated Cab']),
      JSON.stringify([
        { day: 'Day 1', title: 'Srinagar Arrival & Dal Lake Shikara', desc: 'Fly above snow-capped Pir Panjal mountains, check into traditional carved cedar houseboat, romantic sunset Shikara ride.' },
        { day: 'Day 2', title: 'Gulmarg Gondola High Altitude Ascent', desc: 'Drive to snowy Gulmarg, ride world\'s second highest Gondola cable car to Apharwat peak, snow activities.' },
        { day: 'Day 3', title: 'Pahalgam & Betaab Pine Valley', desc: 'Scenic drive along saffron fields of Pampore to Lidder river valley, pony rides through pristine Betaab valley pine woods.' },
        { day: 'Day 4', title: 'Mughal Gardens & Old Bazaar Kahwa', desc: 'Visit Shalimar & Nishat royal Mughal gardens, sip steaming saffron Kahwa with walnut biscuits in old Lal Chowk.' },
        { day: 'Day 5', title: 'Floating Flower Market & Departure', desc: 'Early morning floating market Shikara tour, souvenir shopping for Pashmina & dry fruits, departure flight.' },
      ]),
      JSON.stringify(['Snow & Mountains', 'Houseboat', 'Gondola', 'Romantic']),
      7,
      1
    ]
  ];

  for (const t of trips) {
    insertTrip.run(...t);
  }

  // Seed Distressed Flights
  const insertFlight = db.prepare(`
    INSERT INTO distressed_flights (
      flight_num, airline, origin, origin_code, dest, dest_code,
      departure_time, arrival_time, original_price, distressed_price, discount_percent,
      seats_remaining, baggage, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const flights = [
    ['6E-2041', 'IndiGo', 'Delhi (DEL)', 'DEL', 'Goa MOPA (GOX)', 'GOX', '06:15 AM', '08:45 AM', 7200, 2899, 60, 3, '15kg + 7kg cabin', JSON.stringify(['Flash Drop', 'Direct', 'Lowest in 30 Days'])],
    ['AI-915', 'Air India', 'Delhi (DEL)', 'DEL', 'Dubai (DXB)', 'DXB', '08:40 AM', '11:15 AM', 18000, 8499, 53, 5, '25kg check-in + Meal', JSON.stringify(['Hot Deal', 'Direct', 'Free Meal'])],
    ['QP-1302', 'Akasa Air', 'Mumbai (BOM)', 'BOM', 'Bangalore (BLR)', 'BLR', '07:00 AM', '08:35 AM', 4800, 1999, 58, 4, '15kg check-in', JSON.stringify(['Weekend Deal', 'Non-Stop'])],
    ['SG-8124', 'SpiceJet', 'Delhi (DEL)', 'DEL', 'Srinagar (SXR)', 'SXR', '09:20 AM', '10:50 AM', 8100, 3299, 59, 2, '15kg check-in', JSON.stringify(['Mountain Flash', 'Direct'])],
    ['UK-121', 'Vistara', 'Delhi (DEL)', 'DEL', 'Bangkok (BKK)', 'BKK', '01:30 PM', '07:15 PM', 22000, 9999, 55, 6, '30kg + Hot Meal', JSON.stringify(['Flat ₹499 Visa Cap Eligible', 'Full Service'])],
  ];

  for (const f of flights) {
    insertFlight.run(...f);
  }

  // Seed Visas
  const insertVisa = db.prepare(`
    INSERT INTO visas (
      country_key, country_name, flag, processing_hours, platform_fee, govt_fee,
      total_fee, success_rate, express_available, requirements
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const visas = [
    ['thailand', 'Thailand Tourist eVisa', '🇹🇭', 24, 499, 0, 499, 99.8, 1, JSON.stringify(['Passport front & back scan', 'Passport size photo with white bg', 'Confirmed return flight tickets'])],
    ['dubai', 'Dubai / UAE 30-Day Express eVisa', '🇦🇪', 24, 499, 6500, 6999, 99.4, 1, JSON.stringify(['Passport bio page scan (6m validity)', 'PAN Card copy of primary traveler', 'White background passport photo'])],
    ['vietnam', 'Vietnam 30-Day Multi-Entry eVisa', '🇻🇳', 48, 499, 2100, 2599, 99.2, 1, JSON.stringify(['Passport clear scan', 'Portrait photo 4x6cm', 'Entry & Exit airport selection'])],
    ['bali', 'Indonesia / Bali 30-Day e-VOA', '🇮🇩', 2, 499, 2700, 3199, 99.9, 1, JSON.stringify(['Passport scan', 'Hotel confirmation voucher'])],
    ['singapore', 'Singapore Entry eVisa', '🇸🇬', 72, 499, 2200, 2699, 98.7, 0, JSON.stringify(['Passport copy', 'Form 14A filled', 'Flight & hotel itinerary', 'Last 6 months bank statement'])],
  ];

  for (const v of visas) {
    insertVisa.run(...v);
  }

  // Seed sample initial bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      booking_id, trip_slug, trip_title, destination_key, travel_date, travelers_count,
      total_amount, payment_method, status, user_name, user_email, user_phone,
      gstin, company_name, itc_eligible, itc_amount, qr_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleBookings = [
    [
      'ORB-2026-X992',
      'rishikesh-riverfront-glamping',
      'Rishikesh Riverfront Glamping & 16km Rafting',
      'rishikesh',
      '2026-11-01',
      2,
      6998,
      'UPI_INSTANT',
      'CONFIRMED',
      'Rahul Sharma',
      'rahul.sharma@travel.in',
      '+91 98765 43210',
      '07AAAAA0000A1Z5',
      'Sharma Tech Enterprises',
      1,
      1260,
      'QR_TOKEN_RISHIKESH_992'
    ],
    [
      'ORB-2026-X481',
      'goa-coastal-villa-beach-club',
      'Goa Coastal Villa & Beach Club Escape',
      'goa',
      '2026-11-14',
      4,
      53996,
      'UPI_INSTANT',
      'CONFIRMED',
      'Priya Mehta',
      'priya.mehta@orbit.ai',
      '+91 98111 22334',
      '27AABCM8821B1ZM',
      'Mehta Creative Studios',
      1,
      9719,
      'QR_TOKEN_GOA_481'
    ]
  ];

  for (const b of sampleBookings) {
    insertBooking.run(...b);
  }
}

export const db = getDatabase();
