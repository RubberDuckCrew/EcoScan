import { Image, StyleSheet, View } from "react-native";
import { Card, Text, Avatar } from "react-native-paper";
import { useEffect, useMemo, useState } from "react";

type AlternativeCardProps = {
  name: string;
  image: any;
  scanScore: number;
  alternativeScore: number;
  targetLatitude: number;
  targetLongitude: number;
  userLatitude: number;
  userLongitude: number;
};
export default function AlternativeCard({
  name,
  image,
  scanScore,
  alternativeScore,
  targetLatitude,
  targetLongitude,
  userLatitude,
  userLongitude,
}: AlternativeCardProps) {
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
