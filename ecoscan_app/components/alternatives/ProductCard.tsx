import { View, StyleSheet } from "react-native";
import { Card, Text, Icon, useTheme } from "react-native-paper";

type ProductCardProps = {
  title: string;
  description: string;
  image: string;
  score: number;
};

export default function ProductCard({
  title,
  description,
  image,
  score,
}: ProductCardProps) {
  const theme = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text variant="bodySmall" style={styles.cardHeaderText}>
          Dein gescanntes Produkt
        </Text>
        <View style={styles.scoreBadge}>
          <Icon source="leaf" size={22} color="#009A0A" />
          <Text style={{ ...styles.scoreText, color: theme.colors.primary }}>
            {score}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <Card.Cover source={{ uri: image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ fontWeight: "600" }}>
            {title}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: "#666" }}
            numberOfLines={3}
          >
            {description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e3e3e3",
    borderRadius: 16,
    padding: 12,
    marginVertical: 16,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardHeaderText: {
    color: "#888",
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
  },
});
