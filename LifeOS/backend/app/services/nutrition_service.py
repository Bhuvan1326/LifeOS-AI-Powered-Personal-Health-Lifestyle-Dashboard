from sqlalchemy.orm import Session
from datetime import date, timedelta
from ..models.nutrition import FoodLog, NutritionGoal

def get_nutrition_score(db: Session, user_id: int, days: int = 7) -> float:
    start_date = date.today() - timedelta(days=days)
    
    goal = db.query(NutritionGoal).filter(NutritionGoal.user_id == user_id).first()
    if not goal:
        goal_calories = 2000
        goal_protein = 50
        goal_carbs = 250
        goal_fat = 65
    else:
        goal_calories = goal.daily_calories
        goal_protein = goal.daily_protein
        goal_carbs = goal.daily_carbs
        goal_fat = goal.daily_fat
    
    food_logs = db.query(FoodLog).filter(
        FoodLog.user_id == user_id,
        FoodLog.logged_at >= start_date
    ).all()
    
    if not food_logs:
        return 50.0
    
    days_logged = set(log.logged_at for log in food_logs)
    
    total_score = 0
    for log_date in days_logged:
        day_logs = [l for l in food_logs if l.logged_at == log_date]
        
        total_cal = sum(l.calories for l in day_logs)
        total_protein = sum(l.protein for l in day_logs)
        total_carbs = sum(l.carbs for l in day_logs)
        total_fat = sum(l.fat for l in day_logs)
        
        cal_ratio = min(total_cal / goal_calories, 1.2) if goal_calories > 0 else 1
        cal_score = 100 - abs(1 - cal_ratio) * 100
        
        protein_ratio = min(total_protein / goal_protein, 1.5) if goal_protein > 0 else 1
        protein_score = min(protein_ratio * 100, 100)
        
        carb_ratio = min(total_carbs / goal_carbs, 1.2) if goal_carbs > 0 else 1
        carb_score = 100 - abs(1 - carb_ratio) * 50
        
        fat_ratio = min(total_fat / goal_fat, 1.2) if goal_fat > 0 else 1
        fat_score = 100 - abs(1 - fat_ratio) * 50
        
        day_score = cal_score * 0.4 + protein_score * 0.3 + carb_score * 0.15 + fat_score * 0.15
        total_score += max(0, day_score)
    
    consistency_bonus = (len(days_logged) / days) * 20
    avg_score = (total_score / len(days_logged)) + consistency_bonus
    
    return min(round(avg_score, 2), 100)

def analyze_nutrition_patterns(db: Session, user_id: int, days: int = 14) -> dict:
    start_date = date.today() - timedelta(days=days)
    
    food_logs = db.query(FoodLog).filter(
        FoodLog.user_id == user_id,
        FoodLog.logged_at >= start_date
    ).all()
    
    insights = []
    
    if not food_logs:
        return {"insights": ["Start logging your meals to get personalized nutrition insights."]}
    
    goal = db.query(NutritionGoal).filter(NutritionGoal.user_id == user_id).first()
    goal_calories = goal.daily_calories if goal else 2000
    
    daily_calories = {}
    for log in food_logs:
        day = log.logged_at
        daily_calories[day] = daily_calories.get(day, 0) + log.calories
    
    if daily_calories:
        avg_cal = sum(daily_calories.values()) / len(daily_calories)
        if avg_cal < goal_calories * 0.7:
            insights.append(f"Your average calorie intake ({int(avg_cal)}) is below target. Consider eating more balanced meals.")
        elif avg_cal > goal_calories * 1.2:
            insights.append(f"Your average calorie intake ({int(avg_cal)}) exceeds target. Monitor portion sizes.")
    
    meal_counts = {}
    for log in food_logs:
        meal_counts[log.meal_type] = meal_counts.get(log.meal_type, 0) + 1
    
    if meal_counts.get("breakfast", 0) < len(daily_calories) * 0.5:
        insights.append("You're often skipping breakfast. A healthy breakfast can boost energy and focus.")
    
    total_protein = sum(l.protein for l in food_logs)
    days_count = len(daily_calories) or 1
    avg_protein = total_protein / days_count
    goal_protein = goal.daily_protein if goal else 50
    if avg_protein < goal_protein * 0.7:
        insights.append("Protein intake is below target. Include more lean meats, beans, or dairy.")
    
    return {"insights": insights, "avg_daily_calories": int(avg_cal) if daily_calories else 0}
