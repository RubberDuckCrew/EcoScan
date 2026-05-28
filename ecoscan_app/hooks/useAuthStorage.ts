import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  ID_TOKEN: "auth_id_token",
  REFRESH_TOKEN: "auth_refresh_token",
};

export const useAuthStorage = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isStorageLoading, setIsStorageLoading] = useState(true);

  const loadTokens = useCallback(async () => {
    try {
      const [storedAccess, storedId, storedRefresh] = await Promise.all([
        SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.ID_TOKEN),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
      ]);

      setAccessToken(storedAccess);
      setIdToken(storedId);
      setRefreshToken(storedRefresh);
    } catch (e) {
      console.error("Failed to load tokens from SecureStore:", e);
    } finally {
      setIsStorageLoading(false);
    }
  }, []);

  const saveTokens = useCallback(
    async (tokenResult: AuthSession.TokenResponse) => {
      try {
        const ops = [];
        if (tokenResult.accessToken) {
          ops.push(
            SecureStore.setItemAsync(
              SECURE_STORE_KEYS.ACCESS_TOKEN,
              tokenResult.accessToken,
            ),
          );
          setAccessToken(tokenResult.accessToken);
        }
        if (tokenResult.idToken) {
          ops.push(
            SecureStore.setItemAsync(
              SECURE_STORE_KEYS.ID_TOKEN,
              tokenResult.idToken,
            ),
          );
          setIdToken(tokenResult.idToken);
        }
        if (tokenResult.refreshToken) {
          ops.push(
            SecureStore.setItemAsync(
              SECURE_STORE_KEYS.REFRESH_TOKEN,
              tokenResult.refreshToken,
            ),
          );
          setRefreshToken(tokenResult.refreshToken);
        }
        await Promise.all(ops);
      } catch (e) {
        console.error("Failed to save tokens:", e);
      }
    },
    [],
  );

  const clearTokens = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ID_TOKEN),
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
      ]);
      setAccessToken(null);
      setIdToken(null);
      setRefreshToken(null);
    } catch (e) {
      console.error("Failed to clear tokens:", e);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return {
    accessToken,
    idToken,
    refreshToken,
    isStorageLoading,
    saveTokens,
    clearTokens,
  };
};
