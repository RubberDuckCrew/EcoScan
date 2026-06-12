import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Button, Text } from "react-native-paper";

import BarcodeScanner from "@/components/BarcodeScanner";
import { PageContainer } from "@/components/PageContainer";
import { theme } from "@/theme";
import { useRouter } from "expo-router";

export default function Scan() {
  const [barcode, setBarcode] = useState("");
  const router = useRouter();

  const onScanned = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    console.log("Scanned barcode:", code);
    setBarcode(trimmed);
    router.push({
      pathname: "/product/[id]",
      params: { id: trimmed },
    });
  };

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
          onChangeText={setBarcode}
          placeholder="z.B. 4001686312520"
          placeholderTextColor={theme.colors.muted}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button onPress={() => onScanned(barcode)} style={styles.button}>
          <Text style={styles.buttonText}>Los</Text>
        </Button>
      </View>
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
});
