import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.health import router as health_router
from src.api.users import router as users_router
from src.api.chat import router as chat_router

load_dotenv()

app = FastAPI(title="Niyam Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(users_router)
app.include_router(chat_router)
