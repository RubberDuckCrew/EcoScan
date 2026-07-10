import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/components/Skeleton";

export default function ScoreDetailsSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.scoreCard}>
        <Skeleton height={200} borderRadius={16} />
      </View>
      <View style={styles.buttonsRow}>
        <Skeleton width={180} height={45} borderRadius={25} />
        <Skeleton width={180} height={45} borderRadius={25} />
      </View>
      <View style={styles.categoryCardList}>
        <Skeleton height={70} borderRadius={12} />
        <Skeleton height={70} borderRadius={12} />
        <Skeleton height={70} borderRadius={12} />
      </View>
      <View style={styles.reasonCard}>
        <Skeleton height={120} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
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
