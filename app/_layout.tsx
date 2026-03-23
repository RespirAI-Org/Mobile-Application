import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AudioProvider } from "../contexts/AudioContext";
import { DiagnosisProvider } from "../contexts/DiagnosisContext";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AudioProvider>
      <DiagnosisProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SafeAreaView style={styles.safeAreaView}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(doctor)" />
              <Stack.Screen name="(patient)" />
            </Stack>
            <StatusBar style="auto" />
          </SafeAreaView>
        </ThemeProvider>
      </DiagnosisProvider>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
