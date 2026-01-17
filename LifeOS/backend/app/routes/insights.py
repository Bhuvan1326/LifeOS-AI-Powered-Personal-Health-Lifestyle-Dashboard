from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.ai_scores import LifeScore, AIInsight
from ..schemas.ai_schema import LifeScoreResponse, AIInsightResponse, DashboardData, ScoreBreakdown
from ..services.life_score_service import calculate_life_score, generate_insights

router = APIRouter(prefix="/api/insights", tags=["Insights"])

@router.get("/life-score", response_model=LifeScoreResponse)
def get_life_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    existing = db.query(LifeScore).filter(
        LifeScore.user_id == current_user.id,
        LifeScore.calculated_at == today
    ).first()
    
    if existing:
        return LifeScoreResponse.model_validate(existing)
    
    score_data = calculate_life_score(db, current_user.id)
    
    life_score = LifeScore(
        user_id=current_user.id,
        habit_score=score_data["habit_score"],
        nutrition_score=score_data["nutrition_score"],
        mood_score=score_data["mood_score"],
        finance_score=score_data["finance_score"],
        consistency_score=score_data["consistency_score"],
        total_score=score_data["total_score"],
        calculated_at=today
    )
    db.add(life_score)
    db.commit()
    db.refresh(life_score)
    
    return LifeScoreResponse.model_validate(life_score)

@router.get("/life-score/history", response_model=List[LifeScoreResponse])
def get_life_score_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    scores = db.query(LifeScore).filter(
        LifeScore.user_id == current_user.id,
        LifeScore.calculated_at >= start_date
    ).order_by(LifeScore.calculated_at.desc()).all()
    return [LifeScoreResponse.model_validate(s) for s in scores]

@router.get("/life-score/breakdown", response_model=ScoreBreakdown)
def get_score_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    score_data = calculate_life_score(db, current_user.id)
    return ScoreBreakdown(**score_data)

@router.get("/recommendations", response_model=List[AIInsightResponse])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    generate_insights(db, current_user.id)
    
    insights = db.query(AIInsight).filter(
        AIInsight.user_id == current_user.id,
        AIInsight.is_read == 0
    ).order_by(AIInsight.priority.desc()).limit(10).all()
    
    return [AIInsightResponse.model_validate(i) for i in insights]

@router.post("/recommendations/{insight_id}/read")
def mark_insight_read(
    insight_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    insight = db.query(AIInsight).filter(
        AIInsight.id == insight_id,
        AIInsight.user_id == current_user.id
    ).first()
    
    if insight:
        insight.is_read = 1
        db.commit()
    
    return {"message": "Insight marked as read"}

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from ..models.habit import Habit, HabitLog
    from ..models.nutrition import FoodLog, NutritionGoal
    from ..models.mood import MoodEntry
    from ..models.finance import Transaction
    
    today = date.today()
    week_start = today - timedelta(days=7)
    
    life_score = db.query(LifeScore).filter(
        LifeScore.user_id == current_user.id,
        LifeScore.calculated_at == today
    ).first()
    
    if not life_score:
        score_data = calculate_life_score(db, current_user.id)
        life_score = LifeScore(
            user_id=current_user.id,
            **{k: v for k, v in score_data.items() if k != "total_score"},
            total_score=score_data["total_score"],
            calculated_at=today
        )
        db.add(life_score)
        db.commit()
        db.refresh(life_score)
    
    score_history = db.query(LifeScore).filter(
        LifeScore.user_id == current_user.id,
        LifeScore.calculated_at >= week_start
    ).order_by(LifeScore.calculated_at.desc()).all()
    
    generate_insights(db, current_user.id)
    insights = db.query(AIInsight).filter(
        AIInsight.user_id == current_user.id,
        AIInsight.is_read == 0
    ).order_by(AIInsight.priority.desc()).limit(5).all()
    
    habits = db.query(Habit).filter(Habit.user_id == current_user.id, Habit.is_active == True).all()
    today_logs = db.query(HabitLog).filter(
        HabitLog.user_id == current_user.id,
        HabitLog.completed_at == today
    ).all()
    habit_summary = {
        "total_habits": len(habits),
        "completed_today": len(set(l.habit_id for l in today_logs))
    }
    
    nutrition_goal = db.query(NutritionGoal).filter(NutritionGoal.user_id == current_user.id).first()
    today_food = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at == today
    ).all()
    nutrition_summary = {
        "calories_consumed": sum(f.calories for f in today_food),
        "calories_goal": nutrition_goal.daily_calories if nutrition_goal else 2000
    }
    
    today_mood = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.logged_at == today
    ).first()
    mood_summary = {
        "today_mood": today_mood.mood_score if today_mood else None,
        "today_energy": today_mood.energy_level if today_mood else None
    }
    
    month_start = date(today.year, today.month, 1)
    month_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= month_start
    ).all()
    income = sum(t.amount for t in month_transactions if t.type == "income")
    expenses = sum(t.amount for t in month_transactions if t.type == "expense")
    finance_summary = {
        "monthly_income": income,
        "monthly_expenses": expenses,
        "net_savings": income - expenses
    }
    
    return DashboardData(
        life_score=LifeScoreResponse.model_validate(life_score) if life_score else None,
        score_history=[LifeScoreResponse.model_validate(s) for s in score_history],
        insights=[AIInsightResponse.model_validate(i) for i in insights],
        habit_summary=habit_summary,
        nutrition_summary=nutrition_summary,
        mood_summary=mood_summary,
        finance_summary=finance_summary
    )
