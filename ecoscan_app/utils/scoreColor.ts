import { theme } from "@/theme";

export type ScoreVariant = "good" | "warning" | "bad";

export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
}

export function getScoreVariant(score: number): ScoreVariant {
  const s = normalizeScore(score);
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

export function withOpacity(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
