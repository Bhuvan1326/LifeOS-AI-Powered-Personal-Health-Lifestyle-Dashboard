from sqlalchemy.orm import Session
from datetime import date, timedelta
from ..models.finance import Transaction, Budget

def get_finance_score(db: Session, user_id: int) -> float:
    today = date.today()
    month_start = date(today.year, today.month, 1)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= month_start
    ).all()
    
    if not transactions:
        return 50.0
    
    income = sum(t.amount for t in transactions if t.type == "income")
    expenses = sum(t.amount for t in transactions if t.type == "expense")
    
    if income == 0:
        savings_rate = 0
    else:
        savings_rate = (income - expenses) / income * 100
    
    if savings_rate >= 30:
        savings_score = 100
    elif savings_rate >= 20:
        savings_score = 80
    elif savings_rate >= 10:
        savings_score = 60
    elif savings_rate >= 0:
        savings_score = 40
    else:
        savings_score = max(0, 40 + savings_rate)
    
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    budget_score = 100
    
    if budgets:
        over_budget_count = 0
        for budget in budgets:
            spent = sum(
                t.amount for t in transactions 
                if t.type == "expense" and t.category == budget.category
            )
            if spent > budget.monthly_limit:
                over_budget_count += 1
        
        budget_score = 100 - (over_budget_count / len(budgets) * 100)
    
    total_score = savings_score * 0.6 + budget_score * 0.4
    
    return min(round(total_score, 2), 100)

def analyze_spending_patterns(db: Session, user_id: int, months: int = 3) -> dict:
    today = date.today()
    start_date = date(today.year, today.month, 1) - timedelta(days=months * 30)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_date,
        Transaction.type == "expense"
    ).all()
    
    insights = []
    
    if not transactions:
        return {"insights": ["Start tracking expenses to get spending insights."]}
    
    category_totals = {}
    for t in transactions:
        category_totals[t.category] = category_totals.get(t.category, 0) + t.amount
    
    total_spent = sum(category_totals.values())
    
    if total_spent > 0:
        top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3]
        top_category, top_amount = top_categories[0]
        top_percentage = (top_amount / total_spent) * 100
        
        if top_percentage > 40:
            insights.append(f"{top_category} accounts for {top_percentage:.0f}% of spending. Consider reviewing this category.")
    
    monthly_totals = {}
    for t in transactions:
        month_key = t.transaction_date.strftime("%Y-%m")
        monthly_totals[month_key] = monthly_totals.get(month_key, 0) + t.amount
    
    if len(monthly_totals) >= 2:
        sorted_months = sorted(monthly_totals.keys())
        recent = monthly_totals[sorted_months[-1]]
        previous = monthly_totals[sorted_months[-2]]
        
        if previous > 0:
            change = ((recent - previous) / previous) * 100
            if change > 20:
                insights.append(f"Spending increased {change:.0f}% from last month. Review recent purchases.")
            elif change < -20:
                insights.append(f"Great job! Spending decreased {abs(change):.0f}% from last month.")
    
    return {"insights": insights, "top_categories": category_totals}
