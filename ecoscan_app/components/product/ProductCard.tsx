import { Surface, Text } from "react-native-paper";
import { Image, StyleSheet, View } from "react-native";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {theme} from "@/theme";

export interface ProductCardProps {
  name: string;
  imageUrl: string;
  description: string;
  barcode: string;
}

export default function ProductCard(props: ProductCardProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageError = () => {
    setImageLoadError(true);
  };

  return (
    <Surface style={styles.rootCard} elevation={0}>
      <View style={styles.imageContainer}>
        {!imageLoadError ? (
          <Image
            source={{ uri: props.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={styles.fallbackIcon}>
            <MaterialIcons
              name="image-not-supported"
              size={64}
              color="#757575"
            />
          </View>
        )}
      </View>
      <Surface style={styles.textCard} elevation={0}>
        <Text style={styles.titleText}>{props.name}</Text>
        <Text style={styles.descriptionText}>{props.description}</Text>
        <Text style={styles.barcodeText}>Barcode: {props.barcode}</Text>
      </Surface>
    </Surface>
  );
}

const styles = StyleSheet.create({
  rootCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 128,
    height: 128,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: theme.colors.background,
  },
  textCard: {
    flexDirection: "column",
    marginLeft: 16,
    flex: 1,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 20,
    color: theme.colors.muted,
  },
  barcodeText: {
    fontSize: 15,
    color: theme.colors.muted,
  },
  image: {
    width: 128,
    height: 128,
    borderRadius: 20,
  },
  fallbackIcon: {
    width: 128,
    height: 128,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
