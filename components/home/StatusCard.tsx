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
import { RecordingRecord } from "@/services/recordingService";

interface Props {
  recording: RecordingRecord | null;
  isLoading: boolean;
}

function deriveTitleFromPredName(predName: string): string {
  switch (predName.toLowerCase()) {
    case "normal":   return "Healthy Lung Sounds";
    case "wheezes":  return "Wheeze Detected";
    case "crackles": return "Crackles Detected";
    case "both":     return "Wheezes & Crackles Detected";
    default:         return predName;
  }
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Latest Assessment • Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  const diffDays = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );
  if (diffDays === 1) return "Latest Assessment • Yesterday";
  if (diffDays < 30) return `Latest Assessment • ${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `Latest Assessment • ${months} ${months === 1 ? "month" : "months"} ago`;
  const years = Math.floor(diffDays / 365);
  return `Latest Assessment • ${years} ${years === 1 ? "year" : "years"} ago`;
}

export default function StatusCard({ recording, isLoading }: Props) {
  const router = useRouter();

  const predName = recording?.expand?.result?.pred_name?.toLowerCase() ?? "";
  const severity = recording?.severity;

  const isNormal = severity === "normal" || (!severity && predName === "normal");
  const isProcessing =
    !severity &&
    !predName &&
    recording?.expand?.result?.status &&
    ["queued", "processing"].includes(recording.expand.result.status);

  let title = "Pending Assessment";
  if (recording) {
    if (recording.diagnosis_title) {
      title = recording.diagnosis_title;
    } else if (isProcessing) {
      title = "Processing…";
    } else if (predName) {
      title = deriveTitleFromPredName(predName);
    }
  }

  const statusText = !recording ? "Pending" : isNormal ? "Stable" : "Abnormal";

  const badgeColor = !recording
    ? (Colors as any).warning?.["950"] ?? "#422006"
    : isNormal
      ? Colors.success["950"]
      : (Colors as any).error?.["950"] ?? "#4c0519";
  const dotColor = !recording
    ? (Colors as any).warning?.["500"] ?? "#eab308"
    : isNormal
      ? Colors.success["500"]
      : (Colors as any).error?.["500"] ?? "#e11d48";
  const textColor = !recording
    ? (Colors as any).warning?.["200"] ?? "#fef08a"
    : isNormal
      ? Colors.success["200"]
      : (Colors as any).error?.["200"] ?? "#fecdd3";

  const dateString = recording?.created
    ? formatRelativeDate(recording.created)
    : "No recent assessment";

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusImageContainer}>
        <Image
          source={require("@/assets/images/Patient-dashboard-background.webp")}
          style={styles.statusCardBackground}
        />
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
            if (recording?.id) {
              router.push(`/diagnosis/diagnosis-details?id=${recording.id}`);
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  statusBadge: {
    position: "absolute",
    bottom: 12,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 6,
  },
  statusText: {
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
