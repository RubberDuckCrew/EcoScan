import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { Product } from "@/types/product";
import { useSaveProduct } from "@/hooks/useSaveProduct";
import { useEffect } from "react";
import { useSnackbar } from "@/context/SnackbarContext";

export interface BoughtButtonProps {
  product?: Product;
}

export default function BoughtButton({ product }: BoughtButtonProps) {
  const { saveProduct, loading, error, success, saved, resetSaved } =
    useSaveProduct();
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    if (success) {
      showSuccess("Produkt erfolgreich gekauft!");
    } else if (error) {
      showError("Fehler beim Speichern des Produkts.");
    }
  }, [success, error, showSuccess, showError]);

  useEffect(() => {
    resetSaved();
  }, [product?.id, resetSaved]);

  const handlePress = async () => {
    if (!product?.id) return;
    await saveProduct(product.id);
  };

  const isPrimary = product?.score && product.score >= 50;

  return (
    <>
      <Button
        mode={isPrimary ? "contained" : "outlined"}
        icon="archive-arrow-down-outline"
        loading={loading}
        disabled={loading || !product?.id || saved}
        style={styles.buttonContainer}
        onPress={handlePress}
      >
        Gekauft
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 150,
  },
});
