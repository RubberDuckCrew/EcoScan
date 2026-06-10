import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { StatsCard } from "@/components/history/StatsCard";
import { useHistoryStats } from "@/hooks/useHistoryStats";
import { forwardRef, useImperativeHandle } from "react";

type StatsProps = {
  style?: StyleProp<ViewStyle>;
};

export type ScanStatsRef = {
  refresh: () => void;
};

export const ScanStats = forwardRef<ScanStatsRef, StatsProps>(
  ({ style }, ref) => {
    const { stats, loading, fetchStats } = useHistoryStats();

    useImperativeHandle(ref, () => ({
      refresh() {
        void fetchStats();
      },
    }));

    return (
      <View style={[styles.content, style]}>
        <StatsCard
          value={stats?.averageScore}
          loading={loading}
          description="Ø Green Score"
          style={styles.card}
        />
        <StatsCard
          value={stats?.scanCount}
          loading={loading}
          description="Artikel gescannt"
          style={styles.card}
        />
      </View>
    );
  },
);

ScanStats.displayName = "ScanStats";

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
  },
});
