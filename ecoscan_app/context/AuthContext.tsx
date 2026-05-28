import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";

interface AuthContextType {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (tokenResult: AuthSession.TokenResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateTokens: (tokenResult: AuthSession.TokenResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  ID_TOKEN: "auth_id_token",
  REFRESH_TOKEN: "auth_refresh_token",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tokens from SecureStore on startup
    const loadTokens = async () => {
      try {
        const [storedAccess, storedId, storedRefresh] = await Promise.all([
          SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
          SecureStore.getItemAsync(SECURE_STORE_KEYS.ID_TOKEN),
          SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
        ]);

        if (storedAccess) setAccessToken(storedAccess);
        if (storedId) setIdToken(storedId);
        if (storedRefresh) setRefreshToken(storedRefresh);
      } catch (e) {
        console.error("Failed to load tokens from SecureStore:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  const login = async (tokenResult: AuthSession.TokenResponse) => {
    await updateTokens(tokenResult);
  };

  const updateTokens = async (tokenResult: AuthSession.TokenResponse) => {
    try {
      if (tokenResult.accessToken) {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.ACCESS_TOKEN,
          tokenResult.accessToken,
        );
        setAccessToken(tokenResult.accessToken);
      }

      if (tokenResult.idToken) {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.ID_TOKEN,
          tokenResult.idToken,
        );
        setIdToken(tokenResult.idToken);
      }

      if (tokenResult.refreshToken) {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.REFRESH_TOKEN,
          tokenResult.refreshToken,
        );
        setRefreshToken(tokenResult.refreshToken);
      }
    } catch (e) {
      console.error("Failed to save tokens to SecureStore:", e);
    }
  };

  const logout = async () => {
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
      console.error("Failed to delete tokens from SecureStore:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        idToken,
        refreshToken,
        isLoading,
        login,
        logout,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
