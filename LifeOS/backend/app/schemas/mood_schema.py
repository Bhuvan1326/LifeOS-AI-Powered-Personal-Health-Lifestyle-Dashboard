from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class MoodCreate(BaseModel):
    mood_score: int
    energy_level: int = 5
    stress_level: int = 5
    sleep_hours: Optional[int] = None
    notes: Optional[str] = None
    logged_at: date

class MoodUpdate(BaseModel):
    mood_score: Optional[int] = None
    energy_level: Optional[int] = None
    stress_level: Optional[int] = None
    sleep_hours: Optional[int] = None
    notes: Optional[str] = None

class MoodResponse(BaseModel):
    id: int
    user_id: int
    mood_score: int
    energy_level: int
    stress_level: int
    sleep_hours: Optional[int]
    notes: Optional[str]
    logged_at: date
    created_at: datetime

    class Config:
        from_attributes = True

class JournalCreate(BaseModel):
    title: Optional[str] = None
    content: str
    mood_id: Optional[int] = None
    tags: Optional[str] = None
    logged_at: date

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None

class JournalResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str]
    content: str
    mood_id: Optional[int]
    tags: Optional[str]
    logged_at: date
    created_at: datetime

    class Config:
        from_attributes = True
