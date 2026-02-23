import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleLogin = () => {
    // Implement actual login logic here
    if (email && password) {
    }
  };

  const handleTabPress = (tab: "signin" | "signup") => {
    if (tab === "signup") {
      router.replace("/(auth)/signup");
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
              title="Welcome Back"
              subtitle={`Securely access your patient data and\nadvanced sound analysis.`}
            />

            {/* Tab Switcher */}
            <AuthTabSwitcher activeTab="signin" onTabPress={handleTabPress} />

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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <PrimaryButton title="Secure Sign In" onPress={handleLogin} />

              {/* Social Buttons */}
              <SocialLoginButtons />

              {/* Footer */}
              <AuthFooter />
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#0da6f2",
    fontWeight: "500",
  },
});
