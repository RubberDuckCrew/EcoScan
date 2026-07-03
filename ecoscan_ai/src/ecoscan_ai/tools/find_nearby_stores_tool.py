from typing import Type

import requests
from pydantic import BaseModel

from ecoscan_ai.tools.backend_tool import BackendTool


class LocationInput(BaseModel):
    latitude: float
    longitude: float

class FindNearbyStoresTool(BackendTool):
    name: str = "Find nearby stores"
    description: str = "Find supermarkets near given coordinates using OpenStreetMap."
    args_schema: Type[LocationInput] = LocationInput

    def _run(self, latitude: float, longitude: float) -> str:
        query = f"""
    [out:json];
    node["shop"="supermarket"](around:5000,{latitude},{longitude});
    out 3;
    """
        response = requests.post(
            "https://overpass-api.de/api/interpreter",
            data={"data": query},  # als Form-Data, nicht raw body
            timeout=10
        )
        response.raise_for_status()
        nodes = response.json().get("elements", [])
        results = [
            {"name": n.get("tags", {}).get("name", "Supermarkt"),
             "latitude": n["lat"],
             "longitude": n["lon"]}
            for n in nodes
        ]
        return str(results)