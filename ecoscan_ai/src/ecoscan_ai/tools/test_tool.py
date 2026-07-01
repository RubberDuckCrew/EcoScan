# TODO: Remove after integrating into real crew

import requests
from pydantic import BaseModel

from ecoscan_ai.tools.backend_tool import BackendTool


class TestToolInput(BaseModel):
    pass


class TestTool(BackendTool):
    name: str = "test_query"
    description: str = (
        "Calls the secured test endpoint on the backend to check DuckDB access."
    )
    args_schema: type[BaseModel] = TestToolInput

    def _run(self) -> str:
        try:
            resp = requests.get(
                self._request_url("test"),
                headers=self._auth_headers(),
                timeout=10,
            )
            resp.raise_for_status()
            print(resp.text)
            return resp.text
        except requests.HTTPError as e:
            return f"Error accessing endpoint: {e.response.status_code} - {e.response.text}"
