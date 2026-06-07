cat > routes/chat.py << 'ENDOFFILE'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, ChatHistory, UserSession, Schedule
from services.llm import chat_with_gemini
from datetime import datetime
import uuid
import json
import re

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    mode: str = "general"

class LikeRequest(BaseModel):
    message_id: int
    liked: bool

def parse_schedule_action(text, session_id, db):
    try:
        match = re.search(r'\{[^{}]*"action"[^{}]*\}', text)
        if not match:
            return text, None
        action_data = json.loads(match.group())
        action = action_data.get("action")
        if action == "add_schedule":
            schedule = Schedule(
                session_id=session_id,
                title=action_data.get("title", ""),
                description=action_data.get("description", ""),
                date=action_data.get("date", ""),
                time=action_data.get("time", "00:00"),
                category=action_data.get("category", "umum"),
            )
            db.add(schedule)
            db.commit()
            clean_text = text.replace(match.group(), "").strip()
            return clean_text + f"\n\n✅ Jadwal **{schedule.title}** berhasil ditambahkan!", "added"
        elif action == "get_schedule":
            date = action_data.get("date")
            schedules = db.query(Schedule).filter(
                Schedule.session_id == session_id,
                Schedule.date == date
            ).all()
            clean_text = text.replace(match.group(), "").strip()
            if not schedules:
                return clean_text + f"\n\n📅 Tidak ada jadwal untuk tanggal {date}.", "fetched"
            schedule_list = "\n".join([f"• {s.time} - {s.title}" for s in schedules])
            return clean_text + f"\n\n📅 Jadwal {date}:\n{schedule_list}", "fetched"
    except Exception:
        pass
    return text, None

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())

    session = db.query(UserSession).filter(UserSession.session_id == session_id).first()
    if not session:
        session = UserSession(session_id=session_id, total_messages=0)
        db.add(session)
        db.flush()

    session.last_active = datetime.utcnow()
    session.total_messages = (session.total_messages or 0) + 1

    history = db.query(ChatHistory)\
                .filter(ChatHistory.session_id == session_id)\
                .order_by(ChatHistory.timestamp).all()

    messages = [{"role": h.role, "content": h.content} for h in history]
    messages.append({"role": "user", "content": request.message})

    try:
        reply = chat_with_gemini(messages=messages, mode=request.mode)
        reply, schedule_action = parse_schedule_action(reply, session_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    user_msg = ChatHistory(session_id=session_id, role="user", content=request.message, mode=request.mode)
    ai_msg   = ChatHistory(session_id=session_id, role="assistant", content=reply, mode=request.mode)
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return {
        "session_id": session_id,
        "reply": reply,
        "mode": request.mode,
        "message_id": ai_msg.id,
        "schedule_action": schedule_action
    }

@router.post("/like")
async def like_message(request: LikeRequest, db: Session = Depends(get_db)):
    message = db.query(ChatHistory).filter(ChatHistory.id == request.message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.liked = request.liked
    db.commit()
    return {"success": True, "liked": request.liked}
ENDOFFILE