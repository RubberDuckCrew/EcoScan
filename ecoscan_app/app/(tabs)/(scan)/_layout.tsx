import { Stack } from "expo-router";
import { headerOptions, theme } from "@/theme";

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        ...headerOptions,
      }}
    />
  );
}
