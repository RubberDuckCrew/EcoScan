import { View, StyleSheet } from "react-native";
import { Card, Text, ProgressBar } from "react-native-paper";
import { getScoreVariant, normalizeScore } from "@/utils/scoreColor";
import { variantStyles } from "@/components/product/sections/ScoreCard";

interface ScoreCategoryCardProps {
  label: string;
  score: number;
}

export default function ScoreCategoryCard({
  label,
  score,
}: ScoreCategoryCardProps) {
  const normalized = normalizeScore(score);
  const variant = variantStyles[getScoreVariant(normalized)];

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">{label}</Text>
          <Text variant="titleMedium" style={variant.text}>
            {normalized}
          </Text>
        </View>
        <ProgressBar
          progress={normalized / 100}
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
