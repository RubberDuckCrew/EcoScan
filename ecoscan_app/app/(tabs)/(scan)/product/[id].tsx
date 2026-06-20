import { PageContainer } from "@/components/PageContainer";
import { Text } from "react-native-paper";
import ProductCard from "@/components/product/ProductCard";
import ScoreCard from "@/components/product/ScoreCard";
import { useGreenScore } from "@/hooks/useGreenScore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ScrollView, StyleSheet, View } from "react-native";
import ReasonCard from "@/components/product/ReasonCard";
import AlternativesButton from "@/components/product/AlternativesButton";
import { useError } from "@/context/ErrorContext";
import { useProduct } from "@/context/ProductContext";
import { useShareScreenshot } from "@/hooks/useShareScreenshot";
import ScoreCategoryCard from "@/components/product/ScoreCategoryCard";

export default function Product() {
  const { viewRef, captureAndShare } = useShareScreenshot();
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
    <View ref={viewRef} collapsable={false} style={styles.root}>
      <ScrollView>
        <PageContainer>
          {product && (
            <>
              <ProductCard
                name={product.name || "Unbekanntes Produkt"}
                barcode={product.id || "Kein Barcode"}
                description={
                  product.description || "Keine Beschreibung verfügbar."
                }
                imageUrl={product.imageUrl || ""}
              />
              {product.score !== undefined && (
                <>
                  <View style={styles.scoreCard}>
                    <ScoreCard
                      score={product.score}
                      onShare={() => captureAndShare("Produktscore teilen")}
                    />
                  </View>
                  <View style={styles.buttonsRow}>
                    <AlternativesButton product={product}></AlternativesButton>
                  </View>
                  <View style={styles.categoryCardList}>
                    <ScoreCategoryCard
                      score={product.environmentScore ?? 0}
                      label={"Umwelt"}
                    />
                    <ScoreCategoryCard
                      score={product.socialScore ?? 0}
                      label={"Soziales"}
                    />
                    <ScoreCategoryCard
                      score={product.healthScore ?? 0}
                      label={"Gesundheit"}
                    />
                  </View>
                  <View style={styles.reasonCard}>
                    <ReasonCard
                      reason={
                        product.justification || "Keine Begründung verfügbar."
                      }
                    />
                  </View>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  categoryCardList: {
    gap: 12,
  },
  reasonCard: {
    paddingVertical: 16,
  },
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
