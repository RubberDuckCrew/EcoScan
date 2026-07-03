import { Stack } from "expo-router";
import { headerOptions } from "@/theme";

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        ...headerOptions,
      }}
    />
  );
}
