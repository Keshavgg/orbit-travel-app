import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Hotel
from schemas import HotelResponse, HotelListResponse

router = APIRouter(prefix="/api/hotels", tags=["Hotels, Havelis & Private Villas"])


def serialize_hotel(h: Hotel) -> HotelResponse:
    amenities = json.loads(h.amenities) if isinstance(h.amenities, str) else h.amenities
    return HotelResponse(
        id=h.id,
        slug=h.slug,
        name=h.name,
        city_key=h.city_key,
        location=h.location,
        property_type=h.property_type,
        rating=h.rating,
        review_count=h.review_count,
        price_per_night=h.price_per_night,
        original_price=h.original_price,
        discount_percent=h.discount_percent,
        image=h.image,
        amenities=amenities,
        badge=h.badge,
        rooms_left=h.rooms_left,
        is_featured=h.is_featured,
    )


@router.get("", response_model=HotelListResponse)
def get_hotels(
    city_key: Optional[str] = Query(None, description="Filter by city: goa, delhi, jaipur, rishikesh, mumbai, kashmir, etc."),
    city: Optional[str] = Query(None, description="Alias for city_key"),
    property_type: Optional[str] = Query(None, description="Filter by type: 'Private Villa', 'Heritage Haveli', '5-Star Luxury', etc."),
    search: Optional[str] = Query(None, description="Search keyword in hotel name or location"),
    min_price: Optional[int] = Query(None, description="Minimum price per night in INR"),
    max_price: Optional[int] = Query(None, description="Maximum price per night in INR"),
    min_rating: Optional[float] = Query(None, description="Minimum star rating (e.g. 4.5)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search and filter through 520+ curated hotels, private villas, heritage havelis, and riverside glamping camps.
    """
    query = db.query(Hotel)

    selected_city = city_key or city
    if selected_city and selected_city.lower() != 'all':
        query = query.filter(Hotel.city_key == selected_city.lower())

    if property_type:
        query = query.filter(Hotel.property_type.ilike(f"%{property_type}%"))

    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            Hotel.name.ilike(search_pattern)
            | Hotel.location.ilike(search_pattern)
            | Hotel.property_type.ilike(search_pattern)
        )

    if min_price:
        query = query.filter(Hotel.price_per_night >= min_price)

    if max_price:
        query = query.filter(Hotel.price_per_night <= max_price)

    if min_rating:
        query = query.filter(Hotel.rating >= min_rating)

    total = query.count()
    hotels = (
        query.order_by(Hotel.is_featured.desc(), Hotel.rating.desc(), Hotel.price_per_night.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return HotelListResponse(
        total=total,
        skip=skip,
        limit=limit,
        hotels=[serialize_hotel(h) for h in hotels],
    )


@router.get("/{slug}", response_model=HotelResponse)
def get_hotel_by_slug(slug: str, db: Session = Depends(get_db)):
    """Fetch details of a specific hotel or villa."""
    hotel = db.query(Hotel).filter(Hotel.slug == slug).first()
    if not hotel:
        raise HTTPException(status_code=404, detail=f"Hotel '{slug}' not found")
    return serialize_hotel(hotel)
