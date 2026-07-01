import { Button, Snackbar, Portal } from "react-native-paper";
import { StyleSheet } from "react-native";
import { Product } from "@/types/product";
import { useSaveProduct } from "@/hooks/useSaveProduct";
import { useState, useEffect } from "react";
import { theme } from "@/theme";

export interface BoughtButtonProps {
  product?: Product;
}

export default function BoughtButton({ product }: BoughtButtonProps) {
  const { saveProduct, loading, error, success } = useSaveProduct();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (success || error) {
      setVisible(true);
    }
  }, [success, error]);

  const handlePress = async () => {
    if (!product?.id) return;
    await saveProduct(product.id);
  };

  return (
    <>
      <Button
        mode="contained"
        icon="archive-arrow-down-outline"
        loading={loading}
        disabled={loading || !product?.id}
        style={styles.buttonContainer}
        onPress={handlePress}
      >
        Gekauft
      </Button>

      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={2000}
          style={{
            backgroundColor: error ? theme.colors.error : theme.colors.primary,
          }}
        >
          {error ? `${error}` : "Erfolgreich gespeichert"}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 150,
  },
});
