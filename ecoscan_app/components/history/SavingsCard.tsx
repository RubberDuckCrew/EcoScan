import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useHistorySavings } from "@/hooks/useHistorySavings";
import { theme } from "@/theme";
import { forwardRef, useImperativeHandle } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Card, Icon, Text } from "react-native-paper";

type SavingsCardProps = {
  style?: StyleProp<ViewStyle>;
};

export type SavingsCardRef = {
  refresh: () => void;
};

export const SavingsCard = forwardRef<SavingsCardRef, SavingsCardProps>(
  ({ style }, ref) => {
    const { savings, loading, fetchHistorySavings } = useHistorySavings();

    useImperativeHandle(ref, () => ({
      refresh() {
        void fetchHistorySavings();
      },
    }));

    return (
      <Card style={[styles.card, style]}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingIndicator color={theme.colors.background} />
            </View>
          ) : (
            <View style={styles.textContainer}>
              <Text variant="titleLarge" style={[styles.text, styles.title]}>
                Diese Woche gespart
              </Text>
              <View style={styles.co2}>
                <Text
                  variant="displayLarge"
                  style={[styles.text, styles.title]}
                >
                  {savings?.co2Saving === undefined
                    ? "-"
                    : savings.co2Saving.toFixed(1).replace(".", ",")}
                </Text>
                <Text variant="bodyLarge" style={styles.text}>
                  kg CO₂
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.text}>
                Das entspricht{" "}
                {savings?.carRideEquivalent === undefined
                  ? "-"
                  : savings.carRideEquivalent.toFixed(0)}{" "}
                km Autofahrt.
              </Text>
            </View>
          )}
          <Icon size={100} source="sprout" color={theme.colors.background} />
        </View>
      </Card>
    );
  },
);

SavingsCard.displayName = "SavingsCard";

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: theme.colors.primary,
  },
  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  textContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.inverseOnSurface,
  },
  title: {
    fontWeight: "bold",
  },
  co2: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
});
