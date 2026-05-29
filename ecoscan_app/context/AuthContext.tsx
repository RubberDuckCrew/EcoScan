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
  refresh: () => Promise<void>;
}
interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    accessToken,
    idToken,
    refreshToken,
    isStorageLoading,
    saveTokens,
    clearTokens,
  } = useAuthStorage();

  const { login, logout, refresh, isDiscoveryLoading } = useOAuthFlow({
    idToken,
    refreshToken,
    saveTokens,
    clearTokens,
  });

  const isLoading = isStorageLoading || isDiscoveryLoading;
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
      refresh,
    }),
    [
      accessToken,
      idToken,
      refreshToken,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refresh,
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
