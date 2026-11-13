# backend/routers/rooms.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from services.hotel_service import get_all_rooms

router = APIRouter(tags=["Rooms"])

@router.get("/rooms")
def list_rooms(
    all: bool = Query(False, description="Include booked rooms"),
    db: Session = Depends(get_db)
):
    return get_all_rooms(db, show_all=all)
