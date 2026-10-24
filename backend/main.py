import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, Base, SessionLocal, get_db
from models import Trip, Booking, DistressedFlight, Destination, Hotel, FlightTicket, EventConcert
from seed import seed_database
from seed_massive import seed_all_massive_data
from routers import trips, flights, visas, bookings, chat, gst, callbacks, hotels, events, rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    print("🚀 Initializing Orbit Travel OS Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        seed_all_massive_data()
    finally:
        db.close()
    yield
    print("🛑 Shutting down Orbit Travel OS Backend...")


app = FastAPI(
    title="Orbit Travel OS Backend API",
    description="High-performance FastAPI backend powering Orbit Travel Superapp. "
                "Provides endpoints for 500+ Hotels & Private Villas, 500+ Domestic & Intl Flights, "
                "100+ Concerts & Festivals, Short vs Long trips, distressed 60% flight drops, "
                "flat ₹499 visas, 1-click UPI instant bookings, GST ITC tax calculation, "
                "and GPT-4o multi-turn cross-questioning travel copilot.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3005",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3005",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(hotels.router)
app.include_router(flights.router)
app.include_router(events.router)
app.include_router(trips.router)
app.include_router(visas.router)
app.include_router(bookings.router)
app.include_router(chat.router)
app.include_router(rag.router)
app.include_router(gst.router)
app.include_router(callbacks.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Orbit Travel OS — FastAPI Engine",
        "status": "ONLINE",
        "docs": "/docs",
        "redoc": "/redoc",
        "version": "1.0.0",
        "endpoints": [
            "/api/hotels (520+ Stays & Villas)",
            "/api/flights (520+ Domestic & Intl Flights)",
            "/api/events (110+ Live Concerts & Music Fests)",
            "/api/trips (duration_type=short|long)",
            "/api/destinations",
            "/api/flights/drops (Flash Seat Drops)",
            "/api/visas",
            "/api/bookings",
            "/api/chat",
            "/api/rag/query (Real-Time Hybrid RAG over 1,160+ items)",
            "/api/rag/stats",
            "/api/gst/verify",
            "/api/callbacks",
            "/api/health",
        ],
    }


@app.get("/api/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Backend health check returning database status and inventory totals."""
    # Test DB connection
    db.execute(text("SELECT 1"))

    total_destinations = db.query(Destination).count()
    total_hotels = db.query(Hotel).count()
    total_flights = db.query(FlightTicket).count()
    total_events = db.query(EventConcert).count()
    total_trips = db.query(Trip).count()
    short_trips = db.query(Trip).filter(Trip.duration_type == "short").count()
    long_trips = db.query(Trip).filter(Trip.duration_type == "long").count()
    active_flight_drops = db.query(DistressedFlight).count()
    total_bookings = db.query(Booking).count()

    return {
        "status": "HEALTHY",
        "timestamp": int(time.time()),
        "database": "CONNECTED",
        "inventory": {
            "hotels_count": total_hotels,
            "flight_tickets_count": total_flights,
            "concerts_and_events_count": total_events,
            "destinations_count": total_destinations,
            "total_trips": total_trips,
            "short_trips": short_trips,
            "long_trips": long_trips,
            "distressed_flight_drops": active_flight_drops,
            "total_bookings": total_bookings,
        },
    }
