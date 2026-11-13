# backend/routers/bookings.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from database import get_db
from services.hotel_service import book_room, get_bookings, cancel_booking

router = APIRouter(tags=["Bookings"])

@router.post("/book", status_code=201)
async def create_booking(request: Request, db: Session = Depends(get_db)):
    data = await request.json() or {}
    if not data or 'room_id' not in data or 'start_date' not in data or 'end_date' not in data:
        raise HTTPException(status_code=400, detail={"message": "Missing required booking details (room_id, start_date, end_date)"})

    res = book_room(
        db,
        room_id=data['room_id'],
        start_date_str=data['start_date'],
        end_date_str=data['end_date'],
        user_id=data.get('user_id'),
        user_email=data.get('user_email')
    )
    if "error" in res:
        raise HTTPException(status_code=res["status_code"], detail={"message": res["error"]})
    return res

@router.get("/bookings")
def list_bookings(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    parsed_user_id = None
    if user_id:
        try:
            parsed_user_id = int(user_id)
        except ValueError:
            pass
    return get_bookings(db, user_id=parsed_user_id)

@router.delete("/cancel/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    res = cancel_booking(db, booking_id=booking_id)
    if "error" in res:
        raise HTTPException(status_code=res["status_code"], detail={"message": res["error"]})
    return res
