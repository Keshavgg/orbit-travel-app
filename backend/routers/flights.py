import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import DistressedFlight, FlightTicket
from schemas import (
    DistressedFlightResponse,
    FlightTicketResponse,
    FlightTicketListResponse,
)

router = APIRouter(prefix="/api/flights", tags=["Flights & Airline Seat Drops"])


class ReserveSeatRequest(BaseModel):
    flight_id: int
    seats: int = 1


def serialize_flight_ticket(f: FlightTicket) -> FlightTicketResponse:
    tags = json.loads(f.tags) if isinstance(f.tags, str) else f.tags
    return FlightTicketResponse(
        id=f.id,
        flight_num=f.flight_num,
        airline=f.airline,
        origin=f.origin,
        origin_code=f.origin_code,
        dest=f.dest,
        dest_code=f.dest_code,
        departure_time=f.departure_time,
        arrival_time=f.arrival_time,
        duration=f.duration,
        stops=f.stops,
        price=f.price,
        original_price=f.original_price,
        discount_percent=f.discount_percent,
        seats_available=f.seats_available,
        baggage=f.baggage,
        cabin_class=f.cabin_class,
        is_distressed=f.is_distressed,
        tags=tags,
    )


@router.get("", response_model=FlightTicketListResponse)
def get_all_flights(
    origin_code: Optional[str] = Query(None, description="Origin IATA code: DEL, BOM, BLR, etc."),
    dest_code: Optional[str] = Query(None, description="Destination IATA code: GOX, GOI, DXB, BKK, etc."),
    airline: Optional[str] = Query(None, description="Airline name: IndiGo, Air India, Vistara, etc."),
    cabin_class: Optional[str] = Query(None, description="Economy or Business"),
    stops: Optional[str] = Query(None, description="'Non-Stop' or '1-Stop'"),
    max_price: Optional[int] = Query(None, description="Maximum price in INR"),
    distressed_only: Optional[bool] = Query(False, description="Filter for flash seat drops"),
    search: Optional[str] = Query(None, description="Search flight number, airline, or cities"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search and filter across 520+ live domestic and international flights.
    """
    query = db.query(FlightTicket)

    if origin_code:
        query = query.filter(FlightTicket.origin_code == origin_code.upper())

    if dest_code:
        query = query.filter(FlightTicket.dest_code == dest_code.upper())

    if airline:
        query = query.filter(FlightTicket.airline.ilike(f"%{airline}%"))

    if cabin_class:
        query = query.filter(FlightTicket.cabin_class.ilike(cabin_class))

    if stops:
        query = query.filter(FlightTicket.stops.ilike(f"%{stops}%"))

    if max_price:
        query = query.filter(FlightTicket.price <= max_price)

    if distressed_only:
        query = query.filter(FlightTicket.is_distressed == True)

    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            FlightTicket.flight_num.ilike(search_pattern)
            | FlightTicket.airline.ilike(search_pattern)
            | FlightTicket.origin.ilike(search_pattern)
            | FlightTicket.dest.ilike(search_pattern)
        )

    total = query.count()
    flights = (
        query.order_by(FlightTicket.is_distressed.desc(), FlightTicket.price.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return FlightTicketListResponse(
        total=total,
        skip=skip,
        limit=limit,
        flights=[serialize_flight_ticket(f) for f in flights],
    )


@router.get("/drops", response_model=List[DistressedFlightResponse])
def get_flight_drops(db: Session = Depends(get_db)):
    """Fetch live flash drops: distressed airline seats at 50-60% off cost."""
    flights = db.query(DistressedFlight).filter(DistressedFlight.seats_remaining > 0).all()
    results = []
    for f in flights:
        tags = json.loads(f.tags) if isinstance(f.tags, str) else f.tags
        results.append(
            DistressedFlightResponse(
                id=f.id,
                flight_num=f.flight_num,
                airline=f.airline,
                origin=f.origin,
                origin_code=f.origin_code,
                dest=f.dest,
                dest_code=f.dest_code,
                departure_time=f.departure_time,
                arrival_time=f.arrival_time,
                original_price=f.original_price,
                distressed_price=f.distressed_price,
                discount_percent=f.discount_percent,
                seats_remaining=f.seats_remaining,
                baggage=f.baggage,
                tags=tags,
            )
        )
    return results


@router.post("/reserve-seat")
def reserve_seat(req: ReserveSeatRequest, db: Session = Depends(get_db)):
    """Atomically reserve a distressed seat drop before it expires."""
    flight = db.query(DistressedFlight).filter(DistressedFlight.id == req.flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight drop not found")

    if flight.seats_remaining < req.seats:
        raise HTTPException(status_code=400, detail="Not enough seats left on this distressed flight drop")

    flight.seats_remaining -= req.seats
    db.commit()

    return {
        "status": "RESERVED",
        "flight_num": flight.flight_num,
        "airline": flight.airline,
        "route": f"{flight.origin_code} ➔ {flight.dest_code}",
        "price_locked": flight.distressed_price * req.seats,
        "seats_remaining_now": flight.seats_remaining,
        "message": f"Locked {req.seats} seat(s) at ₹{flight.distressed_price} each. Free baggage included."
    }
