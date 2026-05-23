import {Stack} from 'expo-router';
import {PaperProvider} from 'react-native-paper';
import {theme} from '../theme';

export default function RootLayout() {
    return (
        <PaperProvider theme={theme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
        </PaperProvider>
    );
}