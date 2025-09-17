# backend/app/services/gemini_client.py

from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_diagnosis(prompt, images=None, health_data=None):
    contents = prompt
    if images:
        contents += str(images)
    if health_data:
        contents += str(health_data)

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=contents,
        config=genai.types.GenerateContentConfig(max_output_tokens=300)
    )
    return response.text
