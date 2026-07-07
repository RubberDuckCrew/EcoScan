import { FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Surface, Text } from "react-native-paper";
import ProductCard from "@/components/alternatives/ProductCard";
import AlternativeCard from "@/components/alternatives/AlternativeCard";
import StoreCard from "@/components/alternatives/StoreCard";
import { useProduct } from "@/context/ProductContext";
import { useAlternatives } from "@/hooks/useAlternatives";
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";

import { theme } from "@/theme";

export default function Alternatives() {
  const { product } = useProduct();
  const [userLatitude, setUserLatitude] = useState<number>(-1);
  const [userLongitude, setUserLongitude] = useState<number>(-1);
  const { alternatives, stores, loadingEan, loadingStore, fetchAlternatives } =
    useAlternatives();

  const hasFetched = useRef(false);

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log(status);
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setUserLatitude(coords.latitude);
      setUserLongitude(coords.longitude);
    }

    getCurrentLocation().catch((err) => {
      console.error("Location error:", err);
      setUserLatitude(-1);
      setUserLongitude(-1);
    });
  }, []);

  useEffect(() => {
    if (
      product?.id &&
      product?.categories &&
      userLatitude !== -1 &&
      userLongitude !== -1 &&
      !hasFetched.current
    ) {
      hasFetched.current = true;
      console.log("cat:", product.categories);
      fetchAlternatives(
        product.id,
        product.categories,
        `${userLatitude},${userLongitude}`,
      );
    }
  }, [
    product?.id,
    product?.categories,
    userLatitude,
    userLongitude,
    fetchAlternatives,
  ]);

  console.log("Alternatives", alternatives);

  return (
    <Surface style={styles.pageStyle}>
      <Text variant="headlineMedium" style={styles.headline}>
        Bessere Alternativen
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
      <Text variant={"bodyLarge"} style={{ padding: 8 }}>
        Alternativen:
      </Text>

      <FlatList
        style={{ paddingBottom: 16, paddingHorizontal: 2 }}
        data={alternatives}
        renderItem={({ item }) => <AlternativeCard name={item.ean} />}
        ListEmptyComponent={() =>
          loadingEan ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Text style={{ textAlign: "center", color: "gray" }}>
              Keine Alternativen gefunden
            </Text>
          )
        }
      />

      <Text variant={"bodyLarge"} style={{ padding: 8 }}>
        Supermärkte in der Nähe:
      </Text>

      <FlatList
        style={{ paddingHorizontal: 2 }}
        data={stores}
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
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Text style={{ textAlign: "center", color: "gray" }}>
              Keine Supermärkte in der Nähe gefunden.
            </Text>
          )
        }
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
