import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  MessageCircleMore,
  Video,
  History,
  Pill,
  LucideIcon,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function QuickActions() {
  return (
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.typography["0"],
    marginBottom: 12,
  },
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
