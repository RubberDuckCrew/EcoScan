import { Stack } from "expo-router";
import { headerOptions } from "@/theme";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        ...headerOptions,
      }}
    />
  );
}
