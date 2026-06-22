import { Text, ProgressBar, IconButton } from "react-native-paper";
import { StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import { theme } from "@/theme";
import { getScoreVariant, ScoreVariant } from "@/utils/scoreColor";

export interface ScoreCardProps {
  score: number;
  onShare: () => void;
}

export default function ScoreCard({ score, onShare }: ScoreCardProps) {
  const normalizedScore = Math.max(
    0,
    Math.min(100, Math.round(Number(score) || 0)),
  );
  const variant = variantStyles[getScoreVariant(normalizedScore)];
  return (
    <View style={[styles.rootCard, variant.card]}>
      <IconButton
        icon="share-variant"
        iconColor={theme.colors.lightMuted}
        size={28}
        style={styles.shareButton}
        onPress={onShare}
      />
      <Text style={variant.text} variant={"headlineSmall"}>
        Green Score
      </Text>
      <Text style={[styles.score, variant.text]} variant={"displayLarge"}>
        {normalizedScore}
      </Text>
      <Text style={[styles.message, variant.text]} variant={"bodyLarge"}>
        {variant.message}
      </Text>
      <View style={styles.progressBarContainer}>
        <ProgressBar
          style={styles.progressBar}
          progress={normalizedScore / 100}
          color={variant.progressBar}
        />
      </View>
    </View>
  );
}

export const variantStyles: Record<
  ScoreVariant,
  { card: ViewStyle; text: TextStyle; progressBar: string; message: string }
> = {
  good: {
    card: {
      borderColor: theme.colors.primary,
      backgroundColor: withOpacity(theme.colors.primary, 0.34),
    },
    text: { color: theme.colors.primary },
    progressBar: theme.colors.primary,
    message: "Sehr gute Wahl",
  },
  warning: {
    card: {
      borderColor: theme.colors.warning,
      backgroundColor: withOpacity(theme.colors.warning, 0.34),
    },
    text: { color: theme.colors.warning },
    progressBar: theme.colors.warning,
    message: "Noch Luft nach oben.",
  },
  bad: {
    card: {
      borderColor: theme.colors.error,
      backgroundColor: withOpacity(theme.colors.error, 0.34),
    },
    text: { color: theme.colors.error },
    progressBar: theme.colors.error,
    message: "Bitte überdenke deine Wahl.",
  },
};

function withOpacity(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const styles = StyleSheet.create({
  score: {
    fontWeight: "bold",
  },
  message: {
    marginBottom: 10,
  },
  rootCard: {
    height: 200,
    borderRadius: 25,
    borderStyle: "solid",
    borderWidth: 3,
    padding: 16,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBar: {
    borderRadius: 25,
    height: 15,
  },
  progressBarContainer: {
    alignSelf: "stretch",
  },
  shareButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
});
