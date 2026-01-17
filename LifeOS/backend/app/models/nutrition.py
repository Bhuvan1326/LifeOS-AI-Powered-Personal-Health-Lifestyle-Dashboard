from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Float
from sqlalchemy.sql import func
from ..core.database import Base

class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_name = Column(String, nullable=False)
    meal_type = Column(String, default="snack")  # breakfast, lunch, dinner, snack
    calories = Column(Float, default=0)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    fiber = Column(Float, default=0)
    serving_size = Column(String)
    logged_at = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_ml = Column(Integer, nullable=False)
    logged_at = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    daily_calories = Column(Integer, default=2000)
    daily_protein = Column(Integer, default=50)
    daily_carbs = Column(Integer, default=250)
    daily_fat = Column(Integer, default=65)
    daily_water_ml = Column(Integer, default=2000)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
