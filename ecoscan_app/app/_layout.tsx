import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { PaperProvider, Snackbar } from "react-native-paper";
import { theme } from "@/theme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import {
  useSnackbar,
  getSnackbarStyles,
  SnackbarProvider,
} from "@/context/SnackbarContext";
import { NotificationProvider } from "@/context/NotificationProvider";
import { ProductProvider } from "@/context/ProductContext";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { currentSnackbar, dismissSnackbar } = useSnackbar();

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
      <Snackbar
        visible={!!currentSnackbar}
        onDismiss={dismissSnackbar}
        duration={currentSnackbar?.duration || 4000}
        style={{
          ...(currentSnackbar ? getSnackbarStyles(currentSnackbar.type) : {}),
          marginBottom: 70,
        }}
      >
        {currentSnackbar?.message || ""}
      </Snackbar>
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
