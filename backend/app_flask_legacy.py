# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Room, Booking
from config import Config
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)

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

def get_room_metadata(room_type):
    for key in ['Luxury Suite', 'Family', 'Deluxe', 'Suite', 'Double', 'Single']:
        if key.lower() in room_type.lower():
            return ROOM_META[key]
    return ROOM_META['Double']

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "Hotel Booking API",
        "version": "2.0"
    })

@app.route('/rooms', methods=['GET'])
def get_rooms():
    show_all = request.args.get('all', 'false').lower() == 'true'
    if show_all:
        rooms = Room.query.all()
    else:
        rooms = Room.query.filter_by(is_available=True).all()
        
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
    return jsonify(result)

@app.route('/users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'POST':
        data = request.json or {}
        name = data.get('name', 'Guest')
        email = data.get('email', f"guest_{datetime.now().timestamp()}@example.com")
        existing = User.query.filter_by(email=email).first()
        if existing:
            return jsonify({"id": existing.id, "name": existing.name, "email": existing.email})
        new_user = User(
            name=name,
            email=email,
            age=data.get('age', 25),
            address=data.get('address', 'New Delhi')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"id": new_user.id, "name": new_user.name, "email": new_user.email}), 201
    
    users = User.query.all()
    return jsonify([{"id": u.id, "name": u.name, "email": u.email} for u in users])

@app.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = str(data.get('password') or '').strip()

    if not name:
        return jsonify({"message": "Please enter your full name."}), 400
    if not email or '@' not in email or '.' not in email:
        return jsonify({"message": "Please enter a valid email address."}), 400
    if not password or len(password) != 4 or not password.isdigit():
        return jsonify({"message": "Password must be exactly a 4-digit PIN (e.g., 1234)."}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        if existing_user.password:
            return jsonify({"message": "An account with this email is already registered. Please sign in."}), 409
        existing_user.name = name
        existing_user.password = password
        db.session.commit()
        return jsonify({
            "message": "Account created successfully! Welcome to Rajmahal Residency.",
            "user": {
                "id": existing_user.id,
                "name": existing_user.name,
                "email": existing_user.email
            }
        }), 201

    new_user = User(
        name=name,
        email=email,
        password=password,
        age=data.get('age', 25),
        address=data.get('address', '')
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Account created successfully! Welcome to Rajmahal Residency.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = str(data.get('password') or '').strip()

    if not email:
        return jsonify({"message": "Please enter your email address."}), 400
    if not password:
        return jsonify({"message": "Please enter your 4-digit security PIN."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or user.password != password:
        return jsonify({"message": "Invalid email address or 4-digit PIN. Please try again."}), 401

    return jsonify({
        "message": f"Welcome back, {user.name}!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

@app.route('/book', methods=['POST'])
def book_room():
    data = request.json
    if not data or 'room_id' not in data or 'start_date' not in data or 'end_date' not in data:
        return jsonify({"message": "Missing required booking details (room_id, start_date, end_date)"}), 400

    room = Room.query.get(data['room_id'])
    if not room:
        return jsonify({"message": f"Room with ID {data['room_id']} not found"}), 404
        
    if not room.is_available:
        return jsonify({"message": "Room is already booked or not available"}), 400

    user_id = data.get('user_id')
    user_email = (data.get('user_email') or '').strip().lower()

    user = None
    if user_id:
        user = User.query.get(user_id)
    elif user_email:
        user = User.query.filter_by(email=user_email).first()

    # Require authenticated registered user
    if not user:
        return jsonify({
            "message": "Authentication required: You must be registered or logged in with an account to confirm a room booking."
        }), 401

    try:
        start_date = datetime.strptime(data['start_date'], "%Y-%m-%d").date()
        end_date = datetime.strptime(data['end_date'], "%Y-%m-%d").date()
        if end_date <= start_date:
            return jsonify({"message": "Check-out date must be after check-in date"}), 400
    except ValueError:
        return jsonify({"message": "Dates must be in YYYY-MM-DD format"}), 400

    booking = Booking(
        user_id=user.id,
        room_id=room.id,
        start_date=start_date,
        end_date=end_date
    )
    db.session.add(booking)
    room.is_available = False
    db.session.commit()

    return jsonify({
        "message": f"Room #{room.id} ({room.room_type}) booked successfully!",
        "booking_id": booking.id,
        "room_id": room.id,
        "user_id": user.id,
        "user_name": user.name
    }), 201

@app.route('/bookings', methods=['GET'])
def all_bookings():
    user_id = request.args.get('user_id')
    query = Booking.query
    if user_id:
        try:
            query = query.filter_by(user_id=int(user_id))
        except ValueError:
            pass
    bookings = query.order_by(Booking.id.desc()).all()
    result = []
    for b in bookings:
        room = Room.query.get(b.room_id)
        user = User.query.get(b.user_id)
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
    return jsonify(result)

@app.route('/cancel/<int:booking_id>', methods=['DELETE'])
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": f"Booking ID #{booking_id} not found"}), 404

    room = Room.query.get(booking.room_id)
    if room:
        room.is_available = True
    
    db.session.delete(booking)
    db.session.commit()
    return jsonify({
        "message": f"Booking #{booking_id} cancelled successfully! Room #{booking.room_id} is now available.",
        "booking_id": booking_id
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
