from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import date, timedelta
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.finance import Transaction, Budget, FinancialGoal
from ..schemas.finance_schema import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    BudgetCreate, BudgetUpdate, BudgetResponse,
    FinancialGoalCreate, FinancialGoalUpdate, FinancialGoalResponse,
    MonthlySummary
)

router = APIRouter(prefix="/api/finance", tags=["Finance"])

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= start_date
    ).order_by(Transaction.transaction_date.desc()).all()
    return [TransactionResponse.model_validate(t) for t in transactions]

@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(
    trans_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = Transaction(
        user_id=current_user.id,
        **trans_data.model_dump()
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return TransactionResponse.model_validate(transaction)

@router.put("/transactions/{trans_id}", response_model=TransactionResponse)
def update_transaction(
    trans_id: int,
    trans_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == trans_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = trans_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(transaction, key, value)
    
    db.commit()
    db.refresh(transaction)
    return TransactionResponse.model_validate(transaction)

@router.delete("/transactions/{trans_id}")
def delete_transaction(
    trans_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == trans_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

@router.get("/budgets", response_model=List[BudgetResponse])
def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    today = date.today()
    month_start = date(today.year, today.month, 1)
    
    result = []
    for budget in budgets:
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.category == budget.category,
            Transaction.transaction_date >= month_start
        ).scalar() or 0
        
        budget_data = BudgetResponse.model_validate(budget)
        budget_data.spent = spent
        budget_data.remaining = budget.monthly_limit - spent
        result.append(budget_data)
    
    return result

@router.post("/budgets", response_model=BudgetResponse)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == budget_data.category
    ).first()
    
    if existing:
        existing.monthly_limit = budget_data.monthly_limit
        db.commit()
        db.refresh(existing)
        return BudgetResponse.model_validate(existing)
    
    budget = Budget(user_id=current_user.id, **budget_data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return BudgetResponse.model_validate(budget)

@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}

@router.get("/goals", response_model=List[FinancialGoalResponse])
def get_financial_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(FinancialGoal).filter(
        FinancialGoal.user_id == current_user.id
    ).all()
    
    result = []
    for goal in goals:
        goal_data = FinancialGoalResponse.model_validate(goal)
        goal_data.progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
        result.append(goal_data)
    
    return result

@router.post("/goals", response_model=FinancialGoalResponse)
def create_financial_goal(
    goal_data: FinancialGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = FinancialGoal(user_id=current_user.id, **goal_data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    goal_response = FinancialGoalResponse.model_validate(goal)
    goal_response.progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
    return goal_response

@router.put("/goals/{goal_id}", response_model=FinancialGoalResponse)
def update_financial_goal(
    goal_id: int,
    goal_data: FinancialGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Financial goal not found")
    
    update_data = goal_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
    
    if goal.current_amount >= goal.target_amount:
        goal.is_achieved = 1
    
    db.commit()
    db.refresh(goal)
    
    goal_response = FinancialGoalResponse.model_validate(goal)
    goal_response.progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
    return goal_response

@router.get("/summary/monthly", response_model=MonthlySummary)
def get_monthly_summary(
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    month = month or today.month
    year = year or today.year
    
    month_start = date(year, month, 1)
    if month == 12:
        month_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        month_end = date(year, month + 1, 1) - timedelta(days=1)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= month_start,
        Transaction.transaction_date <= month_end
    ).all()
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    
    expense_by_category = {}
    for t in transactions:
        if t.type == "expense":
            expense_by_category[t.category] = expense_by_category.get(t.category, 0) + t.amount
    
    return MonthlySummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_savings=total_income - total_expenses,
        expense_by_category=expense_by_category
    )
