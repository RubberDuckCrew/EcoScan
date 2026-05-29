import { useAuth } from "@/context/AuthContext";
import { ENV } from "@/utils/env";
import { useCallback, useMemo } from "react";

type ApiClient = {
  get: (endpoint: string, options?: RequestInit) => Promise<any>;
  post: (endpoint: string, body?: any, options?: RequestInit) => Promise<any>;
  put: (endpoint: string, body?: any, options?: RequestInit) => Promise<any>;
  delete: (endpoint: string, options?: RequestInit) => Promise<any>;
};

export const useApiClient = () => {
  const { accessToken, refresh } = useAuth();

  const request = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const url = `${ENV.backendUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

      const headers = new Headers(options.headers);
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      headers.set("Content-Type", "application/json");

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await refresh();
        return request(endpoint, options);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API Request failed with status ${response.status}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    },
    [accessToken, refresh],
  );

  return useMemo(
    (): ApiClient => ({
      get: (endpoint: string, options?: RequestInit) =>
        request(endpoint, { ...options, method: "GET" }),
      post: (endpoint: string, body?: any, options?: RequestInit) =>
        request(endpoint, {
          ...options,
          method: "POST",
          body: JSON.stringify(body),
        }),
      put: (endpoint: string, body?: any, options?: RequestInit) =>
        request(endpoint, {
          ...options,
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (endpoint: string, options?: RequestInit) =>
        request(endpoint, { ...options, method: "DELETE" }),
    }),
    [request],
  );
};
