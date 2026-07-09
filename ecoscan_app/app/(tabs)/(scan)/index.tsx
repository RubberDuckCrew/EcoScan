import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ActivityIndicator, Button, Snackbar, Text } from "react-native-paper";

import BarcodeScanner from "@/components/BarcodeScanner";
import { PageContainer } from "@/components/PageContainer";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useAnalyzeProduct } from "@/hooks/useAnalyzeProduct";
import { useError } from "@/context/ErrorContext";

export default function Scan() {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();
  const { loading, analyzeProduct, cancelAnalysis } = useAnalyzeProduct();
  const { consumeError } = useError();

  const showError = (message: string) => {
    setError(message);
    setSnackbarVisible(true);
  };

  const onScanned = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      showError("Barcode darf nicht leer sein.");
      return;
    }
    setBarcode(trimmed);
    try {
      if (await analyzeProduct(trimmed)) {
        router.push({
          pathname: "/(tabs)/(scan)/product/[id]",
          params: { id: trimmed },
        });
      } else {
        showError("Produkt konnte nicht analysiert werden.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Analyse fehlgeschlagen.";
      showError(msg);
    }
  };

  useEffect(() => {
    const errorMsg = consumeError();
    if (errorMsg) {
      showError(errorMsg);
    }
  }, [consumeError]);

  return (
    <PageContainer>
      <Text style={styles.title}>Produkt scannen</Text>
      <View style={styles.scannerContainer}>
        <View style={styles.scannerBox}>
          <BarcodeScanner onScanned={onScanned} />
        </View>
      </View>
      <Text style={styles.label}>Oder Barcode eingeben</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={barcode}
          onChangeText={(text) => {
            setBarcode(text);
          }}
          placeholder="z.B. 4001686312520"
          placeholderTextColor={theme.colors.muted}
          keyboardType="numeric"
          style={styles.input}
          editable={!loading}
        />
        <Button
          onPress={() => onScanned(barcode)}
          style={styles.button}
          disabled={loading || !barcode}
        >
          <Text style={styles.buttonText}>Los</Text>
        </Button>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
              style={styles.indicator}
            />
            <Text style={styles.loadingTitle}>Produkt wird analysiert</Text>
            <Text style={styles.loadingMessage}>
              Dies kann einen Moment dauern...
            </Text>
            <Button
              onPress={() => {
                cancelAnalysis();
              }}
              style={styles.cancelButton}
              textColor={theme.colors.error}
            >
              Abbrechen
            </Button>
          </View>
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error}
      </Snackbar>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.onSurface,
    fontSize: 22,
    fontWeight: "700",
  },

  scannerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },

  scannerBox: {
    width: "100%",
    maxWidth: 400,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  errorContainer: {
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  errorText: {
    color: theme.colors.onError,
    fontSize: 14,
    fontWeight: "500",
  },

  label: {
    color: theme.colors.onSurface,
    fontSize: 14,
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    color: theme.colors.onSurface,
    borderColor: theme.colors.muted,
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  button: {
    backgroundColor: theme.colors.primary,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  loadingContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
  },

  indicator: {
    marginBottom: 20,
  },

  loadingTitle: {
    color: theme.colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  loadingMessage: {
    color: theme.colors.muted,
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },

  cancelButton: {
    marginTop: 8,
  },
});
