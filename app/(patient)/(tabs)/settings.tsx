import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { authService } from "../../../services/authService";

export default function SettingsScreen() {
  const handleLogout = () => {
    authService.logout();
    router.replace("/(auth)/Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/images/Doctor-ava.jpeg")}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>

          <Text style={styles.name}>Dr. Sarah Miller</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Provider</Text>
          </View>
          <Text style={styles.email}>sarah.miller@hospital.com</Text>
        </View>

        <Text style={styles.sectionTitle}>GENERAL</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#0da6f2" }]}
            >
              <Feather name="user" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Account Info</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#eb4d3d" }]}
            >
              <Feather name="bell" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Notifications</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>HARDWARE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#32ade6" }]}
            >
              <Feather name="activity" size={18} color="#ffffff" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Stethoscope Pro</Text>
              <Text style={styles.rowSubtitle}>Last synced: 2m ago</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Connected</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>LEGAL & SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#8e8e93" }]}
            >
              <Feather name="lock" size={18} color="#ffffff" />
            </View>
            <Text style={styles.rowTitle}>Privacy & Data</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#5856d6" }]}
            >
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
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: "#16a34a",
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
