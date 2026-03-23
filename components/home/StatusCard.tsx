import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useDiagnosis } from "@/contexts/DiagnosisContext";
import { useAudio } from "@/contexts/AudioContext";

export default function StatusCard() {
  const router = useRouter();
  const { latestAudio, isLoading: audioLoading } = useAudio();
  const { diagnosisResult, isLoading: diagnosisLoading } = useDiagnosis();

  const isLoading = audioLoading || diagnosisLoading;

  const isNormal = diagnosisResult?.pred_name?.toLowerCase() === "normal";
  const hasResult = !!diagnosisResult;

  const statusText = !hasResult ? "Pending" : isNormal ? "Stable" : "Abnormal";
  // Fallbacks are provided in case warning/error variants aren't in your Colors constant yet
  const badgeColor = !hasResult
    ? (Colors as any).warning?.["950"] || "#422006"
    : isNormal
      ? Colors.success["950"]
      : (Colors as any).error?.["950"] || "#4c0519";
  const dotColor = !hasResult
    ? (Colors as any).warning?.["500"] || "#eab308"
    : isNormal
      ? Colors.success["500"]
      : (Colors as any).error?.["500"] || "#e11d48";
  const textColor = !hasResult
    ? (Colors as any).warning?.["200"] || "#fef08a"
    : isNormal
      ? Colors.success["200"]
      : (Colors as any).error?.["200"] || "#fecdd3";

  const title = diagnosisResult
    ? diagnosisResult.pred_name
    : "Pending Assessment";

  let dateString = "No recent assessment";
  if (latestAudio?.created) {
    const date = new Date(latestAudio.created);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      dateString = `Latest Assessment • Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      const dateMidnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const nowMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let timeText = "";
      if (diffDays === 1) {
        timeText = "Yesterday";
      } else if (diffDays < 30) {
        timeText = `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        timeText = `${months} ${months === 1 ? "month" : "months"} ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        timeText = `${years} ${years === 1 ? "year" : "years"} ago`;
      }

      dateString = `Latest Assessment • ${timeText}`;
    }
  }

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

        <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          <Text style={[styles.statusText, { color: textColor }]}>
            {statusText}
          </Text>
        </View>
      </View>

      <View style={styles.statusContent}>
        <View style={styles.statusHeader}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.info["200"]} />
          ) : (
            <>
              <Text style={styles.statusTitle}>{title}</Text>
              <Text style={styles.statusSubtitle}>{dateString}</Text>
            </>
          )}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.viewReportButton}
          onPress={() => {
            const reportId = diagnosisResult?.id || latestAudio?.id;
            if (reportId) {
              router.push(`/diagnosis/diagnosis-details?id=${reportId}`);
            }
          }}
        >
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
