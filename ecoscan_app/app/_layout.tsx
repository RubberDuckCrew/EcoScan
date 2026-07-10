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
import { SnackbarProvider } from "@/context/SnackbarContext";
import { NotificationProvider } from "@/context/NotificationProvider";
import { ProductProvider } from "@/context/ProductContext";
import GlobalSnackbar from "@/components/GlobalSnackbar";

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
    </Stack>
  );

  return (
    <>
      {isAuthenticated && !isLoading ? (
        <NotificationProvider>{stack}</NotificationProvider>
      ) : (
        stack
      )}
      <GlobalSnackbar />
    </>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SnackbarProvider>
        <ProductProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ProductProvider>
      </SnackbarProvider>
    </PaperProvider>
  );
}
