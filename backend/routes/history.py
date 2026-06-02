from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, ChatHistory

router = APIRouter()

@router.get("/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    history = db.query(ChatHistory)\
                .filter(ChatHistory.session_id == session_id)\
                .order_by(ChatHistory.timestamp)\
                .all()
    return [
        {
            "role": h.role,
            "content": h.content,
            "timestamp": h.timestamp
        }
        for h in history
    ]

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    total_messages    = db.query(ChatHistory).count()
    total_sessions    = db.query(ChatHistory.session_id).distinct().count()
    user_messages     = db.query(ChatHistory).filter(ChatHistory.role == "user").count()

    return {
        "total_messages":     total_messages,
        "total_sessions":     total_sessions,
        "user_messages":      user_messages,
        "assistant_messages": total_messages - user_messages,
    }