# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    age: Optional[int] = Field(25, ge=18, le=120)
    address: Optional[str] = Field("", max_length=200)

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4, max_length=4)
    age: Optional[int] = 25
    address: Optional[str] = ""

class UserLogin(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class RoomResponse(BaseModel):
    id: int
    type: str
    price: int
    is_available: bool
    image: str
    amenities: List[str]
    capacity: int
    description: str

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    room_id: int
    start_date: str
    end_date: str
    user_id: Optional[int] = None
    user_email: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: str
    user_email: str
    room_id: int
    room_type: str
    room_price: int
    room_image: str
    start_date: str
    end_date: str

    class Config:
        from_attributes = True

class GenericMessage(BaseModel):
    message: str
    user: Optional[UserResponse] = None
