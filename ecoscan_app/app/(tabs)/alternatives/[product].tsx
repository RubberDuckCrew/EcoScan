import {FlatList, StyleSheet} from "react-native";
import {Surface, Text} from "react-native-paper";
import ProductCard from "@/components/alternatives/ProductCard";
import AlternativeCard from "@/components/alternatives/AlternativeCard";
import {useProduct} from "@/context/ProductContext";
import {useAlternatives} from "@/hooks/useAlternatives";
import {useEffect, useState} from "react";
import * as Location from 'expo-location';


export default function Product() {
    const {product} = useProduct();
    const [userLatitude, setUserLatitude] = useState<number>(-1);
    const [userLongitude, setUserLongitude] = useState<number>(-1);
    const {alternatives, loading, fetchAlternatives} = useAlternatives();

    useEffect(() => {
        if (product?.id) {
            fetchAlternatives(product.id, "");
        }
    }, [product?.id]);

    useEffect(() => {
        async function getCurrentLocation() {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log(status);
                return;
            }
            const {coords} = await Location.getCurrentPositionAsync({});
            setUserLatitude(coords.latitude);
            setUserLongitude(coords.longitude);
        }

        getCurrentLocation().catch((err) => {
            console.error('Location error:', err);
            setUserLatitude(-1);
            setUserLongitude(-1);
        });
    }, []);

    useEffect(() => {
        if (product?.id && userLatitude !== -1 && userLongitude !== -1) {
            fetchAlternatives(product.id, `${userLatitude},${userLongitude}`);
        }
    }, [product?.id, userLatitude, userLongitude]);

    return (
        <Surface style={styles.pageStyle}>
            <Text variant="headlineMedium" style={styles.headline}>
                Bessere Alternativen
            </Text>
            <Text variant={"bodyLarge"} style={styles.subHeadline}>
                In deiner Nähe verfügbar
            </Text>
            <ProductCard
                title={product?.name ?? ""}
                description={product?.description ?? ""}
                image={product?.imageUrl ?? ""}
                score={product?.score ?? 0} />
            {/*<FlatList*/}
            {/*    style={{marginTop: 16, paddingHorizontal: 2}}*/}
            {/*    data={alternatives.sort((a, b) => b.score - a.alternativeScore)}*/}
            {/*    renderItem={({item}) =>*/}
            {/*        <AlternativeCard*/}
            {/*            title={item.title}*/}
            {/*            image={item.image}*/}
            {/*            scanScore={item.scanScore}*/}
            {/*            alternativeScore={item.alternativeScore}*/}
            {/*            targetLatitude={item.targetLatitude}*/}
            {/*            targetLongitude={item.targetLongitude}*/}
            {/*            userLatitude={userLatitude}*/}
            {/*            userLongitude={userLongitude}*/}
            {/*        />*/}
            {/*    }*/}
            {/*/>*/}
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