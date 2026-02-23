import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface SocialLoginButtonsProps {
  onGooglePress?: () => void;
  onZaloPress?: () => void;
  dividerText?: string;
  googleButtonText?: string;
  zaloButtonText?: string;
}

export function SocialLoginButtons({
  onGooglePress,
  onZaloPress,
  dividerText = "OR CONTINUE WITH",
  googleButtonText = "Continue with Google",
  zaloButtonText = "Continue with Zalo",
}: SocialLoginButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity
          style={styles.socialButtonGoogle}
          onPress={onGooglePress}
        >
          <FontAwesome5
            name="google"
            size={18}
            color="#0d121c"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.socialButtonTextGoogle}>{googleButtonText}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButtonZalo} onPress={onZaloPress}>
          <View style={styles.zaloIconContainer}>
            <Text style={styles.zaloIconText}>Z</Text>
          </View>
          <Text style={styles.socialButtonTextZalo}>{zaloButtonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "500",
    color: "#9ca3af",
    letterSpacing: 0.6,
  },
  socialContainer: {
    gap: 12,
  },
  socialButtonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
  },
  socialButtonTextGoogle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0d121c",
  },
  socialButtonZalo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: "#0da6f2",
    borderRadius: 12,
    shadowColor: "#bfdbfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  socialButtonTextZalo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  zaloIconContainer: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  zaloIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
