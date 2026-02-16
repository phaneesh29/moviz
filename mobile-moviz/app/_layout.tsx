import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent={true} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: "slide_from_right",
          navigationBarColor: "#141414",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tv/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="person/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
