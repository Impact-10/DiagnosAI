# backend/app/main.py

from fastapi import FastAPI
from app.api import users, healthdata, diagnosis, records

app = FastAPI(title="DiagnosAI Backend")

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(healthdata.router, prefix="/api/healthdata", tags=["Health Data"])
app.include_router(diagnosis.router, prefix="/api/diagnosis", tags=["Diagnosis"])
app.include_router(records.router, prefix="/api/records", tags=["Records"])

@app.get("/")
async def root():
    return {"message": "Welcome to DiagnosAI backend!"}
