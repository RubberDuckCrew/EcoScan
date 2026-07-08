import React from "react";
import { FlatList, ActivityIndicator, Text } from "react-native";
import AlternativeCard from "@/components/alternatives/AlternativeCard";
import { theme } from "@/theme";

type Alternative = {
  ean: string;
  name: string;
};

type AlternativesTabProps = {
  alternatives: Alternative[];
  loadingEan: boolean;
};

export default function AlternativesTab({
  alternatives,
  loadingEan,
}: AlternativesTabProps) {
  return (
    <FlatList
      data={alternatives}
      keyExtractor={(item) => item.ean}
      renderItem={({ item }) => (
        <AlternativeCard key={item.ean} name={item.name} ean={item.ean} />
      )}
      ListEmptyComponent={() =>
        loadingEan ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ padding: 16 }}
          />
        ) : (
          <Text style={{ textAlign: "center", color: "gray", padding: 16 }}>
            Keine Alternativen gefunden
          </Text>
        )
      }
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
