from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Float, Text
from sqlalchemy.sql import func
from ..core.database import Base

class LifeScore(Base):
    __tablename__ = "life_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_score = Column(Float, default=0)
    nutrition_score = Column(Float, default=0)
    mood_score = Column(Float, default=0)
    finance_score = Column(Float, default=0)
    consistency_score = Column(Float, default=0)
    total_score = Column(Float, default=0)
    calculated_at = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)  # habits, nutrition, mood, finance, general
    insight_type = Column(String, nullable=False)  # recommendation, alert, pattern
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(Integer, default=1)  # 1-5
    is_read = Column(Integer, default=0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
