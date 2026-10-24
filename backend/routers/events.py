import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import EventConcert
from schemas import EventConcertResponse, EventConcertListResponse

router = APIRouter(prefix="/api/events", tags=["Concerts, Festivals & Nightlife"])


def serialize_event(e: EventConcert) -> EventConcertResponse:
    tags = json.loads(e.tags) if isinstance(e.tags, str) else e.tags
    return EventConcertResponse(
        id=e.id,
        slug=e.slug,
        title=e.title,
        category=e.category,
        city_key=e.city_key,
        venue=e.venue,
        date_str=e.date_str,
        time_str=e.time_str,
        headliner=e.headliner,
        ticket_price=e.ticket_price,
        original_price=e.original_price,
        tickets_left=e.tickets_left,
        image=e.image,
        badge=e.badge,
        tags=tags,
        includes_stay_combo=e.includes_stay_combo,
        combo_price=e.combo_price,
    )


@router.get("", response_model=EventConcertListResponse)
def get_events(
    city_key: Optional[str] = Query(None, description="City filter: goa, mumbai, delhi, pune, udaipur, etc."),
    category: Optional[str] = Query(None, description="'Concert', 'Music Festival', 'Nightlife', 'Food & Carnival', 'Cultural'"),
    search: Optional[str] = Query(None, description="Search headliner, artist, title or venue"),
    combos_only: Optional[bool] = Query(False, description="Filter for Flight + Stay + Event VIP combo packages"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search 110+ live concerts, global music festivals (Coldplay, Diljit, Sunburn, Lollapalooza),
    food carnivals, and cultural nightlife raves.
    """
    query = db.query(EventConcert)

    if city_key:
        query = query.filter(EventConcert.city_key == city_key.lower())

    if category:
        query = query.filter(EventConcert.category.ilike(f"%{category}%"))

    if combos_only:
        query = query.filter(EventConcert.includes_stay_combo == True)

    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            EventConcert.title.ilike(search_pattern)
            | EventConcert.headliner.ilike(search_pattern)
            | EventConcert.venue.ilike(search_pattern)
            | EventConcert.category.ilike(search_pattern)
        )

    total = query.count()
    events = (
        query.order_by(EventConcert.ticket_price.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return EventConcertListResponse(
        total=total,
        skip=skip,
        limit=limit,
        events=[serialize_event(e) for e in events],
    )


@router.get("/{slug}", response_model=EventConcertResponse)
def get_event_by_slug(slug: str, db: Session = Depends(get_db)):
    """Fetch details of a specific concert, festival or event pass."""
    event = db.query(EventConcert).filter(EventConcert.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{slug}' not found")
    return serialize_event(event)
