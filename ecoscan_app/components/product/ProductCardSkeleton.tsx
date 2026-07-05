import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/components/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton height={128} borderRadius={16} />
      <Skeleton height={80} borderRadius={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    gap: 4
  },
});
