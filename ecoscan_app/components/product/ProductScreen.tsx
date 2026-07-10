import { PageContainer } from "@/components/PageContainer";
import ProductCardSkeleton from "@/components/product/loading/ProductCardSkeleton";
import ScoreDetailsSkeleton from "@/components/product/loading/ScoreDetailsSkeleton";
import ProductScoreDashboard from "@/components/product/ProductScoreDashboard";
import ProductCard from "@/components/product/sections/ProductCard";
import ShareComponent from "@/components/product/ShareComponent";
import { useSnackbar } from "@/context/SnackbarContext";
import { useProductData } from "@/hooks/useProductData";
import { useShareScreenshot } from "@/hooks/useShareScreenshot";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type ProductScreenProps = {
  showActionButtons?: boolean;
};

export default function ProductScreen({
  showActionButtons = true,
}: ProductScreenProps) {
  const { viewRef, captureAndShare } = useShareScreenshot();
  const { showError } = useSnackbar();
  const { id } = useLocalSearchParams();
  const { product, productLoading, scoreLoading, error } = useProductData(id);

  useEffect(() => {
    if (!error) return;

    showError(error);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(scan)");
    }
  }, [error, showError]);

  return (
    <View style={styles.root}>
      <ScrollView>
        <PageContainer>
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

          {product &&
            (scoreLoading || product.score === undefined ? (
              <ScoreDetailsSkeleton />
            ) : (
              <ProductScoreDashboard
                product={product}
                showActionButtons={showActionButtons}
                onShare={() => captureAndShare("Produktscore teilen")}
              />
            ))}
        </PageContainer>
      </ScrollView>
      <View ref={viewRef} collapsable={false} style={styles.shareContainer}>
        {product && product.score !== undefined && (
          <ShareComponent
            ean={product.id}
            name={product.name}
            imageUrl={product.imageUrl}
            score={product.score}
          />
        )}
      </View>
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
  shareContainer: {
    position: "absolute",
    left: -10000,
    top: 0,
    width: 400,
  },
});
