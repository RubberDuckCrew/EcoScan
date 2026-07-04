import { useAuth } from "@/context/AuthContext";
import { OidcUserInfo } from "@/types/userInfo";
import { AUTH_CONFIG } from "@/utils/authConfig";
import * as AuthSession from "expo-auth-session";
import { useEffect, useState } from "react";

export const useUserInfo = () => {
  const { getAccessToken, refresh } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const loadAccessToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token);
    };

    loadAccessToken();
  }, [getAccessToken]);

  const fetchUserInfo = async () => {
    if (!accessToken) {
      setUserInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const discovery = await AuthSession.fetchDiscoveryAsync(
        AUTH_CONFIG.issuer,
      );
      const userInfoEndpoint = discovery.userInfoEndpoint;

      if (!userInfoEndpoint) {
        setError("UserInfo endpoint is not available in discovery document.");
        setUserInfo(null);
        return;
      }

      const response = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        await refresh();
        setUserInfo(null);
        setError(null);
        return;
      }

      if (!response.ok) {
        setError(`Failed to fetch user info: ${response.statusText}`);
        setUserInfo(null);
        return;
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.error("Failed to fetch user info:", errorMessage);
      setError(errorMessage);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUserInfo();
  }, [accessToken]);

  return { userInfo, loading, error, refetch: fetchUserInfo };
};
