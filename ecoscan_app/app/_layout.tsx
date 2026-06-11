import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { PaperProvider } from "react-native-paper";
import { theme } from "@/theme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { ErrorProvider } from "@/context/ErrorContext";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments.some((s) => s === "(auth)");
    const inTabsGroup = segments.some((s) => s === "(tabs)");
    const inProductGroup = segments.some((s) => s === "product");

    if (isAuthenticated) {
      if (!inTabsGroup && !inProductGroup) {
        router.replace("/(tabs)/Scan");
      }
    } else {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product/[id]"
        options={{
          headerShown: true,
          title: "EcoScan",
          headerStyle: { backgroundColor: theme.colors.secondary },
          headerTitleStyle: { color: "black", fontWeight: "bold" },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ErrorProvider>
        <PaperProvider theme={theme}>
          <RootLayoutNav />
        </PaperProvider>
      </ErrorProvider>
    </AuthProvider>
  );
}
