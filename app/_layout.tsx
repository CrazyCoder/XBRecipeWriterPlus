import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import { useColorScheme } from '@/hooks/useColorScheme';
import {  PortalProvider, TamaguiProvider, Text, Theme } from "tamagui";
import config from '../tamagui.config' // your configuration
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toasts } from '@backpackapp-io/react-native-toast';
import { StatusBar } from 'expo-status-bar';


import { ShareIntentProvider } from "expo-share-intent";
import * as Sentry from '@sentry/react-native';




Sentry.init({
  dsn: 'https://3dd2da678aa49988315e2313b544d7d7@o4508303878389760.ingest.us.sentry.io/4508303882846208',
  integrations: [
    //captureConsoleIntegration({ levels: ["warn", "log", "LOG", "error"] }),
  ],
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


function RootLayout() {

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
      debug: false,
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
              <PortalProvider shouldAddRootHost>
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
                  <Stack.Screen name="editRecipe" options={{title:"Edit Recipe"}} />
                </Stack>
                <Toasts />
                <StatusBar hidden={false} />
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

export default Sentry.wrap(RootLayout);

