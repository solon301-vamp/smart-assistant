from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, Schedule
from typing import Optional

router = APIRouter()

class ScheduleCreate(BaseModel):
    session_id: str
    title: str
    description: Optional[str] = None
    date: str        # YYYY-MM-DD
    time: str        # HH:MM
    category: str = "umum"
    notify: bool = True

class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    category: Optional[str] = None
    is_done: Optional[bool] = None
    notify: Optional[bool] = None

@router.post("/schedules")
async def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    schedule = Schedule(**data.dict())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule

@router.get("/schedules/{session_id}")
async def get_schedules(session_id: str, db: Session = Depends(get_db)):
    schedules = db.query(Schedule)\
                  .filter(Schedule.session_id == session_id)\
                  .order_by(Schedule.date, Schedule.time)\
                  .all()
    return schedules

@router.get("/schedules/{session_id}/date/{date}")
async def get_schedules_by_date(session_id: str, date: str, db: Session = Depends(get_db)):
    schedules = db.query(Schedule)\
                  .filter(Schedule.session_id == session_id, Schedule.date == date)\
                  .order_by(Schedule.time)\
                  .all()
    return schedules

@router.patch("/schedules/{schedule_id}")
async def update_schedule(schedule_id: int, data: ScheduleUpdate, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    for key, value in data.dict(exclude_none=True).items():
        setattr(schedule, key, value)
    db.commit()
    db.refresh(schedule)
    return schedule

@router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"success": True}