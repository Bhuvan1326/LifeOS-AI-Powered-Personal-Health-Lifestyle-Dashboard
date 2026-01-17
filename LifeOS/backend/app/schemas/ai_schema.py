from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class LifeScoreResponse(BaseModel):
    id: int
    user_id: int
    habit_score: float
    nutrition_score: float
    mood_score: float
    finance_score: float
    consistency_score: float
    total_score: float
    calculated_at: date
    created_at: datetime

    class Config:
        from_attributes = True

class AIInsightResponse(BaseModel):
    id: int
    user_id: int
    category: str
    insight_type: str
    title: str
    content: str
    priority: int
    is_read: int
    generated_at: datetime

    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    life_score: Optional[LifeScoreResponse]
    score_history: List[LifeScoreResponse]
    insights: List[AIInsightResponse]
    habit_summary: dict
    nutrition_summary: dict
    mood_summary: dict
    finance_summary: dict

class ScoreBreakdown(BaseModel):
    habit_score: float
    nutrition_score: float
    mood_score: float
    finance_score: float
    consistency_score: float
    total_score: float
    habit_weight: float = 0.30
    nutrition_weight: float = 0.25
    mood_weight: float = 0.20
    finance_weight: float = 0.15
    consistency_weight: float = 0.10
