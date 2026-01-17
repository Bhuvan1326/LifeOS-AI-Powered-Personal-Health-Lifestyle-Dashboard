from sqlalchemy.orm import Session
from datetime import date, timedelta
from ..models.mood import MoodEntry

def get_mood_score(db: Session, user_id: int, days: int = 7) -> float:
    start_date = date.today() - timedelta(days=days)
    
    entries = db.query(MoodEntry).filter(
        MoodEntry.user_id == user_id,
        MoodEntry.logged_at >= start_date
    ).all()
    
    if not entries:
        return 50.0
    
    avg_mood = sum(e.mood_score for e in entries) / len(entries)
    avg_energy = sum(e.energy_level for e in entries) / len(entries)
    avg_stress = sum(e.stress_level for e in entries) / len(entries)
    avg_sleep = sum(e.sleep_hours or 7 for e in entries) / len(entries)
    
    mood_score = avg_mood * 10
    energy_score = avg_energy * 10
    stress_score = (10 - avg_stress) * 10
    sleep_score = min(avg_sleep / 8 * 100, 100)
    
    total_score = (mood_score * 0.4 + energy_score * 0.2 + stress_score * 0.2 + sleep_score * 0.2)
    
    return min(round(total_score, 2), 100)

def analyze_mood_trends(db: Session, user_id: int, days: int = 30) -> dict:
    start_date = date.today() - timedelta(days=days)
    
    entries = db.query(MoodEntry).filter(
        MoodEntry.user_id == user_id,
        MoodEntry.logged_at >= start_date
    ).order_by(MoodEntry.logged_at).all()
    
    if len(entries) < 3:
        return {"trend": "insufficient_data", "insights": []}
    
    recent = entries[-7:]
    earlier = entries[:-7] if len(entries) > 7 else entries[:len(entries)//2]
    
    recent_avg = sum(e.mood_score for e in recent) / len(recent)
    earlier_avg = sum(e.mood_score for e in earlier) / len(earlier) if earlier else recent_avg
    
    if recent_avg > earlier_avg + 1:
        trend = "improving"
    elif recent_avg < earlier_avg - 1:
        trend = "declining"
    else:
        trend = "stable"
    
    insights = []
    
    low_energy_days = [e for e in entries if e.energy_level < 4]
    if len(low_energy_days) > len(entries) * 0.3:
        insights.append("You've had multiple low energy days. Consider adjusting sleep or nutrition.")
    
    high_stress_days = [e for e in entries if e.stress_level > 7]
    if len(high_stress_days) > len(entries) * 0.3:
        insights.append("Stress levels have been elevated. Consider stress management techniques.")
    
    sleep_entries = [e for e in entries if e.sleep_hours]
    if sleep_entries:
        avg_sleep = sum(e.sleep_hours for e in sleep_entries) / len(sleep_entries)
        if avg_sleep < 6:
            insights.append("Your average sleep is below recommended. Aim for 7-8 hours.")
    
    return {"trend": trend, "insights": insights}
