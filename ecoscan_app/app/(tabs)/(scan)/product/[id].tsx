import { PageContainer } from "@/components/PageContainer";
import { Text } from "react-native-paper";
import ProductCard from "@/components/product/ProductCard";
import ScoreCard from "@/components/product/ScoreCard";
import { useGreenScore } from "@/hooks/useGreenScore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { StyleSheet, View } from "react-native";
import ReasonCard from "@/components/product/ReasonCard";
import AlternativesButton from "@/components/product/AlternativesButton";
import { useError } from "@/context/ErrorContext";
import { useProduct } from "@/context/ProductContext";

export default function Product() {
  const { loading, fetchGreenScore, fetchProduct, onError } = useGreenScore();

  const { product } = useProduct();

  const { setError } = useError();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    onError((err) => {
      setError(err);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/(scan)");
      }
    });
  }, [onError, setError]);

  useEffect(() => {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    if (!normalizedId) return;

    (async () => {
      const fetchedProduct = await fetchProduct(normalizedId);

      if (fetchedProduct && fetchedProduct.score !== undefined) {
        return;
      }
      await fetchGreenScore(normalizedId);
    })();
  }, [id, fetchGreenScore, fetchProduct]);

  return (
    <PageContainer>
      {product && (
        <>
          <ProductCard
            name={product.name || "Unbekanntes Produkt"}
            barcode={product.id || "Kein Barcode"}
            description={product.description || "Keine Beschreibung verfügbar."}
            imageUrl={product.imageUrl || ""}
          />
          {product.score !== undefined && (
            <>
              <View style={styles.scoreCard}>
                <ScoreCard score={product.score} />
              </View>
              <View style={styles.buttonsRow}>
                <AlternativesButton product={product}></AlternativesButton>
              </View>
              <ReasonCard
                reason={product.justification || "Keine Begründung verfügbar."}
              />
            </>
          )}
        </>
      )}
      {loading && (
        <>
          <View style={styles.loadingIndicator}>
            <LoadingIndicator />
            <Text style={styles.loadingIndicatorText}>
              Produkt wird analysiert...
            </Text>
          </View>
        </>
      )}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  loadingIndicator: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  loadingIndicatorText: {
    textAlign: "center",
    marginTop: 10,
  },
  scoreCard: {
    paddingTop: 16,
  },
  buttonsRow: {
    justifyContent: "space-evenly",
    flexDirection: "row",
    paddingBottom: 16,
    paddingTop: 8,
  },
});
