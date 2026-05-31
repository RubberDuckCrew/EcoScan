import {Image, StyleSheet, View} from "react-native";
import {Card, Text} from "react-native-paper";
import {useEffect, useMemo, useState} from "react";
import * as Location from 'expo-location';

type AlternativeCardProps = {
    title: string;
    image: any;
    scanScore: number;
    alternativeScore: number;
    targetLatitude: number;
    targetLongitude: number;
}

export default function AlternativeCard({
                                            title,
                                            image,
                                            scanScore,
                                            alternativeScore,
                                            targetLatitude,
                                            targetLongitude
                                        }: AlternativeCardProps) {

    const scoreDifference = alternativeScore - scanScore;
    const [userLatitude, setUserLatitude] = useState<number>(-1);
    const [userLongitude, setUserLongitude] = useState<number>(-1);

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
        console.log("Lat:", userLatitude);
        console.log("Lon:", userLongitude);
    }, [userLatitude, userLongitude]);


    const distance = useMemo(() => {
        if (userLatitude === -1 || userLongitude === -1) return null;
        if (!targetLatitude || !targetLongitude) return null;

        const R = 6371;
        const dLat = ((targetLatitude - userLatitude) * Math.PI) / 180;
        const dLon = ((targetLongitude - userLongitude) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((userLatitude * Math.PI) / 180) *
            Math.cos((targetLatitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const km = R * 2 * Math.asin(Math.sqrt(a));

        return km < 1
            ? `${Math.round(km * 1000)} m`
            : `${km.toFixed(1)} km`;
    }, [userLatitude, userLongitude]);

    console.log(distance);

    return (
        <Card style={styles.card}>
            <View style={styles.content}>
                <Image source={image} style={styles.image}/>
                <View>
                    <Text variant="titleMedium" style={{fontWeight: '600'}}>
                        {title}
                    </Text>
                    <Text variant="bodyMedium" style={{color: '#666'}} numberOfLines={3}>
                        {alternativeScore} (+ {scoreDifference} Punkte besser)
                    </Text>
                    {distance &&
                        <Text variant="bodyMedium" style={{color: '#666'}} numberOfLines={3}>
                            {distance}
                        </Text>
                    }
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderWidth: 0,
        borderBottomWidth: 0,
        padding: 8,
        marginTop: 12,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingRight: 16,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
});
