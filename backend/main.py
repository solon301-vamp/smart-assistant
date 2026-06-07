from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.history import router as history_router
from routes.schedule import router as schedule_router

app = FastAPI(title="Smart Assistant API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://smart-assistant-ebon.vercel.app"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router,     prefix="/api", tags=["Chat"])
app.include_router(history_router,  prefix="/api", tags=["History"])
app.include_router(schedule_router, prefix="/api", tags=["Schedule"])

@app.get("/")
def root():
    return {"message": "Smart Assistant API v2.0 is running! 🌊"}