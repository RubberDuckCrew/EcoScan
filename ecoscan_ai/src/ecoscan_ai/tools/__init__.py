from crewai.tools import tool
from ddgs import DDGS

@tool("DuckDuckGo Search")
def duckduckgo_search(query: str) -> str:
    """Search the web using DuckDuckGo and return a summary of results."""
    results = DDGS().text(query, max_results=5)
    return "\n\n".join(
        f"Title: {r['title']}\n{r['href']}\n{r['body']}"
        for r in results
    )