import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bluetooth } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function DeviceConnectionCard() {
  return (
    <View style={styles.deviceCard}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceTitle}>Stethoscope Connected</Text>
        <Text style={styles.deviceSubtitle}>Ready to record new sounds</Text>
      </View>
      <View style={styles.deviceIconContainer}>
        <Bluetooth size={24} color={Colors.typography.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    shadowColor: Colors.success["500"],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceTitle: {
    color: Colors.typography.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  deviceSubtitle: {
    color: Colors.success["950"],
    fontSize: 14,
    fontWeight: "500",
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
