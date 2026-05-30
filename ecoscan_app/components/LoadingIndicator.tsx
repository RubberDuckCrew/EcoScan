import { theme } from "@/theme";
import { ActivityIndicator } from "react-native";
import React from "react";

export function LoadingIndicator() {
  return <ActivityIndicator size="large" color={theme.colors.primary} />;
}
