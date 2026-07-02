from pydantic import BaseModel
import requests
from typing import Type

from ecoscan_ai.tools.backend_tool import BackendTool

class CategoryInput(BaseModel):
    category: str

class SearchProductsByCategoryTool(BackendTool):
    name: str = "Search products by category"
    description: str = "Search for products by category using the backend API."
    args_schema: Type[CategoryInput] = CategoryInput

    def _run(self, category: str) -> str:
        print(f"Searching for products in category: {category}")
        response = requests.get(
            self._request_url(f"product/by-category/{category}"),
            headers=self._auth_headers(),
        )
        response.raise_for_status()
        products = response.json()
        eans = [p["id"] for p in products]
        return str(eans)
