import ImageFallback from "@/components/ImageFallback";
import { theme } from "@/theme";
import { ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

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
  return (
    <Surface style={styles.rootCard} elevation={0}>
      <View style={styles.headerRow}>
        <ImageFallback imageUrl={imageUrl} style={styles.imageContainer} />

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
