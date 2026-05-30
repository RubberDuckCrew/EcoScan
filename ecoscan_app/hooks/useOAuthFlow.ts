import { useCallback, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { AUTH_CONFIG } from "@/utils/authConfig";

const redirectUri = AuthSession.makeRedirectUri();

interface UseOAuthFlowProps {
  idToken: string | null;
  refreshToken: string | null;
  saveTokens: (tokens: AuthSession.TokenResponse) => Promise<void>;
  clearTokens: () => Promise<void>;
}

export const useOAuthFlow = ({
  idToken,
  refreshToken,
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

  const refresh = useCallback(async () => {
    if (!refreshToken || !discovery) return;
    try {
      const tokenResult = await AuthSession.refreshAsync(
        { clientId: AUTH_CONFIG.clientId, refreshToken },
        discovery,
      );
      await saveTokens(tokenResult);
    } catch (e) {
      console.error("Refresh failed", e);
      await logout();
    }
  }, [refreshToken, discovery, saveTokens, clearTokens]);

  const logout = useCallback(async () => {
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
  }, [idToken, discovery, clearTokens]);

  return {
    login,
    logout,
    refresh,
    isDiscoveryLoading,
    discovery,
  };
};
