"""
Orbit Travel OS — Anthropic Claude 3.5 / 3.7 Sonnet Deep Reasoning Travel Brain.

Acts as an elite travel strategist and urban concierge:
- Thinks deeply about time budgets, spatial geometry, city traffic, opening hours, local weather, and hidden local gems.
- Formulates micro-itineraries for 1-3 hour short escapes ("agar mai bahar jao 3 ghante", "2 hours in Delhi", "transit layover")
  with exact minute-by-minute breakdowns, transport modes (metro/cab), cost estimates, and vibe matching.
- Speaks in authentic, witty, high-energy conversational Hinglish (Hindi + English).
- Grounds recommendations in real-time Orbit database facts (flights, hotels, events, visas, distressed drops) via Hybrid RAG.
- Generates structured JSON metadata with thinking/reasoning, conversational answer, trip card, prompt suggestions, and timeline steps.
"""

import os
import re
import json
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    # Look for .env in current directory and parent directories
    load_dotenv()
    env_backend = Path(__file__).resolve().parent / ".env"
    if env_backend.exists():
        load_dotenv(dotenv_path=env_backend)
except Exception:
    pass

logger = logging.getLogger("orbit.claude_agent")

DEFAULT_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")


def get_anthropic_api_key(passed_key: Optional[str] = None, header_key: Optional[str] = None) -> Optional[str]:
    """
    Resolve Anthropic API key with priority:
    1. passed_key (from request body `api_key`)
    2. header_key (from request header `x-anthropic-api-key`)
    3. ANTHROPIC_API_KEY environment variable
    """
    if passed_key and passed_key.strip():
        return passed_key.strip()
    if header_key and header_key.strip():
        return header_key.strip()
    env_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if env_key:
        return env_key
    return None


def is_claude_available(passed_key: Optional[str] = None, header_key: Optional[str] = None) -> bool:
    """Check if a valid Anthropic API key is available."""
    key = get_anthropic_api_key(passed_key, header_key)
    return bool(key and len(key) > 8)


def get_curated_destination_image(city_key: str) -> str:
    """Curated high-res Unsplash travel images for trip cards."""
    images = {
        "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
        "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
        "bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
        "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        "rishikesh": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        "jaipur": "https://images.unsplash.com/photo-1603258849062-114400490b6a?auto=format&fit=crop&w=1200&q=80",
        "kashmir": "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80",
        "thailand": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
        "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
        "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "corbett": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
        "concerts": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    }
    return images.get(city_key.lower(), "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80")


SYSTEM_PROMPT = """You are the Orbit AI Deep Reasoning Travel Strategist, powered by Anthropic Claude 3.5 Sonnet for the Orbit Travel Superapp (India's premier travel OS).

Your mission is to think deeply and architect flawless, exhilarating, realistic travel experiences. You are not a generic textbook tourist guide; you are an elite urban strategist, local concierge, and savvy travel hacker.

### CORE COGNITIVE CAPABILITIES:

1. **Spatial & Time Geometry Thinking**:
   - Always calculate realistic point-to-point transit times.
   - Account for real city bottlenecks:
     * Delhi NCR: Peak-hour DND Flyway, Gurgaon toll gates, Ring Road chokepoints. Prioritize the Airport Express Orange Line (135 km/h, 5m to Aerocity, 20m to CP Shivaji Stadium).
     * Mumbai: Western Express Highway jams, BKC crawling traffic, Bandra-Worli Sea Link shortcuts, local train fast corridors.
     * Bangalore: Silk Board, Outer Ring Road, Marathahalli bottlenecks. Advise Purple/Green Namma Metro where viable.
   - Factor in flight/train buffers: Check-in, security baggage scan, and airport cloakrooms.

2. **Micro-Itinerary Architecture (1 to 3 Hour Escapes)**:
   - When a user asks what they can do in 1, 2, or 3 hours (e.g. "agar mai bahar jao 3 ghante", "2 hours in Delhi", "short transit layover", "3 hour quick escape"):
     Formulate an exact minute-by-minute breakdown:
     * **Segment 1 (0 to 20/25m)**: Fast-Track Transit / Arrival. Specify exact transport mode (e.g. "Orange Line Airport Express Metro from T3" or "Pre-booked AC Cab").
     * **Segment 2 (25 to 80/85m)**: Prime Iconic Anchor Spot. A cultural, architectural, scenic or high-vibe landmark (e.g. Gurudwara Bangla Sahib Sarovar, Sunder Nursery heritage walk, Bandra Ranwar Village).
     * **Segment 3 (85 to 140/145m)**: Curated Artisanal Cafe / Signature Food Stop. Exact signature items to order (e.g. pour-over at Blue Tokai / Subko, mutton patty at Wenger's, artisanal sourdough, cold brew).
     * **Segment 4 (145 to 180m)**: Safety Buffer & Return Transit. Guarantees 100% stress-free return to the airport terminal or train station with time to spare.
   - Always provide an estimated total expense in INR (₹) and transport mode.

3. **Conversational Hinglish Tone**:
   - Speak in natural, high-energy, authentic Hinglish (Hindi + English blended like young, stylish Indian travelers talk).
   - Use warm, relatable expressions ("Bhai scene sorted hai", "zero rush", "mast pour-over coffee", "hassle-free gate return", "direct fast-track").
   - Clear bullet points with emojis, no boring academic monologues.

4. **Grounded Real-Time Orbit Database Facts (RAG Grounding)**:
   - When provided with Orbit Live Database context (flights, hotels, events, visas, flash drops, GST rules), seamlessly cite verified real-time prices, flight numbers, property names, and pass rules.

5. **STRICT JSON OUTPUT REQUIREMENT**:
   You must respond with ONLY a valid JSON object (no outside text). Structure:
   {
     "thinking": "Deep internal reasoning explaining: time budget breakdown, traffic vs metro trade-offs, opening hours, weather, spatial geometry, and budget calculation.",
     "answer": "Complete, conversational Hinglish response formatted with markdown (bold, bullet points, emojis). Includes the minute-by-minute breakdown, transport advice, and closing question.",
     "trip_card": {
       "title": "Short catchy title (e.g. Delhi Express 3-Hour Heritage & Cafe Trail)",
       "cityKey": "delhi | mumbai | bangalore | goa | rishikesh | jaipur | kashmir | thailand | dubai | bali",
       "location": "Key hubs (e.g. Aerocity & Connaught Place, Delhi)",
       "price": "₹499 (or exact price)",
       "originalPrice": "₹1,200 (or realistic original fare)",
       "duration": "3 Hours Express Escape (or 3 Days / 2 Nights)",
       "airline": "Transport mode (e.g. Airport Express Orange Metro Line (135 km/h))",
       "stay": "Lounge / Hub name (e.g. Aerocity Worldmark Lounge Pass)",
       "image": "https://images.unsplash.com/photo-...",
       "inclusions": [
         "⚡ Fast-Track Transit QR Pass",
         "☕ Artisanal Cafe / Tasting Voucher",
         "🧳 Luggage Storage Assistance",
         "🛡️ 100% Guaranteed On-Time Gate Return"
       ],
       "itineraryDays": [
         {"day": "00-25m", "title": "Airport Express Metro Transit", "desc": "..."},
         {"day": "25-85m", "title": "Iconic Cultural / Vibe Spot", "desc": "..."},
         {"day": "85-145m", "title": "Artisanal Cafe & Signature Food Stop", "desc": "..."},
         {"day": "145-180m", "title": "Buffer & Hassle-Free Gate Return", "desc": "..."}
       ]
     },
     "prompt_suggestions": [
       "Suggested quick follow-up prompt 1",
       "Suggested quick follow-up prompt 2",
       "Suggested quick follow-up prompt 3",
       "Suggested quick follow-up prompt 4"
     ],
     "timeline_steps": [
       {
         "time_window": "00:00 - 00:25",
         "title": "Express Transit",
         "mode": "Airport Express Metro / AC Cab",
         "cost": "₹60",
         "activity": "Detailed activity breakdown"
       }
     ]
   }
"""


def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Extract and parse JSON safely from Claude's output."""
    text = raw_text.strip()

    # Attempt 1: Direct JSON parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # Attempt 2: Extract from ```json ... ``` markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    # Attempt 3: Find outermost { ... }
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = text[first_brace : last_brace + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # Attempt 4: Fallback to structured wrapper around raw text
    return {
        "thinking": "Parsed raw narrative response from Claude 3.5 Sonnet.",
        "answer": text,
        "trip_card": None,
        "prompt_suggestions": [
          "⚡ Book This Itinerary",
          "Can we adjust the timing?",
          "Suggest vegetarian food stops",
          "What is the best cab route?"
        ],
        "timeline_steps": []
    }


def run_claude_travel_agent(
    query: str,
    api_key: Optional[str] = None,
    header_key: Optional[str] = None,
    duration_hours: Optional[float] = None,
    destination: Optional[str] = None,
    vibe: Optional[str] = None,
    group_type: Optional[str] = None,
    budget: Optional[str] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    rag_context: Optional[str] = None,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Execute Anthropic Claude 3.5 Sonnet travel agent with deep reasoning.
    Returns structured response with thinking, answer, trip_card, prompt_suggestions, and timeline_steps.
    """
    resolved_key = get_anthropic_api_key(api_key, header_key)
    if not resolved_key:
        return {
            "success": False,
            "error": "NO_API_KEY",
            "message": "Anthropic API Key not provided. Set ANTHROPIC_API_KEY environment variable or pass via x-anthropic-api-key header.",
            "fallback_needed": True
        }

    try:
        import anthropic
    except ImportError:
        logger.error("Anthropic package is not installed.")
        return {
            "success": False,
            "error": "PACKAGE_NOT_INSTALLED",
            "message": "anthropic python library is not installed in current environment.",
            "fallback_needed": True
        }

    selected_model = model or DEFAULT_MODEL

    # Construct user prompt with rich grounding
    context_sections = []

    if duration_hours:
        context_sections.append(
            f"⚡ [STRICT TIME CONSTRAINT]: The user has explicitly requested an itinerary for {duration_hours} hours. "
            f"You MUST formulate an exact minute-by-minute breakdown (e.g. 0 to {int(duration_hours * 60)} minutes) "
            f"covering transit, iconic anchor spot, signature cafe/food, and buffer return."
        )

    user_meta = []
    if destination:
        user_meta.append(f"Destination: {destination.title()}")
    if group_type:
        user_meta.append(f"Group/Squad: {group_type}")
    if vibe:
        user_meta.append(f"Preferred Vibe: {vibe}")
    if budget:
        user_meta.append(f"Budget: {budget}")

    if user_meta:
        context_sections.append(f"📋 [TRAVELER PROFILE]: {', '.join(user_meta)}")

    if rag_context:
        context_sections.append(
            f"🔍 [ORBIT LIVE DATABASE & RAG GROUNDING CONTEXT]:\n{rag_context}\n"
            f"(Use verified flight numbers, stay names, pricing, and perks where relevant to keep facts 100% grounded.)"
        )

    # Format user message
    combined_user_prompt = ""
    if context_sections:
        combined_user_prompt += "\n\n".join(context_sections) + "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
    combined_user_prompt += f"USER QUERY: {query}\n\nRespond in authentic Hinglish adhering to the JSON schema."

    # Build messages array with past conversation context if available
    api_messages = []
    if conversation_history:
        for m in conversation_history[-4:]:
            role = "user" if m.get("sender") == "user" else "assistant"
            api_messages.append({"role": role, "content": m.get("text", "")})

    api_messages.append({"role": "user", "content": combined_user_prompt})

    try:
        client = anthropic.Anthropic(api_key=resolved_key)
        response = client.messages.create(
            model=selected_model,
            max_tokens=3000,
            system=SYSTEM_PROMPT,
            messages=api_messages,
        )

        raw_output = response.content[0].text if response.content else ""
        parsed = clean_json_response(raw_output)

        # Ensure image is present in trip_card
        if parsed.get("trip_card"):
            tc = parsed["trip_card"]
            city_k = (tc.get("cityKey") or destination or "delhi").lower()
            if not tc.get("image") or "unsplash.com" not in tc.get("image", ""):
                tc["image"] = get_curated_destination_image(city_k)

        return {
            "success": True,
            "model": selected_model,
            "engine": f"Anthropic Claude 3.5 Sonnet ({selected_model}) + Orbit Hybrid RAG",
            "thinking": parsed.get("thinking", "Analyzed spatial distances, traffic conditions, and opening hours."),
            "answer": parsed.get("answer", raw_output),
            "trip_card": parsed.get("trip_card"),
            "prompt_suggestions": parsed.get("prompt_suggestions") or [
                "⚡ Book This Itinerary",
                "Suggest cafe alternatives",
                "How to take the metro?",
                "What is the return buffer time?"
            ],
            "timeline_steps": parsed.get("timeline_steps", []),
            "raw_output": raw_output
        }

    except anthropic.AuthenticationError as ae:
        logger.warning(f"Anthropic Authentication Error: {ae}")
        return {
            "success": False,
            "error": "AUTH_ERROR",
            "message": "Invalid Anthropic API Key. Please verify your sk-ant-... key.",
            "fallback_needed": True
        }
    except anthropic.RateLimitError as rle:
        logger.warning(f"Anthropic Rate Limit: {rle}")
        return {
            "success": False,
            "error": "RATE_LIMIT",
            "message": "Anthropic API rate limit exceeded. Falling back to Orbit Local AI.",
            "fallback_needed": True
        }
    except Exception as e:
        logger.error(f"Anthropic API Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": "API_ERROR",
            "message": f"Anthropic API Error: {str(e)}",
            "fallback_needed": True
        }
