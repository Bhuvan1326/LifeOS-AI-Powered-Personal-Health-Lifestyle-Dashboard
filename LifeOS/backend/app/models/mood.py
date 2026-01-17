from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text
from sqlalchemy.sql import func
from ..core.database import Base

class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood_score = Column(Integer, nullable=False)  # 1-10
    energy_level = Column(Integer, default=5)  # 1-10
    stress_level = Column(Integer, default=5)  # 1-10
    sleep_hours = Column(Integer)
    notes = Column(Text)
    logged_at = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    content = Column(Text, nullable=False)
    mood_id = Column(Integer, ForeignKey("mood_entries.id"))
    tags = Column(String)
    logged_at = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
