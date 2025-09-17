# backend/app/services/cdc_client.py

import httpx

class HealthAPIClient:
    CDC_BASE_URL = "https://api.cdc.gov/endpoint"  # Replace with actual endpoint
    WHO_BASE_URL = "https://www.who.int/api/endpoint"

    async def fetch_cdc_data(self, query: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.CDC_BASE_URL}/{query}")
            response.raise_for_status()
            return response.json()

    async def fetch_who_data(self, query: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.WHO_BASE_URL}/{query}")
            response.raise_for_status()
            return response.json()
