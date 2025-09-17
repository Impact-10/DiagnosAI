# backend/app/main.py

from fastapi import FastAPI
from app.api import users, healthdata, diagnosis, records

# At the top of your main.py or core/config.py
from dotenv import load_dotenv
import os

load_dotenv()  # load variables from .env into environment

# Now you can access GEMINI_API_KEY as
gemini_api_key = os.getenv("GEMINI_API_KEY")


app = FastAPI(title="DiagnosAI Backend")

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(healthdata.router, prefix="/healthdata", tags=["Health Data"])
app.include_router(diagnosis.router, prefix="/diagnosis", tags=["Diagnosis"])
app.include_router(records.router, prefix="/records", tags=["Records"])
app.include_router(healthdata.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to DiagnosAI backend!"}
