# backend/seed_data.py
"""
Database Seeding Script for Rajmahal Residency
Seeds 25 luxury rooms across 5 distinct categories + default patron.
Compatible with SQLite and PostgreSQL + pgvector.
"""
from database import SessionLocal, engine, Base
from models import Room, User

CATEGORIES_SPEC = [
    {
        'category': 'Single',
        'price': 1200,
        'start_id': 101,
        'count': 5
    },
    {
        'category': 'Double',
        'price': 2200,
        'start_id': 201,
        'count': 5
    },
    {
        'category': 'Suite',
        'price': 3800,
        'start_id': 301,
        'count': 5
    },
    {
        'category': 'Deluxe',
        'price': 5500,
        'start_id': 401,
        'count': 5
    },
    {
        'category': 'Family',
        'price': 7500,
        'start_id': 501,
        'count': 5
    }
]

def seed_database(force_refresh=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed default user if none exists
        if db.query(User).count() == 0:
            user = User(name="Harsh Saini", email="harsh@example.com", password="1234", age=22, address="Rohtak, India")
            db.add(user)
            db.commit()
            print("Default user created (Harsh Saini - ID: 1)")

        if force_refresh or db.query(Room).count() < 25:
            # Clear old rooms if refreshing
            db.query(Room).delete()
            db.commit()

            rooms = []
            for spec in CATEGORIES_SPEC:
                for i in range(spec['count']):
                    room_id = spec['start_id'] + i
                    rooms.append(Room(
                        id=room_id,
                        room_type=spec['category'],
                        price=spec['price'],
                        is_available=True
                    ))
            
            db.bulk_save_objects(rooms)
            db.commit()
            print(f"Added {len(rooms)} rooms across 5 categories successfully!")

        print("Database initialized and verified successfully!")
    finally:
        db.close()

if __name__ == '__main__':
    import sys
    force = '--force' in sys.argv
    seed_database(force_refresh=force)
