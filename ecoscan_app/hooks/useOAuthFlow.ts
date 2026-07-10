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

  const loadDiscovery =
    useCallback(async (): Promise<AuthSession.DiscoveryDocument | null> => {
      setIsDiscoveryLoading(true);
      try {
        const discoveryDoc = await AuthSession.fetchDiscoveryAsync(
          AUTH_CONFIG.issuer,
        );
        setDiscovery(discoveryDoc);
        return discoveryDoc;
      } catch (e) {
        console.warn("[useOAuthFlow] Discovery failed", e);
        Alert.alert("Fehler", "Auth-Service nicht erreichbar"); // TODO: Replace with snackbar
        return null;
      } finally {
        setIsDiscoveryLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDiscovery();
  }, [loadDiscovery]);

  const login = useCallback(async () => {
    const disc = discovery || (await loadDiscovery());
    if (!disc) return;

    try {
      const authRequest = new AuthSession.AuthRequest({
        responseType: AuthSession.ResponseType.Code,
        clientId: AUTH_CONFIG.clientId,
        redirectUri,
        prompt: AuthSession.Prompt.Login,
        scopes: AUTH_CONFIG.scopes,
        usePKCE: true,
      });

      const result = await authRequest.promptAsync(disc);

      if (result.type === "success") {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            code: result.params.code,
            clientId: AUTH_CONFIG.clientId,
            redirectUri,
            extraParams: { code_verifier: authRequest.codeVerifier || "" },
          },
          disc,
        );
        await saveTokens(tokenResult);
      }
    } catch (e) {
      console.error("Login failed", e);
      Alert.alert("Login Fehler", "Anmeldung fehlgeschlagen");
    }
  }, [discovery, loadDiscovery, saveTokens]);

  const refresh = useCallback(
    async (refreshToken: string) => {
      const disc = discovery || (await loadDiscovery());
      if (!disc) return;

      const tokenInstance = new AuthSession.TokenResponse({
        accessToken: "",
        refreshToken,
      });

      try {
        const refreshedToken = await tokenInstance.refreshAsync(
          { clientId: AUTH_CONFIG.clientId },
          disc,
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
    [discovery, loadDiscovery, saveTokens],
  );

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    if (!tokenConfig) return null;

    const tokenInstance = new AuthSession.TokenResponse(tokenConfig);

    if (tokenInstance.shouldRefresh()) {
      const disc = discovery || (await loadDiscovery());
      if (!disc) return null;

      try {
        const refreshedToken = await tokenInstance.refreshAsync(
          { clientId: AUTH_CONFIG.clientId },
          disc,
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
  }, [tokenConfig, discovery, loadDiscovery, saveTokens, clearTokens]);

  const logout = useCallback(
    async (idToken?: string | null) => {
      const disc = discovery || (await loadDiscovery());
      if (!disc) {
        await clearTokens();
        return;
      }

      try {
        const logoutUrl = `${disc.endSessionEndpoint}?client_id=${
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
    [discovery, loadDiscovery, clearTokens],
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
