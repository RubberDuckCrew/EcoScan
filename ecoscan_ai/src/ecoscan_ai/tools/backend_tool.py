import os
import time
from abc import ABC

# noinspection PyPackageRequirements
import requests
# noinspection PyPackageRequirements
from crewai.tools import BaseTool


class BackendTool(BaseTool, ABC):
    _keycloak_url: str = os.getenv("KEYCLOAK_URL", "http://localhost:8100")
    _keycloak_realm: str = os.getenv("KEYCLOAK_REALM", "local_realm")
    _client_id: str = os.getenv("CLIENT_ID", "ai-service")
    _client_secret: str = os.getenv("CLIENT_SECRET", "ai-service-client-secret")
    _backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8080")

    _token: str = None
    _token_expiry: float = 0

    def _get_token(self) -> str:
        if self._token and time.time() < self._token_expiry - 30:
            return self._token

        resp = requests.post(
            f"{self._keycloak_url.rstrip("/")}/auth/realms/{self._keycloak_realm}/protocol/openid-connect/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self._client_id,
                "client_secret": self._client_secret,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        self._token = data["access_token"]
        self._token_expiry = time.time() + data["expires_in"]
        return self._token

    def _auth_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self._get_token()}"}

    def _request_url(self, path: str) -> str:
        return f"{self._backend_url.rstrip("/")}/api/{path.strip("/")}"
