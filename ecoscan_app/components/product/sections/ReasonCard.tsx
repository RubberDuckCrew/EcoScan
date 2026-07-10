import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { theme } from "@/theme";

export interface ReasonCardProps {
  reason: string;
}

export default function ReasonCard({ reason }: ReasonCardProps) {
  return (
    <View>
      <Text style={styles.title} variant={"headlineSmall"}>
        Begründung
      </Text>
      <Card style={styles.card}>
        <Card.Content>
          <ScrollView style={styles.scroll}>
            <Text variant={"bodyMedium"}>{reason}</Text>
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    paddingBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    elevation: 0,
  },
  scroll: {
    maxHeight: 300,
  },
});
