import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { ClipboardList } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";

export default function DiagnosisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnosis</Text>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <ClipboardList size={40} color={Colors.info["400"]} />
        </View>
        <Text style={styles.heading}>No diagnosis selected</Text>
        <Text style={styles.body}>
          To view a diagnosis report, open a patient's profile from the{" "}
          <Text style={styles.bold}>Home</Text> screen and tap on any recording.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Gap.medium,
    backgroundColor: Colors.background.light,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.typography["0"],
    paddingHorizontal: Gap.mediumSmall,
    paddingBottom: Gap.small,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Gap.large,
    paddingBottom: Gap.large,
    gap: Gap.small,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.info["950"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Gap.xxSmall,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.typography["0"],
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: Colors.typography["300"],
    textAlign: "center",
    lineHeight: 22,
  },
  bold: {
    fontWeight: "700",
    color: Colors.typography["100"],
  },
});
