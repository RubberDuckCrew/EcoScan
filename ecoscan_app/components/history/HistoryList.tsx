import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import React from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useHistory } from "@/hooks/useHistory";
import { HistoryItem } from "@/types/history";
import HistoryListItem from "@/components/history/HistoryListItem";

export function HistoryList() {
  const { history, loading, loadNext, refresh, refreshing } = useHistory();

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <HistoryListItem item={item} />
  );

  const ListFooter = () =>
    loading &&
    history.length > 0 && (
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
        history.length === 0 ? styles.emptyContainer : styles.filledContainer
      }
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 16,
    paddingBottom: 16,
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
    paddingBottom: 8,
    gap: 8,
  },
});
