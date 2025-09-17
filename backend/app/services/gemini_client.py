import os
from dotenv import load_dotenv
from google import genai
import asyncio

# Load environment variables from .env
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing! Please set it in .env")

client = genai.Client(api_key=API_KEY)

async def get_diagnosis(prompt, images=None, health_data=None):
    contents = prompt
    if images:
        contents += str(images)
    if health_data:
        contents += str(health_data)

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=genai.types.GenerateContentConfig(max_output_tokens=10),
        )
    )
    return response.text
