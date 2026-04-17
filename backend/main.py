from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

import models
from database import Base, engine
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.sessions import router as sessions_router

app = FastAPI(title="MediAssist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.execute(text("PRAGMA busy_timeout=30000"))
    inspector = inspect(engine)
    if "chat_sessions" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("chat_sessions")]
        if "user_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN user_id INTEGER"))


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(sessions_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
