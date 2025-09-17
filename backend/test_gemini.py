import asyncio
from app.services.gemini_client import get_diagnosis

async def main():
    prompt = "i vomited blood what could be the reason for that and what should i do"
    diagnosis = await get_diagnosis(prompt)
    print("Gemini API response:")
    print(diagnosis)

if __name__ == "__main__":
    asyncio.run(main())
