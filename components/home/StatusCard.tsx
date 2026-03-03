import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function StatusCard() {
  return (
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
  );
}

const styles = StyleSheet.create({
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
});
