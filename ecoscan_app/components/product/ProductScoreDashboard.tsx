import React from "react";
import { View, StyleSheet } from "react-native";
import { Product } from "@/types/product";
import ScoreCard from "@/components/product/sections/ScoreCard";
import AlternativesButton from "@/components/product/sections/AlternativesButton";
import BoughtButton from "@/components/product/sections/BoughtButton";
import ScoreCategoryCard from "@/components/product/sections/ScoreCategoryCard";
import ReasonCard from "@/components/product/sections/ReasonCard";

type ProductScoreDashboardProps = {
  product: Product;
  showActionButtons: boolean;
  onShare: () => void;
};

export default function ProductScoreDashboard({
  product,
  showActionButtons,
  onShare,
}: ProductScoreDashboardProps) {
  return (
    <>
      <View style={styles.scoreCard}>
        <ScoreCard score={product.score ?? 0} onShare={onShare} />
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
        <ScoreCategoryCard score={product.socialScore ?? 0} label="Soziales" />
        <ScoreCategoryCard
          score={product.healthScore ?? 0}
          label="Gesundheit"
        />
      </View>

      <View style={styles.reasonCard}>
        <ReasonCard
          reason={product.justification || "Keine Begründung verfügbar."}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  categoryCardList: { gap: 12 },
  reasonCard: { paddingVertical: 16 },
  scoreCard: { paddingTop: 16 },
  buttonsRow: {
    justifyContent: "space-evenly",
    flexDirection: "row",
    paddingBottom: 16,
    paddingTop: 8,
  },
});
