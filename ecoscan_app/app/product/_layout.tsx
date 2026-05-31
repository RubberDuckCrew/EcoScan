import { Stack } from "expo-router";
import { theme } from "@/theme";

export default function ProductLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "EcoScan",
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          headerTitleStyle: {
            color: "black",
            fontWeight: "bold",
            fontSize: 22,
          },
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
