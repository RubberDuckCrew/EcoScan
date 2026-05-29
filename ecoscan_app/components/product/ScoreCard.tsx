import { Text, ProgressBar } from "react-native-paper";
import {StyleSheet, ViewStyle, TextStyle, View} from "react-native";

export interface ScoreCardProps{
    score: number
}

type ScoreVariant = "good" | "warning" | "bad";

export default function ScoreCard({score}:ScoreCardProps){

    const variant = variantStyles[getScoreVariant(score)];

    return(
        <View style={[styles.rootCard, variant.card]}>
            <Text style={[styles.title, variant.text]}>Green Score</Text>
            <Text style={[styles.score, variant.text]}>{score}</Text>
            <Text style={[styles.message, variant.text]}>{variant.message}</Text>
            <View style={styles.progressBarContainer}>
                <ProgressBar style={styles.progressBar} progress={score/100} color={variant.progressBar}/>
            </View>
        </View>
    );
}

function getScoreVariant(score: number): ScoreVariant {
    if (score >= 70) return "good";
    if (score >= 40) return "warning";
    return "bad";
}

const variantStyles: Record<ScoreVariant, { card: ViewStyle; text: TextStyle, progressBar: string, message: string}> = {
    good: {
        card: { borderColor: "#7CBC82", backgroundColor: "rgba(124, 188, 130, 0.34)" },
        text: { color: "#009A0A" },
        progressBar: "#009A0A",
        message: "Sehr gute Wahl"
    },
    warning: {
        card: { borderColor: "#E0B84B", backgroundColor: "rgba(224, 184, 75, 0.34)" },
        text: { color: "#A07800" },
        progressBar: "#A07800",
        message: "Noch Luft nach oben.",
    },
    bad: {
        card: { borderColor: "#E07B7B", backgroundColor: "rgba(224, 123, 123, 0.34)" },
        text: { color: "#C00000" },
        progressBar: "#C00000",
        message: "Bitte überdenke deine Wahl.",
    },
};

const styles = StyleSheet.create({
    title:{
        fontSize: 20
    },
    score: {
        fontSize: 48,
        fontWeight: "bold"
    },
    message:{
      marginBottom: 10,
    },
    rootCard: {
        height: 200,
        borderRadius: 25,
        borderStyle: "solid",
        borderWidth: 1,
        padding: 16,
        marginVertical: 8,
        alignItems: "center",
        justifyContent: "space-between",
    },
    progressBar:{
        borderRadius: 25,
        height: 15,
    },
    progressBarContainer: {
        alignSelf: "stretch",
    },
});