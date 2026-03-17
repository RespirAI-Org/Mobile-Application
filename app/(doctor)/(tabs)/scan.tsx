import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get("window");
const SCANNER_SIZE = width * 0.7;

export default function ScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.iconButton}>
          <HelpCircle size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Camera Area Placeholder */}
      <View style={styles.cameraPlaceholder}>
        {/* Mask Overlay */}
        <View style={styles.maskContainer}>
          <View style={styles.maskRow}>
            <View style={styles.mask} />
          </View>
          <View style={[styles.maskRow, { height: SCANNER_SIZE }]}>
            <View style={styles.mask} />
            <View style={[styles.scanWindow, { width: SCANNER_SIZE }]} />
            <View style={styles.mask} />
          </View>
          <View style={styles.maskRow}>
            <View style={styles.mask} />
          </View>
        </View>

        {/* Scanner Overlay Elements (Corners & Line) */}
        <View
          style={[
            styles.scannerOverlay,
            { width: SCANNER_SIZE, height: SCANNER_SIZE },
          ]}
        >
          {/* Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Scan Line */}
          <View style={styles.scanLine} />
        </View>
      </View>

      {/* Controls Overlay */}
      <View style={styles.controlsContainer}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Align the QR code</Text>
          <Text style={styles.instructionSubtitle}>
            Scan device to pair stethoscope or patient ID
          </Text>
        </View>

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
    backgroundColor: "#1e1e1e", // Dark background for simulated camera
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  maskRow: {
    flexDirection: "row",
    flex: 1,
  },
  mask: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scanWindow: {
    backgroundColor: "transparent",
  },
  scannerOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#0da6f2",
    borderWidth: 6,
    borderRadius: 12, // Rounded outer corner
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 24, // Rounded corner
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 24,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    width: "90%",
    height: 2,
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40, // Adjust based on bottom safe area if needed
    alignItems: "center",
    zIndex: 20,
  },
  instructionContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  instructionSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  flashlightButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 40,
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
    backgroundColor: "#1e1e1e", // Dark circle bg
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
});
