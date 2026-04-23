import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  ArrowLeft,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Keyboard,
} from "lucide-react-native";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Camera access is required to scan QR codes.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <CameraView style={styles.camera} facing="back">
      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
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

        {/* Spacer — camera fills this space */}
        <View style={{ flex: 1 }} />

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
    </CameraView>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  permissionText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#0da6f2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
