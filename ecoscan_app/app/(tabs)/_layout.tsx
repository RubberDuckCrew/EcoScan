import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { headerOptions } from "@/theme";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type TabConfig = {
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  headerShown: boolean;
};

const tabs = {
  "(scan)": { title: "Scannen", icon: "barcode-scan", headerShown: false },
  History: {
    title: "Historie",
    icon: "format-list-bulleted",
    headerShown: true,
  },
  Profile: { title: "Profil", icon: "account", headerShown: true },
} satisfies Record<string, TabConfig>;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
      }}
    >
      {Object.entries(tabs).map(([name, tab]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            headerShown: tab.headerShown,
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Icon source={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
        <Tabs.Screen
            name="alternatives/[product]"
            options={{
                href: null,
            }}
        />
    </Tabs>
  );
}
