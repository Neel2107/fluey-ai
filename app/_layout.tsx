import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#18181b" />
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          animationDuration: 200,
          presentation: "transparentModal",
          contentStyle: {
            backgroundColor: "#18181b",
          }, 
          navigationBarColor: "#18181b",
          statusBarStyle: "light",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            animation: "fade",
          }}
        />
      </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
