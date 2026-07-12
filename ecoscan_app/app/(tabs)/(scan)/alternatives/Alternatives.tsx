import { StyleSheet, useWindowDimensions } from "react-native";
import { Surface, Text } from "react-native-paper";
import { TabBar, TabView } from "react-native-tab-view";
import ProductCard from "@/components/alternatives/ProductCard";
import AlternativesTab from "@/components/alternatives/AlternativesTab";
import StoresTab from "@/components/alternatives/StoresTab";
import { useProduct } from "@/context/ProductContext";
import { useAlternatives } from "@/hooks/useAlternatives";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import { theme } from "@/theme";

export default function Alternatives() {
  const { product } = useProduct();
  const [userLatitude, setUserLatitude] = useState<number>(-1);
  const [userLongitude, setUserLongitude] = useState<number>(-1);

  const {
    alternatives,
    stores,
    loadingEan,
    loadingStore,
    fetchAlternativeEans,
    fetchStores,
  } = useAlternatives();

  const layout = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);

  const routes = [
    { key: "alternatives", title: "Alternativen" },
    { key: "stores", title: "Supermärkte" },
  ];

  const hasFetchedEans = useRef(false);
  const hasFetchedStores = useRef(false);

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const { coords } = await Location.getCurrentPositionAsync({});
      setUserLatitude(coords.latitude);
      setUserLongitude(coords.longitude);
    }
    getCurrentLocation().catch(console.error);
  }, []);

  useEffect(() => {
    if (product?.id && product?.categories && !hasFetchedEans.current) {
      hasFetchedEans.current = true;
      fetchAlternativeEans(product.categories);
    }
  }, [product?.id, product?.categories, fetchAlternativeEans]);

  useEffect(() => {
    if (
      userLatitude !== -1 &&
      userLongitude !== -1 &&
      !hasFetchedStores.current &&
      product?.id
    ) {
      hasFetchedStores.current = true;
      fetchStores(`${userLatitude},${userLongitude}`);
    }
  }, [product?.id, userLatitude, userLongitude, fetchStores]);

  return (
    <Surface style={styles.pageStyle}>
      <Text variant="headlineMedium" style={styles.headline}>
        Alternativen
      </Text>
      <Text variant={"bodyLarge"} style={styles.subHeadline}>
        In deiner Nähe verfügbar
      </Text>
      <ProductCard
        title={product?.name ?? ""}
        description={product?.description ?? ""}
        image={product?.imageUrl ?? ""}
        score={product?.score ?? 0}
      />

      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={({ route }) => {
          switch (route.key) {
            case "alternatives":
              return (
                <AlternativesTab
                  alternatives={alternatives}
                  loadingEan={loadingEan}
                />
              );
            case "stores":
              return (
                <StoresTab
                  stores={stores}
                  loadingStore={loadingStore}
                  userLatitude={userLatitude}
                  userLongitude={userLongitude}
                  isActive={tabIndex === 1}
                />
              );
            default:
              return null;
          }
        }}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: "transparent",
              elevation: 0,
              borderBottomWidth: 2,
              borderBottomColor: "#cccccc",
            }}
            indicatorStyle={{
              backgroundColor: theme.colors.primary,
              height: 3,
              borderRadius: 1.5,
              bottom: -2,
            }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.text}
          />
        )}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  pageStyle: {
    flex: 1,
    padding: 16,
  },
  headline: {
    fontWeight: "bold",
  },
  subHeadline: {
    color: "gray",
  },
});
