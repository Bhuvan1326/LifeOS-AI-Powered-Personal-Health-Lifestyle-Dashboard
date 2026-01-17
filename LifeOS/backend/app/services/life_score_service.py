from sqlalchemy.orm import Session
from datetime import date, timedelta
from .habit_service import get_habit_score
from .mood_service import get_mood_score, analyze_mood_trends
from .nutrition_service import get_nutrition_score, analyze_nutrition_patterns
from .finance_service import get_finance_score, analyze_spending_patterns
from ..models.ai_scores import AIInsight
from ..models.habit import Habit, HabitLog
from ..models.mood import MoodEntry
from ..models.nutrition import FoodLog
from ..models.finance import Transaction

WEIGHTS = {
    "habit": 0.30,
    "nutrition": 0.25,
    "mood": 0.20,
    "finance": 0.15,
    "consistency": 0.10
}

def calculate_consistency_score(db: Session, user_id: int, days: int = 7) -> float:
    start_date = date.today() - timedelta(days=days)
    
    habit_days = db.query(HabitLog.completed_at).filter(
        HabitLog.user_id == user_id,
        HabitLog.completed_at >= start_date
    ).distinct().count()
    
    mood_days = db.query(MoodEntry.logged_at).filter(
        MoodEntry.user_id == user_id,
        MoodEntry.logged_at >= start_date
    ).distinct().count()
    
    food_days = db.query(FoodLog.logged_at).filter(
        FoodLog.user_id == user_id,
        FoodLog.logged_at >= start_date
    ).distinct().count()
    
    finance_days = db.query(Transaction.transaction_date).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_date
    ).distinct().count()
    
    avg_consistency = (
        (habit_days / days) * 25 +
        (mood_days / days) * 25 +
        (food_days / days) * 25 +
        (min(finance_days, days) / days) * 25
    )
    
    return min(round(avg_consistency, 2), 100)

def calculate_life_score(db: Session, user_id: int) -> dict:
    habit_score = get_habit_score(db, user_id)
    nutrition_score = get_nutrition_score(db, user_id)
    mood_score = get_mood_score(db, user_id)
    finance_score = get_finance_score(db, user_id)
    consistency_score = calculate_consistency_score(db, user_id)
    
    total_score = (
        habit_score * WEIGHTS["habit"] +
        nutrition_score * WEIGHTS["nutrition"] +
        mood_score * WEIGHTS["mood"] +
        finance_score * WEIGHTS["finance"] +
        consistency_score * WEIGHTS["consistency"]
    )
    
    return {
        "habit_score": habit_score,
        "nutrition_score": nutrition_score,
        "mood_score": mood_score,
        "finance_score": finance_score,
        "consistency_score": consistency_score,
        "total_score": round(total_score, 2)
    }

def generate_insights(db: Session, user_id: int):
    today = date.today()
    
    existing = db.query(AIInsight).filter(
        AIInsight.user_id == user_id,
        AIInsight.generated_at >= today
    ).first()
    
    if existing:
        return
    
    scores = calculate_life_score(db, user_id)
    
    insights_to_add = []
    
    if scores["habit_score"] < 40:
        insights_to_add.append({
            "category": "habits",
            "insight_type": "recommendation",
            "title": "Boost Your Habit Score",
            "content": "Your habit score is below average. Try focusing on completing at least one habit daily to build momentum.",
            "priority": 4
        })
    elif scores["habit_score"] > 80:
        insights_to_add.append({
            "category": "habits",
            "insight_type": "pattern",
            "title": "Great Habit Consistency!",
            "content": "Your habit tracking is excellent. Consider adding a new challenging habit to continue growing.",
            "priority": 2
        })
    
    if scores["nutrition_score"] < 40:
        insights_to_add.append({
            "category": "nutrition",
            "insight_type": "alert",
            "title": "Nutrition Needs Attention",
            "content": "Your nutrition score indicates room for improvement. Focus on logging meals and hitting your calorie and protein targets.",
            "priority": 5
        })
    
    if scores["mood_score"] < 40:
        mood_analysis = analyze_mood_trends(db, user_id)
        insights_to_add.append({
            "category": "mood",
            "insight_type": "alert",
            "title": "Mood Support Needed",
            "content": "Your mood score suggests you may be struggling. Consider activities that boost your wellbeing, like exercise or social connection.",
            "priority": 5
        })
    
    if scores["finance_score"] < 40:
        insights_to_add.append({
            "category": "finance",
            "insight_type": "recommendation",
            "title": "Financial Review Recommended",
            "content": "Your finance score is low. Review your spending categories and consider setting or adjusting budgets.",
            "priority": 4
        })
    
    if scores["consistency_score"] < 30:
        insights_to_add.append({
            "category": "general",
            "insight_type": "recommendation",
            "title": "Improve Daily Tracking",
            "content": "Consistency is key to accurate insights. Try to log data across all categories daily for better recommendations.",
            "priority": 3
        })
    
    if scores["total_score"] >= 75:
        insights_to_add.append({
            "category": "general",
            "insight_type": "pattern",
            "title": "Excellent Overall Performance!",
            "content": f"Your Life Score of {scores['total_score']} is impressive! Keep maintaining your healthy lifestyle habits.",
            "priority": 1
        })
    
    for insight_data in insights_to_add:
        insight = AIInsight(
            user_id=user_id,
            **insight_data
        )
        db.add(insight)
    
    db.commit()
