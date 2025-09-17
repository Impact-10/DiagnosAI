from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import get_current_user
from app.db.crud import (
    create_diagnosis_record,
    create_session,
    add_message,
    get_session_messages,
    get_session,
)
from app.services.gemini_client import get_diagnosis_with_history
import json

router = APIRouter()

class DiagnosisRequest(BaseModel):
    prompt: str
    images: Optional[List[str]] = None
    health_data: Optional[str] = None

class DiagnosisResponse(BaseModel):
    diagnosis_text: str
    record_id: int

@router.post("/diagnosis", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    req: DiagnosisRequest,
    user=Depends(get_current_user),
    session_id: Optional[int] = Query(None, description="Conversation session id"),
):
    if session_id is None:
        session = await create_session(user.id)
        session_id = session.id
    else:
        session = await get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

    await add_message(session_id, "user", req.prompt)

    messages = await get_session_messages(session_id)
    instruction = (
        "You are a helpful assistant that provides possible medical conditions "
        "based on symptoms described, without giving a direct diagnosis or medical advice. "
        "List possible causes and suggest what to watch for."
    )

    diagnosis_prompt = instruction + "\n\nUser symptoms:\n" + req.prompt

    contents = [{"role": m.role, "parts": [{"text": m.content}]} for m in messages]
    contents.append({"role": "user", "parts": [{"text": diagnosis_prompt}]})


    diagnosis_data = await get_diagnosis_with_history(contents)

    # Extract text safely for response and saving message
    diagnosis_text = ""
    if isinstance(diagnosis_data, str):
        diagnosis_text = diagnosis_data
    elif isinstance(diagnosis_data, dict):
        parts = diagnosis_data.get("content", {}).get("parts") if "content" in diagnosis_data else diagnosis_data.get("parts")
        if parts and isinstance(parts, list) and len(parts) > 0 and "text" in parts[0]:
            diagnosis_text = parts[0]["text"]
        else:
            diagnosis_text = diagnosis_data.get("text", "No diagnosis returned")
    else:
        diagnosis_text = "No diagnosis returned"
    

    # Save model reply message as JSON string so DB save works
    import json
    await add_message(session_id, "model", json.dumps(diagnosis_data))

    await create_diagnosis_record(user.id, req.prompt, diagnosis_data)

    return DiagnosisResponse(diagnosis_text=diagnosis_text, record_id=session_id)
