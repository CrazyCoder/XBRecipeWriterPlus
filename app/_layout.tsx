import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import { useColorScheme } from '@/hooks/useColorScheme';
import {  PortalProvider, TamaguiProvider, Text, Theme } from "tamagui";
import config from '../tamagui.config' // your configuration
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toasts } from '@backpackapp-io/react-native-toast';

import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {


  const router = useRouter();

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  {/*  <ApplicationProvider {...eva} theme={eva.dark}>
        <Stack
        screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        <Stack.Screen name="index" options={{}} />
        <Stack.Screen name="editRecipe" options={{}} />


        </Stack>
      </ApplicationProvider> */}

  return (
    <>

    <ShareIntentProvider 
    options={{
      debug: true,
      resetOnBackground: true,
      
      }}
    >
      <TamaguiProvider config={config}>
        <Theme name={colorScheme}>
          <ThemeProvider
            value={colorScheme === "light" ? DefaultTheme : DarkTheme}
          >
            <SafeAreaProvider>
              <GestureHandlerRootView>
              <PortalProvider>
                <Stack
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: '#f4511e',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}>

                  <Stack.Screen name="index" options={{}} />
                </Stack>
                <Toasts />
                </PortalProvider>

              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ThemeProvider>
        </Theme>
      </TamaguiProvider>
    </ShareIntentProvider>
    </>
  );
}
