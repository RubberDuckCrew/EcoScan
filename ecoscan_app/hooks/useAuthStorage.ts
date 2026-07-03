import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";

const SECURE_STORE_KEYS = {
  TOKEN_CONFIG: "auth_token_config",
};

export const useAuthStorage = () => {
  const [tokenConfig, setTokenConfig] =
    useState<AuthSession.TokenResponseConfig | null>(null);
  const [isStorageLoading, setIsStorageLoading] = useState(true);

  const loadTokens = useCallback(async () => {
    try {
      const storedConfigString = await SecureStore.getItemAsync(
        SECURE_STORE_KEYS.TOKEN_CONFIG,
      );

      if (storedConfigString) {
        setTokenConfig(JSON.parse(storedConfigString));
      }
    } catch (e) {
      console.error("Failed to load tokens from SecureStore:", e);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.TOKEN_CONFIG);
    } finally {
      setIsStorageLoading(false);
    }
  }, []);

  const saveTokens = useCallback(
    async (tokenResult: AuthSession.TokenResponse) => {
      try {
        const configToSave = tokenResult.getRequestConfig();

        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.TOKEN_CONFIG,
          JSON.stringify(configToSave),
        );

        setTokenConfig(configToSave);
      } catch (e) {
        console.error("Failed to save tokens to SecureStore:", e);
      }
    },
    [],
  );

  const clearTokens = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.TOKEN_CONFIG);
    } catch (e) {
      console.error("Failed to clear tokens from SecureStore:", e);
    } finally {
      setTokenConfig(null);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return {
    tokenConfig,
    isStorageLoading,
    saveTokens,
    clearTokens,
  };
};
