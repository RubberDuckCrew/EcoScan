import {StyleSheet, View} from "react-native";
import {Card, Text, useTheme} from "react-native-paper";
import {useEffect, useMemo, useState} from "react";
import * as Location from 'expo-location';

type AlternativeCardProps = {
    title: string;
    image: string;
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
    const theme = useTheme();

    const scoreDiffenrence = alternativeScore - scanScore;
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
        <Card style={{...styles.card, borderColor: theme.colors.primary}}>
            <View style={styles.content}>
                <Card.Cover
                    source={{uri: image}}
                    style={styles.image}
                />
                <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={{fontWeight: '600'}}>
                        {title}
                    </Text>
                    <Text variant="bodyMedium" style={{color: '#666'}} numberOfLines={3}>
                        {alternativeScore} (+ {scoreDiffenrence} Punkte besser)
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
        borderWidth: 3,
        borderRadius: 16,
        padding: 12,
        marginTop: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: 10,
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    }
});
