import { Card, Text } from "react-native-paper";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type StatsCardProps = {
  value?: number;
  description: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function StatsCard({
  value,
  description,
  style,
  loading = false,
}: StatsCardProps) {
  return (
    <Card style={[styles.card, style]}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <Text variant="titleLarge" style={styles.value}>
          {value ?? "-"}
        </Text>
      )}
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
