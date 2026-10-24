# 🚀 Orbit Travel OS — AI-Powered Next-Gen Travel SuperApp

> **Investor-Grade Travel SuperApp & Conversational AI Copilot**  
> Combining MakeMyTrip's comprehensive inventory with Atlys's high-margin visa automation, powered by a sub-10ms Real-Time Hybrid RAG engine.

---

## 🌟 Key Product Features

### 1. 🤖 Conversational AI Trip Recommender & Copilot
- **Multi-Turn Cross-Questioning**: State machine actively qualifies traveler context (mood, squad size, budget, stay preference) before assembling personalized packages.
- **Micro-Transit & City Layover Engine**: Intelligent layover handling (e.g. 2 hours in Delhi/Mumbai) with Airport Express fast-track guides and cafe recommendations.
- **Dynamic Traveler Memory Pill Bar**: Real-time context tracking across conversation turns.
- **Interactive Day-by-Day Timeline**: Tabbed schedule breakdown (`Day 1`, `Day 2`, `Day 3`, `Day 4`).
- **Squad Cost Splitter**: Live multi-traveler price computation (`1P`, `2P`, `4P`, `6P`).
- **1-Tap WhatsApp Itinerary Share**: Formatted markdown summary copied to clipboard with single tap.

### 2. ⚡ Real-Time Hybrid RAG Engine (<10ms SLA)
- In-memory BM25 + L2-normalized TF-IDF vector retrieval indexing **1,170+ live SQLite items**:
  - ✈️ **520+ Real-Time Flight Tickets** (IndiGo, Vistara, Air India, Emirates, SpiceJet)
  - 🏨 **520+ Luxury Stays & Villas** (Goa pool villas, Rishikesh glamping, Jaipur havelis, Dubai, Bangkok)
  - 🎸 **110+ Live Concerts, Cafes & Evergreen City Life** (Coldplay, Diljit Dosanjh, Zomaland, Sunburn)
  - 🛂 **Flat ₹499 Family Visas** (Thailand, Dubai, Vietnam, Indonesia with 24h OCR)
  - 🔥 **60% Off Distressed Flight Drops** (Unsold airline seat liquidation)
  - 🏢 **Corporate GST & 18% Input Tax Credit Compliance** (myBiz tax engine)
  - 📋 **Live Confirmed PNR Status & Bookings**

### 3. 🛂 Atlys-Equivalent Visa Engine (Flat ₹499 Family Pass)
- Flat ₹499 fee covering up to 6 family members (saving ~₹3,500 vs traditional OTAs).
- Laser Passport OCR pre-check & AI photo background eraser.
- 100% free verified embassy dummy flight proofs and hotel vouchers.

### 4. 🏢 Corporate myBiz & 18% GST Compliance
- Real-time GSTIN validation and automatic 18% (hotels/business class) and 5% (economy flights) ITC calculation with GSTR-1 compliant invoice generation.

---

## 🏗️ Architecture & Tech Stack

```
orbit-travel-app/
├── app/                  # Next.js 14 App Router (React 18, TypeScript)
│   ├── chat/             # AI Travel Copilot & Recommender Studio
│   ├── layout.tsx        # Root Layout & Theme Configuration
│   └── page.tsx          # Main SuperApp Marketplace & Live Services
├── backend/              # FastAPI Python Backend
│   ├── main.py           # Application Entrypoint & CORS/Proxy Router
│   ├── rag_engine.py     # Hybrid BM25 + Vector TF-IDF Retrieval Engine
│   ├── local_llm.py      # Apple Silicon Metal / ARM NEON LLM Runner
│   ├── database.py       # SQLAlchemy Engine & SQLite Connection Pool
│   ├── models.py         # Relational DB Models (Flights, Hotels, Events, Visas)
│   ├── schemas.py        # Pydantic v2 Request/Response Schemas
│   └── routers/          # Modular API Routers (chat, rag, flights, hotels, bookings)
└── components/           # Reusable Modern UI Components & Dialogs
```

---

## ⚡ Quickstart & Local Setup

### 1. Backend (FastAPI + Python 3.12)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt # (fastapi, uvicorn, sqlalchemy, pydantic, numpy)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Next.js 14)
```bash
npm install
npm run build
npm run start # Starts on http://localhost:3005 with built-in API proxy to backend
```

---

## 📄 License
MIT License. Built for High-Performance Travel Tech Exploration.
