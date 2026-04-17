import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Keyboard,
} from "lucide-react-native";

export default function ScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.iconButton}>
          <HelpCircle size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Camera fill */}
      <View style={styles.cameraFill} />

      {/* Bottom controls */}
      <View style={styles.controls}>
        <Text style={styles.instructionTitle}>Align the QR code</Text>
        <Text style={styles.instructionSubtitle}>
          Scan device to pair stethoscope or patient ID
        </Text>

        <TouchableOpacity style={styles.flashlightButton}>
          <Zap size={20} color="#ffffff" fill="#ffffff" />
          <Text style={styles.flashlightText}>Flashlight</Text>
        </TouchableOpacity>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconCircle}>
              <ImageIcon size={24} color="#ffffff" />
            </View>
            <Text style={styles.actionText}>Import</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconCircle}>
              <Keyboard size={24} color="#ffffff" />
            </View>
            <Text style={styles.actionText}>Enter ID</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraFill: {
    flex: 1,
  },
  controls: {
    alignItems: "center",
    paddingBottom: 16,
    gap: 24,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  instructionSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: -16,
  },
  flashlightButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  flashlightText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
});
