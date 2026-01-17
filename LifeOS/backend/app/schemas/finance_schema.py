from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class TransactionCreate(BaseModel):
    type: str  # income or expense
    category: str
    amount: float
    description: Optional[str] = None
    transaction_date: date

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    type: str
    category: str
    amount: float
    description: Optional[str]
    transaction_date: date
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    monthly_limit: Optional[float] = None

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    monthly_limit: float
    spent: Optional[float] = 0
    remaining: Optional[float] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class FinancialGoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    deadline: Optional[date] = None

class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[date] = None

class FinancialGoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[date]
    is_achieved: int
    progress: Optional[float] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class MonthlySummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    expense_by_category: dict
