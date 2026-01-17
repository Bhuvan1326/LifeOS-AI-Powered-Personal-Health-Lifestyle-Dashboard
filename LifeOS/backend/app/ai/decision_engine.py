from typing import Dict, List
from datetime import date

class DecisionEngine:
    WEIGHTS = {
        "habit": 0.30,
        "nutrition": 0.25,
        "mood": 0.20,
        "finance": 0.15,
        "consistency": 0.10
    }
    
    PRIORITY_THRESHOLDS = {
        "critical": 30,
        "high": 50,
        "medium": 70,
        "low": 85
    }
    
    @staticmethod
    def calculate_life_score(scores: Dict[str, float]) -> float:
        total = 0
        for category, weight in DecisionEngine.WEIGHTS.items():
            score = scores.get(f"{category}_score", 50)
            total += score * weight
        return round(total, 2)
    
    @staticmethod
    def get_priority_areas(scores: Dict[str, float]) -> List[Dict]:
        priorities = []
        
        score_categories = [
            ("habit_score", "Habits", "Build consistent daily routines"),
            ("nutrition_score", "Nutrition", "Optimize your diet and eating habits"),
            ("mood_score", "Mood", "Focus on mental wellbeing"),
            ("finance_score", "Finance", "Improve financial health"),
            ("consistency_score", "Consistency", "Log data more regularly")
        ]
        
        for key, name, description in score_categories:
            score = scores.get(key, 50)
            
            if score < DecisionEngine.PRIORITY_THRESHOLDS["critical"]:
                priority = "critical"
            elif score < DecisionEngine.PRIORITY_THRESHOLDS["high"]:
                priority = "high"
            elif score < DecisionEngine.PRIORITY_THRESHOLDS["medium"]:
                priority = "medium"
            else:
                priority = "low"
            
            priorities.append({
                "category": name,
                "score": score,
                "priority": priority,
                "description": description
            })
        
        priorities.sort(key=lambda x: x["score"])
        return priorities
    
    @staticmethod
    def generate_daily_recommendations(scores: Dict[str, float], context: Dict = None) -> List[str]:
        recommendations = []
        priorities = DecisionEngine.get_priority_areas(scores)
        
        top_priority = priorities[0] if priorities else None
        
        if top_priority:
            if top_priority["category"] == "Habits":
                recommendations.extend([
                    "Start your day by completing one key habit",
                    "Set a specific time for your most important habit",
                    "Use habit stacking - attach new habits to existing ones"
                ])
            elif top_priority["category"] == "Nutrition":
                recommendations.extend([
                    "Plan your meals for today",
                    "Drink water before each meal",
                    "Include protein in every meal"
                ])
            elif top_priority["category"] == "Mood":
                recommendations.extend([
                    "Take 10 minutes for mindfulness or meditation",
                    "Connect with someone who lifts your spirits",
                    "Get outside for fresh air and natural light"
                ])
            elif top_priority["category"] == "Finance":
                recommendations.extend([
                    "Review yesterday's spending",
                    "Identify one expense you could reduce",
                    "Check your budget progress for the month"
                ])
            elif top_priority["category"] == "Consistency":
                recommendations.extend([
                    "Set daily reminders to log your data",
                    "Spend 5 minutes each evening on data entry",
                    "Start with just one category and build from there"
                ])
        
        life_score = DecisionEngine.calculate_life_score(scores)
        
        if life_score >= 80:
            recommendations.append("Excellent progress! Consider helping others or mentoring.")
        elif life_score >= 60:
            recommendations.append("Good momentum! Focus on your weakest area today.")
        elif life_score >= 40:
            recommendations.append("Room for improvement. Pick one small win to achieve today.")
        else:
            recommendations.append("Start with the basics. One positive action can change your trajectory.")
        
        return recommendations[:5]
    
    @staticmethod
    def assess_decision_impact(
        category: str,
        action: str,
        current_scores: Dict[str, float]
    ) -> Dict:
        impact_matrix = {
            "habit": {
                "complete": 5,
                "skip": -3,
                "add_new": 2
            },
            "nutrition": {
                "log_meal": 3,
                "healthy_choice": 5,
                "unhealthy_choice": -2
            },
            "mood": {
                "log_mood": 3,
                "journal": 4,
                "positive_activity": 5
            },
            "finance": {
                "log_expense": 2,
                "save": 5,
                "overspend": -4
            }
        }
        
        category_impact = impact_matrix.get(category.lower(), {})
        impact_value = category_impact.get(action.lower(), 0)
        
        current_score = current_scores.get(f"{category}_score", 50)
        projected_score = min(100, max(0, current_score + impact_value))
        
        return {
            "category": category,
            "action": action,
            "impact": impact_value,
            "current_score": current_score,
            "projected_score": projected_score,
            "recommendation": "positive" if impact_value > 0 else "negative" if impact_value < 0 else "neutral"
        }
