'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Flame, 
  Check, 
  Plane, 
  Home, 
  Search, 
  Music, 
  Ticket, 
  Filter, 
  ShieldCheck,
  Coffee,
  Utensils,
  GlassWater,
  Compass,
  Star,
  Users,
  Sun,
  Moon,
  Sunset,
  X,
  CheckCircle2,
  ExternalLink,
  Share2,
  PhoneCall
} from 'lucide-react';

export interface CityPulseItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'cafe' | 'restaurant' | 'rooftop' | 'concert' | 'beachclub' | 'cultural';
  categoryBadge: string;
  categoryBadgeColor: string;
  cityKey: string;
  cityName: string;
  locality: string;
  distance: string;
  timeSlot: 'now' | 'morning' | 'afternoon' | 'sunset' | 'night' | 'weekend';
  timeStatus: string;
  timings: string;
  highlight: string;
  priceTag: string;
  priceNumber: number;
  originalPriceTag?: string;
  image: string;
  rating: string;
  reviewsCount: string;
  tags: string[];
  includesCombo?: boolean;
  comboPrice?: number;
  details: {
    vibe: string;
    signatureMustTry: string[];
    address: string;
    bestTimeToVisit: string;
  };
}

export const EVERGREEN_CITY_PULSE_ITEMS: CityPulseItem[] = [
  // ── 1. DELHI NCR ──
  {
    id: 'del-cafe-colocal',
    title: 'Colocal The Cacao Artisans & Bakehouse',
    subtitle: 'European white courtyard with live artisanal bean-to-bar chocolate roasting',
    category: 'cafe',
    categoryBadge: 'ARTISAN CAFE',
    categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cityKey: 'delhi',
    cityName: 'Delhi NCR',
    locality: 'The Dhan Mill, Chhatarpur',
    distance: '15m from Gurgaon / South Delhi',
    timeSlot: 'now',
    timeStatus: '🟢 Happening Now · Open till 11:30 PM',
    timings: 'Daily 09:00 AM - 11:30 PM',
    highlight: 'Must-Order: Campfire Hot Chocolate with torched marshmallow & sourdough burrata pizza',
    priceTag: '₹1,200 for two',
    priceNumber: 1200,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '2,140',
    tags: ['Pet Friendly', 'Live Chocolate Roaster', 'Outdoor Garden', 'Free Wi-Fi'],
    details: {
      vibe: 'Sunlit Pondicherry-style yellow colonial courtyard with lush greenery, fairy lights and live specialty coffee bar.',
      signatureMustTry: ['Campfire Hot Chocolate (64% Single Origin)', 'Smoked Mushroom & Truffle Sourdough', 'Handcrafted Cocoa Nibs Cold Brew'],
      address: 'Shed 21, The Dhan Mill Compound, 100ft Road, Chhatarpur, New Delhi 110074',
      bestTimeToVisit: 'Evenings 5:30 PM for golden hour lighting and live garden music.'
    }
  },
  {
    id: 'del-rooftop-botai',
    title: 'Bo-Tai & Dear Donna Rooftop',
    subtitle: 'Sweeping panoramic open-air deck overlooking illuminated 12th-century Qutub Minar',
    category: 'rooftop',
    categoryBadge: 'ROOFTOP BAR',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cityKey: 'delhi',
    cityName: 'Delhi NCR',
    locality: 'Qutub Complex, Mehrauli',
    distance: 'Scenic Heritage Corridor',
    timeSlot: 'sunset',
    timeStatus: '🌇 Golden Hour Active · Resident DJ Set',
    timings: '12:30 PM - 01:00 AM',
    highlight: 'Must-Order: Bangkok Night market cocktails & Crispy lotus root with truffle dip',
    priceTag: '₹2,500 for two',
    priceNumber: 2500,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.8',
    reviewsCount: '3,890',
    tags: ['Qutub Minar View', 'Cocktail Speakeasy', 'Live House DJ', 'Valet Parking'],
    details: {
      vibe: 'Glamorous rooftop with unobstructed eye-level views of the glowing Qutub Minar, bespoke mixology and high-energy house beats.',
      signatureMustTry: ['Macau Smoked Negroni', 'Truffle Edamame Dimsums', 'Slow Cooked Lamb Rendang'],
      address: '6/4 Kalka Das Marg, Mehrauli, New Delhi 110030 (Next to Qutub Minar)',
      bestTimeToVisit: 'Sunset 6:00 PM to watch the monument floodlights turn on.'
    }
  },
  {
    id: 'del-concert-diljit',
    title: 'Diljit Dosanjh: Dil-Luminati Tour India Stadium Edition',
    subtitle: 'Historic 50,000-fan stadium concert with immersive multi-tier LED production',
    category: 'concert',
    categoryBadge: 'STADIUM CONCERT',
    categoryBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    cityKey: 'delhi',
    cityName: 'Delhi NCR',
    locality: 'Jawaharlal Nehru Stadium',
    distance: 'Gate 2 Metro Direct Entry',
    timeSlot: 'night',
    timeStatus: '⚡ Tonight 08:00 PM · VIP Gates Open',
    timings: 'Tonight 08:00 PM - 11:30 PM',
    highlight: 'Headline Act: Diljit Dosanjh live with 30-piece international brass orchestra',
    priceTag: '₹5,648 VIP Pass',
    priceNumber: 5648,
    originalPriceTag: '₹14,000',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    rating: '★ 5.0',
    reviewsCount: '8,400',
    tags: ['Stage Access', 'VIP Lounge', 'Fast-Track Lane', 'Flight Combo Available'],
    includesCombo: true,
    comboPrice: 18925,
    details: {
      vibe: 'Electrifying stadium atmosphere with fire cannons, synchronized LED wristbands and Diljit singing his record-breaking global hits.',
      signatureMustTry: ['VIP Fanpit access right in front of the center ramp', 'Official Dil-Luminati merchandise zone', 'Dedicated express security gate'],
      address: 'Jawaharlal Nehru Stadium, Pragati Vihar, New Delhi 110003',
      bestTimeToVisit: 'Arrive by 6:30 PM to bypass highway traffic and claim front standing spots.'
    }
  },
  {
    id: 'del-food-old-delhi',
    title: 'Old Delhi Midnight Culinary & Heritage Trail',
    subtitle: 'Guided twilight food walk through secret 17th-century Shahjahanabad alleys',
    category: 'cultural',
    categoryBadge: 'FOOD TRAIL',
    categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    cityKey: 'delhi',
    cityName: 'Delhi NCR',
    locality: 'Chandni Chowk & Jama Masjid',
    distance: 'Old Delhi Heritage Zone',
    timeSlot: 'night',
    timeStatus: '🟢 Active Tonight till 01:30 AM',
    timings: 'Daily 07:00 PM - 01:30 AM',
    highlight: 'Must-Try: Butter-soaked Aslam chicken, hot jalebis at Dariba Kalan & Daulat ki Chaat',
    priceTag: '₹950 per head',
    priceNumber: 950,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '1,890',
    tags: ['Secret Haveli Access', 'Rickshaw Safari', 'Certified Historian', 'Vegetarian Friendly'],
    details: {
      vibe: 'Nocturnal sensory adventure through candlelit spice bazaars, aroma of burning charcoal kebabs and views of illuminated Jama Masjid domes.',
      signatureMustTry: ['Aslam Butter Chicken & Roomali Roti', 'Old Famous Jalebi Wala (Fried in Pure Desi Ghee)', 'Winter Special Foam Milk Daulat ki Chaat'],
      address: 'Gathering Point: Gate 3, Jama Masjid Metro Station, Old Delhi 110006',
      bestTimeToVisit: '9:00 PM for peak night market buzz and shorter rickshaw queues.'
    }
  },

  // ── 2. MUMBAI ──
  {
    id: 'bom-cafe-subko',
    title: 'Subko Coffee Roasters & Craft Bakehouse',
    subtitle: 'Third-wave Indian specialty coffee in a 90-year-old restored Bandra Portuguese cottage',
    category: 'cafe',
    categoryBadge: 'SPECIALTY COFFEE',
    categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cityKey: 'mumbai',
    cityName: 'Mumbai',
    locality: 'Ranwar Village, Bandra West',
    distance: 'Heart of Bandra Art District',
    timeSlot: 'morning',
    timeStatus: '🌅 Fresh Batch Baking Now · Open 07:30 AM',
    timings: 'Daily 07:30 AM - 10:00 PM',
    highlight: 'Must-Order: Twice-baked almond croissant, Podi sourdough toast & Lot M specialty pour-over',
    priceTag: '₹850 for two',
    priceNumber: 850,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '4,120',
    tags: ['Single-Origin Beans', 'Bakehouse', 'Bandra Street Art', 'Laptop Friendly'],
    details: {
      vibe: 'Aromatic vintage wooden roastery hidden in narrow cobblestone lanes of Ranwar, with artisanal pastries made from indigenous grains.',
      signatureMustTry: ['Subko Lavender Cold Brew Tonic', 'Cardamom & Jaggery Babka Bun', 'Smoked Gunpowder Sourdough'],
      address: '21A Chapel Road, Ranwar, Bandra West, Mumbai 400050',
      bestTimeToVisit: '8:30 AM for warm-out-of-the-oven morning pastry bakes.'
    }
  },
  {
    id: 'bom-rooftop-aer',
    title: 'Aer Rooftop Bar & Arabian Sea Sunset Deck',
    subtitle: '34th-floor open-sky lounge perched over the Mumbai shoreline and Worli Sea Link',
    category: 'rooftop',
    categoryBadge: 'SKY LOUNGE',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cityKey: 'mumbai',
    cityName: 'Mumbai',
    locality: 'Four Seasons, Worli',
    distance: '5 mins from Bandra-Worli Sea Link',
    timeSlot: 'sunset',
    timeStatus: '🌇 Golden Hour Deck Active · Ocean Sunset',
    timings: '05:00 PM - 01:30 AM',
    highlight: 'Must-Order: Sea-salt washed botanical Martinis & sunset oyster platters with deep house',
    priceTag: '₹3,500 for two',
    priceNumber: 3500,
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '5,300',
    tags: ['Sea Link View', 'Retractable Glass Roof', 'DJ Sundowner', 'Luxury Valet'],
    details: {
      vibe: 'Nautical superyacht inspired deck with sea-breeze, panoramic horizon sunsets over the Arabian Sea, and world-class craft mixology.',
      signatureMustTry: ['Bombay Sapphire & Marine Botanical Highball', 'Charcoal Grilled Robata Skewers', 'Truffle Truffle Sushi Rolls'],
      address: '1/136, Dr E Moses Rd, Gandhi Nagar, Upper Worli, Mumbai 400018',
      bestTimeToVisit: '5:15 PM to grab the west-facing sea-view circular lounge seats.'
    }
  },
  {
    id: 'bom-concert-coldplay',
    title: 'Coldplay: Music of the Spheres World Tour (Mumbai)',
    subtitle: 'The iconic international stadium spectacle with solar-powered kinetic dancefloors',
    category: 'concert',
    categoryBadge: 'MEGA CONCERT',
    categoryBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    cityKey: 'mumbai',
    cityName: 'Mumbai',
    locality: 'DY Patil Sports Stadium',
    distance: 'Navi Mumbai Highway',
    timeSlot: 'night',
    timeStatus: '⚡ Sold Out Everywhere · Exclusive Passes Here',
    timings: 'Doors Open 04:30 PM · Concert 07:30 PM',
    highlight: 'Headline Act: Chris Martin & Coldplay performing Yellow, Fix You & Viva La Vida',
    priceTag: '₹6,499 VIP Floor',
    priceNumber: 6499,
    originalPriceTag: '₹18,500',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=80',
    rating: '★ 5.0',
    reviewsCount: '12,900',
    tags: ['Kinetic Floor', 'Biodegradable Confetti', 'Official Wristbands', 'Flight Combo'],
    includesCombo: true,
    comboPrice: 22400,
    details: {
      vibe: 'A once-in-a-lifetime euphoric explosion of glowing LED wristbands, fireworks, and 60,000 voices singing in unison under the Mumbai night sky.',
      signatureMustTry: ['Front General Admission Standing Pass', 'Eco-friendly rechargeable wristband station', 'Express entry Gate 4'],
      address: 'DY Patil Stadium, Sector 7, Nerul, Navi Mumbai 400706',
      bestTimeToVisit: 'Arrive at 4:30 PM to catch the opening support artists and collect wristbands.'
    }
  },

  // ── 3. GOA ──
  {
    id: 'goa-club-thalassa',
    title: 'Thalassa Greek Taverna & Sunset Ampitheatre',
    subtitle: 'Iconic clifftop open-air Greek dining with Zorba dance and sunset river panoramas',
    category: 'beachclub',
    categoryBadge: 'SUNDOWNER LOUNGE',
    categoryBadgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    cityKey: 'goa',
    cityName: 'Goa',
    locality: 'Vaddy, Siolim Riverfront',
    distance: '10m from Chapora / Vagator',
    timeSlot: 'sunset',
    timeStatus: '🟢 Happening Now · Sunset Sirtaki Fire Show',
    timings: 'Daily 09:00 AM - 01:00 AM',
    highlight: 'Must-Order: Grilled spicy tiger prawns, Saganaki flaming cheese & Thalassa Martinis',
    priceTag: '₹2,200 for two',
    priceNumber: 2200,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.8',
    reviewsCount: '8,900',
    tags: ['Greek Fire Dance', 'Riverfront Sunset', 'Cocktail Lounge', 'Waterfront Deck'],
    details: {
      vibe: 'White cane cabanas swaying in coastal coconut palms, Greek plate smashing traditions, and golden rays reflecting over the tranquil backwaters.',
      signatureMustTry: ['Flaming Saganaki with Lemon & Oregano', 'Slow-Roasted Souvlaki Wrap', 'Greek Watermelon Feta Salad'],
      address: 'Plot No. 301, 1, Vaddy, Siolim, Goa 403517',
      bestTimeToVisit: '5:00 PM table booking is mandatory for the world-famous sunset deck.'
    }
  },
  {
    id: 'goa-cafe-babka',
    title: 'Babka Goa & Artisan Bakery',
    subtitle: 'Secret jungle garden bakery serving hot chocolate babkas and cold brews in Assagao',
    category: 'cafe',
    categoryBadge: 'JUNGLE BAKEHOUSE',
    categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cityKey: 'goa',
    cityName: 'Goa',
    locality: 'Badem, Assagao',
    distance: 'North Goa Culinary Belt',
    timeSlot: 'morning',
    timeStatus: '🌅 Fresh Batch Active · Morning Chill',
    timings: 'Daily 08:30 AM - 09:00 PM',
    highlight: 'Must-Order: Cardamom Pistachio Babka, Avocado Tartine & Tonic Espresso',
    priceTag: '₹750 for two',
    priceNumber: 750,
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '2,900',
    tags: ['Goan Heritage Garden', 'Artisanal Breads', 'Specialty Coffee', 'Pet Friendly'],
    details: {
      vibe: 'Bohemian open-air garden surrounded by leafy banana trees, retro vinyl music, and the smell of hot cinnamon babkas baking in the stone oven.',
      signatureMustTry: ['Dark Chocolate Swirl Babka', 'Cream Cheese & Smoked Salmon Bagel', 'Goan Cashew Nut Milk Latte'],
      address: 'House No. 528, Badem, Assagao, Goa 403507',
      bestTimeToVisit: '9:00 AM for fresh morning bread batches before they sell out.'
    }
  },
  {
    id: 'goa-festival-sunburn',
    title: 'Sunburn Goa 2026: The Enchanted Forest Stage',
    subtitle: 'Asia’s premier multi-stage electronic dance music festival on the Vagator cliffs',
    category: 'concert',
    categoryBadge: 'MUSIC FESTIVAL',
    categoryBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    cityKey: 'goa',
    cityName: 'Goa',
    locality: 'Vagator Hilltop Arena',
    distance: 'Walking distance from Ozran Beach',
    timeSlot: 'night',
    timeStatus: '⚡ Live Tonight · 4 Stages Activated',
    timings: '03:00 PM - 03:00 AM',
    highlight: 'Headliners: Martin Garrix, Anyma & Charlotte de Witte with 3D projection mapping',
    priceTag: '₹3,999 Festival Pass',
    priceNumber: 3999,
    originalPriceTag: '₹9,500',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '14,200',
    tags: ['4 Massive Stages', 'Flea Market', 'Food Village', 'Sunset Clifftop View'],
    includesCombo: true,
    comboPrice: 14890,
    details: {
      vibe: 'High-octane seaside festival energy with massive laser installations, sunset clifftop views of the Arabian ocean, and international sound systems.',
      signatureMustTry: ['Mainstage sunset transition set at 6:30 PM', 'Techno arena underground dome', 'VIP deck fast bar access'],
      address: 'Hilltop Grounds, Small Vagator, Anjuna, Goa 403509',
      bestTimeToVisit: 'Entry at 4:00 PM lets you enjoy both the sunset golden hour and the midnight laser shows.'
    }
  },

  // ── 4. BANGALORE ──
  {
    id: 'blr-cafe-araku',
    title: 'Araku Coffee Flagship Roastery & Cafe',
    subtitle: 'Award-winning regenerative specialty coffee roastery designed by Studio Lotus',
    category: 'cafe',
    categoryBadge: 'FLAGSHIP ROASTERY',
    categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cityKey: 'bangalore',
    cityName: 'Bangalore',
    locality: '100ft Road, Indiranagar',
    distance: 'Central Indiranagar',
    timeSlot: 'afternoon',
    timeStatus: '🟢 Happening Now · Sensory Cupping Bar',
    timings: 'Daily 08:30 AM - 11:00 PM',
    highlight: 'Must-Order: Nitro cascara iced tea, Grand Reserve siphon brew & French butter croissants',
    priceTag: '₹950 for two',
    priceNumber: 950,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.8',
    reviewsCount: '3,210',
    tags: ['Sensory Lab', 'Single-Origin Araku Valley', 'Architectural Marvel', 'High-Speed Wi-Fi'],
    details: {
      vibe: 'Chic white modernist coffee temple featuring custom brass Modbar espresso taps, sensory tasting labs, and light-filled Scandinavian seating.',
      signatureMustTry: ['Araku Signature Cold Brew Nitro', 'Poached Pear & Burrata Salad', 'Single Estate Pour-Over Flight'],
      address: '968, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      bestTimeToVisit: '11:00 AM or 3:30 PM for quieter co-working hours and fresh coffee roasts.'
    }
  },
  {
    id: 'blr-brew-toit',
    title: 'Toit Brewpub & Woodfired Kitchen',
    subtitle: 'Bangalore’s legendary craft brewery serving fresh Belgian wits and thin-crust sourdough pizzas',
    category: 'restaurant',
    categoryBadge: 'CRAFT BREWPUB',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cityKey: 'bangalore',
    cityName: 'Bangalore',
    locality: 'Indiranagar 100ft Road',
    distance: 'Indiranagar High Street',
    timeSlot: 'night',
    timeStatus: '🟢 Full House Tonight · Taproom Active',
    timings: '12:00 PM - 01:00 AM',
    highlight: 'Must-Order: Tintin Toit Belgian witbier, Toit baked nachos & spicy beef steak pizza',
    priceTag: '₹1,600 for two',
    priceNumber: 1600,
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '19,800',
    tags: ['House Craft Beers', 'Pet Friendly', 'Live Sports Screens', 'Woodfired Oven'],
    details: {
      vibe: 'Energetic bi-level industrial brick brewhouse buzzing with tech founders, live chatter, and the aroma of fermenting hops.',
      signatureMustTry: ['Basmati Blonde Ale', 'Colonial Toit IPA', 'Woodfired Pesto Genovese Pizza'],
      address: '298, 100 Feet Rd, Near KFC Restaurant, Indiranagar, Bengaluru 560038',
      bestTimeToVisit: 'Reserve via Orbit 1-click booking to bypass the 45-minute street waiting line.'
    }
  },

  // ── 5. JAIPUR ──
  {
    id: 'jai-rooftop-palladio',
    title: 'Bar Palladio & Grand Heritage Courtyard',
    subtitle: 'Cobalt-blue Orientalist palace lounge in an 18th-century royal Kanota haveli',
    category: 'rooftop',
    categoryBadge: 'PALACE LOUNGE',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cityKey: 'jaipur',
    cityName: 'Jaipur',
    locality: 'Narayan Singh Circle',
    distance: '10 mins from Old Pink City',
    timeSlot: 'sunset',
    timeStatus: '🌇 Sunset Tent Canopies Lit · Peacock Courtyard',
    timings: '06:00 PM - 12:00 AM',
    highlight: 'Must-Order: Italian Bellinis, handmade saffron gnocchi & bonfire courtyard cocktails',
    priceTag: '₹2,400 for two',
    priceNumber: 2400,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '4,890',
    tags: ['Royal Heritage Haveli', 'Bonfire Tents', 'Venetian Italian Cuisine', 'Peacock Garden'],
    details: {
      vibe: 'Dreamy royal fantasy covered in intricate Mughal frescoes, turquoise upholstery, glowing brass lanterns, and resident peacocks.',
      signatureMustTry: ['Campari & Blood Orange Spritz', 'Handmade Truffle Tortellini', 'Tiramisu Tradizionale'],
      address: 'Kanota Bagh, Narayan Singh Rd, Rambagh, Jaipur, Rajasthan 302004',
      bestTimeToVisit: '6:30 PM for illuminated tent seating under the desert night sky.'
    }
  },

  // ── 6. RISHIKESH ──
  {
    id: 'rishi-cafe-beatles',
    title: 'The Beatles Cafe (The 60s Cafe)',
    subtitle: 'Cliffside Ganges-facing cafe celebrating the legendary 1968 Beatles Rishikesh retreat',
    category: 'cafe',
    categoryBadge: 'GANGES CLIFF CAFE',
    categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cityKey: 'rishikesh',
    cityName: 'Rishikesh',
    locality: 'Tapovan, Paidal Marg',
    distance: 'Overlooking the Ganges Riverbed',
    timeSlot: 'morning',
    timeStatus: '🟢 Happening Now · Morning River Mist',
    timings: 'Daily 08:30 AM - 10:30 PM',
    highlight: 'Must-Order: Vegan gluten-free buckwheat pancakes, masala chai & raw organic smoothies',
    priceTag: '₹650 for two',
    priceNumber: 650,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.8',
    reviewsCount: '3,450',
    tags: ['Ganges River View', 'Vegan Organic', 'Beatles Vinyl Records', 'Peaceful Workdesk'],
    details: {
      vibe: 'Tranquil cliffside open balcony listening to the gushing sound of river Ganges, walls lined with rare black & white 1968 Beatles photos.',
      signatureMustTry: ['Beatles Special Granola Bowl with Himalayan Honey', 'Spicy Tofu Burger', 'Ginger Lemon Mint Infusion'],
      address: 'Paidal Marg, Tapovan Sarai, Badrinath Rd, Rishikesh, Uttarakhand 249192',
      bestTimeToVisit: '9:00 AM for morning sunshine and panoramic mountain views.'
    }
  },
  {
    id: 'rishi-cultural-aarti',
    title: 'Triveni Ghat Maha Ganga Aarti Experience',
    subtitle: 'Sacred evening synchronized brass lamp ritual on the holy confluence of three rivers',
    category: 'cultural',
    categoryBadge: 'SACRED AARTI',
    categoryBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    cityKey: 'rishikesh',
    cityName: 'Rishikesh',
    locality: 'Mayakund, Triveni Ghat',
    distance: 'Main Riverbank Promenade',
    timeSlot: 'sunset',
    timeStatus: '🌇 Ritual Starts 06:00 PM · Free Public Access',
    timings: 'Every Evening 05:45 PM - 07:15 PM',
    highlight: 'Experience: Chanting of Vedic mantras, ringing temple bells & floating leaf diyas in the holy Ganges',
    priceTag: 'Free Entry (₹0)',
    priceNumber: 0,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    rating: '★ 5.0',
    reviewsCount: '9,200',
    tags: ['Spiritual Confluence', 'Live Vedic Chants', 'Brass Diya Lighting', 'VIP Steps Seating'],
    details: {
      vibe: 'Spiritual goosebumps as priests hoist towering multi-tiered flaming brass lamps against the darkening Himalayan skyline while thousands chant.',
      signatureMustTry: ['Reserved front row step seating via Orbit VIP escort', 'Floating earthen diya flower basket blessing', 'Evening prasad distribution'],
      address: 'Triveni Ghat Promenade, Mayakund, Rishikesh, Uttarakhand 249201',
      bestTimeToVisit: 'Reach the ghat steps by 5:30 PM to secure an unobstructed front-row view.'
    }
  },

  // ── 7. DUBAI ──
  {
    id: 'dxb-rooftop-celavi',
    title: 'CÉ LA VI Dubai & Infinity Sky Deck',
    subtitle: '54th-floor infinity pool rooftop facing the illuminated needle of Burj Khalifa',
    category: 'rooftop',
    categoryBadge: 'BURJ KHALIFA ROOFTOP',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cityKey: 'dubai',
    cityName: 'Dubai',
    locality: 'Address Sky View, Downtown Dubai',
    distance: 'Center of Downtown Dubai',
    timeSlot: 'sunset',
    timeStatus: '🌇 Golden Hour Active · Red Swing Open',
    timings: '12:00 PM - 03:00 AM',
    highlight: 'Must-Order: Miso black cod, wagyu beef tartare & sky lounge signature Bellinis',
    priceTag: '₹4,800 for two',
    priceNumber: 4800,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '6,200',
    tags: ['Burj Khalifa Front Row', 'Infinity Pool', 'Iconic Floral Swing', 'Michelin-Rated Chef'],
    details: {
      vibe: 'Ultra-luxurious rooftop bridge connecting the twin Address towers, famous circular infinity pool and the most photographed skyline view in the UAE.',
      signatureMustTry: ['Truffle Edamame & Black Truffle Sushi', 'Pan-Seared Chilean Seabass', 'CÉ LA VI Gold Leaf Dessert'],
      address: 'Tower 2, Level 54, Address Sky View Hotel, Sheikh Mohammed bin Rashid Blvd, Dubai',
      bestTimeToVisit: '5:30 PM sunset slot to watch the golden sun drop behind the Burj Khalifa.'
    }
  },

  // ── 8. BANGKOK (THAILAND) ──
  {
    id: 'bkk-rooftop-tichuca',
    title: 'Tichuca Rooftop Jellyfish Bar',
    subtitle: '46th-floor tropical rooftop canopy with iconic multi-color LED glowing jellyfish tree',
    category: 'rooftop',
    categoryBadge: 'TIKI SKY BAR',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cityKey: 'thailand',
    cityName: 'Bangkok',
    locality: 'T-One Building, Sukhumvit 40',
    distance: 'Near Thonglor BTS Station',
    timeSlot: 'night',
    timeStatus: '🟢 Happening Now · DJ Set Live till 02:00 AM',
    timings: '05:00 PM - 02:00 AM',
    highlight: 'Must-Order: Yuzu Tiki rum bowls served in whole coconuts with 360-degree skyline views',
    priceTag: '₹1,800 for two',
    priceNumber: 1800,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '7,100',
    tags: ['360 Skyline View', 'Glowing Jellyfish Canopy', 'Thonglor Nightlife', 'BTS Accessible'],
    details: {
      vibe: 'Futuristic Avatar-like open-air tropical jungle high above Bangkok’s coolest nightlife district, pulsating with afrobeat and tropical house rhythms.',
      signatureMustTry: ['Pineapple Yuzu Mezcal Splash', 'Dragonfruit Tiki Coconut Bowl', 'Truffle French Fries'],
      address: 'T-One Building 8, 46th Floor, Soi Sukhumvit 40, Phra Khanong, Khlong Toei, Bangkok 10110',
      bestTimeToVisit: '9:00 PM for the ultimate electric glow under the illuminated LED tree.'
    }
  },

  // ── 9. BALI (INDONESIA) ──
  {
    id: 'bali-beachclub-savaya',
    title: 'Savaya Bali & Ocean Clifftop Amphitheatre',
    subtitle: 'Perched 100 meters above the Indian Ocean on Uluwatu’s dramatic limestone cliffs',
    category: 'beachclub',
    categoryBadge: 'CLIFFTOP CLUB',
    categoryBadgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    cityKey: 'bali',
    cityName: 'Bali',
    locality: 'Uluwatu, South Kuta',
    distance: 'Uluwatu Sunset Coast',
    timeSlot: 'sunset',
    timeStatus: '🌇 Sunset Session Live · Infinity Pool Daybeds',
    timings: '01:00 PM - 12:00 AM',
    highlight: 'Experience: Suspended glass cube lounge overlooking crashing ocean waves & international DJs',
    priceTag: '₹2,800 Daybed Pass',
    priceNumber: 2800,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.9',
    reviewsCount: '9,400',
    tags: ['100m Cliffside', 'Iconic Glass Cube', 'Infinity Edge Pool', 'World-Class Headliners'],
    details: {
      vibe: 'Architectural wonder suspended over the roaring Indian Ocean, celebrated globally as Bali’s ultimate luxury day-to-night lifestyle destination.',
      signatureMustTry: ['Uluwatu Sunset Sangria Pitcher', 'Woodfired Balinese Chicken Satay', 'VIP Glass Platform Daybed'],
      address: 'Jl. Belimbing Sari, Banjar Tambiyak, Pecatu, Uluwatu, Kabupaten Badung, Bali 80364',
      bestTimeToVisit: '4:00 PM to swim in the cliff pool during the golden sunset hour.'
    }
  },

  // ── 10. KASHMIR / SRINAGAR ──
  {
    id: 'srx-cafe-chaijaai',
    title: 'Chai Jaai Tea Room & Jhelum Riverside Heritage',
    subtitle: 'English-Cotswolds style floral tea parlor celebrating historic Kashmiri tea brewing',
    category: 'cafe',
    categoryBadge: 'HERITAGE TEA ROOM',
    categoryBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cityKey: 'kashmir',
    cityName: 'Srinagar, Kashmir',
    locality: 'The Bund, Jhelum Riverfront',
    distance: 'Opposite Lal Chowk Heritage Post',
    timeSlot: 'morning',
    timeStatus: '🟢 Happening Now · Hot Saffron Kahwa Brewed',
    timings: '09:00 AM - 09:30 PM',
    highlight: 'Must-Order: Traditional copper Samovar Saffron Kahwa, Pink Noon Chai & warm Bakarkhani',
    priceTag: '₹600 for two',
    priceNumber: 600,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    rating: '★ 4.8',
    reviewsCount: '2,640',
    tags: ['Jhelum Riverfront', 'Traditional Samovar', 'Hand-Painted Chinars', 'Bakery'],
    details: {
      vibe: 'Poetic Kashmiri sanctuary lined with delicate chintz wallpaper, vintage books, and the gentle sound of the Jhelum river flowing outside.',
      signatureMustTry: ['Peshawari Kahwa with crushed almonds & green cardamom', 'Sheermal Bread with Spiced Keema', 'Almond Phirni in Clay Pots'],
      address: 'Mahatta & Co, The Bund, Munshi Bagh, Srinagar, Jammu and Kashmir 190001',
      bestTimeToVisit: '10:00 AM for a peaceful breakfast by the historic riverbank.'
    }
  }
];

const CITY_FILTERS = [
  { key: 'all', label: 'All Cities 🌍' },
  { key: 'delhi', label: 'Delhi NCR 🏛️' },
  { key: 'mumbai', label: 'Mumbai 🏙️' },
  { key: 'goa', label: 'Goa 🏖️' },
  { key: 'bangalore', label: 'Bangalore 🌿' },
  { key: 'jaipur', label: 'Jaipur 🏰' },
  { key: 'rishikesh', label: 'Rishikesh ⛰️' },
  { key: 'dubai', label: 'Dubai 🇦🇪' },
  { key: 'thailand', label: 'Bangkok 🇹🇭' },
  { key: 'bali', label: 'Bali 🇮🇩' },
  { key: 'kashmir', label: 'Kashmir ❄️' },
];

const TIME_FILTERS = [
  { key: 'all', label: 'Any Time 🕒', icon: Clock },
  { key: 'now', label: '🟢 Happening Now', icon: Sparkles },
  { key: 'morning', label: '🌅 Morning & Brunch', icon: Sun },
  { key: 'afternoon', label: '☀️ Afternoon & Day', icon: Sun },
  { key: 'sunset', label: '🌇 Sunset & Sundowner', icon: Sunset },
  { key: 'night', label: '🌙 Nightlife & Late Night', icon: Moon },
  { key: 'weekend', label: '📅 This Weekend', icon: Calendar },
];

const CATEGORY_FILTERS = [
  { key: 'all', label: '🌟 All City Pulse' },
  { key: 'cafe', label: '☕ Aesthetic Cafes & Brunch' },
  { key: 'rooftop', label: '🍸 Rooftops & Cocktail Bars' },
  { key: 'concert', label: '🎵 Mega Concerts & Live Gigs' },
  { key: 'restaurant', label: '🍽️ Top Restaurants & Food Walks' },
  { key: 'beachclub', label: '🏖️ Beach Clubs & Sundowners' },
  { key: 'cultural', label: '🛕 Cultural & Heritage Walks' },
];

interface ConcertsEventsFeedProps {
  onSelectToCart: (name: string, price: string) => void;
  onFocusCity: (cityKey: string) => void;
}

export default function ConcertsEventsFeed({ onSelectToCart, onFocusCity }: ConcertsEventsFeedProps) {
  const [activeCity, setActiveCity] = useState('all');
  const [activeTimeSlot, setActiveTimeSlot] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceModal, setSelectedPlaceModal] = useState<CityPulseItem | null>(null);

  // Filter logic across all dimensions: City + Time + Category + Search Keyword
  const filteredItems = useMemo(() => {
    return EVERGREEN_CITY_PULSE_ITEMS.filter((item) => {
      // 1. City Filter
      if (activeCity !== 'all' && item.cityKey !== activeCity) return false;

      // 2. Time Slot Filter
      if (activeTimeSlot !== 'all') {
        if (activeTimeSlot === 'now' && item.timeSlot !== 'now' && item.timeSlot !== 'night' && item.timeSlot !== 'sunset') {
          return false;
        } else if (activeTimeSlot !== 'now' && item.timeSlot !== activeTimeSlot && activeTimeSlot !== 'weekend') {
          return false;
        }
      }

      // 3. Category Filter
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;

      // 4. Keyword Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.locality.toLowerCase().includes(q) ||
          item.highlight.toLowerCase().includes(q) ||
          item.cityName.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [activeCity, activeTimeSlot, activeCategory, searchQuery]);

  const handleBookItem = (item: CityPulseItem) => {
    onSelectToCart(
      `${item.title} (${item.categoryBadge}) - ${item.locality}`,
      item.priceTag.includes('Free') ? '₹0' : (item.priceNumber > 0 ? `₹${item.priceNumber.toLocaleString()}` : item.priceTag)
    );
    onFocusCity(item.cityKey);
  };

  const handleInspectPlace = (item: CityPulseItem) => {
    setSelectedPlaceModal(item);
    onFocusCity(item.cityKey);
  };

  return (
    <div className="space-y-6 tab-content-enter select-none">
      
      {/* ── 1. PROMINENT EVERGREEN CITY PULSE HERO BANNER ── */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0A1024] rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-cyan-400/30 relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0084FF]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-black border border-cyan-400/40">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>EVERGREEN CITY PULSE · REAL-TIME HYPERLOCAL RADAR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              What’s Happening in Every City Right Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Discover aesthetic third-wave cafes, clifftop sundowners, Michelin street-food walks, secret speakeasies &amp; mega stadium gigs. Filtered live by time &amp; neighborhood.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              Live Verified Spots Active
            </span>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-300 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish, cafe, concert or neighborhood (e.g. 'Truffle Burrata', 'Coldplay', 'Bandra', 'Assagao', 'Aarti')..."
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── 2. MULTI-LEVEL FILTER MATRIX ── */}
        <div className="space-y-3 pt-1 relative z-10">
          
          {/* Row A: City Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-bold">
            <span className="text-[10px] uppercase font-mono text-cyan-300 tracking-wider shrink-0 mr-1">City:</span>
            {CITY_FILTERS.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setActiveCity(c.key);
                  if (c.key !== 'all') onFocusCity(c.key);
                }}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeCity === c.key
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-400/30'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                }`}
              >
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Row B: Time Filters (Happening Now, Morning, Sunset, Late Night) */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-bold pt-1">
            <span className="text-[10px] uppercase font-mono text-emerald-300 tracking-wider shrink-0 mr-1">Time:</span>
            {TIME_FILTERS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTimeSlot(t.key)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    activeTimeSlot === t.key
                      ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Row C: Category Pills (Cafes, Restaurants, Rooftops, Gigs) */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-bold pt-1">
            <span className="text-[10px] uppercase font-mono text-[#0084FF] tracking-wider shrink-0 mr-1">Vibe:</span>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-[#0084FF] text-white font-black shadow-md shadow-blue-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── 3. RESULTS STATUS STRIP ── */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-bold">
        <div className="flex items-center gap-2">
          <span>Found <strong className="text-slate-900">{filteredItems.length} Verified Spots</strong> in {activeCity === 'all' ? 'All Hubs' : activeCity.toUpperCase()}</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700">✓ Table Reservations &amp; Verified VIP Passes</span>
        </div>
        <div className="text-[11px] text-[#0084FF] flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Tap pin to inspect on 3D Route Engine</span>
        </div>
      </div>

      {/* ── 4. RICH EVERGREEN CITY PULSE CARDS GRID ── */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0084FF] flex items-center justify-center text-3xl mx-auto">
            🔍
          </div>
          <h3 className="text-lg font-black text-slate-900">No spots matched this time or vibe filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching the time filter to &quot;Any Time&quot; or selecting &quot;All Cities&quot; to see all curated cafes, rooftop decks, and concerts.
          </p>
          <button
            onClick={() => {
              setActiveCity('all');
              setActiveTimeSlot('all');
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Live Status Header */}
                <div 
                  className="relative h-52 overflow-hidden cursor-pointer" 
                  onClick={() => handleInspectPlace(item)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Top-Left Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${item.categoryBadgeColor}`}>
                      {item.categoryBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-slate-900 text-[10px] font-bold shadow-md">
                      📍 {item.cityName}
                    </span>
                  </div>

                  {/* Top-Right Rating Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                      {item.rating} <span className="text-[10px] font-normal text-slate-800">({item.reviewsCount})</span>
                    </span>
                  </div>

                  {/* Bottom Time Status Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-extrabold flex items-center gap-1.5 truncate">
                      <span>{item.timeStatus}</span>
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0">
                      {item.locality}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 
                      onClick={() => handleInspectPlace(item)}
                      className="text-lg font-black text-slate-900 group-hover:text-[#0084FF] transition-colors leading-tight cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Highlight Box (What to order / Special feature) */}
                  <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 font-medium">
                    <span className="font-bold block text-amber-900 text-[10px] uppercase tracking-wider">
                      ✨ Evergreen Highlight:
                    </span>
                    <span className="line-clamp-2">{item.highlight}</span>
                  </div>

                  {/* Quick Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Pricing & Action Buttons */}
              <div className="p-5 pt-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  {item.originalPriceTag && (
                    <div className="text-[10px] text-slate-400 line-through font-mono">
                      {item.originalPriceTag}
                    </div>
                  )}
                  <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                    {item.priceTag}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Direct Guaranteed Reservation
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleInspectPlace(item)}
                    title="View Menu & Details"
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#0084FF] transition cursor-pointer active:scale-90 shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBookItem(item)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-[#0052CC] hover:from-[#0070db] hover:to-[#004099] active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/25 transition flex items-center gap-1.5 btn-press cursor-pointer"
                  >
                    <span>{item.category === 'concert' ? 'Get Ticket' : (item.priceTag.includes('Free') ? 'Claim Pass' : 'Reserve')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── 5. DETAILED EVERGREEN PLACE / EVENT MODAL ── */}
      {selectedPlaceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 modal-backdrop-enter select-none overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-slate-900 shadow-2xl border border-slate-200 modal-panel-enter relative my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto space-y-4">
            
            {/* Top Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedPlaceModal.categoryBadgeColor}`}>
                  {selectedPlaceModal.categoryBadge}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedPlaceModal.title}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0084FF]" />
                  <span>{selectedPlaceModal.locality}, {selectedPlaceModal.cityName} ({selectedPlaceModal.distance})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlaceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Showcase */}
            <div className="relative h-60 rounded-2xl overflow-hidden shadow-inner">
              <img 
                src={selectedPlaceModal.image} 
                alt={selectedPlaceModal.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedPlaceModal.timeStatus}
              </div>
            </div>

            {/* Vibe & Atmosphere */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono">The Vibe &amp; Space:</span>
              <p className="text-slate-700 leading-relaxed font-medium">
                {selectedPlaceModal.details.vibe}
              </p>
            </div>

            {/* Signature Must-Try Items / Experience */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-amber-800 font-mono block">
                ⭐ Curated Signature Highlights:
              </span>
              <div className="space-y-1.5">
                {selectedPlaceModal.details.signatureMustTry.map((dish, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold">{dish}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Timings */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Exact Address:</span>
                <span className="line-clamp-2 font-medium">{selectedPlaceModal.details.address}</span>
              </div>
              <div className="border-l border-slate-200 pl-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Best Hour to Visit:</span>
                <span className="font-medium text-[#0084FF]">{selectedPlaceModal.details.bestTimeToVisit}</span>
              </div>
            </div>

            {/* Bottom Modal CTA Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">Pricing / Entry:</div>
                <div className="text-xl font-black text-slate-900 font-mono">{selectedPlaceModal.priceTag}</div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    onFocusCity(selectedPlaceModal.cityKey);
                    setSelectedPlaceModal(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Pivots Globe ➔
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleBookItem(selectedPlaceModal);
                    setSelectedPlaceModal(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 btn-press cursor-pointer"
                >
                  <span>{selectedPlaceModal.category === 'concert' ? 'Get Ticket Now' : 'Reserve Table'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
