import { Surface, Text } from "react-native-paper";
import { Image, StyleSheet, View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "@/theme";

export interface ProductCardProps {
  name: string;
  imageUrl: string;
  description: string;
  ean: string;
}

export default function ProductCard({
  name,
  imageUrl,
  description,
  ean,
}: ProductCardProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageError = () => {
    setImageLoadError(true);
  };

  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);

  const isImageValid: boolean = imageUrl.trim() !== "";

  return (
    <Surface style={styles.rootCard} elevation={0}>
      <View style={styles.headerRow}>
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
                size={64}
                color="#757575"
              />
            </View>
          )}
        </View>

        <View style={styles.headerTextContainer}>
          <Text
            style={styles.titleText}
            variant={"headlineSmall"}
            numberOfLines={3}
          >
            {name}
          </Text>
          <Text style={styles.eanText} variant={"bodySmall"}>
            EAN: {ean}
          </Text>
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <ScrollView
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.descriptionText} variant={"bodyMedium"}>
            {description}
          </Text>
        </ScrollView>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  rootCard: {
    flexDirection: "column",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.background,
    flexShrink: 0,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  fallbackIcon: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  titleText: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  eanText: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  descriptionContainer: {
    flex: 1,
    maxHeight: 80,
  },
  descriptionText: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  scrollContent: {
    paddingRight: 4,
    paddingBottom: 4,
  },
});
