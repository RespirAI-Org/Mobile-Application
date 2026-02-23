import { Stack } from "expo-router";
import { LoginProvider } from "@/contexts/LoginContext";
import { SignupProvider } from "@/contexts/SignupContext";

export default function AuthLayout() {
  return (
    <LoginProvider>
      <SignupProvider>
        <Stack screenOptions={{ animation: "none" }}>
          <Stack.Screen
            name="login"
            options={{ title: "Sign In", headerShown: false }}
          />
          <Stack.Screen
            name="signup"
            options={{ title: "Create Account", headerShown: false }}
          />
        </Stack>
      </SignupProvider>
    </LoginProvider>
  );
}
