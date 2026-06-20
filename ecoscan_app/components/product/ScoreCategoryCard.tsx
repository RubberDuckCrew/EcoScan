import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ProgressBar } from "react-native-paper";
import { getScoreVariant } from "@/utils/scoreColor";
import { variantStyles } from "@/components/product/ScoreCard";

interface ScoreCardProps {
  label: string;
  score: number;
}

export default function ScoreCategoryCard({ label, score }: ScoreCardProps) {
  const normalizedScore = Math.max(
    0,
    Math.min(100, Math.round(Number(score) || 0)),
  );
  const variant = variantStyles[getScoreVariant(normalizedScore)];

  return (
    <Card style={[styles.card]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">{label}</Text>
          <Text variant="titleMedium" style={variant.text}>
            {normalizedScore}
          </Text>
        </View>
        <ProgressBar
          progress={normalizedScore / 100}
          color={variant.progressBar}
          style={styles.progressBar}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 99,
  },
});
