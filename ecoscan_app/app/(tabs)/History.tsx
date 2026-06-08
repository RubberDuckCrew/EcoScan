import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import { HistoryList } from "@/components/history/HistoryList";
import { SavingsCard } from "@/components/history/SavingsCard";
import { ScanStats } from "@/components/history/ScanStats";

export default function History() {
  return (
    <PageContainer style={{ padding: 0 }}>
      <View style={styles.wrapper}>
        <View style={[styles.section, styles.horizontalSpacing]}>
          <Text variant="headlineLarge" style={styles.heading}>
            Historie
          </Text>
          <SavingsCard />
          <ScanStats />
        </View>
        <View style={styles.section}>
          <Text
            variant="headlineSmall"
            style={[styles.horizontalSpacing, styles.heading]}
          >
            Scanverlauf
          </Text>
          <HistoryList />
        </View>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    paddingTop: 16,
    gap: 16,
  },
  heading: {
    fontWeight: "bold",
  },
  section: {
    gap: 8,
  },
  horizontalSpacing: {
    marginInline: 16,
  },
});
