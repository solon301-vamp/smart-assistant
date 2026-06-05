#update
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, ChatHistory, UserSession

router = APIRouter()

@router.get("/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    history = db.query(ChatHistory)\
                .filter(ChatHistory.session_id == session_id)\
                .order_by(ChatHistory.timestamp)\
                .all()
    return [
        {
            "id": h.id,
            "role": h.role,
            "content": h.content,
            "mode": h.mode,
            "liked": h.liked,
            "timestamp": h.timestamp
        }
        for h in history
    ]

@router.delete("/history/{session_id}")
async def delete_history(session_id: str, db: Session = Depends(get_db)):
    db.query(ChatHistory).filter(ChatHistory.session_id == session_id).delete()
    db.query(UserSession).filter(UserSession.session_id == session_id).delete()
    db.commit()
    return {"success": True, "message": "History deleted"}

@router.get("/sessions")
async def get_sessions(db: Session = Depends(get_db)):
    sessions = db.query(UserSession).order_by(UserSession.last_active.desc()).all()
    return [
        {
            "session_id": s.session_id,
            "display_name": s.display_name,
            "total_messages": s.total_messages,
            "created_at": s.created_at,
            "last_active": s.last_active
        }
        for s in sessions
    ]

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    total_messages  = db.query(ChatHistory).count()
    total_sessions  = db.query(UserSession).count()
    user_messages   = db.query(ChatHistory).filter(ChatHistory.role == "user").count()
    liked_messages  = db.query(ChatHistory).filter(ChatHistory.liked == True).count()

    # Stats per mode
    modes = ["general", "tutor", "translator", "coding"]
    mode_stats = {}
    for mode in modes:
        count = db.query(ChatHistory)\
                  .filter(ChatHistory.role == "user", ChatHistory.mode == mode)\
                  .count()
        mode_stats[mode] = count

    return {
        "total_messages":     total_messages,
        "total_sessions":     total_sessions,
        "user_messages":      user_messages,
        "assistant_messages": total_messages - user_messages,
        "liked_messages":     liked_messages,
        "mode_stats":         mode_stats
    }