import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  ArrowRight,
  Bluetooth,
  Repeat2,
  MessageCircleMore,
  Video,
  History,
  Pill,
  LucideIcon,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require("@/assets/images/Patient-ava.jpeg")}
                style={styles.profileImage}
              />
            </View>
            <View>
              <Text style={styles.greetingText}>Good Morning,</Text>
              <Text style={styles.userName}>Sarah</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={20} color={Colors.typography["0"]} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusImageContainer}>
            {/* Using a placeholder gradient-like image or dark medical background */}
            <Image
              source={require("@/assets/images/Patient-dashboard-background.webp")}
              style={styles.statusCardBackground}
            />
            {/* Gradient Simulation Overlay */}
            <View style={styles.statusOverlay} />

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Stable</Text>
            </View>
          </View>

          <View style={styles.statusContent}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Normal Sinus Rhythm</Text>
              <Text style={styles.statusSubtitle}>
                Latest Assessment • Today, 9:41 AM
              </Text>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.viewReportButton}>
              <Text style={styles.viewReportText}>View Full Report</Text>
              <ArrowRight size={18} color={Colors.info["200"]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stethoscope Card */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceTitle}>Stethoscope Connected</Text>
            <Text style={styles.deviceSubtitle}>
              Ready to record new sounds
            </Text>
          </View>
          <View style={styles.deviceIconContainer}>
            <Bluetooth size={24} color={Colors.typography.white} />
          </View>
        </View>

        {/* Doctor's Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{"Doctor's Note"}</Text>
          <View style={styles.noteCard}>
            <View style={styles.doctorHeader}>
              <Image
                source={require("@/assets/images/Doctor-ava.jpeg")}
                style={styles.doctorImage}
              />
              <View>
                <Text style={styles.doctorName}>Dr. Emily Chen</Text>
                <Text style={styles.doctorRole}>
                  Cardiologist • 2 hours ago
                </Text>
              </View>
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>
                Your heart sounds are clear. Please continue with the prescribed
                medication and record again in 3 days. Let me know if you feel
                any shortness of breath.
              </Text>
            </View>
            <TouchableOpacity style={styles.replyButton}>
              <Text style={styles.replyButtonText}>Reply to Doctor</Text>
              <Repeat2
                size={16}
                color={Colors.info["200"]}
                style={{ transform: [{ scaleX: 1 }] }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              Icon={MessageCircleMore}
              label="Message"
              color={Colors.info["950"]}
              iconColor={Colors.info["500"]}
            />
            <QuickActionButton
              Icon={Video}
              label="Video Call"
              color={Colors.error["950"]}
              iconColor={Colors.error["500"]}
            />
            <QuickActionButton
              Icon={History}
              label="History"
              color={Colors.warning["900"]}
              iconColor={Colors.warning["500"]}
            />
            <QuickActionButton
              Icon={Pill}
              label="Medication"
              color={Colors.success["950"]}
              iconColor={Colors.success["500"]}
            />
          </View>
        </View>

        {/* Padding for bottom nav */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionButton({
  Icon,
  label,
  color,
  iconColor,
}: {
  Icon: LucideIcon;
  label: string;
  color: string;
  iconColor: string;
}) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
        <Icon size={24} color={iconColor} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.background["950"],
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  greetingText: {
    fontSize: 18,
    color: Colors.typography["0"],
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  userName: {
    fontSize: 14,
    color: Colors.typography["200"],
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.background["950"],
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Status Card
  statusCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: Colors.background["950"],
    borderWidth: 1,
    borderColor: Colors.background["950"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusImageContainer: {
    height: 128,
    position: "relative",
    width: "100%",
  },
  statusCardBackground: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Simulates gradient/darkening
  },
  statusBadge: {
    position: "absolute",
    bottom: 12,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success["950"],
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success["500"],
    marginRight: 6,
  },
  statusText: {
    color: Colors.success["200"],
    fontSize: 12,
    fontWeight: "600",
  },
  statusContent: {
    padding: 20,
  },
  statusHeader: {
    marginBottom: 16,
    gap: 4,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  statusSubtitle: {
    fontSize: 14,
    color: Colors.typography["300"],
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outline["800"],
    marginBottom: 12,
    width: "100%",
  },
  viewReportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 8,
  },
  viewReportText: {
    color: Colors.info["200"],
    fontSize: 14,
    fontWeight: "700",
  },
  // Device Card
  deviceCard: {
    backgroundColor: "#10B981",
    // backgroundColor: Colors.success["600"],
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
  // Generic Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.typography["0"],
    marginBottom: 12,
  },
  // Note Card
  noteCard: {
    backgroundColor: Colors.background["950"],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline["900"],
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  doctorRole: {
    fontSize: 12,
    color: Colors.typography["200"],
    fontWeight: "400",
  },
  noteContent: {
    backgroundColor: Colors.background["900"],
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  noteText: {
    color: Colors.typography["100"],
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  replyButtonText: {
    color: Colors.info["200"],
    fontSize: 14,
    fontWeight: "600",
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    width: "47%", // roughly (100% - gap) / 2
    backgroundColor: Colors.background["950"],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.background["950"],
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 128,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.typography["0"],
  },
});
