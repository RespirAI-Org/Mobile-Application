import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import {
  ArrowLeft,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Keyboard,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { authService } from "@/services/authService";
import { deviceService } from "@/services/deviceService";
import { useDevices } from "@/contexts/DeviceContext";

type ScanState = "scanning" | "loading" | "success" | "error";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { fetchDevices } = useDevices();
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      setScanState("scanning");
      setErrorMessage("");
    }, [])
  );

  const handleBarcodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (scanState !== "scanning") return;

    setScanState("loading");

    try {
      const parsed = JSON.parse(result.data);
      const deviceId: string = parsed?.id;

      if (!deviceId) {
        setErrorMessage("Invalid QR code format.");
        setScanState("error");
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setErrorMessage("You must be logged in to pair a device.");
        setScanState("error");
        return;
      }

      const deviceResult = await deviceService.getDeviceById(deviceId);
      if (!deviceResult.success) {
        setErrorMessage(deviceResult.error || "Device not found.");
        setScanState("error");
        return;
      }

      if (deviceResult.data?.owner) {
        setErrorMessage("This device is already paired to another account.");
        setScanState("error");
        return;
      }

      const response = await deviceService.pairDeviceById(deviceId, currentUser.id);

      if (response.success) {
        setScanState("success");
        fetchDevices();
      } else {
        setErrorMessage(response.error || "Failed to pair device.");
        setScanState("error");
      }
    } catch {
      setErrorMessage("Could not read QR code data.");
      setScanState("error");
    }
  }, [scanState]);

  const resetScan = () => {
    setErrorMessage("");
    setScanState("scanning");
  };

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
    <CameraView
      style={styles.camera}
      facing="back"
      onBarcodeScanned={scanState === "scanning" ? handleBarcodeScanned : undefined}
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
    >
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

        {/* Viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

        </View>

        {/* Bottom controls */}
        <View style={styles.controls}>
          {scanState === "scanning" ? (
            <>
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
            </>
          ) : (
            <>
              {scanState === "loading" && (
                <View style={styles.statusOverlay}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.statusText}>Pairing device...</Text>
                </View>
              )}
              {scanState === "success" && (
                <View style={styles.statusOverlay}>
                  <CheckCircle size={20} color="#22c55e" />
                  <Text style={styles.statusText}>Device paired!</Text>
                </View>
              )}
              {scanState === "error" && (
                <View style={styles.statusOverlay}>
                  <XCircle size={20} color="#ef4444" />
                  <Text style={styles.statusText}>{errorMessage}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.flashlightButton, scanState === "success" && styles.successButton]}
                onPress={scanState === "success" ? () => router.back() : resetScan}
                disabled={scanState === "loading"}
              >
                <Text style={styles.flashlightText}>
                  {scanState === "loading" ? "Please wait..." : scanState === "success" ? "Done" : "Try Again"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </CameraView>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

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
  viewfinderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinder: {
    width: 240,
    height: 240,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#ffffff",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  statusOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
  successButton: {
    backgroundColor: "#22c55e",
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
