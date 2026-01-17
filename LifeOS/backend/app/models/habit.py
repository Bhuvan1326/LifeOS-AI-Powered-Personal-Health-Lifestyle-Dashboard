from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    frequency = Column(String, default="daily")
    target_count = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    completed_at = Column(Date, nullable=False)
    count = Column(Integer, default=1)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
