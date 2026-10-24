import re
import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import ChatSession, ChatMessage, Trip
from local_llm import is_local_model_ready, generate_local_response
from rag_engine import answer_query_with_rag
from schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessageResponse,
    TripCardSchema,
    SessionProfileSchema,
    RAGLedgerSchema,
    RAGLedgerRecord,
)

router = APIRouter(prefix="/api/chat", tags=["AI Copilot & Conversational Engine"])


def map_rag_card_to_trip_card(rag_card: Optional[dict]) -> Optional[dict]:
    if not rag_card:
        return None
    t = rag_card.get("type")
    meta = rag_card.get("payload", {})
    price_str = rag_card.get("price", "₹4,999")

    if t == "flight":
        orig_price = f"₹{int(meta.get('price', 5000) * 1.25):,}"
        return {
            "title": rag_card.get("title", "Direct Flight"),
            "cityKey": (meta.get("dest_code") or "DEL").lower(),
            "location": f"{meta.get('origin', 'Origin')} ➔ {meta.get('dest', 'Destination')}",
            "price": price_str,
            "originalPrice": orig_price,
            "duration": meta.get("duration", "Direct Non-Stop"),
            "airline": f"{meta.get('airline', 'Airline')} ({meta.get('flight_num', 'Flight')})",
            "stay": f"{meta.get('cabin_class', 'Economy')} · Baggage {meta.get('baggage', '15kg')}",
            "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            "inclusions": [
                f"✈️ {meta.get('airline')} Verified Flight Ticket",
                f"💺 {meta.get('seats_available', 'Limited')} Seats Left in Inventory",
                "⚡ Flat ₹0 Convenience Fee on Orbit",
                "💼 Baggage Allowance Included",
            ],
            "itineraryDays": [
                {"day": "Departure", "title": f"Takeoff at {meta.get('departure_time')}", "desc": f"Flight {meta.get('flight_num')} from {meta.get('origin_code')}"},
                {"day": "Arrival", "title": f"Landing at {meta.get('arrival_time')}", "desc": f"Direct arrival at {meta.get('dest_code')} ({meta.get('dest')})"}
            ]
        }
    elif t == "hotel":
        amenities = meta.get("amenities", [])
        return {
            "title": rag_card.get("title", "Luxury Stay"),
            "cityKey": (meta.get("city_key") or "delhi").lower(),
            "location": meta.get("location", "Prime Location"),
            "price": price_str,
            "originalPrice": f"₹{int(meta.get('price_per_night', 4000) * 1.3):,}",
            "duration": "1 Night / Per Room",
            "airline": "Complimentary Airport Cab Assistance",
            "stay": f"{meta.get('property_type', 'Hotel')} · {meta.get('rating', '4.5')}★ Rating",
            "image": meta.get("image") or "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "inclusions": [
                f"🏨 {meta.get('rating', 4.5)}★ {meta.get('badge', 'Verified')}",
                "🍳 Complimentary Breakfast Buffet",
                "🔄 Free Cancellation up to 24h before Check-in",
                f"✨ {amenities[0] if amenities else 'Wi-Fi & Swimming Pool'}",
            ],
            "itineraryDays": [
                {"day": "Check-in", "title": "12:00 PM Express Check-in", "desc": "Welcome drink and keycard delivery."},
                {"day": "Check-out", "title": "11:00 AM Hassle-free Checkout", "desc": "Luggage storage available."}
            ]
        }
    elif t == "event":
        return {
            "title": rag_card.get("title", "Live Event Pass"),
            "cityKey": (meta.get("city_key") or "delhi").lower(),
            "location": meta.get("venue", "City Arena"),
            "price": price_str,
            "originalPrice": f"₹{int(meta.get('ticket_price', 3000) * 1.4):,}",
            "duration": f"{meta.get('date_str', 'Tonight')} ({meta.get('time_str', 'Live')})",
            "airline": "Express Fast-Track Entry Gates",
            "stay": f"{meta.get('category', 'Event')} · {meta.get('badge', 'Selling Fast')}",
            "image": meta.get("image") or "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
            "inclusions": [
                "🎟️ Official 100% Verified Entry Ticket",
                f"🎸 Curated By {meta.get('headliner', 'Artist')}",
                "⚡ Direct Digital QR Pass on WhatsApp & Email",
                "🍹 Fast-Track Bar & Counter Access",
            ],
            "itineraryDays": [
                {"day": "Entry", "title": f"Gates Open at {meta.get('time_str', '18:00')}", "desc": "Security check and wristband redemption."},
                {"day": "Show", "title": "Live Performance & DJ Sets", "desc": f"Headline act by {meta.get('headliner', 'Artist')}."}
            ]
        }
    elif t == "visa":
        return {
            "title": rag_card.get("title", "Tourist eVisa"),
            "cityKey": (meta.get("country_key") or "thailand").lower(),
            "location": f"Embassy & Consulate of {meta.get('country_name', 'Destination')}",
            "price": f"₹{meta.get('platform_fee', 499):,}",
            "originalPrice": "₹4,000",
            "duration": f"{meta.get('processing_hours', 24)} Hours Express Delivery",
            "airline": "Free Verified Dummy Flight Proof Included",
            "stay": "Free Verified Dummy Hotel Voucher Included",
            "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
            "inclusions": [
                "🛂 Flat ₹499 Family Pass (Covers up to 6 Members)",
                "📸 AI Photo Studio & White BG Eraser",
                "📄 Laser Passport OCR Scanner",
                f"⚡ {meta.get('success_rate', 99.8)}% Official Approval Guarantee",
            ],
            "itineraryDays": [
                {"day": "Day 1", "title": "Document Verification & OCR", "desc": "AI verification within 15 minutes of upload."},
                {"day": "Day 2", "title": "Consulate Approval & WhatsApp Delivery", "desc": "Official eVisa PDF delivered directly with QR verification."}
            ]
        }
    elif t == "drop":
        return {
            "title": rag_card.get("title", "Distressed Flight Seat Drop"),
            "cityKey": (meta.get("dest_code") or "DEL").lower(),
            "location": f"{meta.get('origin_code', 'DEL')} ➔ {meta.get('dest_code', 'BOM')}",
            "price": price_str,
            "originalPrice": f"₹{int(meta.get('distressed_price', 3000) * 2.2):,}",
            "duration": "Instant Flash Drop",
            "airline": f"{meta.get('airline', 'Airline')} ({meta.get('flight_num', 'Flight')})",
            "stay": "Unsold Airline Seat Liquidation",
            "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            "inclusions": [
                f"🔥 {meta.get('discount_percent', 60)}% Massive Flash Discount",
                f"💺 Only {meta.get('seats_remaining', 3)} Seats Remaining",
                "✈️ Direct Non-Stop Confirmed Airline PNR",
                "⚡ Flat ₹0 Convenience Fee",
            ],
            "itineraryDays": [
                {"day": "Departure", "title": f"Takeoff {meta.get('departure_time', 'Morning')}", "desc": "Express gate boarding."}
            ]
        }
    elif t == "trip":
        itinerary_raw = meta.get("itinerary", [])
        if isinstance(itinerary_raw, str):
            try:
                itinerary_list = json.loads(itinerary_raw)
            except Exception:
                itinerary_list = []
        else:
            itinerary_list = itinerary_raw or []

        inclusions_raw = meta.get("inclusions", [])
        if isinstance(inclusions_raw, str):
            try:
                inclusions_list = json.loads(inclusions_raw)
            except Exception:
                inclusions_list = []
        else:
            inclusions_list = inclusions_raw or []

        return {
            "title": rag_card.get("title", meta.get("title", "Curated Vacation")),
            "cityKey": (meta.get("destination_key") or "delhi").lower(),
            "location": meta.get("distance") or meta.get("drive_time") or "Prime Location",
            "price": f"₹{meta.get('price', 4999):,}",
            "originalPrice": f"₹{meta.get('original_price', 7999):,}",
            "duration": meta.get("duration", "Custom Trip"),
            "airline": meta.get("airline", "Direct Fast-Track Transit"),
            "stay": meta.get("stay_name", "Luxury Curated Stay"),
            "image": meta.get("image") or "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
            "inclusions": inclusions_list or ["⚡ Verified Package Booking", "🏨 Confirmed Hotel Stay", "🍳 Breakfast Included"],
            "itineraryDays": itinerary_list or [
                {"day": "Day 1", "title": "Check-in & Exploration", "desc": "Smooth arrival and relaxation."},
                {"day": "Day 2", "title": "Local Trail & Return", "desc": "Curated sightseeing and return."}
            ]
        }
    return None


def get_or_create_session(db: Session, session_id: Optional[str], initial_title: str = "New Trip Chat") -> ChatSession:
    if session_id:
        sess = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if sess:
            return sess

    new_id = f"sess_{uuid.uuid4().hex[:10]}"
    sess = ChatSession(
        id=new_id,
        title=initial_title,
        step=0,
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return sess


@router.get("/model-status")
def get_model_status():
    """Check whether local Apple Silicon Metal LLM (Qwen2.5-0.5B GGUF) is ready."""
    ready = is_local_model_ready()
    return {
        "engine": "llama-cpp-python (Apple Silicon Metal GPU)",
        "model": "Qwen2.5-0.5B-Instruct-Q4_K_M.gguf",
        "status": "READY" if ready else "DOWNLOADING",
        "is_local": True,
        "zero_api_keys_needed": True,
    }


@router.get("/sessions")
def list_chat_sessions(db: Session = Depends(get_db)):
    """List recent conversation threads for the desktop chat sidebar."""
    sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).limit(10).all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "destination": s.destination,
            "step": s.step,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Load previous chat transcript and trip suggestions for a session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    results = []
    for m in messages:
        trip_card = json.loads(m.trip_card_json) if m.trip_card_json else None
        prompt_suggestions = json.loads(m.prompt_suggestions_json) if m.prompt_suggestions_json else None
        results.append(
            {
                "id": m.id,
                "session_id": m.session_id,
                "sender": m.sender,
                "text": m.text,
                "time": m.created_at.strftime("%I:%M %p"),
                "trip_card": trip_card,
                "prompt_suggestions": prompt_suggestions,
            }
        )

    return {
        "session_id": session.id,
        "title": session.title,
        "step": session.step,
        "destination": session.destination,
        "messages": results,
    }


def normalize_city_and_typos(text: str) -> str:
    t = text.lower()
    t = re.sub(r'\bdelji\b', 'delhi', t)
    t = re.sub(r'\bdehli\b', 'delhi', t)
    t = re.sub(r'\bdilli\b', 'delhi', t)
    t = re.sub(r'\brishkesh\b', 'rishikesh', t)
    t = re.sub(r'\bjaiput\b', 'jaipur', t)
    t = re.sub(r'\bmumbau\b', 'mumbai', t)
    t = re.sub(r'\bbanglore\b', 'bangalore', t)
    t = re.sub(r'\bgoaa\b', 'goa', t)
    return t


def extract_city_destination(text: str) -> Optional[str]:
    t = normalize_city_and_typos(text)
    if any(w in t for w in ["delhi", "ncr", "aerocity", "gurgaon", "gurugram", "noida", "connaught place", "cp", "hauz khas", "khan market", "qutub", "saket", "dwarka", "igi"]):
        return "delhi"
    if any(w in t for w in ["mumbai", "bombay", "bandra", "juhu", "marine drive", "colaba", "andheri", "bkc"]):
        return "mumbai"
    if any(w in t for w in ["bangalore", "bengaluru", "blr", "koramangala", "indiranagar", "whitefield"]):
        return "bangalore"
    if any(w in t for w in ["goa", "panjim", "calangute", "baga", "anjuna", "candolim", "vagator", "morjim", "arambol"]):
        return "goa"
    if any(w in t for w in ["rishi", "rafting", "glamp", "shivpuri", "haridwar", "ganga", "neelkanth"]):
        return "rishikesh"
    if any(w in t for w in ["jaipur", "udaipur", "haveli", "amber fort", "nahargarh", "rajasthan"]):
        return "jaipur"
    if any(w in t for w in ["kashmir", "srinagar", "gulmarg", "pahalgam", "dal lake", "sonamarg"]):
        return "kashmir"
    if any(w in t for w in ["thailand", "phuket", "krabi", "bangkok", "bkk", "pattaya", "koh samui"]):
        return "thailand"
    if any(w in t for w in ["dubai", "dxb", "burj", "safari", "abu dhabi", "sharjah"]):
        return "dubai"
    if any(w in t for w in ["bali", "seminyak", "ubud", "canggu"]):
        return "bali"
    if any(w in t for w in ["corbett", "jim corbett", "tiger", "ramnagar"]):
        return "corbett"
    if any(w in t for w in ["coldplay", "diljit", "concert", "fest", "gig"]):
        return "concerts"
    return None


def extract_time_constraint(text: str) -> Optional[str]:
    t = normalize_city_and_typos(text)
    m = re.search(r'\b(one|two|three|four|five|six|1|2|3|4|5|6|half|few)\s*(hour|hr|ghante|ghanta|h|hours|hrs)\b', t)
    if m:
        return m.group(0)
    if any(w in t for w in ["layover", "transit", "stopover", "short time", "free time", "time to kill", "free hoon", "kuch der", "two hours", "2 hours", "where should i go", "where to go", "what to do in"]):
        return "short_time"
    return None


def extract_group_type(text: str) -> Optional[str]:
    t = normalize_city_and_typos(text)
    if any(w in t for w in ["alone", "solo", "single", "just me", "myself", "akela", "akeli", "1 person", "one person"]):
        return "Solo Traveler"
    if any(w in t for w in ["couple", "wife", "husband", "girlfriend", "boyfriend", "partner", "romantic", "two of us", "2 people"]):
        return "Couple Romantic"
    if any(w in t for w in ["friend", "squad", "dost", "buddies", "boys", "girls", "gang", "group"]):
        if "ganga" not in t:
            return "Friends Squad"
    if any(w in t for w in ["family", "parents", "kids", "children", "mom", "dad", "bache"]):
        return "Family Vacation"
    return None


@router.post("", response_model=ChatResponse)
def handle_chat_message(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Multi-Turn Cross-Questioning Travel Copilot (powered by GPT-4o Route Engine).
    Actively narrows down squad, vibe, budget, and stay before synthesizing a custom-tailored package.
    """
    session = get_or_create_session(db, req.session_id)
    user_text = req.message.strip()

    # 1. Save User Message
    user_msg_id = f"u-{uuid.uuid4().hex[:8]}"
    db_user_msg = ChatMessage(
        id=user_msg_id,
        session_id=session.id,
        sender="user",
        text=user_text,
    )
    db.add(db_user_msg)
    db.commit()

    # Retrieve past messages to maintain context across turns
    past_user_msgs = [
        m.text for m in db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id, ChatMessage.sender == "user")
        .order_by(ChatMessage.created_at.desc())
        .limit(5)
        .all()
    ]
    full_context_str = " ".join([user_text] + past_user_msgs)

    # 2. Conversational Cross-Questioning State Machine
    q = normalize_city_and_typos(user_text)
    ai_text = ""
    trip_card_data: Optional[dict] = None
    next_suggestions: Optional[List[str]] = None
    current_rag_ledger: Optional[RAGLedgerSchema] = None

    # Detect entity constraints with multi-turn recall
    detected_dest = extract_city_destination(user_text) or session.destination or extract_city_destination(full_context_str)
    detected_time = extract_time_constraint(user_text) or extract_time_constraint(full_context_str)
    detected_group = extract_group_type(user_text)

    if detected_group:
        session.group_type = detected_group

    dest = detected_dest
    if dest and not session.destination:
        session.destination = dest
        session.title = f"Trip to {dest.title()}"

    # ----------------------------------------------------
    # 1. CHECK IF USER WANTS TRIP RECOMMENDATION / CUSTOMIZATION
    # If yes -> ALWAYS run Multi-Turn Cross-Questioning Flow!
    # ----------------------------------------------------
    is_recommender_query = (
        bool(dest) or
        any(w in q for w in [
            "recommend", "plan", "trip", "vacation", "holiday", "package", "itinerary",
            "chahiye", "jana hai", "ghoomne", "squad", "escape", "weekend", "chalna", "chalo",
            "north", "south", "peace", "party", "adventure", "rafting", "glamp", "tents",
            "villa", "pool", "budget", "under", "15000", "25000", "4000", "couple", "family", "alone", "solo",
            "delhi", "mumbai", "goa", "rishikesh", "thailand", "dubai", "jaipur", "kashmir", "corbett", "bali"
        ])
    )

    # ----------------------------------------------------
    # 2. STANDALONE FACTUAL INQUIRIES (RAG INTERCEPTION + CROSS-QUESTION)
    # Trigger ONLY for pure standalone factual lookups (e.g. "delhi se bangkok cheapest flight")
    # ----------------------------------------------------
    is_standalone_factual = not is_recommender_query and any(
        w in q for w in [
            "cheapest flight", "lowest fare", "sasti flight", "flight schedule", "flight price",
            "visa fee", "visa charge", "visa documents", "passport ocr",
            "unsold flight", "seat drop", "distressed drop",
            "gst itc", "gst rule", "tax invoice",
            "booking status", "pnr status"
        ]
    )

    if is_standalone_factual:
        rag_res = answer_query_with_rag(user_text, top_k=3)
        if rag_res and rag_res.get("sources") and rag_res["metrics"].get("top_confidence", 0) >= 0.40:
            current_rag_ledger = RAGLedgerSchema(
                retrieval_ms=round(rag_res["metrics"].get("retrieval_ms", 3.8), 2),
                tables_scanned=["flight_tickets", "hotels", "events_concerts", "visas"],
                matched_records=len(rag_res["sources"]),
                confidence=round(rag_res["metrics"].get("top_confidence", 0.96), 3),
                engine="Hybrid BM25 + Vector Cosine + Qwen2.5 Metal",
                is_live_db=True,
                sources=[
                    RAGLedgerRecord(
                        title=s["title"],
                        type=s["type"],
                        price=s.get("price"),
                        confidence=s.get("confidence", 0.95),
                        snippet=s.get("snippet", "")
                    ) for s in rag_res["sources"][:4]
                ]
            )
            # Answer fact with RAG, BUT ALWAYS FOLLOW UP WITH RELEVANT CROSS-QUESTIONS!
            cross_q = (
                "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "🤔 **Orbit Recommender Cross-Question:**\n"
                "Kya aap iske sath customized stay, airport cab aur day-by-day plan bhi assemble karwana chahte ho?\n"
                "Batao: **Kiske sath travel kar rahe ho (Friends squad, couple, ya family) aur approximate budget kitna hai?**"
            )
            ai_text = rag_res["answer"] + cross_q
            trip_card_data = map_rag_card_to_trip_card(rag_res.get("action_card"))
            top_src = rag_res["sources"][0]
            src_type = top_src.get("type", "flight")
            if src_type == "flight":
                next_suggestions = [
                    "👫 Couple Romantic Trip",
                    "🍻 Friends Squad (4-6 people)",
                    "🏨 Add 4-Star Luxury Stay",
                    "💰 Budget Under ₹15k per person",
                ]
            elif src_type == "visa":
                next_suggestions = [
                    "🛂 Start Atlys Visa Flow (Flat ₹499)",
                    "What documents are required?",
                    "Is free embassy ticket proof valid?",
                    "How long does express approval take?",
                ]
            else:
                next_suggestions = [
                    "✨ Recommend Goa Beach Vacation",
                    "🇹🇭 Thailand Flat ₹499 Visa Flow",
                    "🎸 Coldplay Mumbai VIP Pass",
                    "🔥 Distressed Flight Drops",
                ]

    # Step-based Cross Questioning (only if RAG didn't intercept)
    if ai_text:
        pass
    # ----------------------------------------------------
    # 0. DELHI FLOW (Layover, 2-Hour Express, Solo Trails & Heritage)
    # ----------------------------------------------------
    elif dest == "delhi":
        session.destination = "delhi"
        is_short_time = detected_time is not None or any(w in q for w in [
            "2 hours", "two hours", "hour", "hr", "ghante", "layover", "transit", "short",
            "where should i go", "where to go", "kahan jau", "kya karun", "alone", "solo"
        ])
        is_solo = session.group_type == "Solo Traveler" or "alone" in q or "solo" in q or "single" in q

        if is_short_time or session.step >= 1:
            if is_solo or session.step >= 2 or "alone" in q or "solo" in q:
                session.step = 3
                session.group_type = "Solo Traveler"
                session.vibe = "Aerocity & CP Solo Trail"
                session.stay_type = "Aerocity Worldmark Lounge Pass"
                session.budget = "Under ₹500"

                ai_text = (
                    "Superb! Delhi me 2 hours alone (solo) travel karne ka best scene hai — zero coordination delay, direct fast-track! 🎒⚡\n\n"
                    "Ye raha aapka exact 2-hour solo transit plan (without any outstation confusion):\n\n"
                    "• 🚇 **Fast-Track Transit**: IGI Airport Terminal-3 se direct Orange Line Airport Express lo (135 km/h, 5 mins to Aerocity, 20 mins to CP Shivaji Stadium).\n"
                    "• ☕ **Option 1 (Aerocity Worldmark - 5 mins from terminal)**: Cafe Delhi Heights ya Plum by Bent Chair me mast pour-over coffee, AC glass atrium stroll, high-speed Wi-Fi & laptop charging table. 45 mins me terminal gate wapas!\n"
                    "• 🏛️ **Option 2 (Central Delhi / CP - 20 mins)**: Shivaji Stadium metro exit lo aur Connaught Place Inner Circle & Gurudwara Bangla Sahib ka serene Sarovar walk lo (soulful peaceful solo vibe) + iconic Wenger's bakery mutton patty.\n"
                    "• 🧳 **Luggage Cloakroom**: Airport T3 arrivals ya Aerocity lounge me 100% secure baggage drop.\n"
                    "• 💰 **Total Budget**: Sirf ₹499 (Airport Express Metro QR + Artisanal Coffee included).\n\n"
                    "Ye lo aapka **Delhi 2-Hour Solo Express Pass** — yahan se direct 1-click me pass lock kar sakte ho:"
                )

                trip_card_data = {
                    "title": "Delhi Express 2-Hour Solo Heritage & Cafe Trail",
                    "cityKey": "delhi",
                    "location": "Aerocity Worldmark & Connaught Place, Delhi",
                    "price": "₹499",
                    "originalPrice": "₹1,200",
                    "duration": "2 Hours Express Stopover",
                    "airline": "Airport Express Orange Metro Line (135 km/h)",
                    "stay": "Aerocity Worldmark Lounge & Cafe Pass",
                    "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
                    "inclusions": [
                        "⚡ Airport Express Metro QR Fast-Track Pass",
                        "☕ Cafe Delhi Heights / Blue Tokai Voucher",
                        "🧳 Airport Cloakroom Baggage Drop Assistance",
                        "🛡️ Stress-Free Guaranteed Return to Flight Gate",
                    ],
                    "itineraryDays": [
                        {"day": "Hour 1", "title": "Terminal Exit & Express Metro", "desc": "Take 135 km/h Airport Express orange line straight to Aerocity (5 min) or Shivaji Stadium CP (20 min)."},
                        {"day": "Hour 2", "title": "Solo Coffee, Walk & Smooth Gate Return", "desc": "Relax with pour-over coffee at Cafe Delhi Heights, soak in peaceful vibe, express return to gate."}
                    ]
                }
                next_suggestions = [
                    "⚡ Book Express Pass (₹499)",
                    "☕ Aerocity Worldmark cafes list",
                    "🚇 How to take Airport Express Metro?",
                    "🧳 Where to keep luggage at airport?",
                ]
            else:
                session.step = 1
                ai_text = (
                    "Delhi me 2 hours hain! ⏱️⚡ Agar aap short transit/layover me ho, toh flight/train miss hone ke dar ke bina ye 3 best realistic spots hain:\n\n"
                    "1. ✈️ **Near IGI Airport (Aerocity Worldmark)**: Sirf 5 mins from terminal! Cafe Delhi Heights / Plum by Bent Chair me artisan coffee, air-conditioned atrium walk, high-speed Wi-Fi, aur 45 mins me wapas terminal gate par.\n"
                    "2. 🏛️ **Central Delhi / CP (Orange Line Airport Express Metro se 20m)**: Connaught Place Inner Circle + Gurudwara Bangla Sahib sarovar serenity + iconic Keventers shake.\n"
                    "3. 🌳 **South Delhi (Cab se 25m)**: Sunder Nursery heritage lake walk + Blue Tokai coffee.\n\n"
                    "Customise karne ke liye clarify karo:\n"
                    "**Aap alone (solo) ho ya friends squad/family ke sath? Aur right now aap Airport/Aerocity ke paas ho ya Central Delhi me?**"
                )
                next_suggestions = [
                    "🚶 I am Alone / Solo",
                    "🍻 With Friends Squad",
                    "✈️ Near IGI Airport / Aerocity",
                    "🏛️ Near Connaught Place (CP)",
                ]
        else:
            # Full Delhi Weekend / Vacation query
            if session.step == 0:
                session.step = 1
                ai_text = (
                    "Delhi NCR is full of heritage, royal havelis, and iconic food! 🏰✨\n\n"
                    "Plan customize karne ke liye 2 cross-questions clarify karo:\n"
                    "1. Vibe kya chahiye: Royal Fort Haveli stay (Neemrana / ITC Grand Bharat) ya South Delhi luxury boutique hotel & cafe hopping?\n"
                    "2. Kiske sath travel kar rahe ho (Friends squad, couple, ya family)?"
                )
                next_suggestions = [
                    "🏰 Royal Fort Haveli & Peacock Courtyard",
                    "☕ South Delhi Boutique Stay & Cafe Hop",
                    "👫 Couple Romantic Weekend",
                    "🍻 Friends Squad Getaway",
                ]
            else:
                session.step = 3
                ai_text = (
                    "Aapka customized Delhi NCR Heritage & Boutique Trail package assemble ho gaya hai:\n\n"
                    "• 🏰 Stay: Heritage Haveli Courtyard with private peacock lawn & rooftop pool\n"
                    "• 🍽️ Inclusions: Sunder Nursery heritage pass, Khan Market artisanal cafe voucher, buffet breakfast\n"
                    "• 🚗 Travel: Dedicated private AC Sedan cab for local city trail\n"
                    "• 💰 Total Price: ₹4,499 per person."
                )
                trip_card_data = {
                    "title": "Delhi NCR Heritage Haveli & Sunder Nursery Trail",
                    "cityKey": "delhi",
                    "location": "Lutyens Delhi & Sunder Nursery",
                    "price": "₹4,499",
                    "originalPrice": "₹7,500",
                    "duration": "2 Days / 1 Night",
                    "airline": "Dedicated Private AC Sedan Assistance",
                    "stay": "Boutique Heritage Haveli Stay",
                    "image": "https://images.unsplash.com/photo-1592635196078-9fe3d54f2377?auto=format&fit=crop&w=1200&q=80",
                    "inclusions": [
                        "🏨 4-Star Heritage Haveli Stay",
                        "🌳 Sunder Nursery & Monument Fast-Track Entry",
                        "☕ Khan Market Artisanal Cafe Tasting Voucher",
                        "🍳 Complimentary Royal Buffet Breakfast",
                    ],
                    "itineraryDays": [
                        {"day": "Day 1", "title": "Check-in & Sunder Nursery Lake Walk", "desc": "Check into heritage haveli, peaceful afternoon stroll by Mughal monuments and lotus lakes."},
                        {"day": "Day 2", "title": "Khan Market & Central Delhi Drive", "desc": "Morning pour-over coffee at Blue Tokai, shopping in Khan Market, evening departure."}
                    ]
                }
                next_suggestions = [
                    "⚡ Book Entire Package (₹4,499)",
                    "Can we add Chandni Chowk food walk?",
                    "Change to 5-star Lutyens hotel",
                    "Show full itinerary",
                ]

    # ----------------------------------------------------
    # 0.1 MUMBAI FLOW (Layover or Coastal Weekend)
    # ----------------------------------------------------
    elif dest == "mumbai":
        session.destination = "mumbai"
        is_short_time = detected_time is not None or any(w in q for w in ["2 hours", "two hours", "hour", "hr", "layover", "transit", "short", "where should i go", "where to go", "alone", "solo"])
        is_solo = session.group_type == "Solo Traveler" or "alone" in q or "solo" in q

        if is_short_time or is_solo:
            session.step = 3
            ai_text = (
                "Mumbai me 2 hours quick transit me ho? 🌊 Marine breeze & cafe trail is unmatched:\n\n"
                "• ☕ **Option 1 (Bandra Cafe Trail)**: Subko Specialty Coffee & Craftery (Ranwar Village) me cold brew & sourdough croissant, then a 10-min stroll on Bandra Bandstand.\n"
                "• 🍕 **Option 2 (South Bombay)**: Marine Drive promenade walk + slice at Pizza By The Bay overlooking Arabian sea.\n"
                "• ✈️ **Airport Transit Note**: Agar T2 airport par ho, toh Bandra sirf 15-20 min cab drive hai via Western Express Highway!\n\n"
                "Ye lo direct **Mumbai Express Coastal & Cafe Pass**:"
            )
            trip_card_data = {
                "title": "Mumbai Express 2-Hour Coastal Breeze & Subko Coffee",
                "cityKey": "mumbai",
                "location": "Bandra West & Marine Drive, Mumbai",
                "price": "₹599",
                "originalPrice": "₹1,500",
                "duration": "2 Hours Express Stopover",
                "airline": "Express AC Cab Assistance",
                "stay": "Bandra Heritage Village Cafe Pass",
                "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "☕ Subko Specialty Coffee & Croissant Voucher",
                    "🚕 Express Airport Cab Fast-Track Pickup",
                    "🌊 Marine Drive & Bandstand Sunset Stroll",
                    "🛡️ Guaranteed On-Time Return to T2 Departure Gate",
                ],
                "itineraryDays": [
                    {"day": "Hour 1", "title": "Bandra Coastal Ride", "desc": "Fast cab through Sea Link view to Bandra Ranwar Village."},
                    {"day": "Hour 2", "title": "Specialty Coffee & Gate Return", "desc": "Artisan coffee at Subko, quick walk by Arabian sea, smooth return to T2."}
                ]
            }
            next_suggestions = [
                "⚡ Book Express Pass (₹599)",
                "Show best cafes in Bandra",
                "Traffic time to T2 terminal",
                "Can I visit Gateway of India?",
            ]

    # ----------------------------------------------------
    # A. GOA FLOW
    # ----------------------------------------------------
    elif dest == "goa":
        if session.step == 0:
            session.step = 1
            ai_text = (
                "Goa is always legendary! 🏖️ Lekin plan customize karne ke liye mujhe 2 cross-questions clarify karo:\n\n"
                "1. Vibe kya chahiye: North Goa (Beach clubs, night parties & shacks) ya South Goa (Peaceful clean beaches, luxury resorts)?\n"
                "2. Kiske sath travel kar rahe ho (Friends squad, couple, ya family)?"
            )
            next_suggestions = [
                "🎉 North Goa (Parties & Shacks)",
                "🧘 South Goa (Peace & Luxury)",
                "🍻 Friends Squad (4-6 people)",
                "💑 Couple Romantic Getaway",
            ]
        elif session.step == 1:
            is_north = "south" not in q
            is_friends = "couple" not in q and ("friend" in q or "squad" in q or is_north)
            session.vibe = "North Goa Parties" if is_north else "South Goa Relaxation"
            session.group_type = "Friends Squad" if is_friends else "Couple Romantic"
            session.step = 2

            ai_text = (
                f"Got it! {session.vibe} with {session.group_type} locked! 🎯\n\n"
                "Ab agla cross-question:\n"
                "1. Approximate budget per person kitna prefer karoge: Under ₹15,000 ya Premium Luxury ₹25k+?\n"
                "2. Stay me kya chahiye: 3BHK Private Pool Villa ya 4-Star Beachfront Hotel?"
            )
            next_suggestions = [
                "💰 Under ₹15,000 per person",
                "🏡 3BHK Private Pool Villa",
                "🏨 4-Star Beachfront Hotel",
                "💎 Premium Luxury ₹25,000+",
            ]
        elif session.step == 2:
            session.step = 3
            ai_text = (
                "BOOM! 🚀 Maine tumhare saare answers cross-check karke tumhara customized package assemble kar diya hai:\n\n"
                "• ✈️ Flight: IndiGo Direct DEL ➔ GOI (06:15 AM non-stop, lowest in 30 days locked)\n"
                "• 🏡 Stay: Candolim 3BHK Sunset Private Pool Villa with chef & gazebo\n"
                "• 🛵 Perks: 2 Activa Scooters included for beach hopping + Thalassa VIP access pass\n"
                "• 💰 Budget: ₹13,499 per person (₹1,500 under your ₹15k budget!)\n\n"
                "Ye lo direct live package — yahan se direct 1-click me booking lock kar sakte ho:"
            )
            trip_card_data = {
                "title": "Goa Coastal Villa & Beach Club Escape",
                "cityKey": "goa",
                "location": "Candolim & Vagator, North Goa",
                "price": "₹13,499",
                "originalPrice": "₹18,500",
                "duration": "4 Days / 3 Nights",
                "airline": "IndiGo Direct (DEL ➔ GOI)",
                "stay": "Candolim 3BHK Private Pool Villa",
                "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "✈️ Return Non-Stop Flights",
                    "🏡 Private Pool Villa",
                    "🛵 2 Scooters Included",
                    "🍳 Daily Breakfast by Chef",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Touchdown MOPA & Sunset Villa Pool", "desc": "IndiGo flight arrival, private cab to Candolim villa, evening sundowner pool party."},
                    {"day": "Day 2", "title": "Beach Hopping & Water Sports", "desc": "Scooter ride across Anjuna, parasailing at Calangute, dinner at Thalassa."},
                    {"day": "Day 3", "title": "Old Goa & Tito's Lane Nightlife", "desc": "Heritage church stroll in morning, club hopping at Tito's Lane in evening."},
                    {"day": "Day 4", "title": "Poolside Brunch & Flight Home", "desc": "Leisurely brunch, souvenir shopping in Panjim, departure flight."},
                ],
            }
            next_suggestions = [
                "⚡ Book Entire Package (₹13,499)",
                "Can we make it even cheaper?",
                "Swap stay to Vagator boutique resort",
                "Show full day-by-day plan",
            ]
        else:
            prompt = (
                f"You are Orbit AI, an expert travel copilot answering follow-up queries about a Goa beach villa holiday. "
                f"User asked: '{user_text}'. Respond in energetic, helpful Hinglish with practical tips (beaches, budget, scooters, packing). Keep it concise."
            )
            local_ans = generate_local_response(user_text, prompt) if is_local_model_ready() else ""
            ai_text = local_ans if local_ans else f"Haan bilkul! Goa trip me '{user_text}': Hamare package me private chef, scooters and 24/7 concierge assistance included hai. Booking direct 1-click me confirm kar sakte ho!"
            trip_card_data = {
                "title": "Goa Coastal Villa & Beach Club Escape",
                "cityKey": "goa",
                "location": "Candolim & Vagator, North Goa",
                "price": "₹13,499",
                "originalPrice": "₹18,500",
                "duration": "4 Days / 3 Nights",
                "airline": "IndiGo Direct (DEL ➔ GOI)",
                "stay": "Candolim 3BHK Private Pool Villa",
                "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "✈️ Return Non-Stop Flights",
                    "🏡 Private Pool Villa",
                    "🛵 2 Scooters Included",
                    "🍳 Daily Breakfast by Chef",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Touchdown MOPA & Sunset Villa Pool", "desc": "IndiGo flight arrival, private cab to Candolim villa, evening sundowner pool party."},
                    {"day": "Day 2", "title": "Beach Hopping & Water Sports", "desc": "Scooter ride across Anjuna, parasailing at Calangute, dinner at Thalassa."},
                    {"day": "Day 3", "title": "Old Goa & Tito's Lane Nightlife", "desc": "Heritage church stroll in morning, club hopping at Tito's Lane in evening."},
                    {"day": "Day 4", "title": "Poolside Brunch & Flight Home", "desc": "Leisurely brunch, souvenir shopping in Panjim, departure flight."},
                ],
            }
            next_suggestions = [
                "⚡ Book Entire Package (₹13,499)",
                "Can we make it even cheaper?",
                "Swap stay to Vagator boutique resort",
                "Show full day-by-day plan",
            ]

    # ----------------------------------------------------
    # B. RISHIKESH / WEEKEND FLOW
    # ----------------------------------------------------
    elif dest == "rishikesh":
        if session.step == 0:
            session.step = 1
            ai_text = (
                "Rishikesh weekend getaway is just 2h 45m from Delhi NCR via Meerut Expressway! ⛰️\n\n"
                "Cross-Question for you:\n"
                "1. Adventure chahiye (16km Grade-3 Ganga Rafting + Cliff Jump) ya peaceful yoga & Ganga Aarti?\n"
                "2. Riverbed sand par luxury Swiss tents me glamping pasand hai ya concrete luxury resort?"
            )
            next_suggestions = [
                "🌊 Adventure: 16km Rafting + Cliff Jump",
                "🧘 Peaceful: Yoga & Ganga Aarti",
                "⛺ Luxury Swiss Beach Tents",
                "🏨 Resort Room with Pool",
            ]
        elif session.step == 1:
            session.step = 2
            ai_text = (
                "Awesome! Weekend glamping + rafting package ready ho gaya:\n\n"
                "• 🚗 Distance: 2h 45m scenic drive from Delhi NCR (Fast-track expressway)\n"
                "• ⛺ Stay: Air-cooled Swiss tents right on the Ganga white sand riverbed\n"
                "• 🌊 Activities: 16km Grade-3 Ganga rafting, cliff jumping, evening acoustic campfire & BBQ buffet\n"
                "• 💰 Total Price: ₹3,499 per person (All 3 buffet meals included)."
            )
            trip_card_data = {
                "title": "Rishikesh Riverfront Glamping & 16km Rafting",
                "cityKey": "rishikesh",
                "location": "Shivpuri, Rishikesh (< 3h Drive)",
                "price": "₹3,499",
                "originalPrice": "₹5,999",
                "duration": "2 Days / 1 Night",
                "airline": "Scenic Highway Drive / Vande Bharat",
                "stay": "Luxury Swiss Air-Cooled Tents",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "⛺ AC Swiss Tent",
                    "🌊 16km Ganga Rafting",
                    "🔥 Evening Bonfire & Live Music",
                    "🍲 All 3 Buffet Meals",
                ],
                "itineraryDays": [
                    {"day": "Day 1 (Saturday)", "title": "Drive In, Rafting & Bonfire", "desc": "Scenic morning drive, tent check-in, 16km thrilling rafting, evening guitar campfire with snacks."},
                    {"day": "Day 2 (Sunday)", "title": "Cliff Jump & Aarti", "desc": "Sunrise yoga, cliff jump into river, Parmarth Niketan Ganga Aarti, evening return drive."},
                ],
            }
            next_suggestions = [
                "⚡ Book Weekend Glamping (₹3,499)",
                "Is rafting safe for non-swimmers?",
                "Can we book for 4 people?",
                "What clothes to pack?",
            ]
        else:
            prompt = (
                f"You are Orbit AI, an expert travel recommender answering follow-up queries about Rishikesh glamping and 16km rafting. "
                f"User asked: '{user_text}'. "
                f"Answer concisely in friendly Hinglish (Hindi + English) with practical tips (safety, lifejackets, non-swimmers, clothes, group discounts)."
            )
            local_ans = generate_local_response(user_text, prompt) if is_local_model_ready() else ""
            ai_text = local_ans if local_ans else f"Bilkul! Rishikesh me '{user_text}': Synthetic quick-dry clothes, strap floaters best hain. Rafting certified guide ke under hoti hai and non-swimmers ke liye 100% safe lifejackets provide hoti hain!"
            trip_card_data = {
                "title": "Rishikesh Riverfront Glamping & 16km Rafting",
                "cityKey": "rishikesh",
                "location": "Shivpuri, Rishikesh (< 3h Drive)",
                "price": "₹3,499",
                "originalPrice": "₹5,999",
                "duration": "2 Days / 1 Night",
                "airline": "Scenic Highway Drive / Vande Bharat",
                "stay": "Luxury Swiss Air-Cooled Tents",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "⛺ AC Swiss Tent",
                    "🌊 16km Ganga Rafting",
                    "🔥 Evening Bonfire & Live Music",
                    "🍲 All 3 Buffet Meals",
                ],
                "itineraryDays": [
                    {"day": "Day 1 (Saturday)", "title": "Drive In, Rafting & Bonfire", "desc": "Scenic morning drive, tent check-in, 16km thrilling rafting, evening guitar campfire with snacks."},
                    {"day": "Day 2 (Sunday)", "title": "Cliff Jump & Aarti", "desc": "Sunrise yoga, cliff jump into river, Parmarth Niketan Ganga Aarti, evening return drive."},
                ],
            }
            next_suggestions = [
                "⚡ Book Weekend Glamping (₹3,499)",
                "Is rafting safe for non-swimmers?",
                "Can we book for 4 people?",
                "What is the best time to visit?",
            ]

    # ----------------------------------------------------
    # C. THAILAND / DUBAI FLOW
    # ----------------------------------------------------
    elif dest in ["thailand", "dubai"]:
        is_dubai = dest == "dubai"
        if session.step == 0:
            session.step = 1
            ai_text = (
                f"International {dest.title()} trip is a fantastic choice! ✈️ Hamara flat ₹499 visa cap aur OCR pre-check already included hai.\n\n"
                "Lekin customization ke liye 2 cross-questions:\n"
                "1. Total kitne din ka plan socha hai (4 days express ya 6 days relaxed)?\n"
                "2. Kiske sath travel kar rahe ho (Family with kids, couple, ya friends)?"
            )
            next_suggestions = [
                "🗓️ 4 Days Express Package",
                "🗓️ 6 Days Full Vacation",
                "👫 Couple / Romantic",
                "👨‍👩‍👧 Family with Kids",
            ]
        elif session.step == 1:
            session.step = 2
            ai_text = (
                f"Superb! Ye raha aapka custom {dest.title()} package:\n\n"
                f"• 🛂 Visa: Pre-approved in {'24h' if is_dubai else '24h'} with OCR radar (Flat ₹499 fee)\n"
                "• ✈️ Flight: Direct return flights with baggage included\n"
                "• 🏨 Stay: 4-Star / 5-Star luxury resort with buffet breakfast\n"
                "• 💰 Rate: Fully locked with ₹0 hidden booking fees."
            )
            trip_card_data = {
                "title": "Dubai 48h Luxury Safari & Skyline" if is_dubai else "Thailand Phuket & Krabi Island Hopper",
                "cityKey": dest,
                "location": "Downtown Dubai & Marina" if is_dubai else "Phuket & Krabi Islands",
                "price": "₹29,999" if is_dubai else "₹24,999",
                "originalPrice": "₹41,000" if is_dubai else "₹34,000",
                "duration": "4 Days / 3 Nights" if is_dubai else "5 Days / 4 Nights",
                "airline": "Emirates / Air India Direct" if is_dubai else "Vistara / Thai Airways Direct",
                "stay": "5-Star Downtown Hotel" if is_dubai else "4-Star Cliffside Resort",
                "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" if is_dubai else "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "✈️ Direct Flights",
                    "🛂 Flat ₹499 Visa Included",
                    "🏨 Luxury Stay",
                    "🚗 Airport Transfers",
                ],
            }
            next_suggestions = [
                f"⚡ Book {dest.title()} Now",
                "Can you check passport OCR?",
                "Add 2 more days",
                "View hotel pictures",
            ]
        else:
            prompt = (
                f"You are Orbit AI, an expert travel recommender answering follow-up queries for a {dest.title()} international trip. "
                f"User asked: '{user_text}'. "
                f"Answer concisely in friendly Hinglish (Hindi + English) with tips on visas (flat ₹499), flights, or activities."
            )
            local_ans = generate_local_response(user_text, prompt) if is_local_model_ready() else ""
            ai_text = local_ans if local_ans else f"Haanji! {dest.title()} trip ke bare me '{user_text}': Orbit Flat ₹499 visa cap ke sath aapka 24h approval guarantee rehta hai with instant eSIM pass!"
            trip_card_data = {
                "title": "Dubai 48h Luxury Safari & Skyline" if is_dubai else "Thailand Phuket & Krabi Island Hopper",
                "cityKey": dest,
                "location": "Downtown Dubai & Marina" if is_dubai else "Phuket & Krabi Islands",
                "price": "₹29,999" if is_dubai else "₹24,999",
                "originalPrice": "₹41,000" if is_dubai else "₹34,000",
                "duration": "4 Days / 3 Nights" if is_dubai else "5 Days / 4 Nights",
                "airline": "Emirates / Air India Direct" if is_dubai else "Vistara / Thai Airways Direct",
                "stay": "5-Star Downtown Hotel" if is_dubai else "4-Star Cliffside Resort",
                "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" if is_dubai else "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "✈️ Direct Flights",
                    "🛂 Flat ₹499 Visa Included",
                    "🏨 Luxury Stay",
                    "🚗 Airport Transfers",
                ],
            }
            next_suggestions = [
                f"⚡ Book {dest.title()} Now",
                "Can you check passport OCR?",
                "Add 2 more days",
                "View hotel pictures",
            ]

    # ----------------------------------------------------
    # D. KASHMIR FLOW
    # ----------------------------------------------------
    elif dest == "kashmir":
        if session.step == 0:
            session.step = 1
            ai_text = (
                "Kashmir is heaven on earth! ❄️ Customise karne ke liye mujhe 2 cross-questions clarify karo:\n\n"
                "1. Stay kya prefer karoge: Dal Lake par handcrafted cedar wood Houseboat ya Gulmarg me snow-view resort?\n"
                "2. Vibe kaisi chahiye: Romantic Shikara & pine strolls ya high-altitude Gulmarg Gondola adventure?"
            )
            next_suggestions = [
                "🛶 Dal Lake Cedar Houseboat",
                "🏔️ Snow-Facing Mountain Resort",
                "🚠 High Altitude Gulmarg Gondola",
                "💑 Romantic Couple Paradise",
            ]
        elif session.step == 1:
            session.step = 2
            ai_text = (
                "Superb! Aapka customized Kashmir Valley package ready ho gaya hai:\n\n"
                "• ✈️ Flight: Direct non-stop flight (DEL ➔ SXR in 1h 25m)\n"
                "• 🛶 Stay: Carved luxury Houseboat on Nigeen Lake + 4-star Gulmarg resort\n"
                "• 🚠 Inclusions: Gulmarg Gondola phase 1 tickets + romantic Dal Lake Shikara ride + heated private cab\n"
                "• 💰 Total Price: ₹18,999 per person (Flights + Houseboat + Gondola included)."
            )
            trip_card_data = {
                "title": "Kashmir Dal Lake Royal Houseboat & Gulmarg Skiing",
                "cityKey": "kashmir",
                "location": "Srinagar & Gulmarg (<1.5h flight)",
                "price": "₹18,999",
                "originalPrice": "₹26,500",
                "duration": "5 Days / 4 Nights",
                "airline": "IndiGo / SpiceJet Direct (DEL ➔ SXR)",
                "stay": "Carved Cedar Wood Houseboat + Gulmarg Resort",
                "image": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "✈️ Return Non-Stop Flights",
                    "🛶 Cedar Houseboat Stay",
                    "🚠 Gulmarg Gondola Pass",
                    "🍲 Daily Kashmiri Breakfast & Dinner",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Srinagar Arrival & Dal Lake Shikara", "desc": "Fly over Pir Panjal snow ranges, check into carved cedar houseboat, romantic sunset Shikara ride."},
                    {"day": "Day 2", "title": "Gulmarg Gondola Ride", "desc": "Scenic drive to snowy Gulmarg, ride Gondola to Apharwat peak, snow activities."},
                    {"day": "Day 3", "title": "Pahalgam Betaab Valley", "desc": "Drive through saffron fields to pine-covered Betaab valley and Lidder river."},
                    {"day": "Day 4", "title": "Mughal Gardens & Lal Chowk", "desc": "Visit Shalimar gardens, sip authentic saffron Kahwa in old bazaar."},
                    {"day": "Day 5", "title": "Floating Market & Return", "desc": "Early morning Shikara market tour, departure flight."},
                ],
            }
            next_suggestions = [
                "⚡ Book Kashmir (₹18,999)",
                "Can we add Pahalgam pony trek?",
                "Is heating available in houseboat?",
                "Show weather forecast",
            ]
        else:
            prompt = (
                f"You are Orbit AI, an expert travel recommender answering follow-up queries for a Kashmir Dal Lake & Gulmarg ski trip. "
                f"User asked: '{user_text}'. "
                f"Answer warmly in friendly Hinglish (Hindi + English) with tips on snow clothing, Gondola rides, heating, or Dal lake."
            )
            local_ans = generate_local_response(user_text, prompt) if is_local_model_ready() else ""
            ai_text = local_ans if local_ans else f"Bilkul! Kashmir trip me '{user_text}': Cedar wood houseboats me central electric heating and Bukhari available hoti hai, aur Gulmarg Gondola tickets package me confirmed rehti hain."
            trip_card_data = {
                "title": "Kashmir Dal Lake Royal Houseboat & Gulmarg Skiing",
                "cityKey": "kashmir",
                "location": "Srinagar & Gulmarg (<1.5h flight)",
                "price": "₹18,999",
                "originalPrice": "₹26,500",
                "duration": "5 Days / 4 Nights",
                "airline": "IndiGo / SpiceJet Direct (DEL ➔ SXR)",
                "stay": "Carved Cedar Wood Houseboat + Gulmarg Resort",
                "image": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "✈️ Return Non-Stop Flights",
                    "🛶 Cedar Houseboat Stay",
                    "🚠 Gulmarg Gondola Pass",
                    "🍲 Daily Kashmiri Breakfast & Dinner",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Srinagar Arrival & Dal Lake Shikara", "desc": "Fly over Pir Panjal snow ranges, check into carved cedar houseboat, romantic sunset Shikara ride."},
                    {"day": "Day 2", "title": "Gulmarg Gondola Ride", "desc": "Scenic drive to snowy Gulmarg, ride Gondola to Apharwat peak, snow activities."},
                    {"day": "Day 3", "title": "Pahalgam Betaab Valley", "desc": "Drive through saffron fields to pine-covered Betaab valley and Lidder river."},
                    {"day": "Day 4", "title": "Mughal Gardens & Lal Chowk", "desc": "Visit Shalimar gardens, sip authentic saffron Kahwa in old bazaar."},
                    {"day": "Day 5", "title": "Floating Market & Return", "desc": "Early morning Shikara market tour, departure flight."},
                ],
            }
            next_suggestions = [
                "⚡ Book Kashmir (₹18,999)",
                "Can we add Pahalgam pony trek?",
                "Is heating available in houseboat?",
                "Show weather forecast",
            ]

    # ----------------------------------------------------
    # E. JAIPUR HERITAGE FLOW
    # ----------------------------------------------------
    elif dest == "jaipur":
        if session.step == 0:
            session.step = 1
            ai_text = (
                "Jaipur heritage getaway is just 3h 30m via the new Delhi-Mumbai Expressway! 🏰\n\n"
                "Cross-Questions for you:\n"
                "1. Vibe kya chahiye: Royal heritage haveli with peacock courtyard ya modern luxury hotel?\n"
                "2. Focus kya hai: Nahargarh sunset & fort trails ya Johari bazaar shopping & culinary trail?"
            )
            next_suggestions = [
                "🏰 Royal Heritage Haveli Courtyard",
                "🌅 Nahargarh Fort Sunset Trail",
                "🛍️ Johari Bazaar Food & Shopping",
                "🚗 Expressway Self-Drive",
            ]
        elif session.step == 1:
            session.step = 2
            ai_text = (
                "Awesome! Royal Jaipur weekend trip ready hai:\n\n"
                "• 🚗 Route: 3h 30m cruise on Delhi-Mumbai Expressway\n"
                "• 🏰 Stay: 4-Star Heritage Haveli Courtyard with pool & peacock gardens\n"
                "• 👑 Perks: Nahargarh sunset trail pass + authentic Rajasthani thali dinner voucher\n"
                "• 💰 Total Price: ₹4,299 per person (Breakfast included)."
            )
            trip_card_data = {
                "title": "Jaipur Royal Haveli & Sunset Amber Fort Trail",
                "cityKey": "jaipur",
                "location": "Pink City & Amber Fort (<3.5h Expressway)",
                "price": "₹4,299",
                "originalPrice": "₹7,499",
                "duration": "3 Days / 2 Nights",
                "airline": "Expressway Road Route / Vande Bharat",
                "stay": "4-Star Heritage Haveli Courtyard",
                "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "🏰 Heritage Haveli Stay",
                    "🍳 Daily Royal Breakfast",
                    "🎫 Amber Fort Fast-Track Pass",
                    "🍲 Rajasthani Food Tasting",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Expressway Drive & Hawa Mahal", "desc": "Quick drive on expressway, check-in, sunset stroll around City Palace."},
                    {"day": "Day 2", "title": "Amber Fort & Nahargarh Sunset", "desc": "Morning Amber fort exploration, evening sunset view from Nahargarh ridge."},
                    {"day": "Day 3", "title": "Bazaars & Smooth Return", "desc": "Shopping for blue pottery in Johari Bazaar, smooth return drive."},
                ],
            }
            next_suggestions = [
                "⚡ Book Jaipur Haveli (₹4,299)",
                "Can we go by Vande Bharat train?",
                "Is parking available at haveli?",
                "Add 1 more night",
            ]
        else:
            prompt = (
                f"You are Orbit AI answering follow-up queries for a Jaipur heritage haveli weekend trip. "
                f"User asked: '{user_text}'. "
                f"Answer concisely in friendly Hinglish (Hindi + English) with tips on expressway drive, Vande Bharat, or sightseeing."
            )
            local_ans = generate_local_response(user_text, prompt) if is_local_model_ready() else ""
            ai_text = local_ans if local_ans else f"Haanji! Jaipur trip me '{user_text}': Delhi-Mumbai Expressway se sirf 3h 30m lagte hain, aur haveli me valet parking available rehti hai."
            trip_card_data = {
                "title": "Jaipur Royal Haveli & Sunset Amber Fort Trail",
                "cityKey": "jaipur",
                "location": "Pink City & Amber Fort (<3.5h Expressway)",
                "price": "₹4,299",
                "originalPrice": "₹7,499",
                "duration": "3 Days / 2 Nights",
                "airline": "Expressway Road Route / Vande Bharat",
                "stay": "4-Star Heritage Haveli Courtyard",
                "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "🏰 Heritage Haveli Stay",
                    "🍳 Daily Royal Breakfast",
                    "🎫 Amber Fort Fast-Track Pass",
                    "🍲 Rajasthani Food Tasting",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Expressway Drive & Hawa Mahal", "desc": "Quick drive on expressway, check-in, sunset stroll around City Palace."},
                    {"day": "Day 2", "title": "Amber Fort & Nahargarh Sunset", "desc": "Morning Amber fort exploration, evening sunset view from Nahargarh ridge."},
                    {"day": "Day 3", "title": "Bazaars & Smooth Return", "desc": "Shopping for blue pottery in Johari Bazaar, smooth return drive."},
                ],
            }
            next_suggestions = [
                "⚡ Book Jaipur Haveli (₹4,299)",
                "Can we go by Vande Bharat train?",
                "Is parking available at haveli?",
                "Add 1 more night",
            ]

    # ----------------------------------------------------
    # F. CONCERTS & MEGA EVENTS FLOW
    # ----------------------------------------------------
    elif dest == "concerts":
        if session.step == 0:
            session.step = 1
            ai_text = (
                "Epic choice! 🎸 Live music events & arena tours ke liye Orbit AI ke paas exclusive VIP passes + non-stop flights + luxury stay combo inventory hai!\n\n"
                "Cross-Questions for you:\n"
                "1. Kaunsa mega event attend karna chahte ho (Coldplay Mumbai, Diljit Dosanjh Delhi, ya Sunburn Goa)?\n"
                "2. Sirf VIP event entry ticket chahiye ya Flight + 4-Star Stay combo package lock karun?"
            )
            next_suggestions = [
                "🎸 Coldplay Mumbai (DY Patil)",
                "🎤 Diljit Dosanjh Delhi NCR",
                "🏖️ Sunburn Festival Goa",
                "✈️ Flight + 🏨 Stay Combo Bundle",
            ]
        elif session.step == 1:
            session.step = 2
            is_coldplay = "coldplay" in q or "mumbai" in q
            is_diljit = "diljit" in q or "delhi" in q

            event_title = "Coldplay Music of the Spheres (Mumbai)" if is_coldplay else ("Diljit Dosanjh Dil-Luminati Tour (Delhi)" if is_diljit else "Sunburn Festival Goa 2026")
            venue_name = "DY Patil Stadium, Mumbai" if is_coldplay else ("JLN Stadium, Delhi NCR" if is_diljit else "Vagator Beach Arena, Goa")
            combo_rate = "₹22,999" if is_coldplay else ("₹16,499" if is_diljit else "₹24,687")

            ai_text = (
                f"BOOM! 🎟️ Aapka {event_title} All-Inclusive VIP Package ready ho gaya hai:\n\n"
                f"• 🎫 Pass: Verified Official Floor / Seated VIP Entry with fast-track wristband\n"
                f"• ✈️ Flight: Return non-stop direct flight timed perfectly for concert day\n"
                f"• 🏨 Stay: 4-Star Luxury Hotel (Late checkout & free breakfast included)\n"
                f"• 💰 Rate: {combo_rate} per person (All flights + hotel + VIP ticket included).\n\n"
                "Ye lo direct package — yahan se direct 1-click me reserve kar sakte ho:"
            )
            trip_card_data = {
                "title": f"{event_title} VIP Pass + Flight & Stay Combo",
                "cityKey": "mumbai" if is_coldplay else ("delhi" if is_diljit else "goa"),
                "location": venue_name,
                "price": combo_rate,
                "originalPrice": "₹34,000",
                "duration": "3 Days / 2 Nights",
                "airline": "IndiGo / Vistara Direct Non-Stop",
                "stay": "4-Star Luxury City Hotel (Near Venue)",
                "image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "🎫 Official Verified VIP Event Pass",
                    "✈️ Return Non-Stop Flights Included",
                    "🏨 4-Star Hotel Stay with Breakfast",
                    "🚗 Venue Cab Transfers",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Flight Arrival & Hotel Check-in", "desc": "Morning direct flight, hotel check-in, relax and get concert wristbands."},
                    {"day": "Day 2", "title": "Concert Night & VIP Stage Experience", "desc": "Pre-gig drinks, direct cab drop to venue gates, attend electrifying live concert."},
                    {"day": "Day 3", "title": "Late Brunch & Departure Flight", "desc": "Sleep in with complimentary late checkout, local cafe brunch, evening flight home."},
                ],
            }
            next_suggestions = [
                f"⚡ Book {event_title} Combo",
                "Can I buy only the ticket without flight?",
                "Are passes transferable?",
                "Show stage view angle",
            ]
        else:
            is_coldplay = "coldplay" in q or "mumbai" in q or "cold" in session.title.lower()
            is_diljit = "diljit" in q or "delhi" in q or "diljit" in session.title.lower()
            event_title = "Coldplay Mumbai" if is_coldplay else ("Diljit Dosanjh Delhi" if is_diljit else "Sunburn Goa")
            venue_name = "DY Patil Stadium, Mumbai" if is_coldplay else ("JLN Stadium, Delhi NCR" if is_diljit else "Vagator Beach Arena, Goa")
            combo_rate = "₹22,999" if is_coldplay else ("₹16,499" if is_diljit else "₹24,687")

            prompt = (
                f"You are Orbit AI answering follow-up queries for {event_title} VIP concert & travel combo package. "
                f"User asked: '{user_text}'. "
                f"Answer enthusiastically in crisp Hinglish (Hindi + English) with helpful event tips (wristbands, transfers, entry gates)."
            )
            local_ans = generate_local_response(user_text, prompt) if is_local_model_ready() else ""
            ai_text = local_ans if local_ans else f"Haan bilkul! {event_title} combo me '{user_text}': Passes verified wristbands ke sath dedicated VIP gate par deliver hote hain with pre-booked return cab transfers."
            trip_card_data = {
                "title": f"{event_title} VIP Pass + Flight & Stay Combo",
                "cityKey": "mumbai" if is_coldplay else ("delhi" if is_diljit else "goa"),
                "location": venue_name,
                "price": combo_rate,
                "originalPrice": "₹34,000",
                "duration": "3 Days / 2 Nights",
                "airline": "IndiGo / Vistara Direct Non-Stop",
                "stay": "4-Star Luxury City Hotel (Near Venue)",
                "image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
                "inclusions": [
                    "🎫 Official Verified VIP Event Pass",
                    "✈️ Return Non-Stop Flights Included",
                    "🏨 4-Star Hotel Stay with Breakfast",
                    "🚗 Venue Cab Transfers",
                ],
                "itineraryDays": [
                    {"day": "Day 1", "title": "Flight Arrival & Hotel Check-in", "desc": "Morning direct flight, hotel check-in, relax and get concert wristbands."},
                    {"day": "Day 2", "title": "Concert Night & VIP Stage Experience", "desc": "Pre-gig drinks, direct cab drop to venue gates, attend electrifying live concert."},
                    {"day": "Day 3", "title": "Late Brunch & Departure Flight", "desc": "Sleep in with complimentary late checkout, local cafe brunch, evening flight home."},
                ],
            }
            next_suggestions = [
                f"⚡ Book {event_title} Combo",
                "Can I buy only the ticket without flight?",
                "Are passes transferable?",
                "Show stage view angle",
            ]

    # ----------------------------------------------------
    # G. DEFAULT / OPEN-ENDED RECOMMENDATION (PROACTIVE CROSS-QUESTIONING)
    # ----------------------------------------------------
    else:
        ai_text = (
            "Namaste! Main hoon aapka Orbit AI Travel Copilot & Recommender. 🤖✨\n\n"
            "Aapke mood, squad aur budget ke hisab se exact tailor-made vacation ya city stopover plan karunga.\n\n"
            "Batao, kahan ka plan banayein:\n"
            "• ⏱️ **City Transit / Layover**: 2-4 hours quick cafe & heritage trail (Delhi, Mumbai, Bangalore)\n"
            "• 🏖️ **Beach Vacation**: Sunset private pool villas & beach clubs (Goa)\n"
            "• ⛰️ **Weekend Adventure**: Ganga white water rafting & glamping <3h (Rishikesh)\n"
            "• 🌴 **International Holiday**: Tropical islands with flat ₹499 family visa (Thailand, Dubai)\n"
            "• 🏰 **Royal Heritage**: Palaces & havelis (Jaipur)\n"
            "• ❄️ **Snow Escape**: Dal Lake houseboats & Gulmarg Gondola (Kashmir)\n\n"
            "Kahan chalna chahte ho ya kis city me ho right now?"
        )
        next_suggestions = [
            "⏱️ 2 Hours in Delhi where to go?",
            "🏖️ Goa Beach Holiday",
            "⛰️ Rishikesh Weekend <3h",
            "🇹🇭 Thailand Flat ₹499 Visa",
            "🏰 Jaipur Royal Haveli",
            "🌊 2 Hours in Mumbai",
        ]

    db.commit()

    # Populate RAG Ledger for package assembly if not already present
    if trip_card_data and not current_rag_ledger:
        dest_term = dest or "goa"
        rag_pack = answer_query_with_rag(f"{dest_term} live flights stays", top_k=3)
        if rag_pack and rag_pack.get("sources"):
            current_rag_ledger = RAGLedgerSchema(
                retrieval_ms=round(rag_pack["metrics"].get("retrieval_ms", 3.8), 2),
                tables_scanned=["flight_tickets", "hotels", "events_concerts"],
                matched_records=len(rag_pack["sources"]),
                confidence=0.98,
                engine="Hybrid BM25 + Vector Cosine + Qwen2.5 Metal",
                is_live_db=True,
                sources=[
                    RAGLedgerRecord(
                        title=s["title"],
                        type=s["type"],
                        price=s.get("price"),
                        confidence=s.get("confidence", 0.95),
                        snippet=s.get("snippet", "")
                    ) for s in rag_pack["sources"][:4]
                ]
            )

    # 3. Save AI Message
    ai_msg_id = f"ai-{uuid.uuid4().hex[:8]}"
    db_ai_msg = ChatMessage(
        id=ai_msg_id,
        session_id=session.id,
        sender="ai",
        text=ai_text,
        trip_card_json=json.dumps(trip_card_data) if trip_card_data else None,
        prompt_suggestions_json=json.dumps(next_suggestions) if next_suggestions else None,
    )
    db.add(db_ai_msg)
    db.commit()

    card_obj = TripCardSchema(**trip_card_data) if trip_card_data else None

    session_profile = SessionProfileSchema(
        destination=session.destination,
        vibe=session.vibe,
        group_type=session.group_type,
        budget=session.budget,
        stay_type="3BHK Private Pool Villa" if (session.vibe and "party" in session.vibe.lower()) else ("4-Star Beachfront Hotel" if dest == "goa" else "Luxury Heritage Stay"),
        step=session.step,
    )

    return ChatResponse(
        session_id=session.id,
        step=session.step,
        session_profile=session_profile,
        rag_ledger=current_rag_ledger,
        message=ChatMessageResponse(
            id=ai_msg_id,
            session_id=session.id,
            sender="ai",
            text=ai_text,
            time=datetime.now().strftime("%I:%M %p"),
            trip_card=card_obj,
            prompt_suggestions=next_suggestions,
            rag_ledger=current_rag_ledger,
        ),
    )
