# backend/routers/ai.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
from services.ai_orchestrator import ai_orchestrator

router = APIRouter(prefix="/ai", tags=["AI & Intelligence"])

@router.post("/chat")
async def ai_chat(request: Request):
    data = await request.json() or {}
    message = data.get("message", "")
    history = data.get("history", [])
    context = data.get("context", {})
    return ai_orchestrator.chat(message=message, history=history, context=context)

@router.post("/recommend")
async def ai_recommend(request: Request, db: Session = Depends(get_db)):
    data = await request.json() or {}
    budget_max = data.get("budget_max")
    guests = data.get("guests")
    rooms = ai_orchestrator.recommend_rooms(budget_max=budget_max, guests=guests, db=db)
    return {"recommendations": rooms}

@router.post("/compare")
async def ai_compare(request: Request, db: Session = Depends(get_db)):
    data = await request.json() or {}
    room_ids = data.get("room_ids", [])
    return ai_orchestrator.compare_rooms(room_ids=room_ids, db=db)
