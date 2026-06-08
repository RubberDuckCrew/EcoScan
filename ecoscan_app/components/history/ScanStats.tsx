import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { StatsCard } from "@/components/history/StatsCard";

type StatsProps = {
  style?: StyleProp<ViewStyle>;
};

const averageGreenScore = 78;
const scanCount = 24;

export function ScanStats({ style }: StatsProps) {
  return (
    <View style={[styles.content, style]}>
      <StatsCard
        value={averageGreenScore}
        description="Ø Green Score"
        style={styles.card}
      />
      <StatsCard
        value={scanCount}
        description="Artikel gescannt"
        style={styles.card}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
  },
});
