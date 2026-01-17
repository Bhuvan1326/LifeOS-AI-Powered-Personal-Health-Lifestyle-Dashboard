from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, timedelta
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.nutrition import FoodLog, WaterLog, NutritionGoal
from ..schemas.nutrition_schema import (
    FoodLogCreate, FoodLogUpdate, FoodLogResponse,
    WaterLogCreate, WaterLogResponse,
    NutritionGoalCreate, NutritionGoalResponse, DailySummary
)

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition"])

@router.get("/food", response_model=List[FoodLogResponse])
def get_food_logs(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at >= start_date
    ).order_by(FoodLog.logged_at.desc()).all()
    return [FoodLogResponse.model_validate(l) for l in logs]

@router.post("/food", response_model=FoodLogResponse)
def create_food_log(
    food_data: FoodLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = FoodLog(
        user_id=current_user.id,
        **food_data.model_dump()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return FoodLogResponse.model_validate(log)

@router.put("/food/{food_id}", response_model=FoodLogResponse)
def update_food_log(
    food_id: int,
    food_data: FoodLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(FoodLog).filter(
        FoodLog.id == food_id,
        FoodLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Food log not found")
    
    update_data = food_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)
    
    db.commit()
    db.refresh(log)
    return FoodLogResponse.model_validate(log)

@router.delete("/food/{food_id}")
def delete_food_log(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(FoodLog).filter(
        FoodLog.id == food_id,
        FoodLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Food log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Food log deleted successfully"}

@router.get("/water", response_model=List[WaterLogResponse])
def get_water_logs(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    logs = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.logged_at >= start_date
    ).order_by(WaterLog.logged_at.desc()).all()
    return [WaterLogResponse.model_validate(l) for l in logs]

@router.post("/water", response_model=WaterLogResponse)
def create_water_log(
    water_data: WaterLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.logged_at == water_data.logged_at
    ).first()
    
    if existing:
        existing.amount_ml += water_data.amount_ml
        db.commit()
        db.refresh(existing)
        return WaterLogResponse.model_validate(existing)
    
    log = WaterLog(
        user_id=current_user.id,
        **water_data.model_dump()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return WaterLogResponse.model_validate(log)

@router.get("/goals", response_model=NutritionGoalResponse)
def get_nutrition_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        goal = NutritionGoal(user_id=current_user.id)
        db.add(goal)
        db.commit()
        db.refresh(goal)
    
    return NutritionGoalResponse.model_validate(goal)

@router.put("/goals", response_model=NutritionGoalResponse)
def update_nutrition_goals(
    goal_data: NutritionGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        goal = NutritionGoal(user_id=current_user.id, **goal_data.model_dump())
        db.add(goal)
    else:
        for key, value in goal_data.model_dump().items():
            setattr(goal, key, value)
    
    db.commit()
    db.refresh(goal)
    return NutritionGoalResponse.model_validate(goal)

@router.get("/summary/{log_date}", response_model=DailySummary)
def get_daily_summary(
    log_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    food_logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at == log_date
    ).all()
    
    water_logs = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.logged_at == log_date
    ).all()
    
    goal = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        goal = NutritionGoal(user_id=current_user.id)
    
    return DailySummary(
        total_calories=sum(f.calories for f in food_logs),
        total_protein=sum(f.protein for f in food_logs),
        total_carbs=sum(f.carbs for f in food_logs),
        total_fat=sum(f.fat for f in food_logs),
        total_water=sum(w.amount_ml for w in water_logs),
        goal_calories=goal.daily_calories,
        goal_protein=goal.daily_protein,
        goal_carbs=goal.daily_carbs,
        goal_fat=goal.daily_fat,
        goal_water=goal.daily_water_ml
    )

@router.get("/today", response_model=List[FoodLogResponse])
def get_today_food(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at == today
    ).all()
    return [FoodLogResponse.model_validate(l) for l in logs]
