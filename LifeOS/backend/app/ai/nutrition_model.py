from typing import List, Dict

FOOD_DATABASE = {
    "apple": {"calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "fiber": 4.4},
    "banana": {"calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "fiber": 3.1},
    "chicken breast": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
    "rice": {"calories": 206, "protein": 4.3, "carbs": 45, "fat": 0.4, "fiber": 0.6},
    "salad": {"calories": 20, "protein": 1.5, "carbs": 3.5, "fat": 0.2, "fiber": 2},
    "egg": {"calories": 78, "protein": 6, "carbs": 0.6, "fat": 5, "fiber": 0},
    "bread": {"calories": 79, "protein": 2.7, "carbs": 15, "fat": 1, "fiber": 0.6},
    "milk": {"calories": 149, "protein": 8, "carbs": 12, "fat": 8, "fiber": 0},
}

def estimate_nutrition(food_name: str) -> Dict:
    food_lower = food_name.lower()
    
    for key, nutrients in FOOD_DATABASE.items():
        if key in food_lower:
            return nutrients
    
    return {"calories": 200, "protein": 5, "carbs": 25, "fat": 8, "fiber": 2}

def analyze_daily_nutrition(food_logs: List[Dict], goals: Dict) -> Dict:
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}
    
    for log in food_logs:
        totals["calories"] += log.get("calories", 0)
        totals["protein"] += log.get("protein", 0)
        totals["carbs"] += log.get("carbs", 0)
        totals["fat"] += log.get("fat", 0)
        totals["fiber"] += log.get("fiber", 0)
    
    analysis = {
        "totals": totals,
        "percentages": {},
        "recommendations": []
    }
    
    if goals:
        analysis["percentages"] = {
            "calories": round((totals["calories"] / goals.get("daily_calories", 2000)) * 100, 1),
            "protein": round((totals["protein"] / goals.get("daily_protein", 50)) * 100, 1),
            "carbs": round((totals["carbs"] / goals.get("daily_carbs", 250)) * 100, 1),
            "fat": round((totals["fat"] / goals.get("daily_fat", 65)) * 100, 1),
        }
        
        if analysis["percentages"]["protein"] < 80:
            analysis["recommendations"].append("Consider adding more protein-rich foods like eggs, chicken, or legumes.")
        
        if analysis["percentages"]["calories"] > 110:
            analysis["recommendations"].append("You've exceeded your calorie goal. Consider lighter options for remaining meals.")
        elif analysis["percentages"]["calories"] < 70:
            analysis["recommendations"].append("You're under your calorie target. Make sure to eat balanced meals.")
    
    return analysis

def suggest_meal(current_intake: Dict, goals: Dict, meal_type: str) -> List[str]:
    suggestions = []
    
    remaining_calories = goals.get("daily_calories", 2000) - current_intake.get("calories", 0)
    remaining_protein = goals.get("daily_protein", 50) - current_intake.get("protein", 0)
    
    if meal_type == "breakfast":
        suggestions = [
            "Oatmeal with fruits and nuts",
            "Greek yogurt with berries",
            "Scrambled eggs with whole grain toast"
        ]
    elif meal_type == "lunch":
        if remaining_protein > 20:
            suggestions = [
                "Grilled chicken salad",
                "Turkey sandwich with vegetables",
                "Quinoa bowl with lean protein"
            ]
        else:
            suggestions = [
                "Vegetable soup with whole grain bread",
                "Mediterranean salad",
                "Veggie wrap"
            ]
    elif meal_type == "dinner":
        if remaining_calories > 600:
            suggestions = [
                "Salmon with roasted vegetables",
                "Chicken stir-fry with brown rice",
                "Lean beef with sweet potato"
            ]
        else:
            suggestions = [
                "Grilled fish with salad",
                "Vegetable curry (light)",
                "Soup with lean protein"
            ]
    else:
        suggestions = [
            "Apple with almond butter",
            "Greek yogurt",
            "Mixed nuts (small portion)",
            "Vegetables with hummus"
        ]
    
    return suggestions
