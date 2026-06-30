from crewai.tools import tool
from ddgs import DDGS
import requests

@tool("DuckDuckGo Search")
def duckduckgo_search(query: str) -> str:
    results = DDGS().text(query, max_results=5)
    return "\n\n".join(
        f"Title: {r['title']}\n{r['href']}\n{r['body']}"
        for r in results
    )

@tool("Search products by category")
def search_products_by_category(category: str) -> str:
    response = requests.get(
        f"http://backend:8080/api/product/by-category/{category}"
    )
    response.raise_for_status()
    products = response.json()
    eans = [p["id"] for p in products]
    return str(eans)