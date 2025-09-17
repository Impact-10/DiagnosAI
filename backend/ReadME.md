# DiagnosAI Backend

This folder contains the backend code for DiagnosAI, an AI-powered health chatbot integrating Gemini API and health data sources like CDC and WHO.

## Folder Structure

- `app/` - Main application code
  - `main.py` - FastAPI app instance and entry point
  - `api/` - API route handlers grouped by functionality
    - `users.py` - User registration, authentication APIs
    - `healthdata.py` - Health information retrieval APIs
    - `diagnosis.py` - Integration with Gemini API for diagnosis
    - `records.py` - Upload and manage personal health records
  - `core/` - Core utilities and configurations
    - `config.py` - Environment variable management
    - `dependencies.py` - Dependency injection helpers
    - `logging.py` - Logging configuration
    - `security.py` - Authentication and security utilities
  - `models/` - Data models and schemas
    - `user.py`, `health_info.py`, `diagnosis.py`, `record.py` define ORM and Pydantic models
  - `db/` - Database setup and CRUD operations
    - `base.py` - Base ORM models
    - `session.py` - Database session management
    - `crud.py` - Create, Read, Update, Delete operations
  - `services/` - External service integrations and helpers
    - `gemini_client.py` - Wrapper for Gemini API
    - `cdc_client.py` - Wrapper for CDC/WHO API data fetching
    - `nlp_utils.py` - Text and symptom NLP processing

- `tests/` - Unit and integration tests for backend components

- `.env` - Environment variables file (not committed to git)

- `requirements.txt` - Python package dependencies

- `run.sh` - Script to start the FastAPI server quickly

## Getting Started

1. Create a virtual environment and activate it.
2. Install dependencies with: `pip install -r requirements.txt`.
3. Set required environment variables in `.env`.
4. Run the FastAPI app with: `sh run.sh`.

## Contribution Guidelines

- Follow the folder structure for adding new features.
- Write tests for new code in `tests/`.
- Document your API changes in appropriate files.
- Use logging and error handling from `core/`.

---

This modular backend structure ensures fast, scalable, and collaborative development for DiagnosAI.

python -m uvicorn app.main:app --reload

curl -X POST http://localhost:8000/api/users/register -H "Content-Type: application/json" -d '{"email":"user2@example.com", "password":"StrongPassword123"}'

curl -X POST http://localhost:8000/api/users/token \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"testpassword"}'

curl -X POST http://localhost:8000/api/diagnosis \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.t3_DM4moMnetRLI3w9FNY0m_Pg3ZJ-5dbnhJCduSuOA" \
-H "Content-Type: application/json" \
-d '{"prompt": "I have fever and cough"}'