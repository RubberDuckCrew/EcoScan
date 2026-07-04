import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
        if (!decoded || !decoded.exp) return null;

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
        clearTokens,
    } = useAuthStorage();

    const accessTokenRef = useRef<string | null>(initialAccessToken);
    const idTokenRef = useRef<string | null>(initialIdToken);
    const refreshTokenRef = useRef<string | null>(initialRefreshToken);
    const tokenExpiresAtRef = useRef<number | null>(
        getTokenExpiresAt(initialAccessToken)
    );

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

            console.log("[Auth] Tokens updated in refs (silent update)");
        },
        [saveTokensToStorage]
    );

    const {
        login: oauthLogin,
        logout: oauthLogout,
        refresh: refreshOAuth,
        isDiscoveryLoading,
    } = useOAuthFlow({
        idToken: initialIdToken,
        refreshToken: initialRefreshToken,
        saveTokens,
        clearTokens,
    });

    const [isAuthenticatedState, setIsAuthenticatedState] = useState(
        !!initialAccessToken && !!initialRefreshToken
    );
    const [isLoadingState, setIsLoadingState] = useState(
        isStorageLoading || isDiscoveryLoading
    );

    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

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

        if (!tokenExpiresAt || !refreshToken || isRefreshingRef.current) {
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
            `[Auth] Token expires in ${Math.round(timeUntilExpiry / 1000)}s, scheduling refresh in ${Math.round(delayUntilRefresh / 1000)}s`
        );

        refreshTimeoutRef.current = setTimeout(() => {
            refreshInternal();
        }, delayUntilRefresh);

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [tokenExpiresAtRef.current?.toString()]);

    const refreshInternal = useCallback(async () => {
        if (isRefreshingRef.current || !refreshTokenRef.current) {
            return;
        }

        isRefreshingRef.current = true;
        try {
            console.log("[Auth] Refreshing tokens in background...");
            await refreshOAuth();

            console.log("[Auth] Tokens refreshed successfully (silent)");
        } catch (e) {
            console.error("[Auth] Failed to refresh tokens:", e);
            await clearTokens();
        } finally {
            isRefreshingRef.current = false;
        }
    }, [refreshOAuth, clearTokens]);

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
        await oauthLogout();
    }, [oauthLogout]);

    const value: AuthContextType = {
        refresh,
        getAccessToken,
        getIdToken,
        getRefreshToken,
        isAuthenticated: isAuthenticatedState,
        isLoading: isLoadingState,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};