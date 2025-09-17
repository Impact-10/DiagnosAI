# backend/app/api/diagnosis.py

import logging
from fastapi import APIRouter, HTTPException, Request
from app.services.gemini_client import get_diagnosis

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/diagnose")
async def diagnose(request: Request):
    try:
        data = await request.json()
        result = await get_diagnosis(
            prompt=data.get("symptoms"),
            images=data.get("images"),
            health_data=data.get("health_records")
        )
        logger.info(f"Diagnosis success: {result}")
        return {"diagnosis": result}
    except Exception as e:
        logger.error(f"Diagnosis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {str(e)}")
