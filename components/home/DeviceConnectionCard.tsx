import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bluetooth, BluetoothOff } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface DeviceConnectionCardProps {
  deviceName: string | null;
  status: "active" | "inactive" | "unpaired" | null;
}

export default function DeviceConnectionCard({
  deviceName,
  status,
}: DeviceConnectionCardProps) {
  const isConnected = status === "active";

  const title = isConnected
    ? deviceName || "Stethoscope Connected"
    : "No Device Connected";
  const subtitle = isConnected
    ? "Ready to record new sounds"
    : "Pair a stethoscope to get started";
  const backgroundColor = isConnected ? "#10B981" : Colors.background["300"];
  const shadowColor = isConnected ? Colors.success["500"] : "transparent";
  const Icon = isConnected ? Bluetooth : BluetoothOff;

  return (
    <View style={[styles.deviceCard, { backgroundColor, shadowColor }]}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceTitle}>{title}</Text>
        <Text
          style={[
            styles.deviceSubtitle,
            !isConnected && { color: Colors.typography["600"] },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <View style={styles.deviceIconContainer}>
        <Icon size={24} color={Colors.typography.white} />
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
