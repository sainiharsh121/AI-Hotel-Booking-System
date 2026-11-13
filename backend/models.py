# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=True)
    email = Column(String(120), unique=True, index=True, nullable=True)
    password = Column(String(128), nullable=True)
    age = Column(Integer, nullable=True)
    address = Column(String(200), nullable=True)

class Room(Base):
    __tablename__ = 'room'

    id = Column(Integer, primary_key=True, index=True)
    room_type = Column(String(20), nullable=True)
    price = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True)

class Booking(Base):
    __tablename__ = 'booking'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    room_id = Column(Integer, ForeignKey('room.id'), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)