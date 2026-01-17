from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class FoodLogCreate(BaseModel):
    food_name: str
    meal_type: str = "snack"
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    serving_size: Optional[str] = None
    logged_at: date

class FoodLogUpdate(BaseModel):
    food_name: Optional[str] = None
    meal_type: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    serving_size: Optional[str] = None

class FoodLogResponse(BaseModel):
    id: int
    user_id: int
    food_name: str
    meal_type: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    serving_size: Optional[str]
    logged_at: date
    created_at: datetime

    class Config:
        from_attributes = True

class WaterLogCreate(BaseModel):
    amount_ml: int
    logged_at: date

class WaterLogResponse(BaseModel):
    id: int
    user_id: int
    amount_ml: int
    logged_at: date
    created_at: datetime

    class Config:
        from_attributes = True

class NutritionGoalCreate(BaseModel):
    daily_calories: int = 2000
    daily_protein: int = 50
    daily_carbs: int = 250
    daily_fat: int = 65
    daily_water_ml: int = 2000

class NutritionGoalResponse(BaseModel):
    id: int
    user_id: int
    daily_calories: int
    daily_protein: int
    daily_carbs: int
    daily_fat: int
    daily_water_ml: int
    created_at: datetime

    class Config:
        from_attributes = True

class DailySummary(BaseModel):
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_water: int
    goal_calories: int
    goal_protein: int
    goal_carbs: int
    goal_fat: int
    goal_water: int
