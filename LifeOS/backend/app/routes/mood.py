from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.mood import MoodEntry, JournalEntry
from ..schemas.mood_schema import (
    MoodCreate, MoodUpdate, MoodResponse,
    JournalCreate, JournalUpdate, JournalResponse
)

router = APIRouter(prefix="/api/mood", tags=["Mood"])

@router.get("/", response_model=List[MoodResponse])
def get_mood_entries(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    entries = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.logged_at >= start_date
    ).order_by(MoodEntry.logged_at.desc()).all()
    return [MoodResponse.model_validate(e) for e in entries]

@router.post("/", response_model=MoodResponse)
def create_mood_entry(
    mood_data: MoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.logged_at == mood_data.logged_at
    ).first()
    
    if existing:
        for key, value in mood_data.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return MoodResponse.model_validate(existing)
    
    entry = MoodEntry(
        user_id=current_user.id,
        **mood_data.model_dump()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return MoodResponse.model_validate(entry)

@router.get("/today", response_model=MoodResponse)
def get_today_mood(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    entry = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.logged_at == today
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="No mood entry for today")
    return MoodResponse.model_validate(entry)

@router.put("/{mood_id}", response_model=MoodResponse)
def update_mood_entry(
    mood_id: int,
    mood_data: MoodUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(MoodEntry).filter(
        MoodEntry.id == mood_id,
        MoodEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found")
    
    update_data = mood_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entry, key, value)
    
    db.commit()
    db.refresh(entry)
    return MoodResponse.model_validate(entry)

@router.get("/journal", response_model=List[JournalResponse])
def get_journal_entries(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.logged_at >= start_date
    ).order_by(JournalEntry.logged_at.desc()).all()
    return [JournalResponse.model_validate(e) for e in entries]

@router.post("/journal", response_model=JournalResponse)
def create_journal_entry(
    journal_data: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = JournalEntry(
        user_id=current_user.id,
        **journal_data.model_dump()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return JournalResponse.model_validate(entry)

@router.put("/journal/{journal_id}", response_model=JournalResponse)
def update_journal_entry(
    journal_id: int,
    journal_data: JournalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == journal_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    update_data = journal_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entry, key, value)
    
    db.commit()
    db.refresh(entry)
    return JournalResponse.model_validate(entry)

@router.delete("/journal/{journal_id}")
def delete_journal_entry(
    journal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == journal_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted successfully"}

@router.get("/stats")
def get_mood_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    entries = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.logged_at >= start_date
    ).all()
    
    if not entries:
        return {
            "avg_mood": 0,
            "avg_energy": 0,
            "avg_stress": 0,
            "avg_sleep": 0,
            "total_entries": 0
        }
    
    total = len(entries)
    return {
        "avg_mood": sum(e.mood_score for e in entries) / total,
        "avg_energy": sum(e.energy_level for e in entries) / total,
        "avg_stress": sum(e.stress_level for e in entries) / total,
        "avg_sleep": sum(e.sleep_hours or 0 for e in entries) / total,
        "total_entries": total
    }
