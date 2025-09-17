# backend/app/core/config.py

import os
from dotenv import load_dotenv


# Load .env into environment
load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")

settings = Settings()



REDIS_URL = os.getenv("REDIS_URL")
