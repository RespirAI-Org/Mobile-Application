import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AuthFooterProps {
  prefixText?: string;
  onPrivacyPolicyPress?: () => void;
  onTermsOfServicePress?: () => void;
}

export function AuthFooter({
  prefixText = "By continuing, you agree to our",
  onPrivacyPolicyPress,
  onTermsOfServicePress,
}: AuthFooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {prefixText}{" "}
        <Text style={styles.linkText} onPress={onPrivacyPolicyPress}>
          Medical Privacy Policy
        </Text>{" "}
        and{" "}
        <Text style={styles.linkText} onPress={onTermsOfServicePress}>
          Terms of Service
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#0da6f2",
  },
});
