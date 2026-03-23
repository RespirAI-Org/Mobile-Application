import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for AsyncStorage to resolve to ensure PocketBase auth store has the correct data loaded
        const authDataStr = await AsyncStorage.getItem("pb_auth");
        let route = "/(auth)/Login";

        if (authDataStr) {
          console.log("[Auth] User has already authenticated");
          const authData = JSON.parse(authDataStr);
          if (authData && authData.record) {
            const user = authData.record;
            if (user.isDoctor) {
              route = "/(doctor)/(tabs)";
            } else {
              route = "/(patient)/(tabs)";
            }
          }
        }

        setInitialRoute(route);
      } catch (error) {
        console.error("Failed to read auth state:", error);
        setInitialRoute("/(auth)/Login");
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!isReady || !initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fc",
        }}
      >
        <ActivityIndicator size="large" color="#1961F0" />
      </View>
    );
  }

  return <Redirect href={initialRoute} />;
}
