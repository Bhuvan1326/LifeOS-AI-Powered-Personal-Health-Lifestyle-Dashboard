from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, timedelta
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.habit import Habit, HabitLog
from ..schemas.habit_schema import (
    HabitCreate, HabitUpdate, HabitResponse, 
    HabitLogCreate, HabitLogResponse, HabitWithLogs
)
from ..services.habit_service import calculate_streak, calculate_completion_rate

router = APIRouter(prefix="/api/habits", tags=["Habits"])

@router.get("/", response_model=List[HabitResponse])
def get_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    result = []
    for habit in habits:
        habit_data = HabitResponse.model_validate(habit)
        habit_data.current_streak = calculate_streak(db, habit.id, current_user.id)
        habit_data.completion_rate = calculate_completion_rate(db, habit.id, current_user.id)
        result.append(habit_data)
    
    return result

@router.post("/", response_model=HabitResponse)
def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = Habit(
        user_id=current_user.id,
        name=habit_data.name,
        description=habit_data.description,
        frequency=habit_data.frequency,
        target_count=habit_data.target_count
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return HabitResponse.model_validate(habit)

@router.get("/{habit_id}", response_model=HabitWithLogs)
def get_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id
    ).order_by(HabitLog.completed_at.desc()).limit(30).all()
    
    habit_data = HabitWithLogs.model_validate(habit)
    habit_data.current_streak = calculate_streak(db, habit.id, current_user.id)
    habit_data.completion_rate = calculate_completion_rate(db, habit.id, current_user.id)
    habit_data.logs = [HabitLogResponse.model_validate(log) for log in logs]
    
    return habit_data

@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    habit_data: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = habit_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(habit, key, value)
    
    db.commit()
    db.refresh(habit)
    return HabitResponse.model_validate(habit)

@router.delete("/{habit_id}")
def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habit.is_active = False
    db.commit()
    return {"message": "Habit deleted successfully"}

@router.post("/log", response_model=HabitLogResponse)
def log_habit(
    log_data: HabitLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == log_data.habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == log_data.habit_id,
        HabitLog.user_id == current_user.id,
        HabitLog.completed_at == log_data.completed_at
    ).first()
    
    if existing_log:
        existing_log.count += log_data.count
        existing_log.notes = log_data.notes or existing_log.notes
        db.commit()
        db.refresh(existing_log)
        return HabitLogResponse.model_validate(existing_log)
    
    log = HabitLog(
        habit_id=log_data.habit_id,
        user_id=current_user.id,
        completed_at=log_data.completed_at,
        count=log_data.count,
        notes=log_data.notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return HabitLogResponse.model_validate(log)

@router.get("/logs/today", response_model=List[HabitLogResponse])
def get_today_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    logs = db.query(HabitLog).filter(
        HabitLog.user_id == current_user.id,
        HabitLog.completed_at == today
    ).all()
    return [HabitLogResponse.model_validate(log) for log in logs]
