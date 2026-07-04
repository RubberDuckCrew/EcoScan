import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  ID_TOKEN: "auth_id_token",
};

export const useAuthStorage = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [isStorageLoading, setIsStorageLoading] = useState(true);

  const clearTokens = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ID_TOKEN),
      ]);
    } catch (e) {
      console.error("Failed to clear tokens from SecureStore:", e);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setIdToken(null);
    }
  }, []);

  const loadTokens = useCallback(async () => {
    try {
      const [storedAccessToken, storedRefreshToken, storedIdToken] = await Promise.all([
        SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.ID_TOKEN),
      ]);

      setAccessToken(storedAccessToken || null);
      setRefreshToken(storedRefreshToken || null);
      setIdToken(storedIdToken || null);
    } catch (e) {
      console.error("Failed to load tokens from SecureStore:", e);
      await clearTokens();
    } finally {
      setIsStorageLoading(false);
    }
  }, [clearTokens]);

  const saveTokens = useCallback(
      async (tokenResult: AuthSession.TokenResponse) => {
        try {
          const promises = [];

          if (tokenResult.accessToken) {
            promises.push(SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, tokenResult.accessToken));
            setAccessToken(tokenResult.accessToken);
          }

          if (tokenResult.refreshToken) {
            promises.push(SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, tokenResult.refreshToken));
            setRefreshToken(tokenResult.refreshToken);
          }

          if (tokenResult.idToken) {
            promises.push(SecureStore.setItemAsync(SECURE_STORE_KEYS.ID_TOKEN, tokenResult.idToken));
            setIdToken(tokenResult.idToken);
          }

          await Promise.all(promises);
        } catch (e) {
          console.error("Failed to save tokens to SecureStore:", e);
        }
      },
      [],
  );

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return {
    accessToken,
    refreshToken,
    idToken,
    isStorageLoading,
    saveTokens,
    clearTokens,
  };
};