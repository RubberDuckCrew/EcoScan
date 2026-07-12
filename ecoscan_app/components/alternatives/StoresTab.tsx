import { useState, useEffect } from "react";
import { FlatList, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import StoreCard from "@/components/alternatives/StoreCard";
import LocationNeededPortal from "@/components/alternatives/LocationNeededPortal";
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
  isActive: boolean;
};

export default function StoresTab({
  stores,
  loadingStore,
  userLatitude,
  userLongitude,
  isActive,
}: StoresTabProps) {
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationDismissed, setLocationDismissed] = useState(false);

  useEffect(() => {
    if (isActive && userLatitude === -1 && !locationDismissed) {
      setShowLocationAlert(true);
    } else {
      setShowLocationAlert(false);
    }
  }, [userLatitude, locationDismissed, isActive]);

  return (
    <>
      <FlatList
        data={stores}
        keyExtractor={(item) =>
          `${item.name}-${item.latitude}-${item.longitude}`
        }
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
              {userLatitude === -1
                ? "Bitte erlaube den Zugriff auf deinen Standort."
                : "Keine Supermärkte in der Nähe gefunden."}
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 8 }}
      />
      <LocationNeededPortal
        visible={showLocationAlert}
        onDismiss={() => {
          setShowLocationAlert(false);
          setLocationDismissed(true);
        }}
      />
    </>
  );
}
