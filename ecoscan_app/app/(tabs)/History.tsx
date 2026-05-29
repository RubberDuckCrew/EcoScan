import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import HistoryListItem from "@/components/HistoryListItem";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryItem } from "@/types/history";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function History() {
  const { history, loading, loadNext, refresh, refreshing } = useHistory();

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <HistoryListItem item={item} />
  );

  const ListFooter = () =>
    loading && (
      <View style={styles.footer}>
        <LoadingIndicator />
      </View>
    );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? <LoadingIndicator /> : <Text>Keine Historie vorhanden</Text>}
    </View>
  );

  return (
    <PageContainer style={{ padding: 0 }}>
      <View style={styles.wrapper}>
        <Text variant="headlineLarge" style={styles.heading}>
          Historie
        </Text>
        <Text variant="headlineSmall" style={styles.heading}>
          Scanverlauf
        </Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={loadNext}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={refresh}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={
            history.length === 0
              ? styles.emptyContainer
              : styles.filledContainer
          }
        />
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    gap: 8,
  },
  heading: { paddingInline: 16, fontWeight: "bold" },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filledContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
});
