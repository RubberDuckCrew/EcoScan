import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "EcoScan",
        headerStyle: {
          backgroundColor: "#7CBC82",
        },
        headerTitleStyle: {
          color: "black",
          fontWeight: "bold",
          fontSize: 22,
        },
        headerTitleAlign: "center",

        tabBarStyle: {
          backgroundColor: "#ECECEC",
        },
        tabBarActiveTintColor: "#009A0A",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="Scan"
        options={{
          title: "Scannen",
          tabBarIcon: ({ color, size }) => (
            <Icon source="barcode-scan" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: "Historie",
          tabBarIcon: ({ color, size }) => (
            <Icon source="format-list-bulleted" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
