import { FlatList, StyleSheet } from "react-native";
import { Surface, Text, Button } from "react-native-paper";
import ProductCard from "@/components/alternatives/ProductCard";
import AlternativeCard from "@/components/alternatives/AlternativeCard";
import { useProduct } from "@/context/ProductContext";
import { useAlternatives } from "@/hooks/useAlternatives";
import { useEffect, useState, useCallback, useRef } from "react";
import * as Location from "expo-location";

import { Linking } from "react-native";

export default function Index() {
  const { product } = useProduct();
  const [userLatitude, setUserLatitude] = useState<number>(-1);
  const [userLongitude, setUserLongitude] = useState<number>(-1);
  const { alternatives, loading, fetchAlternatives } = useAlternatives();

  const hasFetched = useRef(false);

  const handleClick = useCallback((latitude: number, longitude: number) => {
      const url = `https://maps.google.com/?q=48.150139,11.559488`;
      Linking.openURL(url);
  });

  console.log("Product aus Kontext: ", product);

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
    if (product?.id && userLatitude !== -1 && userLongitude !== -1 && !hasFetched.current) {
      hasFetched.current = true;
      console.log(product.categories);
      fetchAlternatives(product.id, product.categories, `${userLatitude},${userLongitude}`);
    }
  }, [product?.id, userLatitude, userLongitude]);

  console.log("Alternatives", alternatives);

  return (
    <Surface style={styles.pageStyle}>
      <Text variant="headlineMedium" style={styles.headline}>
        Bessere Alternativen
      </Text>
      <Text variant={"bodyLarge"} style={styles.subHeadline}>
        In deiner Nähe verfügbar
      </Text>
      <Button
          mode={"contained"}
        onPress={handleClick}
        >
        Alternativen
    </Button>
      <ProductCard
        title={product?.name ?? ""}
        description={product?.description ?? ""}
        image={product?.imageUrl ?? ""}
        score={product?.score ?? 0}
      />
      <FlatList
          style={{marginTop: 16, paddingHorizontal: 2}}
          //TODO Liste sortieren?
          data={alternatives}
          renderItem={({item}) =>
              <AlternativeCard
                  title={item.name}
                  image={item.imageUrl ? { uri: item.imageUrl } : null }
                  scanScore={product?.score ?? 0}
                  alternativeScore={item.score ?? 0}
                  targetLatitude={0}
                  targetLongitude={0}
                  userLatitude={userLatitude}
                  userLongitude={userLongitude}
              />
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
