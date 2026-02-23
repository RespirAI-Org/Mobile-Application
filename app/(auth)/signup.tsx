import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthTabSwitcher } from "@/components/auth/AuthTabSwitcher";
import { FormInput } from "@/components/auth/FormInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { AuthFooter } from "@/components/auth/AuthFooter";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleSignup = () => {
    // Implement actual signup logic here
    if (email && password && confirmPassword && password === confirmPassword) {
    }
  };

  const handleTabPress = (tab: "signin" | "signup") => {
    if (tab === "signin") {
      router.replace("/(auth)/login");
    }
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.container, isLargeScreen && styles.containerLarge]}
          >
            {/* Header Section */}
            <AuthHeader
              title="Create New Account"
              subtitle={`Join now to analyze patient heart & lung\nsounds securely.`}
            />

            {/* Tab Switcher */}
            <AuthTabSwitcher activeTab="signup" onTabPress={handleTabPress} />

            {/* Form Section */}
            <View style={styles.form}>
              {/* Email Input */}
              <FormInput
                label="Email"
                iconName="mail-outline"
                placeholder="doctor@hospital.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password Input */}
              <FormInput
                label="Password"
                iconName="lock-outline"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                isPassword
              />

              {/* Confirm Password Input */}
              <FormInput
                label="Confirm Password"
                iconName="history"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />

              {/* Sign Up Button */}
              <PrimaryButton title="Sign Up" onPress={handleSignup} />

              {/* Social Buttons */}
              <SocialLoginButtons
                dividerText="OR REGISTER WITH"
                googleButtonText="Sign up with Google"
                zaloButtonText="Sign up with Zalo"
              />

              {/* Footer */}
              <AuthFooter prefixText="By registering, you agree to our" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f6f6f8",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  container: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  containerLarge: {
    maxWidth: 480,
  },
  form: {
    width: "100%",
    gap: 20,
  },
});
