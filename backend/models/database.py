#update
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role       = Column(String)
    content    = Column(Text)
    mode       = Column(String, default="general")
    liked      = Column(Boolean, default=False)
    timestamp  = Column(DateTime, default=datetime.utcnow)

class UserSession(Base):
    __tablename__ = "user_sessions"
    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(String, unique=True, index=True)
    display_name = Column(String, default="User")
    total_messages = Column(Integer, default=0)
    created_at   = Column(DateTime, default=datetime.utcnow)
    last_active  = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()