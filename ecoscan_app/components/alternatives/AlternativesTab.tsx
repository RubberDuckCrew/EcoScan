import { ActivityIndicator, FlatList, Text } from "react-native";
import { useCallback } from "react";
import { useSnackbar } from "@/context/SnackbarContext";
import AlternativeCard from "@/components/alternatives/AlternativeCard";
import { theme } from "@/theme";

type Alternative = {
  ean: string;
  name: string;
  imageUrl: string;
};

type AlternativesTabProps = {
  alternatives: Alternative[];
  loadingEan: boolean;
};

export default function AlternativesTab({
  alternatives,
  loadingEan,
}: AlternativesTabProps) {
  const { showSuccess } = useSnackbar();

  const handleCopyEan = useCallback(() => {
    showSuccess("EAN kopiert!");
  }, [showSuccess]);

  return (
    <FlatList
      data={alternatives}
      keyExtractor={(item) => item.ean}
      renderItem={({ item }) => (
        <AlternativeCard
          key={item.ean}
          name={item.name}
          ean={item.ean}
          imageUrl={item.imageUrl}
          onCopy={handleCopyEan}
        />
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
