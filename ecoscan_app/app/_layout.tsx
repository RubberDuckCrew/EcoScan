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
import { NotificationProvider } from "@/context/NotificationProvider";
import { ProductProvider } from "@/context/ProductContext";

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
    const inAlternativesGroup = segments.some((s) => s === "alternatives");

    if (isAuthenticated) {
      if (!inTabsGroup && !inProductGroup && !inAlternativesGroup) {
        router.replace("/(tabs)/(scan)");
      }
    } else {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key, router]);

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="alternatives/[product]"
        options={{
          headerShown: true,
          title: "EcoScan",
          headerStyle: { backgroundColor: theme.colors.secondary },
          headerTitleStyle: { color: "black", fontWeight: "bold" },
        }}
      />
    </Stack>
  );

  return isAuthenticated && !isLoading ? (
    <ProductProvider>
      <NotificationProvider>{stack}</NotificationProvider>
    </ProductProvider>
  ) : (
    stack
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <ErrorProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ErrorProvider>
    </PaperProvider>
  );
}
