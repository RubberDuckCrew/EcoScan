import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import ImageFallback from "@/components/ImageFallback";

type AlternativeCardProps = {
  name: string;
  ean: string;
  imageUrl: any;
};
export default function AlternativeCard({
  name,
  ean,
  imageUrl,
}: AlternativeCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <ImageFallback
          imageUrl={imageUrl}
          imageStyle={styles.image}
          fallbackStyle={styles.image}
        />
        <View style={{ flex: 1 }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "600" }}
            numberOfLines={2}
          >
            {name}
          </Text>
          <Text variant="bodyMedium" style={{ color: "#666" }}>
            EAN: {ean}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 0,
    borderBottomWidth: 0,
    padding: 8,
    marginTop: 12,
    marginHorizontal: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingRight: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
});
