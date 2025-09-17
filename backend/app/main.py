from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import diagnosis, users

app = FastAPI(
    title="DiagnosAI Backend",
    description="Backend API for DiagnosAI Health Chatbot",
    version="1.0.0",
)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(diagnosis.router, prefix="/api", tags=["diagnosis"])


@app.get("/")
async def root():
    return {"message": "Welcome to DiagnosAI Backend"}
