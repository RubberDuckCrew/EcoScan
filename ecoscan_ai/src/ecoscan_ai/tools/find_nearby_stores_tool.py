from typing import Type

import requests
from pydantic import BaseModel

from ecoscan_ai.tools.backend_tool import BackendTool


class LocationInput(BaseModel):
    latitude: float
    longitude: float

    model_config = {
        "json_schema_extra": {"examples": [{"latitude": 48.1351, "longitude": 11.5820}]}
    }


class FindNearbyStoresTool(BackendTool):
    name: str = "Find nearby stores"
    description: str = (
        "Find supermarkets near given coordinates using OpenStreetMap. "
        "Pass the actual numeric values for latitude and longitude, "
        "e.g. latitude=48.1351, longitude=11.5820. "
        "Do NOT pass a schema or JSON object description."
    )
    args_schema: Type[LocationInput] = LocationInput

    def _run(self, latitude: float, longitude: float) -> str:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": "supermarket",
                "lat": latitude,
                "lon": longitude,
                "format": "json",
                "limit": 3,
                "bounded": 1,
                "viewbox": f"{longitude - 0.05},{latitude + 0.05},{longitude + 0.05},{latitude - 0.05}",
            },
            headers={"User-Agent": "EcoScan/1.0"},
            timeout=10,
        )
        response.raise_for_status()
        results = [
            {
                "name": r.get("display_name", "Supermarkt"),
                "latitude": float(r["lat"]),
                "longitude": float(r["lon"]),
            }
            for r in response.json()
        ]
        return str(results)
