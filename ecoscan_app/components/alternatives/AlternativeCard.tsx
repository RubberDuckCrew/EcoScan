import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import ImageFallback from "@/components/ImageFallback";
import * as Clipboard from "expo-clipboard";

type AlternativeCardProps = {
  name: string;
  ean: string;
  imageUrl: any;
  onCopy: () => void;
};
export default function AlternativeCard({
  name,
  ean,
  imageUrl,
  onCopy,
}: AlternativeCardProps) {
  const handleCopyToClipboard = useCallback(() => {
    Clipboard.setStringAsync(ean);
    onCopy();
  }, [ean, onCopy]);

  return (
    <>
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="bodyMedium" style={{ color: "#666" }}>
                EAN: {ean}
              </Text>
              <IconButton
                icon="content-copy"
                size={16}
                onPress={handleCopyToClipboard}
              />
            </View>
          </View>
        </View>
      </Card>
    </>
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
