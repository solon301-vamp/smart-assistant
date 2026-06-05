#update
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, ChatHistory, UserSession
from services.llm import chat_with_gemini
from datetime import datetime
import uuid

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    mode: str = "general"

class LikeRequest(BaseModel):
    message_id: int
    liked: bool

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())

    # Buat atau update session
    session = db.query(UserSession).filter(
        UserSession.session_id == session_id
    ).first()

    if not session:
        session = UserSession(session_id=session_id)
        db.add(session)

    session.last_active = datetime.utcnow()
    session.total_messages += 1

    # Ambil history
    history = db.query(ChatHistory)\
                .filter(ChatHistory.session_id == session_id)\
                .order_by(ChatHistory.timestamp)\
                .all()

    messages = [{"role": h.role, "content": h.content} for h in history]
    messages.append({"role": "user", "content": request.message})

    try:
        reply = chat_with_gemini(messages=messages, mode=request.mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    # Simpan ke database
    user_msg = ChatHistory(
        session_id=session_id,
        role="user",
        content=request.message,
        mode=request.mode
    )
    ai_msg = ChatHistory(
        session_id=session_id,
        role="assistant",
        content=reply,
        mode=request.mode
    )
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return {
        "session_id": session_id,
        "reply": reply,
        "mode": request.mode,
        "message_id": ai_msg.id
    }

@router.post("/like")
async def like_message(request: LikeRequest, db: Session = Depends(get_db)):
    message = db.query(ChatHistory).filter(ChatHistory.id == request.message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.liked = request.liked
    db.commit()
    return {"success": True, "liked": request.liked}