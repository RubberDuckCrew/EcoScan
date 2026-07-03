import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import { HistoryList } from "@/components/history/HistoryList";
import { SavingsCard, SavingsCardRef } from "@/components/history/SavingsCard";
import { ScanStats, ScanStatsRef } from "@/components/history/ScanStats";

export default function History() {
  const scanStatsRef = useRef<ScanStatsRef>(null);
  const savingsCardRef = useRef<SavingsCardRef>(null);

  const refresh = async () => {
    scanStatsRef.current?.refresh();
    savingsCardRef.current?.refresh();
  };

  return (
    <PageContainer style={{ padding: 0 }}>
      <View style={styles.wrapper}>
        <Text variant="headlineLarge" style={[styles.title]}>
          Meine Käufe
        </Text>
        <HistoryList
          onRefresh={refresh}
          headerComponent={
            <View style={styles.header}>
              <View style={styles.section}>
                <SavingsCard ref={savingsCardRef} />
                <ScanStats ref={scanStatsRef} />
              </View>
              <View style={styles.section}>
                <Text variant="headlineSmall" style={styles.heading}>
                  Gekaufte Produkte
                </Text>
              </View>
            </View>
          }
        />
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 16,
    gap: 8,
  },
  title: {
    fontWeight: "bold",
    marginInline: 16,
  },
  heading: {
    fontWeight: "bold",
  },
  header: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
});
