import { theme } from "@/theme";

export function getScoreColor(score: number): string {
  const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  if (s <= 33) return theme.colors.error;
  if (s <= 66) return theme.colors.warning;
  return theme.colors.primary;
}
