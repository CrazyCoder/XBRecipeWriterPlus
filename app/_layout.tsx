import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {SplashScreen, Stack} from 'expo-router';
import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {useColorScheme} from '@/hooks/useColorScheme';
import {TamaguiProvider, Theme} from 'tamagui';
import {PortalProvider} from '@tamagui/portal'
import config from '../tamagui.config' // your configuration
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Toasts} from '@backpackapp-io/react-native-toast';
import {StatusBar} from 'expo-status-bar';

import {ShareIntentProvider} from 'expo-share-intent';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
    });

    const LightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: 'rgb(221,221,221)'
        }
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
        <ShareIntentProvider
            options={{
                debug: false,
                resetOnBackground: true
            }}>
            <GestureHandlerRootView style={{flex: 1}}>
                <TamaguiProvider config={config}>
                    <Theme name={colorScheme}>
                        <PortalProvider shouldAddRootHost>
                            <SafeAreaProvider>
                                <ThemeProvider value={colorScheme === "light" ? LightTheme : DarkTheme}>
                                    <SafeAreaView style={{flex: 1, backgroundColor: '#f4511e'}}>
                                        <Stack
                                            screenOptions={{
                                                headerStyle:      {
                                                    backgroundColor: '#f4511e'
                                                },
                                                headerTintColor:  '#fff',
                                                headerTitleStyle: {
                                                    fontWeight: 'bold'
                                                }
                                            }}>
                                            <Stack.Screen name="index" options={{}}/>
                                            <Stack.Screen name="editRecipe" options={{title: "Edit Recipe"}}/>
                                        </Stack>
                                        <Toasts/>
                                        <StatusBar hidden={false} translucent={true}/>
                                    </SafeAreaView>
                                </ThemeProvider>
                            </SafeAreaProvider>
                        </PortalProvider>
                    </Theme>
                </TamaguiProvider>
            </GestureHandlerRootView>
        </ShareIntentProvider>
    );
}
