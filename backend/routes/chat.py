from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, ChatHistory
from services.llm import chat_with_gemini
import uuid

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    mode: str = "general"

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())

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

    db.add(ChatHistory(session_id=session_id, role="user",      content=request.message))
    db.add(ChatHistory(session_id=session_id, role="assistant", content=reply))
    db.commit()

    return {
        "session_id": session_id,
        "reply": reply,
        "mode": request.mode
    }