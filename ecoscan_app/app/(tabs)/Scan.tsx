import { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";

import BarcodeScanner from "@/components/BarcodeScanner";
import { PageContainer } from "@/components/PageContainer";

export default function Scan() {
  const theme = useTheme();
  const [barcode, setBarcode] = useState("");

  const onScanned = (code: string) => {
    console.log("Scanned barcode:", code);
    setBarcode(code);
  };

  return (
    <PageContainer>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Produkt scannen
      </Text>

      <View style={styles.scannerContainer}>
        <View style={styles.scannerBox}>
          <BarcodeScanner onScanned={onScanned} />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.colors.onSurface }]}>
        Oder Barcode eingeben
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          value={barcode}
          onChangeText={setBarcode}
          placeholder="z.B. 4001686312520"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          style={[styles.input, { color: theme.colors.onSurface }]}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
            Los
          </Text>
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  title: {
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
    fontSize: 14,
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  button: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
