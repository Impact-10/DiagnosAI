from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.core.dependencies import get_db
from app.db import crud

router = APIRouter()

@router.post("/upload")
async def upload_health_record(file: UploadFile = File(...), db=Depends(get_db)):
    if file.content_type not in ("application/pdf", "image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    contents = await file.read()
    # Save file contents securely in DB or cloud storage (not shown)
    record = await crud.create_health_record(db, file.filename, contents)
    return {"filename": file.filename, "id": record.id}
