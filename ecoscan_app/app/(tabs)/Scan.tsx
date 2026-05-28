import BarcodeScanner from "@/components/BarcodeScanner";
import { PageContainer } from "@/components/PageContainer";
import { Text } from "react-native-paper";

export default function Scan() {
  const onScanned = (barcode: string) => {
    console.log("Scanned barcode:", barcode);
  };

  return (
    <PageContainer>
      <Text>Dummy for Scanning-Page</Text>
      <BarcodeScanner onScanned={onScanned} />
    </PageContainer>
  );
}
