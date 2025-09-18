
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.api import users, healthdata, diagnosis, records, referral

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

load_dotenv()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(healthdata.router, prefix="/healthdata", tags=["Health Data"])
app.include_router(diagnosis.router, prefix="/diagnosis", tags=["Diagnosis"])
app.include_router(records.router, prefix="/records", tags=["Records"])
app.include_router(referral.router, prefix="/api/referral", tags=["Referral"])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Return detailed validation errors for debugging
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )


@app.get("/")
async def root():
    return {"message": "Welcome to DiagnosAI backend!"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(diagnosis.router, prefix="/api", tags=["diagnosis"])


@app.get("/")
async def root():
    return {"message": "Welcome to DiagnosAI Backend"}