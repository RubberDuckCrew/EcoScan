import { MD3LightTheme } from "react-native-paper";

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#009A0A",
    secondary: "#7CBC82",
    background: "#FFFFFF",
    surface: "#ECECEC",
    muted: "#606060",
    text: "#000000",
    onSurface: "#000000",
    warning: "#f1c40f",
    error: "#b3261e",
    outline: "#D1D5DC",
  },
};

export const headerOptions = {
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
} as const;
