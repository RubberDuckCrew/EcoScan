import { StyleSheet, View } from "react-native";
import { Card, Text, Avatar } from "react-native-paper";

type AlternativeCardProps = {
  name: string;
  ean: string;
  image: any;
};
export default function AlternativeCard({ name, ean, image }: AlternativeCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {image ? (
            <Avatar.Image size={64} source={{ uri: image }} />
          ) : (
            <Avatar.Icon size={64} icon="image-off" />
          )}
        </View>
        <View>
          <Text variant="titleMedium" style={{ fontWeight: "600" }}>
            {name}
          </Text>
          <Text variant="bodyMedium" style={{ color: "#666" }}>
            Ean: {ean}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
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
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
