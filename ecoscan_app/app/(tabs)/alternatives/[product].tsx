import {FlatList, StyleSheet} from "react-native";
import {Surface, Text} from "react-native-paper";
import ProductCard from "@/components/alternatives/ProductCard";
import AlternativeCard from "@/components/alternatives/AlternativeCard";

type AlternativesScreenProps = {
    scannedProduct: {
        ean: string;
        title: string;
        image: string;
        description: string;
        score: number;
    }
}

export default function Product({scannedProduct}: AlternativesScreenProps) {
    const alternatives = [
        {
            title: "Alternativprodukt",
            image: require("../../../assets/images/icon.png"),
            scanScore: 87,
            alternativeScore: 95,
            targetLatitude: 48.15520,
            targetLongitude: 11.55457,
        },
        {
            title: "Alternativprodukt2",
            image: require("../../../assets/images/icon.png"),
            scanScore: 87,
            alternativeScore: 90,
            targetLatitude: 48,
            targetLongitude: 10,
        },
        {
            title: "Alternativprodukt3",
            image: require("../../../assets/images/icon.png"),
            scanScore: 87,
            alternativeScore: 88,
            targetLatitude: 48.03655106953577,
            targetLongitude: 10.727155318771056,
        },
        {
            title: "Alternativprodukt",
            image: require("../../../assets/images/icon.png"),
            scanScore: 87,
            alternativeScore: 95,
            targetLatitude: 48.15520,
            targetLongitude: 11.55457,
        },
        {
            title: "Alternativprodukt2",
            image: require("../../../assets/images/icon.png"),
            scanScore: 87,
            alternativeScore: 90,
            targetLatitude: 48,
            targetLongitude: 10,
        },
        {
            title: "Alternativprodukt3",
            image: require("../../../assets/images/icon.png"),
            scanScore: 87,
            alternativeScore: 88,
            targetLatitude: 48.03655106953577,
            targetLongitude: 10.727155318771056,
        },
    ];
    const scannedProductTesting = {
        title: "Titel des Produkts",
        description: "Beschreibung\nBeschreibung\nBeschreibung",
        image: "../assets/images/icon.png",
        score: 87,
    }  // TODO change later to prop

    return (
        <Surface style={styles.pageStyle}>
            <Text variant="headlineMedium" style={styles.headline}>
                Bessere Alternativen
            </Text>
            <Text variant={"bodyLarge"} style={styles.subHeadline}>
                In deiner Nähe verfügbar
            </Text>
            <ProductCard {...scannedProductTesting} />
            <FlatList
                style={{marginTop: 16, paddingHorizontal: 2}}
                data={alternatives.sort((a, b) => b.alternativeScore - a.alternativeScore)}
                renderItem={({item}) =>
                    <AlternativeCard
                        title={item.title}
                        image={item.image}
                        scanScore={item.scanScore}
                        alternativeScore={item.alternativeScore}
                        targetLatitude={item.targetLatitude}
                        targetLongitude={item.targetLongitude}
                    />
                }
            />
        </Surface>
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