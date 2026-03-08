import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./niyam.db")
SECRET_KEY = os.getenv("SECRET_KEY", "niyam-dev-secret-change-in-production")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
