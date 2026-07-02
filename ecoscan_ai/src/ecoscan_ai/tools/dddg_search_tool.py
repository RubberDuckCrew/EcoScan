from typing import Type

from ddgs import DDGS
from crewai.tools import BaseTool
from pydantic import BaseModel

class DuckDuckGoInput(BaseModel):
    query: str

class DuckDuckGoSearchTool(BaseTool):
    name: str = "DuckDuckGo Search"
    description: str = "Perform a DuckDuckGo search and return the top 5 results."
    args_schema: Type[DuckDuckGoInput] = DuckDuckGoInput

    def _run(self, query: str) -> str:
        print(f"Performing DuckDuckGo search for query: {query}")
        results = DDGS().text(query, max_results=5)
        return "\n\n".join(
            f"Title: {r['title']}\n{r['href']}\n{r['body']}"
            for r in results
        )