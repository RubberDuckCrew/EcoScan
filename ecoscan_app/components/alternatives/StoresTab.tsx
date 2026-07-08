import { FlatList, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import StoreCard from "./StoreCard";
import { theme } from "@/theme";

type Store = {
  name: string;
  latitude: number;
  longitude: number;
};

type StoresTabProps = {
  stores: Store[];
  loadingStore: boolean;
  userLatitude: number;
  userLongitude: number;
};

export default function StoresTab({
  stores,
  loadingStore,
  userLatitude,
  userLongitude,
}: StoresTabProps) {
  return (
    <FlatList
      data={stores}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          targetLatitude={item.latitude}
          targetLongitude={item.longitude}
          userLatitude={userLatitude}
          userLongitude={userLongitude}
        />
      )}
      ListEmptyComponent={() =>
        loadingStore ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ padding: 16 }}
          />
        ) : (
          <Text style={{ textAlign: "center", color: "gray", padding: 16 }}>
            Keine Supermärkte in der Nähe gefunden.
          </Text>
        )
      }
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
