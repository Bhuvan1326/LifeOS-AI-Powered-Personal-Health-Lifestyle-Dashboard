from sqlalchemy.orm import Session
from datetime import date, timedelta
from ..models.habit import Habit, HabitLog

def calculate_streak(db: Session, habit_id: int, user_id: int) -> int:
    today = date.today()
    streak = 0
    current_date = today
    
    while True:
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == user_id,
            HabitLog.completed_at == current_date
        ).first()
        
        if log:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
        
        if streak > 365:
            break
    
    return streak

def calculate_completion_rate(db: Session, habit_id: int, user_id: int, days: int = 30) -> float:
    start_date = date.today() - timedelta(days=days)
    
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return 0.0
    
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user_id,
        HabitLog.completed_at >= start_date
    ).all()
    
    unique_days = len(set(log.completed_at for log in logs))
    
    return round((unique_days / days) * 100, 2)

def get_habit_score(db: Session, user_id: int) -> float:
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.is_active == True
    ).all()
    
    if not habits:
        return 50.0
    
    total_score = 0
    for habit in habits:
        streak = calculate_streak(db, habit.id, user_id)
        completion_rate = calculate_completion_rate(db, habit.id, user_id)
        
        streak_score = min(streak * 5, 50)
        completion_score = completion_rate * 0.5
        
        total_score += streak_score + completion_score
    
    avg_score = total_score / len(habits)
    return min(round(avg_score, 2), 100)
