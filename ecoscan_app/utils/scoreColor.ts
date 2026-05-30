import { theme } from "@/theme";

export type ScoreVariant = "good" | "warning" | "bad";

export function getScoreVariant(score: number) : ScoreVariant {
  const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  if (s <= 33) return "bad";
  if (s <= 66) return "warning";
  return "good";
}

export function getScoreColor(score: number): string {
  const scoreVariant = getScoreVariant(score);
  if (scoreVariant === "bad") return theme.colors.error;
  if (scoreVariant === "warning") return theme.colors.warning;
  return theme.colors.primary;
}
