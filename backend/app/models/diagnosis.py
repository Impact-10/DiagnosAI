from pydantic import BaseModel
from typing import List, Optional

# Pydantic schemas for diagnosis inputs and outputs
class DiagnosisRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None

class DiagnosisResult(BaseModel):
    probable_diseases: List[str]
    recommendations: str
    severity_level: str

    class Config:
        orm_mode = True
