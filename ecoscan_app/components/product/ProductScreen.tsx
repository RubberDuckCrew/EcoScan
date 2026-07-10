import { PageContainer } from "@/components/PageContainer";
import ProductCard from "@/components/product/ProductCard";
import ScoreCard from "@/components/product/ScoreCard";
import { useProductData } from "@/hooks/useProductData";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ReasonCard from "@/components/product/ReasonCard";
import AlternativesButton from "@/components/product/AlternativesButton";
import { useError } from "@/context/ErrorContext";
import { useShareScreenshot } from "@/hooks/useShareScreenshot";
import ScoreCategoryCard from "@/components/product/ScoreCategoryCard";
import ScoreDetailsSkeleton from "@/components/product/ScoreDetailsSkeleton";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import BoughtButton from "@/components/product/BoughtButton";

type ProductScreenProps = {
  showActionButtons?: boolean;
};

export default function ProductScreen({
  showActionButtons = true,
}: ProductScreenProps) {
  const { viewRef, captureAndShare } = useShareScreenshot();

  const { product, productLoading, scoreLoading, error } = useProductData(id);
  const { setError } = useError();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (!error) return;

    setError(error);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(scan)");
    }
  }, [error, setError]);

  return (
    <View ref={viewRef} collapsable={false} style={styles.root}>
      <ScrollView>
        <PageContainer>
          {product && (
            <>
              {productLoading || !product ? (
                <ProductCardSkeleton />
              ) : (
                <ProductCard
                  name={product.name || "Unbekanntes Produkt"}
                  description={
                    product.description || "Keine Beschreibung verfügbar."
                  }
                  imageUrl={product.imageUrl || ""}
                  ean={product.id || "Unbekannt"}
                />
              )}

              {scoreLoading || product.score === undefined ? (
                <ScoreDetailsSkeleton />
              ) : (
                <>
                  <View style={styles.scoreCard}>
                    <ScoreCard
                      score={product.score}
                      onShare={() => captureAndShare("Produktscore teilen")}
                    />
                  </View>
                  {showActionButtons && (
                    <View style={styles.buttonsRow}>
                      <AlternativesButton product={product} />
                      <BoughtButton product={product} />
                    </View>
                  )}
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
        </PageContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  skeletonContainer: {
    paddingVertical: 8,
  },
  categoryCardList: {
    gap: 12,
  },
  reasonCard: {
    paddingVertical: 16,
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
