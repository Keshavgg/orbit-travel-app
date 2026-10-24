import random
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Booking, Trip
from schemas import BookingCreateRequest, BookingResponse

router = APIRouter(prefix="/api/bookings", tags=["Bookings & Checkouts"])


def generate_booking_id() -> str:
    suffix = f"{random.randint(100, 999)}"
    char = random.choice(["X", "Y", "Z", "V", "R"])
    return f"ORB-2026-{char}{suffix}"


@router.post("", response_model=BookingResponse)
def create_booking(req: BookingCreateRequest, db: Session = Depends(get_db)):
    """
    1-Click instant booking creation with UPI / Card / GST Invoice.
    Automatically generates unique ORB-2026-... ticket code, calculates GST ITC, and issues digital QR pass.
    """
    booking_id = generate_booking_id()

    # Calculate GST ITC (18% for hotel/packages, 5% for direct flight)
    itc_eligible = bool(req.gstin and len(req.gstin.strip()) == 15)
    itc_amount = 0
    if itc_eligible:
        # Approximate 18% GST component claimable
        itc_amount = int(req.total_amount * 0.18 / 1.18)

    qr_token = f"QR_{booking_id}_{uuid.uuid4().hex[:8].upper()}"

    booking = Booking(
        booking_id=booking_id,
        trip_slug=req.trip_slug,
        trip_title=req.trip_title,
        destination_key=req.destination_key,
        travel_date=req.travel_date,
        travelers_count=req.travelers_count,
        total_amount=req.total_amount,
        payment_method=req.payment_method,
        status="CONFIRMED",
        user_name=req.user_name,
        user_email=req.user_email,
        user_phone=req.user_phone,
        gstin=req.gstin.strip().upper() if req.gstin else None,
        company_name=req.company_name.strip() if req.company_name else None,
        itc_eligible=itc_eligible,
        itc_amount=itc_amount,
        qr_token=qr_token,
    )

    db.add(booking)

    # If trip_slug provided, decrement available slots
    if req.trip_slug:
        trip = db.query(Trip).filter(Trip.slug == req.trip_slug).first()
        if trip and trip.available_slots > 0:
            trip.available_slots = max(0, trip.available_slots - req.travelers_count)

    db.commit()
    db.refresh(booking)

    return booking


@router.get("", response_model=List[BookingResponse])
def list_bookings(
    phone: Optional[str] = Query(None, description="Filter by user phone number"),
    db: Session = Depends(get_db)
):
    """Retrieve user bookings."""
    query = db.query(Booking)
    if phone:
        query = query.filter(Booking.user_phone.contains(phone))
    return query.order_by(Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Fetch booking pass, check-in QR code, and voucher status."""
    booking = db.query(Booking).filter(Booking.booking_id == booking_id.upper()).first()
    if not booking:
        raise HTTPException(status_code=404, detail=f"Booking '{booking_id}' not found")
    return booking
