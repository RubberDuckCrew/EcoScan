import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

import BarcodeScanner from "@/components/BarcodeScanner";
import { PageContainer } from "@/components/PageContainer";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useAnalyzeProduct } from "@/hooks/useAnalyzeProduct";
import { useError } from "@/context/ErrorContext";

export default function Scan() {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const { loading, analyzeProduct } = useAnalyzeProduct();
  const { consumeError } = useError();

  const onScanned = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Barcode darf nicht leer sein.");
      return;
    }
    setError(undefined);
    setBarcode(trimmed);
    try {
      if (await analyzeProduct(trimmed)) {
        router.push({
          pathname: "/product/[id]",
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

  useEffect(() => {
    const errorMsg = consumeError();
    if (errorMsg) {
      setError(errorMsg);
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
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <Text style={styles.label}>Oder Barcode eingeben</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={barcode}
          onChangeText={(text) => {
            setBarcode(text);
            setError(undefined);
          }}
          placeholder="z.B. 4001686312520"
          placeholderTextColor={theme.colors.muted}
          keyboardType="numeric"
          style={styles.input}
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      )}
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

  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
