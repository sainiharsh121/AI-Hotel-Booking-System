# backend/services/hotel_service.py
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models import User, Room, Booking

ROOM_META = {
    'Single': {
        'image': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        'amenities': ['Free High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Dedicated Workspace'],
        'capacity': 1,
        'description': 'Cozy and comfortable private room designed for solo travelers or professionals.'
    },
    'Double': {
        'image': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'amenities': ['Free Wi-Fi', 'Queen-sized Bed', 'En-suite Bathroom', 'Smart TV', 'Tea & Coffee Maker'],
        'capacity': 2,
        'description': 'Spacious and stylish room ideal for couples or pairs looking for relaxation.'
    },
    'Suite': {
        'image': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'amenities': ['King Bed', 'Separate Living Area', 'Balcony with City View', 'Complimentary Breakfast', 'Mini Bar'],
        'capacity': 3,
        'description': 'Premium executive suite featuring panoramic views, luxury bedding, and lounge area.'
    },
    'Deluxe': {
        'image': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        'amenities': ['Panoramic Skyline View', 'Marble Bathroom & Bathtub', '24/7 Room Service', 'King Bed'],
        'capacity': 2,
        'description': 'Opulent deluxe haven offering bespoke furniture and lavish spa-style bathroom.'
    },
    'Family': {
        'image': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
        'amenities': ['2 Double Beds', 'Kid-friendly Setup', 'Spacious Lounge', 'Kitchenette', 'Free Breakfast'],
        'capacity': 4,
        'description': 'Generously sized family retreat with dual bedding, entertainment system, and full comfort.'
    },
    'Luxury Suite': {
        'image': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        'amenities': ['Private Jacuzzi', 'Butler Service', 'Private Terrace', 'Complimentary Champagne & Dining'],
        'capacity': 4,
        'description': 'The pinnacle of grandeur and sophistication with world-class hospitality and private terrace.'
    }
}

def get_room_metadata(room_type: str) -> Dict[str, Any]:
    for key in ['Luxury Suite', 'Family', 'Deluxe', 'Suite', 'Double', 'Single']:
        if key.lower() in (room_type or '').lower():
            return ROOM_META[key]
    return ROOM_META['Double']

def get_all_rooms(db: Session, show_all: bool = False) -> List[Dict[str, Any]]:
    query = db.query(Room)
    if not show_all:
        query = query.filter(Room.is_available == True)
    rooms = query.all()
    
    result = []
    for r in rooms:
        meta = get_room_metadata(r.room_type)
        result.append({
            "id": r.id,
            "type": r.room_type,
            "price": r.price,
            "is_available": r.is_available,
            "image": meta['image'],
            "amenities": meta['amenities'],
            "capacity": meta['capacity'],
            "description": meta['description']
        })
    return result

def register_user(db: Session, name: str, email: str, password: str, age: int = 25, address: str = ""):
    name = (name or "").strip()
    email = (email or "").strip().lower()
    password = str(password or "").strip()

    if not name:
        return {"error": "Please enter your full name.", "status_code": 400}
    if not email or '@' not in email or '.' not in email:
        return {"error": "Please enter a valid email address.", "status_code": 400}
    if not password or len(password) != 4 or not password.isdigit():
        return {"error": "Password must be exactly a 4-digit PIN (e.g., 1234).", "status_code": 400}

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        if existing_user.password:
            return {"error": "An account with this email is already registered. Please sign in.", "status_code": 409}
        existing_user.name = name
        existing_user.password = password
        db.commit()
        db.refresh(existing_user)
        return {
            "message": "Account created successfully! Welcome to Rajmahal Residency.",
            "user": {
                "id": existing_user.id,
                "name": existing_user.name,
                "email": existing_user.email
            },
            "status_code": 201
        }

    new_user = User(
        name=name,
        email=email,
        password=password,
        age=age or 25,
        address=address or ""
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "Account created successfully! Welcome to Rajmahal Residency.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        },
        "status_code": 201
    }

def login_user(db: Session, email: str, password: str):
    email = (email or "").strip().lower()
    password = str(password or "").strip()

    if not email:
        return {"error": "Please enter your email address.", "status_code": 400}
    if not password:
        return {"error": "Please enter your 4-digit security PIN.", "status_code": 400}

    user = db.query(User).filter(User.email == email).first()
    if not user or user.password != password:
        return {"error": "Invalid email address or 4-digit PIN. Please try again.", "status_code": 401}

    return {
        "message": f"Welcome back, {user.name}!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },
        "status_code": 200
    }

def book_room(db: Session, room_id: int, start_date_str: str, end_date_str: str, user_id: Optional[int] = None, user_email: Optional[str] = None):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        return {"error": f"Room with ID {room_id} not found", "status_code": 404}

    if not room.is_available:
        return {"error": "Room is already booked or not available", "status_code": 400}

    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    elif user_email:
        user = db.query(User).filter(User.email == user_email.strip().lower()).first()

    # Require authenticated registered user
    if not user:
        return {
            "error": "Authentication required: You must be registered or logged in with an account to confirm a room booking.",
            "status_code": 401
        }

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        if end_date <= start_date:
            return {"error": "Check-out date must be after check-in date", "status_code": 400}
    except ValueError:
        return {"error": "Dates must be in YYYY-MM-DD format", "status_code": 400}

    booking = Booking(
        user_id=user.id,
        room_id=room.id,
        start_date=start_date,
        end_date=end_date
    )
    db.add(booking)
    room.is_available = False
    db.commit()
    db.refresh(booking)

    return {
        "message": f"Room #{room.id} ({room.room_type}) booked successfully!",
        "booking_id": booking.id,
        "room_id": room.id,
        "user_id": user.id,
        "user_name": user.name,
        "status_code": 201
    }

def get_bookings(db: Session, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    query = db.query(Booking)
    if user_id is not None:
        query = query.filter(Booking.user_id == user_id)
    
    bookings = query.order_by(Booking.id.desc()).all()
    result = []
    for b in bookings:
        room = db.query(Room).filter(Room.id == b.room_id).first()
        user = db.query(User).filter(User.id == b.user_id).first()
        meta = get_room_metadata(room.room_type) if room else {}
        result.append({
            "id": b.id,
            "user_id": b.user_id,
            "user_name": user.name if user else "Unknown Guest",
            "user_email": user.email if user else "",
            "room_id": b.room_id,
            "room_type": room.room_type if room else "Unknown Room",
            "room_price": room.price if room else 0,
            "room_image": meta.get('image', ''),
            "start_date": str(b.start_date),
            "end_date": str(b.end_date)
        })
    return result

def cancel_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return {"error": f"Booking ID #{booking_id} not found", "status_code": 404}

    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.is_available = True

    deleted_room_id = booking.room_id
    db.delete(booking)
    db.commit()

    return {
        "message": f"Booking #{booking_id} cancelled successfully! Room #{deleted_room_id} is now available.",
        "booking_id": booking_id,
        "status_code": 200
    }
