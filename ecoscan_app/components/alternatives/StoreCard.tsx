import { Image, StyleSheet, View } from "react-native";
import { Card, Text, Avatar, Button } from "react-native-paper";
import { useEffect, useMemo, useState } from "react";

type StoreCardProps = {
    name: string;
    targetLatitude: number;
    targetLongitude: number;
    userLatitude: number;
    userLongitude: number;
};
export default function StoreCard({
                                    name,
                                    targetLatitude,
                                    targetLongitude,
                                    userLatitude,
                                    userLongitude
                                }: StoreCardProps) {

    const distance = useMemo(() => {
        if (userLatitude === -1 || userLongitude === -1) return null;

        const R = 6371;
        const dLat = ((targetLatitude - userLatitude) * Math.PI) / 180;
        const dLon = ((targetLongitude - userLongitude) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((userLatitude * Math.PI) / 180) *
            Math.cos((targetLatitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const km = R * 2 * Math.asin(Math.sqrt(a));

        return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
    }, [userLatitude, userLongitude]);

    console.log(distance);

    return (
        <Card style={styles.card}>
            <View style={styles.cardContentHorizontal}>
                <View style={styles.textColumn}>
                    <Text variant="titleMedium" style={{ lineHeight: 20, fontWeight: "600" }} numberOfLines={2}
                          ellipsizeMode="tail">
                        {name}
                    </Text>
                    {distance && (
                        <Text
                            variant="bodyMedium"
                            style={{ color: "#666" }}
                            numberOfLines={3}
                        >
                            {distance}
                        </Text>
                    )}
                </View>

                <View style={styles.buttonColumn}>
                    <Button
                        mode="contained"
                        icon="google-maps"
                        onPress={() => console.log('Store gedrückt')}
                    >
                        Route
                    </Button>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 0,
        borderBottomWidth: 0,
        padding: 8,
        marginTop: 12,
    },
    cardContentHorizontal: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
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
    textColumn: {
        flex: 1,
        paddingRight: 16,
    },
    buttonColumn: {
        justifyContent: "center",
        alignItems: "center",
    }
});
