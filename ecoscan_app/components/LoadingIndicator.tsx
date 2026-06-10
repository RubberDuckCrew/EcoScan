import { theme } from "@/theme";
import { ActivityIndicator } from "react-native";
import React from "react";

type LoadingIndicatorProps = {
  color?: string;
};
export function LoadingIndicator({
  color = theme.colors.primary,
}: LoadingIndicatorProps) {
  return <ActivityIndicator size="large" color={color} />;
}
