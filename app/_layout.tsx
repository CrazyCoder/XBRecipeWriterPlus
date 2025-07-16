import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {SplashScreen, Stack} from 'expo-router';
import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';


import {useColorScheme} from '@/hooks/useColorScheme';
import {PortalProvider, TamaguiProvider, Theme} from "tamagui";
import config from '../tamagui.config' // your configuration
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Toasts} from '@backpackapp-io/react-native-toast';
import {StatusBar} from 'expo-status-bar';


import {ShareIntentProvider} from "expo-share-intent";
import {MySafeAreaView} from "@/components/MySafeAreaView";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    const LightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: 'rgb(221,221,221)',
        },
    };

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <>
            <ShareIntentProvider
                options={{
                    debug: false,
                    resetOnBackground: true,
                }}>
                <GestureHandlerRootView style={{flex: 1}}>
                    <PortalProvider shouldAddRootHost={true}>
                        <SafeAreaProvider>
                            <TamaguiProvider config={config}>
                                <Theme name={colorScheme}>
                                    <ThemeProvider
                                        value={colorScheme === "light" ? LightTheme : DarkTheme}
                                    >
                                        <MySafeAreaView>
                                            <Stack
                                                screenOptions={{
                                                    headerStyle: {
                                                        backgroundColor: '#f4511e',
                                                    },
                                                    headerTintColor: '#fff',
                                                    headerTitleStyle: {
                                                        fontWeight: 'bold',
                                                    }
                                                }}>
                                                <Stack.Screen name="index" options={{}}/>
                                                <Stack.Screen name="editRecipe" options={{title: "Edit Recipe"}}/>
                                            </Stack>
                                            <Toasts/>
                                            <StatusBar hidden={false} translucent={true}/>
                                        </MySafeAreaView>
                                    </ThemeProvider>
                                </Theme>
                            </TamaguiProvider>
                        </SafeAreaProvider>
                    </PortalProvider>
                </GestureHandlerRootView>
            </ShareIntentProvider>
        </>
    );
}
