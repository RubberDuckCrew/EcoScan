import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri();

const keycloakUri = "http://localhost:8100";
const keycloakRealm = "local_realm";
const clientId = "mobile";

export function generateShortUUID() {
  return Math.random().toString(36).substring(2, 15);
}

export default function App() {
  const [accessToken, setAccessToken] = useState<string>();
  const [idToken, setIdToken] = useState<string>();
  const [refreshToken, setRefreshToken] = useState<string>();
  const [discoveryResult, setDiscoveryResult] =
    useState<AuthSession.DiscoveryDocument>();

  // Fetch OIDC discovery document once
  useEffect(() => {
    const getDiscoveryDocument = async () => {
      try {
        const issuer = `${keycloakUri}/auth/realms/${keycloakRealm}`;
        console.log("Fetching discovery from", issuer);
        const discoveryDocument = await AuthSession.fetchDiscoveryAsync(issuer);
        setDiscoveryResult(discoveryDocument);
      } catch (e) {
        console.error("Failed to fetch discovery:", e);
        Alert.alert(
          "Netzwerkfehler",
          `Fehler beim Laden der Discovery-Dokument: ${e}`,
        );
      }
    };
    getDiscoveryDocument();
  }, []);

  const login = async () => {
    const state = generateShortUUID();
    // Get Authorization code
    const authRequestOptions: AuthSession.AuthRequestConfig = {
      responseType: AuthSession.ResponseType.Code,
      clientId,
      redirectUri: redirectUri,
      prompt: AuthSession.Prompt.Login,
      scopes: ["openid", "profile", "email", "offline_access"],
      state: state,
      usePKCE: true,
    };
    const authRequest = new AuthSession.AuthRequest(authRequestOptions);
    const authorizeResult = await authRequest.promptAsync(discoveryResult!);

    if (authorizeResult.type === "success") {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          code: authorizeResult.params.code,
          clientId: clientId,
          redirectUri: redirectUri,
          extraParams: {
            code_verifier: authRequest.codeVerifier || "",
          },
        },
        discoveryResult!,
      );

      setAccessToken(tokenResult.accessToken);
      setIdToken(tokenResult.idToken);
      setRefreshToken(tokenResult.refreshToken);
    }
  };

  const refresh = async () => {
    const refreshTokenObject: AuthSession.RefreshTokenRequestConfig = {
      clientId: clientId,
      refreshToken: refreshToken,
    };
    const tokenResult = await AuthSession.refreshAsync(
      refreshTokenObject,
      discoveryResult!,
    );

    setAccessToken(tokenResult.accessToken);
    setIdToken(tokenResult.idToken);
    setRefreshToken(tokenResult.refreshToken);
  };

  const logout = async () => {
    if (!accessToken) return;
    const redirectUrl = AuthSession.makeRedirectUri({
      // useProxy
    });
    const revoked = await AuthSession.revokeAsync(
      { token: accessToken },
      discoveryResult!,
    );
    if (!revoked) return;

    // The default revokeAsync method doesn't work for Keycloak, we need to explicitely invoke the OIDC endSessionEndpoint with the correct parameters
    const logoutUrl = `${discoveryResult!
      .endSessionEndpoint!}?client_id=${clientId}&post_logout_redirect_uri=${redirectUrl}&id_token_hint=${idToken}`;

    const res = await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUrl);
    if (res.type === "success") {
      setAccessToken(undefined);
      setIdToken(undefined);
      setRefreshToken(undefined);
    }
  };

  if (!discoveryResult) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {refreshToken ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View>
            <ScrollView style={{ flex: 1 }}>
              <Text>AccessToken: {accessToken}</Text>
              <Text>idToken: {idToken}</Text>
              <Text>refreshToken: {refreshToken}</Text>
            </ScrollView>
          </View>
          <View>
            <Button title="Logout" onPress={logout} />
            <Button title="Refresh" onPress={refresh} />
          </View>
        </View>
      ) : (
        <Button title="Login" onPress={login} />
      )}
    </View>
  );
}
