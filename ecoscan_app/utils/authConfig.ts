import { ENV } from "@/utils/env";

export const AUTH_CONFIG = {
  keycloakUri: ENV.keycloak.url,
  realm: ENV.keycloak.realm,
  clientId: ENV.keycloak.clientId,
  scopes: ["openid", "profile", "email", "offline_access"],
  get issuer() {
    return `${this.keycloakUri}/auth/realms/${this.realm}`;
  },
};
