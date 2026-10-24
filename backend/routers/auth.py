import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from database import get_db, Base, engine
from models import User, SessionToken
from schemas import (
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    AuthResponse,
    UserProfile,
    MeResponse,
    LogoutResponse,
)

# Ensure tables exist even if backend was running previously
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def get_initials(name: str) -> str:
    """Derive 1-2 character initials for avatar badge."""
    parts = [p.strip() for p in name.split() if p.strip()]
    if not parts:
        return "OR"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[-1][0]}".upper()


def extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return authorization


def get_current_user_from_token(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User:
    token = extract_bearer_token(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer header",
        )
    session = db.query(SessionToken).filter(SessionToken.token == token).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
        )
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for active session",
        )
    return user


@router.post("/otp/send", response_model=OtpSendResponse)
def send_otp(payload: OtpSendRequest):
    """
    Accepts phone number (e.g. +91 9810123456) or email.
    In dev/demo mode, returns demo_otp = "1234".
    """
    target = payload.phone or payload.email or "+91 9810123456"
    return OtpSendResponse(
        success=True,
        message=f"OTP sent successfully to {target}",
        demo_otp="1234",
    )


@router.post("/otp/verify", response_model=AuthResponse)
def verify_otp(payload: OtpVerifyRequest, db: Session = Depends(get_db)):
    """
    Accepts phone, otp, account_type ('personal' | 'mybiz'), name (optional).
    If OTP is '1234' (or any 4 digits in demo mode), issues a session token.
    """
    clean_otp = (payload.otp or "").strip()
    if len(clean_otp) != 4 or not clean_otp.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please enter a valid 4-digit code (Demo OTP: 1234).",
        )

    # Normalize phone
    raw_phone = payload.phone.strip()
    if not raw_phone.startswith("+"):
        if len(raw_phone) == 10:
            formatted_phone = f"+91 {raw_phone}"
        else:
            formatted_phone = f"+91 {raw_phone[-10:]}"
    else:
        formatted_phone = raw_phone

    # Check if user exists
    user = db.query(User).filter(User.phone == formatted_phone).first()

    name = payload.name or ("Keshav Jindal" if "9810123456" in formatted_phone else "Orbit Traveler")
    account_type = payload.account_type or ("mybiz" if "mybiz" in formatted_phone.lower() else "personal")

    if not user:
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        user = User(
            id=user_id,
            phone=formatted_phone,
            name=name,
            email=f"{name.lower().replace(' ', '.')}@orbit.travel" if name else "user@orbit.travel",
            account_type=account_type,
            tier="Titanium Elite",
            avatar=get_initials(name),
            mybiz_gstin="07AAACR5055K1Z4" if account_type == "mybiz" or "9810123456" in formatted_phone else None,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
        )
        db.add(user)
    else:
        # Update existing user's login and account_type if supplied
        user.last_login = datetime.utcnow()
        if payload.account_type:
            user.account_type = payload.account_type
        if payload.name:
            user.name = payload.name
            user.avatar = get_initials(payload.name)
        if not user.mybiz_gstin and user.account_type == "mybiz":
            user.mybiz_gstin = "07AAACR5055K1Z4"

    # Issue session token
    token_str = f"orbit_tok_{secrets.token_urlsafe(28)}"
    session_record = SessionToken(
        token=token_str,
        user_id=user.id,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30),
    )
    db.add(session_record)
    db.commit()
    db.refresh(user)

    return AuthResponse(
        token=token_str,
        user=UserProfile(
            id=user.id,
            name=user.name,
            phone=user.phone,
            email=user.email,
            account_type=user.account_type,
            tier=user.tier,
            avatar=user.avatar,
            mybiz_gstin=user.mybiz_gstin,
        ),
    )


@router.get("/me", response_model=MeResponse)
def get_me(user: User = Depends(get_current_user_from_token)):
    """Verifies Authorization Bearer token and returns active user."""
    return MeResponse(
        user=UserProfile(
            id=user.id,
            name=user.name,
            phone=user.phone,
            email=user.email,
            account_type=user.account_type,
            tier=user.tier,
            avatar=user.avatar,
            mybiz_gstin=user.mybiz_gstin,
        )
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    """Clears the session token from active sessions."""
    token = extract_bearer_token(authorization)
    if token:
        db.query(SessionToken).filter(SessionToken.token == token).delete()
        db.commit()
    return LogoutResponse(
        success=True,
        message="Session terminated successfully. Logged out.",
    )


@router.post("/demo-login", response_model=AuthResponse)
def demo_login(db: Session = Depends(get_db)):
    """
    Instant 1-click login as 'Keshav Jindal (Titanium Member)'
    for quick testing without typing OTP.
    """
    demo_phone = "+91 9810123456"
    user = db.query(User).filter(User.phone == demo_phone).first()

    if not user:
        user = User(
            id="usr_keshav_jindal_titanium",
            phone=demo_phone,
            name="Keshav Jindal",
            email="keshav@orbit.travel",
            account_type="personal",
            tier="Titanium Elite",
            avatar="KJ",
            mybiz_gstin="07AAACR5055K1Z4",
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
        )
        db.add(user)
    else:
        user.name = "Keshav Jindal"
        user.tier = "Titanium Elite"
        user.avatar = "KJ"
        user.mybiz_gstin = "07AAACR5055K1Z4"
        user.last_login = datetime.utcnow()

    # Create new session token
    token_str = f"orbit_tok_{secrets.token_urlsafe(28)}"
    session_record = SessionToken(
        token=token_str,
        user_id=user.id,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30),
    )
    db.add(session_record)
    db.commit()
    db.refresh(user)

    return AuthResponse(
        token=token_str,
        user=UserProfile(
            id=user.id,
            name=user.name,
            phone=user.phone,
            email=user.email,
            account_type=user.account_type,
            tier=user.tier,
            avatar=user.avatar,
            mybiz_gstin=user.mybiz_gstin,
        ),
    )
