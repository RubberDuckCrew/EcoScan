import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Text } from "react-native-paper";

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
  });

  if (!permission) {
    return <Text>Permission loading...</Text>;
  }

  if (!permission.granted) {
    return <Text>Camera permission required</Text>;
  }

  if (!scanned) {
    return (
      <CameraView
        style={{ flex: 1 }}
        facing={"back"}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a"],
        }}
        onBarcodeScanned={({ data }: any) => {
          setScanned(true);
          onScanned(data);
        }}
      />
    );
  }

  return <Text onPress={() => setScanned(false)}>Tap to scan again</Text>;
}
