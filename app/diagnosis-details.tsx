import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share,
  CheckCircle2,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react-native";

export default function DiagnosisDetailsScreen() {
  const router = useRouter();
  const [activeValve, setActiveValve] = useState("Mitral");
  const [audioMode, setAudioMode] = useState<"Raw" | "AI">("Raw");

  // Simulated waveform bars
  const waveformBars = Array.from({ length: 30 }, (_, i) => {
    // Generate somewhat random heights for visual effect
    const height = Math.max(10, Math.min(40, Math.random() * 40 + 10));
    return height;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color="#0d121c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Report</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Share size={24} color="#0d121c" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Result Card */}
        <View style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View style={styles.confirmedBadge}>
              <CheckCircle2
                size={12}
                color="#0da6f2"
                style={styles.badgeIcon}
              />
              <Text style={styles.confirmedText}>CONFIRMED</Text>
            </View>
            <View style={styles.severityBadge}>
              <Text style={styles.severityText}>HIGH SEVERITY</Text>
            </View>
          </View>

          <Text style={styles.diagnosisTitle}>Systolic Murmur Detected</Text>
          <Text style={styles.diagnosisSubtitle}>
            Recording taken at Mitral Valve position.
          </Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Score</Text>
            <Text style={styles.confidenceValue}>92%</Text>
          </View>
        </View>

        {/* Valve Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.valveSelectorContainer}
          style={styles.valveSelectorScrollView}
        >
          {["Mitral", "Aortic", "Pulmonic", "Tricuspid", "Erb's Point"].map(
            (valve) => (
              <TouchableOpacity
                key={valve}
                style={[
                  styles.valveButton,
                  activeValve === valve && styles.valveButtonActive,
                ]}
                onPress={() => setActiveValve(valve)}
              >
                <Text
                  style={[
                    styles.valveButtonText,
                    activeValve === valve && styles.valveButtonTextActive,
                  ]}
                >
                  {valve}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>

        {/* Symptom Probability */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Symptom Probability</Text>
          <View style={styles.card}>
            {[
              { label: "Murmur", value: 92, color: "#0da6f2" },
              { label: "Normal", value: 5, color: "#cbd5e1" },
              { label: "Stenosis", value: 2, color: "#cbd5e1" },
              { label: "Other", value: 1, color: "#cbd5e1" },
            ].map((item, index) => (
              <View key={item.label} style={styles.probabilityRow}>
                <View style={styles.probabilityHeader}>
                  <Text style={styles.probabilityLabel}>{item.label}</Text>
                  <Text
                    style={[
                      styles.probabilityValue,
                      { color: item.value > 50 ? "#0da6f2" : "#64748b" },
                    ]}
                  >
                    {item.value}%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${item.value}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Audio Player */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Audio</Text>
          <View style={styles.card}>
            <View style={styles.audioTabs}>
              <TouchableOpacity
                style={[
                  styles.audioTab,
                  audioMode === "Raw" && styles.audioTabActive,
                ]}
                onPress={() => setAudioMode("Raw")}
              >
                <Text
                  style={[
                    styles.audioTabText,
                    audioMode === "Raw" && styles.audioTabTextActive,
                  ]}
                >
                  Raw Audio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.audioTab,
                  audioMode === "AI" && styles.audioTabActive,
                ]}
                onPress={() => setAudioMode("AI")}
              >
                <Text
                  style={[
                    styles.audioTabText,
                    audioMode === "AI" && styles.audioTabTextActive,
                  ]}
                >
                  AI Filtered
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.waveformContainer}>
              {waveformBars.map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      height,
                      backgroundColor: index < 12 ? "#0da6f2" : "#cbd5e1",
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.audioTimeContainer}>
              <Text style={styles.audioTimeText}>00:05</Text>
              <Text style={styles.audioTimeText}>00:15</Text>
            </View>

            <View style={styles.audioProgressContainer}>
              <View style={styles.audioProgressBarBg}>
                <View style={styles.audioProgressBarFill} />
                <View style={styles.audioProgressKnob} />
              </View>
            </View>

            <View style={styles.audioControls}>
              <TouchableOpacity>
                <SkipBack size={24} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton}>
                <Play size={24} color="#ffffff" fill="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity>
                <SkipForward size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Doctor's Note */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Doctor&apos;s Note</Text>
          <View style={styles.noteCard}>
            <View style={styles.doctorHeader}>
              <View style={styles.avatarPlaceholder}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?u=dr_sarah" }}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Sarah Smith</Text>
                <Text style={styles.doctorMeta}>
                  Cardiologist • Today, 10:42 AM
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.noteText}>
              Patient exhibits clear signs of Grade 2 systolic murmur.{"\n"}
              The S1 sound is distinct but S2 is partially obscured.{"\n"}
              Recommend follow-up echocardiogram to confirm severity.
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            AI analysis is for reference only and does not replace professional
            diagnosis.{"\n"}
            Please consult with a certified medical professional.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0d121c",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f6f6f8",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1961f01a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeIcon: {
    marginRight: 6,
  },
  confirmedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0da6f2",
    letterSpacing: 0.6,
  },
  severityBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b91c1c",
    letterSpacing: 0.3,
  },
  diagnosisTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0d121c",
    marginBottom: 8,
    lineHeight: 30,
  },
  diagnosisSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 21,
  },
  confidenceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0da6f2",
  },
  valveSelectorScrollView: {
    maxHeight: 60,
  },
  valveSelectorContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  valveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  valveButtonActive: {
    backgroundColor: "#0da6f2",
    borderColor: "#0da6f2",
    shadowColor: "#1961f0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  valveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  valveButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0d121c",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  probabilityRow: {
    gap: 8,
  },
  probabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  probabilityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0d121c",
  },
  probabilityValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  audioTabs: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  audioTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
  },
  audioTabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  audioTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  audioTabTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    marginBottom: 8,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  audioTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  audioTimeText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  audioProgressContainer: {
    marginBottom: 20,
  },
  audioProgressBarBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    position: "relative",
    justifyContent: "center",
  },
  audioProgressBarFill: {
    width: "35%",
    height: "100%",
    backgroundColor: "#0da6f2",
    borderRadius: 3,
  },
  audioProgressKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#0da6f2",
    position: "absolute",
    left: "35%",
    marginLeft: -8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audioControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0da6f2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0da6f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  noteCard: {
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    marginRight: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d121c",
  },
  doctorMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#bfdbfe",
    opacity: 0.5,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#0d121c",
    lineHeight: 22,
  },
  disclaimerContainer: {
    paddingHorizontal: 32,
    marginTop: 12,
  },
  disclaimerText: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 15,
  },
});
