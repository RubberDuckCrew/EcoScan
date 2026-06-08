import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";
import type { HistoryItem } from "@/types/history";
import { formatRelativeDate } from "@/utils/formatDate";
import { getScoreColor } from "@/utils/scoreColor";

type Props = {
  item: HistoryItem;
};

export default function HistoryListItem({ item }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
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
  text: {
    flex: 1,
    paddingVertical: 16,
  },
  name: {
    fontWeight: "700",
    marginBottom: 4,
  },
  date: {
    color: "#666",
  },
  score: {
    alignItems: "center",
    paddingVertical: 16,
  },
  scoreText: {
    marginTop: 4,
  },
});
