import { useCallback, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { AUTH_CONFIG } from "@/utils/authConfig";

const redirectUri = AuthSession.makeRedirectUri();

interface UseOAuthFlowProps {
  tokenConfig: AuthSession.TokenResponseConfig | null;
  saveTokens: (tokens: AuthSession.TokenResponse) => Promise<void>;
  clearTokens: () => Promise<void>;
}

export const useOAuthFlow = ({
  tokenConfig,
  saveTokens,
  clearTokens,
}: UseOAuthFlowProps) => {
  const [discovery, setDiscovery] =
    useState<AuthSession.DiscoveryDocument | null>(null);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(true);

  useEffect(() => {
    AuthSession.fetchDiscoveryAsync(AUTH_CONFIG.issuer)
      .then(setDiscovery)
      .catch((e) => console.error("Discovery failed", e))
      .finally(() => setIsDiscoveryLoading(false));
  }, []);

  const login = useCallback(async () => {
    if (!discovery) {
      Alert.alert("Fehler", "Auth-Service nicht erreichbar");
      return;
    }

    try {
      const authRequest = new AuthSession.AuthRequest({
        responseType: AuthSession.ResponseType.Code,
        clientId: AUTH_CONFIG.clientId,
        redirectUri,
        prompt: AuthSession.Prompt.Login,
        scopes: AUTH_CONFIG.scopes,
        usePKCE: true,
      });

      const result = await authRequest.promptAsync(discovery);

      if (result.type === "success") {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            code: result.params.code,
            clientId: AUTH_CONFIG.clientId,
            redirectUri,
            extraParams: { code_verifier: authRequest.codeVerifier || "" },
          },
          discovery,
        );
        await saveTokens(tokenResult);
      }
    } catch (e) {
      console.error("Login failed", e);
      Alert.alert("Login Fehler", "Anmeldung fehlgeschlagen");
    }
  }, [discovery, saveTokens]);

  const refresh = useCallback(
    async (refreshToken: string) => {
      let currentDiscovery = discovery;

      if (!currentDiscovery) {
        try {
          console.log("[OAuthFlow] Discovery missing. Loading on-the-fly ...");
          currentDiscovery = await AuthSession.fetchDiscoveryAsync(
            AUTH_CONFIG.issuer,
          );
        } catch (e) {
          throw new Error(
            "Cannot refresh: Auth-Service (Discovery) is not available",
          );
        }
      }

      const tokenInstance = new AuthSession.TokenResponse({
        accessToken: "",
        refreshToken,
      });

      try {
        const refreshedToken = await tokenInstance.refreshAsync(
          { clientId: AUTH_CONFIG.clientId },
          currentDiscovery,
        );

        refreshedToken.refreshToken =
          refreshedToken.refreshToken ?? refreshToken;

        await saveTokens(refreshedToken);
        console.info("[OAuthFlow] Token refresh successful");
        return refreshedToken;
      } catch (e) {
        console.error("[OAuthFlow] Token refresh failed", e);
        throw e;
      }
    },
    [discovery, saveTokens],
  );

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    if (!tokenConfig) return null;

    const tokenInstance = new AuthSession.TokenResponse(tokenConfig);

    if (tokenInstance.shouldRefresh()) {
      if (!discovery) return null;
      try {
        const refreshedToken = await tokenInstance.refreshAsync(
          { clientId: AUTH_CONFIG.clientId },
          discovery,
        );
        refreshedToken.refreshToken =
          refreshedToken.refreshToken ?? tokenInstance.refreshToken;
        await saveTokens(refreshedToken);
        console.info("Refreshed access token successfully");
        return refreshedToken.accessToken;
      } catch (e) {
        console.error("Auto-refresh failed, forcing logout", e);
        await clearTokens();
        return null;
      }
    }

    return tokenInstance.accessToken;
  }, [tokenConfig, discovery, saveTokens, clearTokens]);

  const logout = useCallback(
    async (idToken?: string | null) => {
      if (!discovery) {
        await clearTokens();
        return;
      }

      try {
        const logoutUrl = `${discovery.endSessionEndpoint}?client_id=${
          AUTH_CONFIG.clientId
        }${idToken ? `&id_token_hint=${idToken}` : ""}&post_logout_redirect_uri=${encodeURIComponent(
          redirectUri,
        )}`;
        await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
      } catch (e) {
        console.error("Logout failed", e);
      } finally {
        await clearTokens();
      }
    },
    [discovery, clearTokens],
  );

  return {
    login,
    logout,
    refresh,
    getValidAccessToken,
    isDiscoveryLoading,
    discovery,
  };
};
