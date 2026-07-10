import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

import BarcodeScanner from "@/components/BarcodeScanner";
import { PageContainer } from "@/components/PageContainer";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useAnalyzeProduct } from "@/hooks/useAnalyzeProduct";
import { useError } from "@/context/ErrorContext";

export default function Scan() {
  const [barcode, setBarcode] = useState("");
  const { setError } = useError();
  const router = useRouter();
  const { loading, analyzeProduct, cancelAnalysis } = useAnalyzeProduct();
  const [scanned, setScanned] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const onScanned = async (code: string) => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setScanned(true);
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Barcode darf nicht leer sein.");
      return;
    }
    try {
      if (await analyzeProduct(trimmed)) {
        setBarcode("");
        router.push({
          pathname: "/(tabs)/(scan)/product/[id]",
          params: { id: trimmed },
        });
      } else {
        setError("Produkt konnte nicht analysiert werden.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Analyse fehlgeschlagen.";
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled">
        <PageContainer style={{ padding: 0 }}>
          <Text variant="headlineLarge" style={styles.title}>
            Produkt scannen
          </Text>
          <View style={styles.scannerContainer}>
            <View style={styles.scannerBox}>
              <BarcodeScanner onScanned={onScanned} scanned={scanned} />
            </View>
          </View>
          <Text variant="bodyLarge" style={styles.label}>
            Oder Barcode eingeben
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={barcode}
              onChangeText={(text) => {
                setBarcode(text);
              }}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({
                    animated: true,
                  });
                }, 100);
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
              mode="contained"
            >
              Los
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
                <Text variant="headlineSmall" style={styles.loadingTitle}>
                  Produkt wird analysiert
                </Text>
                <Text variant="bodySmall" style={styles.loadingMessage}>
                  Dies kann einen Moment dauern...
                </Text>
                <Button
                  onPress={() => {
                    cancelAnalysis();
                  }}
                  style={styles.cancelButton}
                  textColor={theme.colors.error}
                  mode="text"
                >
                  Abbrechen
                </Button>
              </View>
            </View>
          )}
        </PageContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.onSurface,
    fontWeight: "bold",
    marginInline: 16,
    paddingTop: 16,
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
  },

  label: {
    color: theme.colors.onSurface,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 150,
    paddingHorizontal: 16,
  },

  input: {
    color: theme.colors.onSurface,
    borderColor: theme.colors.muted,
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  button: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.backdrop,
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
    marginBottom: 8,
    textAlign: "center",
  },

  loadingMessage: {
    color: theme.colors.muted,
    marginBottom: 24,
    textAlign: "center",
  },

  cancelButton: {
    marginTop: 8,
  },
});
