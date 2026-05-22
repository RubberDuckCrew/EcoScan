import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StyleSheet} from "react-native";
import {Surface, Text} from "react-native-paper";

export default function History() {
    const insets = useSafeAreaInsets();

    return (
        <Surface style={{...styles.pageStyle, paddingTop: insets.top + 16}}>
            <Text>
                Dummy for History-Page
            </Text>
        </Surface>
    );
}

const styles = StyleSheet.create({
    pageStyle: {
        flex: 1,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
});
