import httpx
import asyncio
import logging
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
)
API_KEY = os.getenv("GEMINI_API_KEY")

logger = logging.getLogger("gemini_client")


async def get_diagnosis_with_history(contents: list, retries=3) -> dict:
    payload = {
        "contents": contents
    }
    headers = {
        "x-goog-api-key": API_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        for attempt in range(retries):
            try:
                response = await client.post(GEMINI_API_URL, json=payload, headers=headers, timeout=10)
                response.raise_for_status()
                data = response.json()
                return data.get("candidates", [{}])[0]  # return dict first candidate
            except Exception as e:
                logger.error(f"Gemini API request failed (attempt {attempt + 1}): {str(e)}")
                if attempt == retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
