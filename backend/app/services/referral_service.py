import httpx
from geopy.distance import geodesic

class ReferralService:
    async def findBestReferrals(self, user_location, diagnosis, preferences):
        lat = user_location.get('lat', 40.7128)
        lng = user_location.get('lng', -74.0060)

        # Overpass API query to find hospitals, clinics, and pharmacies within 10km radius
        overpass_url = "http://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        (
          node["amenity"="hospital"](around:10000,{lat},{lng});
          way["amenity"="hospital"](around:10000,{lat},{lng});
          relation["amenity"="hospital"](around:10000,{lat},{lng});
          node["amenity"="clinic"](around:10000,{lat},{lng});
          way["amenity"="clinic"](around:10000,{lat},{lng});
          relation["amenity"="clinic"](around:10000,{lat},{lng});
          node["amenity"="doctors"](around:10000,{lat},{lng});
          way["amenity"="doctors"](around:10000,{lat},{lng});
          relation["amenity"="doctors"](around:10000,{lat},{lng});
          node["healthcare"="clinic"](around:10000,{lat},{lng});
          way["healthcare"="clinic"](around:10000,{lat},{lng});
          relation["healthcare"="clinic"](around:10000,{lat},{lng});
          node["amenity"="pharmacy"](around:10000,{lat},{lng});
          way["amenity"="pharmacy"](around:10000,{lat},{lng});
          relation["amenity"="pharmacy"](around:10000,{lat},{lng});
        );
        out center;
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(overpass_url, data=query)
            data = response.json()

        facilities = []
        for element in data.get("elements", []):
            # Get coordinates
            if element.get("type") == "node":
                el_lat = element.get("lat")
                el_lon = element.get("lon")
            else:
                center = element.get("center", {})
                el_lat = center.get("lat")
                el_lon = center.get("lon")

            if el_lat is None or el_lon is None:
                continue

            # Calculate distance from user location
            distance = geodesic((lat, lng), (el_lat, el_lon)).km

            tags = element.get("tags", {})

            # Determine facility type based on amenity or healthcare tags
            amenity = tags.get("amenity")
            healthcare = tags.get("healthcare")

            if amenity == "hospital":
                facility_type = "hospital"
                default_name = "Unknown Hospital"
            elif amenity == "clinic" or healthcare == "clinic":
                facility_type = "clinic"
                default_name = "Unknown Clinic"
            elif amenity == "doctors":
                facility_type = "clinic"
                default_name = "Unknown Medical Practice"
            elif amenity == "pharmacy":
                facility_type = "pharmacy"
                default_name = "Unknown Pharmacy"
            else:
                facility_type = "clinic"  # fallback
                default_name = "Unknown Medical Facility"

            name = tags.get("name", default_name)
            address = ", ".join(filter(None, [
                tags.get("addr:street"),
                tags.get("addr:housenumber"),
                tags.get("addr:city"),
                tags.get("addr:state"),
                tags.get("addr:postcode")
            ]))
            if not address:
                address = "Address not available"

            facility = {
                "id": str(element.get("id")),
                "name": name,
                "type": facility_type,
                "address": address,
                "phone": tags.get("phone"),
                "website": tags.get("website"),
                "rating": None,
                "distance": round(distance, 2),
                "isOpen": None,
                "hours": tags.get("opening_hours"),
                "services": None,
                "coordinates": {"lat": el_lat, "lng": el_lon}
            }
            facilities.append(facility)

        return {
            "urgent": [],
            "recommended": facilities,
            "alternatives": [],
            "telemedicine": []
        }
