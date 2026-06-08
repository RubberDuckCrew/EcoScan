import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import { HistoryList } from "@/components/history/HistoryList";

export default function History() {
  return (
    <PageContainer style={{ padding: 0 }}>
      <View style={styles.wrapper}>
        <Text variant="headlineLarge" style={styles.heading}>
          Historie
        </Text>
        <Text variant="headlineSmall" style={styles.heading}>
          Scanverlauf
        </Text>
        <HistoryList />
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    paddingTop: 16,
    gap: 8,
  },
  heading: { paddingInline: 16, fontWeight: "bold" },
});
