import { Surface, Text } from "react-native-paper";
import { Image, StyleSheet, View, ScrollView } from "react-native";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "@/theme";

export interface ProductCardProps {
  name: string;
  imageUrl: string;
  description: string;
  barcode: string;
}

export default function ProductCard({
  name,
  imageUrl,
  description,
  barcode,
}: ProductCardProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const isImageValid : boolean = imageUrl.trim() !== "";

  return (
    <Surface style={styles.rootCard} elevation={0}>
      <View style={styles.imageContainer}>
        {isImageValid && !imageLoadError ? (
            <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
                onError={handleImageError}
            />
        ) : (
            <View style={styles.fallbackIcon}>
              <MaterialIcons
                  name="image-not-supported"
                  size={72}
                  color="#757575"
              />
            </View>
        )}
      </View>
      <Surface style={styles.textCard} elevation={0}>
        <Text style={styles.titleText} variant={"headlineSmall"}>
          {name}
        </Text>
        <View style={styles.descriptionContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.descriptionText} variant={"bodyLarge"}>
              {description}
            </Text>
          </ScrollView>
        </View>
        <Text style={styles.barcodeText} variant={"bodyMedium"}>
          Barcode: {barcode}
        </Text>
      </Surface>
    </Surface>
  );
}

const styles = StyleSheet.create({
  rootCard: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    fontWeight: "bold",
    lineHeight: 26
  },
  descriptionContainer: {
    maxHeight: 70,
    flexShrink: 1,
  },
  descriptionText: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  barcodeText: {
    color: theme.colors.muted,
  },
  scrollContent: {
    paddingRight: 4,
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
