from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, UserSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import uuid
import os

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/auth/google")
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            request.token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = idinfo["sub"]
    email     = idinfo.get("email")
    name      = idinfo.get("name", "User")
    avatar    = idinfo.get("picture")

    # Cek apakah user sudah ada
    user = db.query(UserSession).filter(UserSession.google_id == google_id).first()

    if not user:
        # User baru — buat session
        user = UserSession(
            session_id=str(uuid.uuid4()),
            google_id=google_id,
            email=email,
            display_name=name,
            avatar_url=avatar,
            total_messages=0
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "session_id": user.session_id,
        "email": user.email,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url
    }