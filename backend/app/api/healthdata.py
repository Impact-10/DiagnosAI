# backend/app/api/healthdata.py

from fastapi import APIRouter, HTTPException
from app.services.cdc_client import HealthAPIClient
from app.core.dependencies import redis_client

router = APIRouter()
cdc_client = HealthAPIClient()

@router.get("/health-info/{query}")
async def get_health_info(query: str):
    cache_key = f"health:{query}"
    cached = redis_client.get(cache_key)
    if cached:
        return {"source": "cache", "data": cached.decode("utf-8")}
    result = await cdc_client.fetch_cdc_data(query)
    redis_client.setex(cache_key, 3600, str(result))  # Cache for 1 hr
    return {"source": "CDC_API", "data": result}
