import { useAuth } from "@/context/AuthContext";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function LoginScreen() {
  const auth = useAuth();

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>EcoScan</Text>
          {auth.isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Button onPress={auth.login} mode="contained">
              Anmelden
            </Button>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    alignItems: "center",
    width: "100%",
    gap: 64,
  },
  title: {
    color: "white",
    fontSize: 48,
    textAlign: "center",
    fontWeight: "bold",
  },
});
