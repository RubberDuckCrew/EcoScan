import { PageContainer } from "@/components/PageContainer";
import { Text } from "react-native-paper";
import ProductCard from "@/components/product/ProductCard";
import ScoreCard from "@/components/product/ScoreCard";
import { useGreenScore } from "@/hooks/useGreenScore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ScrollView, StyleSheet, View } from "react-native";
import ReasonCard from "@/components/product/ReasonCard";
import AlternativesButton from "@/components/product/AlternativesButton";
import { useError } from "@/context/ErrorContext";
import { useProduct } from "@/context/ProductContext";
import { useShareScreenshot } from "@/hooks/useShareScreenshot";
import ScoreCategoryCard from "@/components/product/ScoreCategoryCard";
import { useApiClient } from "@/utils/apiClient";

export default function Product() {
  const { viewRef, captureAndShare } = useShareScreenshot();
  const {
    loading: scoreLoading,
    error: scoreError,
    fetchGreenScore,
    cancelGreenScore,
  } = useGreenScore();

  const { product, setProduct } = useProduct();
  const { setError } = useError();
  const { id } = useLocalSearchParams();
  const api = useApiClient();
  const [productLoading, setProductLoading] = useState(false);

  const loading = productLoading || scoreLoading;

  useEffect(() => {
    if (!scoreError) return;
    setError(scoreError);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(scan)");
    }
  }, [scoreError, setError]);

  useEffect(() => {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    if (!normalizedId) return;

    let cancelled = false;

    async function loadProduct() {
      setProductLoading(true);
      setProduct(undefined);
      try {
        const data = await api.get(`product/${normalizedId}`);
        if (cancelled) return;

        if (data) {
          setProduct(data);

          if (data.score === undefined) {
            await fetchGreenScore(normalizedId);
          }
        }
      } catch (err) {
        console.warn("Failed to load product:", err);
        if (cancelled) return;
        setError("Produkt konnte nicht geladen werden.");
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/(scan)");
        }
      } finally {
        if (!cancelled) {
          setProductLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
      cancelGreenScore();
    };
  }, [id, api, setProduct, fetchGreenScore, setError, cancelGreenScore]);

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
                    <AlternativesButton product={product} />
                  </View>
                  <View style={styles.categoryCardList}>
                    <ScoreCategoryCard
                      score={product.environmentScore ?? 0}
                      label="Umwelt"
                    />
                    <ScoreCategoryCard
                      score={product.socialScore ?? 0}
                      label="Soziales"
                    />
                    <ScoreCategoryCard
                      score={product.healthScore ?? 0}
                      label="Gesundheit"
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
            <View style={styles.loadingIndicator}>
              <LoadingIndicator />
              <Text style={styles.loadingIndicatorText}>
                Produkt wird analysiert...
              </Text>
            </View>
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
