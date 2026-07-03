import ImageFallback from "@/components/ImageFallback";
import { theme } from "@/theme";
import type { HistoryItem } from "@/types/history/item";
import { formatRelativeDate } from "@/utils/formatDate";
import { getScoreColor } from "@/utils/scoreColor";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";

type Props = {
  item: HistoryItem;
};

export default function HistoryListItem({ item }: Props) {
  const router = useRouter();

  const routeToProduct = async (code: string) => {
    try {
      router.push({
        pathname: "/(tabs)/(history)/product/[id]",
        params: { id: code },
      });
    } catch {
      console.warn(`Could not route to product ${code}`);
    }
  };

  return (
    <Card style={styles.card} onPress={() => routeToProduct(item.productId)}>
      <View style={styles.content}>
        <ImageFallback
          imageUrl={item.imageUrl}
          style={styles.imageContainer}
          imageStyle={styles.image}
          fallbackStyle={styles.image}
        />
        <View style={styles.text}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {formatRelativeDate(item.savedDate)}
          </Text>
        </View>
        <View style={styles.score}>
          <Icon source="leaf" size={16} color={getScoreColor(item.score)} />
          <Text
            variant="titleMedium"
            style={[styles.scoreText, { color: getScoreColor(item.score) }]}
          >
            {Math.round(Number(item.score) || 0)}
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
  },
  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingRight: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  text: {
    flex: 1,
    paddingVertical: 16,
  },
  name: {
    fontWeight: "700",
    marginBottom: 4,
  },
  date: {
    color: theme.colors.muted,
  },
  score: {
    alignItems: "center",
    paddingVertical: 16,
  },
  scoreText: {
    marginTop: 4,
  },
});
