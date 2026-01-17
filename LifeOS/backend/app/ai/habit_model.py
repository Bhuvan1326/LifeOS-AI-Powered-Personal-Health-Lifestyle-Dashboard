from datetime import date, timedelta
from typing import List, Dict

def analyze_habit_patterns(logs: List[Dict], days: int = 30) -> Dict:
    if not logs:
        return {"pattern": "no_data", "recommendations": []}
    
    dates = [log["completed_at"] for log in logs]
    
    weekday_counts = [0] * 7
    for d in dates:
        if isinstance(d, str):
            d = date.fromisoformat(d)
        weekday_counts[d.weekday()] += 1
    
    best_day = weekday_counts.index(max(weekday_counts))
    worst_day = weekday_counts.index(min(weekday_counts))
    
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    recommendations = []
    if max(weekday_counts) > min(weekday_counts) * 2:
        recommendations.append(f"You're most consistent on {day_names[best_day]}s. Try to match that energy on {day_names[worst_day]}s.")
    
    return {
        "pattern": "weekday_variation" if max(weekday_counts) != min(weekday_counts) else "consistent",
        "best_day": day_names[best_day],
        "worst_day": day_names[worst_day],
        "weekday_distribution": dict(zip(day_names, weekday_counts)),
        "recommendations": recommendations
    }

def predict_habit_success(streak: int, completion_rate: float, days_since_creation: int) -> float:
    if days_since_creation < 7:
        return 50.0
    
    streak_factor = min(streak / 21, 1.0) * 30
    completion_factor = completion_rate * 0.5
    momentum_factor = 20 if streak >= 7 else (streak * 3)
    
    success_probability = streak_factor + completion_factor + momentum_factor
    
    return min(round(success_probability, 2), 100)

def suggest_habit_improvements(habit_data: Dict) -> List[str]:
    suggestions = []
    
    if habit_data.get("streak", 0) == 0:
        suggestions.append("Start small - complete this habit just once today to begin building momentum.")
    elif habit_data.get("streak", 0) < 7:
        remaining = 7 - habit_data.get("streak", 0)
        suggestions.append(f"You're {remaining} days away from forming a weekly habit. Keep going!")
    elif habit_data.get("streak", 0) >= 21:
        suggestions.append("Congratulations! This habit is becoming automatic. Consider increasing difficulty.")
    
    if habit_data.get("completion_rate", 0) < 50:
        suggestions.append("Consider making this habit easier or more specific to improve completion rate.")
    
    return suggestions
