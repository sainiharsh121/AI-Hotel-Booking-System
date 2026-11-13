# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from models import User
from services.hotel_service import register_user, login_user
from datetime import datetime

router = APIRouter(tags=["Authentication"])

@router.post("/register")
async def register(request: Request, db: Session = Depends(get_db)):
    data = await request.json() or {}
    res = register_user(
        db,
        name=data.get("name", ""),
        email=data.get("email", ""),
        password=data.get("password", ""),
        age=data.get("age", 25),
        address=data.get("address", "")
    )
    if "error" in res:
        raise HTTPException(status_code=res["status_code"], detail={"message": res["error"]})
    return {
        "message": res["message"],
        "user": res["user"]
    }

@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    data = await request.json() or {}
    res = login_user(
        db,
        email=data.get("email", ""),
        password=data.get("password", "")
    )
    if "error" in res:
        raise HTTPException(status_code=res["status_code"], detail={"message": res["error"]})
    return {
        "message": res["message"],
        "user": res["user"]
    }

@router.api_route("/users", methods=["GET", "POST"])
async def manage_users(request: Request, db: Session = Depends(get_db)):
    if request.method == "POST":
        data = await request.json() or {}
        name = data.get("name", "Guest")
        email = data.get("email", f"guest_{datetime.now().timestamp()}@example.com")
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return {"id": existing.id, "name": existing.name, "email": existing.email}
        new_user = User(
            name=name,
            email=email,
            age=data.get("age", 25),
            address=data.get("address", "New Delhi")
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "name": new_user.name, "email": new_user.email}

    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email} for u in users]
