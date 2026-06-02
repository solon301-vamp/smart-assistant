from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.history import router as history_router

app = FastAPI(title="Smart Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # ← ganti jadi * untuk development
    allow_credentials=False,    # ← ubah jadi False kalau pakai *
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router,    prefix="/api", tags=["Chat"])
app.include_router(history_router, prefix="/api", tags=["History"])

@app.get("/")
def root():
    return {"message": "Smart Assistant API is running!"}