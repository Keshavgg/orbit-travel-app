import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Trip, Destination
from schemas import TripResponse, DestinationResponse, ItineraryDay

router = APIRouter(prefix="/api", tags=["Trips & Destinations"])


def serialize_trip(trip: Trip) -> TripResponse:
    highlights = json.loads(trip.highlights) if isinstance(trip.highlights, str) else trip.highlights
    inclusions = json.loads(trip.inclusions) if isinstance(trip.inclusions, str) else trip.inclusions
    tags = json.loads(trip.tags) if isinstance(trip.tags, str) else trip.tags
    raw_itinerary = json.loads(trip.itinerary) if isinstance(trip.itinerary, str) else trip.itinerary

    itinerary_objs = [
        ItineraryDay(
            day=item.get("day", ""),
            title=item.get("title", ""),
            desc=item.get("desc", ""),
        )
        for item in raw_itinerary
    ]

    return TripResponse(
        id=trip.id,
        slug=trip.slug,
        title=trip.title,
        destination_key=trip.destination_key,
        category=trip.category,
        duration=trip.duration,
        duration_days=trip.duration_days,
        duration_type=trip.duration_type,
        price=trip.price,
        original_price=trip.original_price,
        discount_percent=trip.discount_percent,
        drive_time=trip.drive_time,
        distance=trip.distance,
        airline=trip.airline,
        stay_name=trip.stay_name,
        image=trip.image,
        highlights=highlights,
        inclusions=inclusions,
        itinerary=itinerary_objs,
        tags=tags,
        available_slots=trip.available_slots,
        is_featured=trip.is_featured,
    )


@router.get("/destinations", response_model=List[DestinationResponse])
def get_destinations(db: Session = Depends(get_db)):
    """Fetch all 3D map destinations with live weather and GPS coordinates."""
    return db.query(Destination).all()


@router.get("/trips", response_model=List[TripResponse])
def get_trips(
    duration_type: Optional[str] = Query(None, description="'short' (<=3 days) or 'long' (4+ days)"),
    category: Optional[str] = Query(None, description="Category filter ('weekend', 'visa', 'flights', 'stays')"),
    destination_key: Optional[str] = Query(None, description="Filter by destination key (e.g. 'goa', 'rishikesh')"),
    search: Optional[str] = Query(None, description="Search keyword in title or tags"),
    max_price: Optional[int] = Query(None, description="Max budget in INR"),
    db: Session = Depends(get_db),
):
    """
    Search and filter trips across short-trip and long-trip catalog.
    Supports duration_type: 'short' vs 'long'.
    """
    query = db.query(Trip)

    if duration_type:
        query = query.filter(Trip.duration_type == duration_type.lower())

    if category:
        query = query.filter(Trip.category == category.lower())

    if destination_key:
        query = query.filter(Trip.destination_key == destination_key.lower())

    if max_price:
        query = query.filter(Trip.price <= max_price)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            Trip.title.ilike(search_term)
            | Trip.stay_name.ilike(search_term)
            | Trip.tags.ilike(search_term)
        )

    trips = query.order_by(Trip.is_featured.desc(), Trip.price.asc()).all()
    return [serialize_trip(t) for t in trips]


@router.get("/trips/{slug}", response_model=TripResponse)
def get_trip_by_slug(slug: str, db: Session = Depends(get_db)):
    """Fetch full details, day-by-day itinerary and live inclusions for a specific trip."""
    trip = db.query(Trip).filter(Trip.slug == slug).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{slug}' not found")
    return serialize_trip(trip)
