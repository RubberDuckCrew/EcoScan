export const AUTH_CONFIG = {
  keycloakUri: process.env.EXPO_PUBLIC_KEYCLOAK_URL || "http://localhost:8100",
  realm: process.env.EXPO_PUBLIC_KEYCLOAK_REALM || "local_realm",
  clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || "mobile",
  scopes: ["openid", "profile", "email", "offline_access"],
  get issuer() {
    return `${this.keycloakUri}/auth/realms/${this.realm}`;
  },
};
