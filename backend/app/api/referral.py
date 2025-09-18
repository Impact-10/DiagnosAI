from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.referral_service import ReferralService


class Location(BaseModel):
    lat: float
    lng: float


class ReferralPreferences(BaseModel):
    urgency: Optional[str] = "normal"
    insurance: Optional[str] = None
    specialty: Optional[str] = None
    maxDistance: Optional[int] = None


class ReferralRequest(BaseModel):
    location: Location
    diagnosis: str
    preferences: Optional[ReferralPreferences] = None


class Facility(BaseModel):
    id: str
    name: str
    type: str
    address: str
    phone: Optional[str]
    website: Optional[str]
    rating: Optional[float]
    distance: Optional[float]
    isOpen: Optional[bool]
    hours: Optional[str]
    services: Optional[List[str]]
    coordinates: Optional[dict]


class ReferralResponse(BaseModel):
    urgent: List[Facility]
    recommended: List[Facility]
    alternatives: List[Facility]
    telemedicine: List[dict]
    emergency_note: Optional[str]


router = APIRouter(prefix="", tags=["referral"])


@router.post("/find", response_model=ReferralResponse)
async def find_referrals(request: ReferralRequest):
    try:
        service = ReferralService()
        result = await service.findBestReferrals(
            user_location=request.location.dict(),
            diagnosis=request.diagnosis,
            preferences=request.preferences.dict() if request.preferences else {}
        )
        return {
            "urgent": result["urgent"],
            "recommended": result["recommended"],
            "alternatives": result["alternatives"],
            "telemedicine": result["telemedicine"],
            "emergency_note": "For emergencies call 911" 
                if request.preferences and request.preferences.urgency == "emergency" 
                else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
