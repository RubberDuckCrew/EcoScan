import { Route, Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { theme } from "@/theme";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type TabRouteName = Exclude<
  Route extends `/${infer Segment}` ? Segment : never,
  `${string}/${string}` | `_${string}` | ""
>;
type TabConfig = {
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const tabs = {
  Scan: { title: "Scannen", icon: "barcode-scan" },
  History: { title: "Historie", icon: "format-list-bulleted" },
  login: { title: "Login", icon: "format-list-bulleted" },
} satisfies Record<TabRouteName, TabConfig>;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
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

        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
      }}
    >
      {Object.entries(tabs).map(([name, tab]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Icon source={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
