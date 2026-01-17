from typing import List, Dict

EXPENSE_CATEGORIES = {
    "essential": ["rent", "utilities", "groceries", "healthcare", "insurance", "transportation"],
    "lifestyle": ["dining", "entertainment", "shopping", "subscriptions", "hobbies"],
    "savings": ["savings", "investments", "emergency fund"],
    "debt": ["credit card", "loans", "mortgage"]
}

def categorize_expense(category: str) -> str:
    category_lower = category.lower()
    
    for cat_type, categories in EXPENSE_CATEGORIES.items():
        if any(c in category_lower for c in categories):
            return cat_type
    
    return "lifestyle"

def analyze_spending(transactions: List[Dict], income: float) -> Dict:
    if not transactions:
        return {"analysis": "no_data", "recommendations": []}
    
    category_totals = {}
    type_totals = {"essential": 0, "lifestyle": 0, "savings": 0, "debt": 0}
    
    for t in transactions:
        if t["type"] == "expense":
            cat = t["category"]
            category_totals[cat] = category_totals.get(cat, 0) + t["amount"]
            
            exp_type = categorize_expense(cat)
            type_totals[exp_type] += t["amount"]
    
    total_expenses = sum(category_totals.values())
    
    recommendations = []
    
    if income > 0:
        savings_rate = ((income - total_expenses) / income) * 100
        
        if savings_rate < 10:
            recommendations.append("Your savings rate is below 10%. Try to cut non-essential expenses.")
        elif savings_rate >= 20:
            recommendations.append("Great savings rate! Consider investing the surplus.")
        
        if type_totals["lifestyle"] > income * 0.3:
            recommendations.append("Lifestyle spending exceeds 30% of income. Review discretionary purchases.")
        
        if type_totals["essential"] > income * 0.5:
            recommendations.append("Essential expenses are high. Look for ways to reduce fixed costs.")
    
    top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3]
    
    return {
        "total_expenses": total_expenses,
        "category_breakdown": category_totals,
        "type_breakdown": type_totals,
        "top_categories": top_categories,
        "savings_rate": ((income - total_expenses) / income * 100) if income > 0 else 0,
        "recommendations": recommendations
    }

def suggest_budget_adjustments(budgets: List[Dict], spending: Dict) -> List[str]:
    suggestions = []
    
    for budget in budgets:
        cat = budget["category"]
        spent = spending.get(cat, 0)
        limit = budget["monthly_limit"]
        
        if spent > limit:
            overage = spent - limit
            suggestions.append(f"Over budget on {cat} by ${overage:.2f}. Consider reducing or increasing budget.")
        elif spent < limit * 0.5:
            suggestions.append(f"Underspending on {cat}. You could reallocate ${(limit - spent):.2f} elsewhere.")
    
    return suggestions

def predict_monthly_spending(past_transactions: List[Dict], days_passed: int) -> Dict:
    if not past_transactions or days_passed == 0:
        return {"predicted_total": 0, "confidence": "low"}
    
    current_total = sum(t["amount"] for t in past_transactions if t["type"] == "expense")
    daily_average = current_total / days_passed
    days_in_month = 30
    
    predicted_total = daily_average * days_in_month
    
    confidence = "high" if days_passed > 15 else ("medium" if days_passed > 7 else "low")
    
    return {
        "current_total": current_total,
        "daily_average": round(daily_average, 2),
        "predicted_total": round(predicted_total, 2),
        "confidence": confidence
    }
