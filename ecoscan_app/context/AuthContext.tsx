import React, { createContext, useContext, useMemo } from "react";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";

interface AuthContextType {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    tokenConfig,
    isStorageLoading,
    saveTokens,
    clearTokens,
  } = useAuthStorage();

  const {
    login,
    logout,
    getValidAccessToken,
    isDiscoveryLoading
  } = useOAuthFlow({
    tokenConfig,
    saveTokens,
    clearTokens,
  });

  const isLoading = isStorageLoading || isDiscoveryLoading;

  const accessToken = tokenConfig?.accessToken || null;
  const idToken = tokenConfig?.idToken || null;
  const refreshToken = tokenConfig?.refreshToken || null;

  const isAuthenticated = !!accessToken;

  const value = useMemo(
      () => ({
        accessToken,
        idToken,
        refreshToken,
        isLoading,
        isAuthenticated,
        login,
        logout,
        getValidAccessToken,
      }),
      [
        accessToken,
        idToken,
        refreshToken,
        isLoading,
        isAuthenticated,
        login,
        logout,
        getValidAccessToken,
      ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};