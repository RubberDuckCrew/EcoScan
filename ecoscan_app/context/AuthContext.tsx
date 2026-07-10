import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as AuthSession from "expo-auth-session";
import { jwtDecode } from "jwt-decode";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";

interface AuthContextType {
  refresh: () => Promise<void>;
  getAccessToken: () => string | null;
  getIdToken: () => string | null;
  getRefreshToken: () => string | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getTokenExpiresAt(token: string | null): number | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded?.exp) return null;

    return decoded.exp * 1000;
  } catch (e) {
    console.error("Failed to decode token expiry:", e);
    return null;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    accessToken: initialAccessToken,
    idToken: initialIdToken,
    refreshToken: initialRefreshToken,
    isStorageLoading,
    saveTokens: saveTokensToStorage,
    clearTokens: clearTokensFromStorage,
  } = useAuthStorage();

  const accessTokenRef = useRef<string | null>(initialAccessToken);
  const idTokenRef = useRef<string | null>(initialIdToken);
  const refreshTokenRef = useRef<string | null>(initialRefreshToken);
  const tokenExpiresAtRef = useRef<number | null>(
    getTokenExpiresAt(initialAccessToken),
  );

  const [isAuthenticatedState, setIsAuthenticatedState] = useState(
    !!initialAccessToken && !!initialRefreshToken,
  );
  const [isLoadingState, setIsLoadingState] = useState(isStorageLoading);
  const [tokenVersion, setTokenVersion] = useState(0);

  const handleClearTokens = useCallback(async () => {
    await clearTokensFromStorage();

    accessTokenRef.current = null;
    idTokenRef.current = null;
    refreshTokenRef.current = null;
    tokenExpiresAtRef.current = null;

    setIsAuthenticatedState(false);
    console.log("[Auth] Tokens cleared and user logged out");
  }, [clearTokensFromStorage]);

  const saveTokens = useCallback(
    async (tokenResult: AuthSession.TokenResponse) => {
      await saveTokensToStorage(tokenResult);

      if (tokenResult.accessToken) {
        accessTokenRef.current = tokenResult.accessToken;
        tokenExpiresAtRef.current = getTokenExpiresAt(tokenResult.accessToken);
      }
      if (tokenResult.idToken) {
        idTokenRef.current = tokenResult.idToken;
      }
      if (tokenResult.refreshToken) {
        refreshTokenRef.current = tokenResult.refreshToken;
      }

      setIsAuthenticatedState(
        !!tokenResult.accessToken && !!tokenResult.refreshToken,
      );

      console.log("[Auth] Tokens updated in refs and state");
    },
    [saveTokensToStorage],
  );

  const tokenConfig: AuthSession.TokenResponseConfig | null =
    accessTokenRef.current
      ? {
          accessToken: accessTokenRef.current,
          idToken: idTokenRef.current ?? undefined,
          refreshToken: refreshTokenRef.current ?? undefined,
        }
      : null;

  const {
    login: oauthLogin,
    logout: oauthLogout,
    refresh: refreshOAuth,
    isDiscoveryLoading,
  } = useOAuthFlow({
    saveTokens,
    clearTokens: handleClearTokens,
    tokenConfig,
  });

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRefreshRef = useRef<Promise<void> | null>(null);

  const refreshInternal = useCallback(async () => {
    if (activeRefreshRef.current) {
      return activeRefreshRef.current;
    }

    const currentRefreshToken = refreshTokenRef.current;
    if (!currentRefreshToken) {
      return;
    }

    const promise = (async () => {
      try {
        console.log("[Auth] Refreshing tokens in background...");
        await refreshOAuth(currentRefreshToken);
        console.log("[Auth] Tokens refreshed successfully (silent)");
        setTokenVersion((v) => v + 1);
      } catch (e) {
        console.error("[Auth] Failed to refresh tokens:", e);
        await handleClearTokens();
      } finally {
        activeRefreshRef.current = null;
      }
    })();

    activeRefreshRef.current = promise;
    return promise;
  }, [refreshOAuth, handleClearTokens]);

  const refresh = useCallback(async () => {
    await refreshInternal();
  }, [refreshInternal]);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);
  const getIdToken = useCallback(() => idTokenRef.current, []);
  const getRefreshToken = useCallback(() => refreshTokenRef.current, []);

  const login = useCallback(async () => {
    await oauthLogin();
  }, [oauthLogin]);

  const logout = useCallback(async () => {
    await oauthLogout(idTokenRef.current);
  }, [oauthLogout]);

  useEffect(() => {
    accessTokenRef.current = initialAccessToken;
    idTokenRef.current = initialIdToken;
    refreshTokenRef.current = initialRefreshToken;
    tokenExpiresAtRef.current = getTokenExpiresAt(initialAccessToken);

    setIsAuthenticatedState(!!initialAccessToken && !!initialRefreshToken);
  }, [initialAccessToken, initialIdToken, initialRefreshToken]);

  useEffect(() => {
    setIsLoadingState(isStorageLoading || isDiscoveryLoading);
  }, [isStorageLoading, isDiscoveryLoading]);

  useEffect(() => {
    const tokenExpiresAt = tokenExpiresAtRef.current;
    const refreshToken = refreshTokenRef.current;

    if (!tokenExpiresAt || !refreshToken || activeRefreshRef.current) {
      return;
    }

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const timeUntilExpiry = tokenExpiresAt - now;
    const REFRESH_THRESHOLD = 60 * 1000;
    const delayUntilRefresh = Math.max(0, timeUntilExpiry - REFRESH_THRESHOLD);

    console.log(
      `[Auth] Token expires in ${Math.round(timeUntilExpiry / 1000)}s, scheduling refresh in ${Math.round(delayUntilRefresh / 1000)}s`,
    );

    refreshTimeoutRef.current = setTimeout(() => {
      refreshInternal();
    }, delayUntilRefresh);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshInternal, tokenVersion]);

  const value = useMemo<AuthContextType>(
    () => ({
      refresh,
      getAccessToken,
      getIdToken,
      getRefreshToken,
      isAuthenticated: isAuthenticatedState,
      isLoading: isLoadingState,
      login,
      logout,
    }),
    [
      refresh,
      getAccessToken,
      getIdToken,
      getRefreshToken,
      isAuthenticatedState,
      isLoadingState,
      login,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
