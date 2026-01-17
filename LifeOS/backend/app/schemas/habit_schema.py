from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    frequency: str = "daily"
    target_count: int = 1

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    target_count: Optional[int] = None
    is_active: Optional[bool] = None

class HabitResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    frequency: str
    target_count: int
    is_active: bool
    created_at: datetime
    current_streak: Optional[int] = 0
    completion_rate: Optional[float] = 0

    class Config:
        from_attributes = True

class HabitLogCreate(BaseModel):
    habit_id: int
    completed_at: date
    count: int = 1
    notes: Optional[str] = None

class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    user_id: int
    completed_at: date
    count: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class HabitWithLogs(HabitResponse):
    logs: List[HabitLogResponse] = []
