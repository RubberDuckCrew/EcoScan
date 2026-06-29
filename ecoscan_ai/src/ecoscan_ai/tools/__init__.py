from crewai.tools import tool

@tool("Search products by category")
def search_products_by_category(category: str) -> str:
    import requests
    response = requests.get(
        f"http://localhost:8080/products/by-category/{category}"
    )
    return response.json()