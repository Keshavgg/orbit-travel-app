from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import CallbackLead
from schemas import CallbackCreateRequest, CallbackResponse

router = APIRouter(prefix="/api/callbacks", tags=["Travel Desk & Callbacks"])


@router.post("", response_model=CallbackResponse)
def request_callback(req: CallbackCreateRequest, db: Session = Depends(get_db)):
    """
    Register a request for 2-Minute Travel Desk Callback.
    Dispatches priority notification to the concierge team.
    """
    lead = CallbackLead(
        phone=req.phone.strip(),
        name=req.name.strip() if req.name else "Traveler",
        destination_interest=req.destination_interest,
        status="PENDING",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return CallbackResponse(
        id=lead.id,
        phone=lead.phone,
        name=lead.name,
        destination_interest=lead.destination_interest,
        status=lead.status,
        message="Travel desk notified. An executive will call your phone in under 2 minutes.",
    )
