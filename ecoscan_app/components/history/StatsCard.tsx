import { Card, Text } from "react-native-paper";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme";

type StatsCardProps = {
  value: number;
  description: string;
  style?: StyleProp<ViewStyle>;
};

export function StatsCard({ value, description, style }: StatsCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <Text variant="titleLarge" style={styles.value}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.description}>
        {description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  value: {
    color: theme.colors.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    color: theme.colors.muted,
    textAlign: "center",
  },
});
