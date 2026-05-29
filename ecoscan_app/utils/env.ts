export const ENV = {
  backendUrl: requireEnv(
    process.env.EXPO_PUBLIC_BACKEND_URL,
    "EXPO_PUBLIC_BACKEND_URL",
  ),
  keycloak: {
    url: requireEnv(
      process.env.EXPO_PUBLIC_KEYCLOAK_URL,
      "EXPO_PUBLIC_KEYCLOAK_URL",
    ),
    realm: requireEnv(
      process.env.EXPO_PUBLIC_KEYCLOAK_REALM,
      "EXPO_PUBLIC_KEYCLOAK_REALM",
    ),
    clientId: requireEnv(
      process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
      "EXPO_PUBLIC_KEYCLOAK_CLIENT_ID",
    ),
  },
} as const;

export function requireEnv(value: string | undefined, key: string): string {
  if (value == null || value.trim() === "") {
    throw new Error(`${key} is not set`);
  }

  return value;
}
