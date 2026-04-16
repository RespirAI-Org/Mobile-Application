import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { authService } from "../../../services/authService";
import { usePatients } from "@/contexts/PatientContext";
import { deviceService, DeviceRecord } from "@/services/deviceService";
import { pb } from "@/lib/pocketbase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatLastSeen(dateString: string): string {
  if (!dateString) return "Never";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusColor(status: DeviceRecord["status"]): {
  bg: string;
  text: string;
  label: string;
} {
  switch (status) {
    case "active":
      return { bg: "#f0fdf4", text: "#16a34a", label: "Connected" };
    case "inactive":
      return { bg: "#fef9c3", text: "#a16207", label: "Inactive" };
    case "unpaired":
    default:
      return { bg: "#f3f4f6", text: "#6b7280", label: "Unpaired" };
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { patientProfile, fetchPatientProfile } = usePatients();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        !patientProfile && fetchPatientProfile(),
        loadDevices(),
      ]);
      setIsLoading(false);
    };
    load();
  }, []);

  const loadDevices = async () => {
    if (!currentUser) return;
    const result = await deviceService.getDevicesByOwner(currentUser.id);
    if (result.success && result.data) {
      setDevices(result.data);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.replace("/(auth)/Login");
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const displayName =
    patientProfile?.full_name || currentUser?.name || "Patient";
  const displayEmail = currentUser?.email ?? "";

  // Patient avatar takes priority over the user-account avatar.
  const patientAvatarUrl =
    patientProfile?.avatar && patientProfile.id
      ? pb.files.getUrl(patientProfile, patientProfile.avatar, {
          thumb: "100x100",
        })
      : null;
  const userAvatarUrl = authService.getAvatarUrl();
  const avatarUrl = patientAvatarUrl || userAvatarUrl;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Settings</Text>

        {/* ── Profile ── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {getInitials(displayName)}
                </Text>
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>

          {isLoading && !patientProfile ? (
            <ActivityIndicator color="#1961f0" style={{ marginVertical: 12 }} />
          ) : (
            <>
              <Text style={styles.name}>{displayName}</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Patient</Text>
              </View>
              <Text style={styles.email}>{displayEmail}</Text>
            </>
          )}
        </View>

        {/* ── General ── */}
        <Text style={styles.sectionTitle}>GENERAL</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: "#0da6f2" }]}>
              <Feather name="user" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Account Info</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.iconContainer, { backgroundColor: "#eb4d3d" }]}>
              <Feather name="bell" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hardware ── */}
        <Text style={styles.sectionTitle}>HARDWARE</Text>
        <View style={styles.card}>
          {isLoading && devices.length === 0 ? (
            <View style={styles.row}>
              <ActivityIndicator color="#1961f0" />
            </View>
          ) : devices.length === 0 ? (
            <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#32ade6" }]}
              >
                <Feather name="activity" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.rowTitle, { color: "#9ca3af" }]}>
                No device paired
              </Text>
            </TouchableOpacity>
          ) : (
            devices.map((device, i) => {
              const { bg, text, label } = statusColor(device.status);
              return (
                <React.Fragment key={device.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={[
                      styles.row,
                      i === devices.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: "#32ade6" },
                      ]}
                    >
                      <Feather name="activity" size={18} color="#ffffff" />
                    </View>
                    <View style={styles.rowTextContainer}>
                      <Text style={styles.rowTitle}>
                        {device.name || device.model || "Stethoscope"}
                      </Text>
                      <Text style={styles.rowSubtitle}>
                        Last synced: {formatLastSeen(device.last_seen)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                      <Text style={[styles.statusBadgeText, { color: text }]}>
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })
          )}
        </View>

        {/* ── Legal & Security ── */}
        <Text style={styles.sectionTitle}>LEGAL & SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: "#8e8e93" }]}>
              <Feather name="lock" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Privacy & Data</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.iconContainer, { backgroundColor: "#5856d6" }]}>
              <Feather name="help-circle" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 2.4.0 (Build 302)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0d121c",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1961f0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: "#e0eaff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: "#1961f0",
    fontSize: 13,
    fontWeight: "600",
  },
  email: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "400",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  rowSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 68,
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: "#ff3b30",
    fontSize: 17,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
  },
});
