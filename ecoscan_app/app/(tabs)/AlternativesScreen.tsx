import {View, StyleSheet} from "react-native";
import {Text} from "react-native-paper";
import ProductCard from "@/components/alternatives/ProductCard";

export default function AlternativesScreen() {
    const defaultProduct = {
        title: "Titel des Produkts",
        description: "Beschreibung\nBeschreibung\nBeschreibung",
        image: "../assets/images/icon.png",
        score: 87,
    }
    return (
        <View style={styles.pageStyle}>
            <Text variant="headlineMedium" style={styles.headline}>
                Bessere Alternativen
            </Text>
            <Text variant={"bodyLarge"} style={styles.subHeadline}>
                In deiner Nähe verfügbar
            </Text>
            <ProductCard {...defaultProduct} />
        </View>
    );
}

const styles = StyleSheet.create({
    pageStyle: {
        flex: 1,
        padding: 16,
    },
    headline: {
      fontWeight: "bold",
    },
    subHeadline: {
        color: 'gray',
    },
});