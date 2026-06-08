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
        <Text variant="headlineLarge" style={[styles.title]}>
          Historie
        </Text>
        <HistoryList
          headerComponent={
            <View style={styles.header}>
              <View style={styles.section}>
                <SavingsCard />
                <ScanStats />
              </View>
              <View style={styles.section}>
                <Text variant="headlineSmall" style={styles.heading}>
                  Scanverlauf
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
