import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

const BASE_URL = "http://localhost:39146/api";

export const useApiClient = () => {
  const { accessToken, logout } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = new Headers(options.headers);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    headers.set("Content-Type", "application/json");

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Potential token expiration handling could go here
        // For now, we just logout if we get an unauthorized response
        // await logout();
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API Request failed with status ${response.status}`,
        );
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error(`API Request Error (${url}):`, error);
      throw error;
    }
  };

  return useMemo(
    () => ({
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
    [accessToken],
  );
};
