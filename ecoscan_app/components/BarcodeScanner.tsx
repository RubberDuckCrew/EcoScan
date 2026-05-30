import { theme } from "@/theme";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Icon, Text } from "react-native-paper";

type Props = {
  onScanned: (barcode: string) => void;
};

export default function BarcodeScanner({ onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    // Intentionally run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!permission?.granted) {
    return (
      <TouchableOpacity
        onPress={requestPermission}
        style={styles.permissionContainer}
      >
        <Icon source="camera-off" size={70} color={theme.colors.muted} />
        <Text style={{ marginTop: 12 }}>
          Hier tippen, um Kamera-Berechtigung zu erteilen
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a"],
            }}
            onBarcodeScanned={({ data }) => {
              setScanned(true);
              onScanned(data);
            }}
          />
          <View
            style={[styles.scanFrame, { borderColor: theme.colors.primary }]}
          />
        </>
      ) : (
        <TouchableOpacity
          onPress={() => setScanned(false)}
          style={styles.resetContainer}
        >
          <Icon source="barcode-scan" size={70} color={theme.colors.muted} />
          <Text style={{ marginTop: 12 }}>
            Hier tippen, um erneut zu scannen
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  scanFrame: {
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderRadius: 14,
  },

  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  resetContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
