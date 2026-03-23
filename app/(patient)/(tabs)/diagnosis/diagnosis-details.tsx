import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Share,
  CheckCircle2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { Audio } from "expo-av";
import { audioService } from "@/services/audioService";
import { diagnosisService, DiagnosisResult } from "@/services/diagnosisService";
import { Gap } from "@/constants/gap";

export default function DiagnosisDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeValve, setActiveValve] = useState("Mitral");
  const [audioMode, setAudioMode] = useState<"Raw" | "AI">("Raw");

  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [audioRecord, setAudioRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Simulated waveform bars
  const waveformBars = Array.from({ length: 30 }, (_, i) => {
    // Generate somewhat random heights for visual effect
    const height = Math.max(10, Math.min(40, Math.random() * 40 + 10));
    return height;
  });

  useEffect(() => {
    async function loadData() {
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);

      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      let fetchedResult = null;
      let fetchedAudio = null;

      const res = await diagnosisService.getResultById(id);
      if (res.success && res.data) {
        fetchedResult = res.data;
        const audioRes = await audioService.getAudioById(
          fetchedResult.audio_id,
        );
        if (audioRes.success && audioRes.data) {
          fetchedAudio = audioRes.data;
        }
      } else {
        const audioRes = await audioService.getAudioById(id);
        if (audioRes.success && audioRes.data) {
          fetchedAudio = audioRes.data;
          const res2 = await diagnosisService.getResultByAudioId(id);
          if (res2.success && res2.data) {
            fetchedResult = res2.data;
          }
        }
      }

      setResult(fetchedResult);
      setAudioRecord(fetchedAudio);
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudio = async () => {
    if (!audioRecord) return;
    const url = audioService.getAudioUrl(audioRecord);
    if (!url) return;

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        },
      );
      setSound(newSound);
    } catch (error) {
      console.error("Error loading audio", error);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      await loadAudio();
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  let diagnosisTitle = "Pending Analysis";
  let confidenceValue = 0;
  let severityText = "PENDING";
  let severityBg = "#f1f5f9";
  let severityColor = "#64748b";
  let probabilities = [
    { label: "Normal", value: 0, color: "#cbd5e1" },
    { label: "Wheezes", value: 0, color: "#cbd5e1" },
    { label: "Crackles", value: 0, color: "#cbd5e1" },
    { label: "Both", value: 0, color: "#cbd5e1" },
  ];

  if (result && result.status === "completed") {
    const predName = result.pred_name?.toLowerCase();
    if (predName === "normal") {
      diagnosisTitle = "Healthy Lung Sounds";
      confidenceValue = Math.round(result.prob_normal * 100);
      severityText = "NORMAL";
      severityBg = "#dcfce7";
      severityColor = "#15803d";
    } else if (predName === "wheezes") {
      diagnosisTitle = "Wheeze Detected";
      confidenceValue = Math.round(result.prob_wheezes * 100);
      severityText = "MODERATE SEVERITY";
      severityBg = "#fef9c3";
      severityColor = "#a16207";
    } else if (predName === "crackles") {
      diagnosisTitle = "Crackles Detected";
      confidenceValue = Math.round(result.prob_crackles * 100);
      severityText = "MODERATE SEVERITY";
      severityBg = "#fef9c3";
      severityColor = "#a16207";
    } else if (predName === "both") {
      diagnosisTitle = "Wheezes & Crackles Detected";
      confidenceValue = Math.round(result.prob_both * 100);
      severityText = "HIGH SEVERITY";
      severityBg = "#fee2e2";
      severityColor = "#b91c1c";
    } else {
      diagnosisTitle = result.pred_name || "Unknown";
      confidenceValue = 0;
      severityText = "UNKNOWN";
    }

    probabilities = [
      { label: "Normal", value: Math.round(result.prob_normal * 100) },
      { label: "Wheezes", value: Math.round(result.prob_wheezes * 100) },
      { label: "Crackles", value: Math.round(result.prob_crackles * 100) },
      { label: "Both", value: Math.round(result.prob_both * 100) },
    ]
      .sort((a, b) => b.value - a.value)
      .map((p, index) => ({
        ...p,
        color: index === 0 ? "#0da6f2" : "#cbd5e1",
      }));
  } else if (result && result.status === "failed") {
    diagnosisTitle = "Analysis Failed";
    severityText = "FAILED";
    severityBg = "#fee2e2";
    severityColor = "#b91c1c";
  }

  return (
    // <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
    <View style={styles.container}>
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

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0da6f2" />
        </View>
      ) : (
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
              <View
                style={[styles.severityBadge, { backgroundColor: severityBg }]}
              >
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {severityText}
                </Text>
              </View>
            </View>

            <Text style={styles.diagnosisTitle}>{diagnosisTitle}</Text>
            <Text style={styles.diagnosisSubtitle}>
              Recording taken at {activeValve} Valve position.
            </Text>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence Score</Text>
              <Text style={styles.confidenceValue}>{confidenceValue}%</Text>
            </View>
          </View>

          {/* Valve Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.valveSelectorContainer}
            style={styles.valveSelectorScrollView}
          >
            {[
              "Left Upper Lobe",
              "Right Upper Lobe",
              "Left Interscapular",
              "Right Interscapular",
              "Left Lower Lobe",
              "RIght Lower Lobe",
            ].map((valve) => (
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
            ))}
          </ScrollView>

          {/* Symptom Probability */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Symptom Probability</Text>
            <View style={styles.card}>
              {probabilities.map((item, index) => (
                <View key={item.label} style={styles.probabilityRow}>
                  <View style={styles.probabilityHeader}>
                    <Text style={styles.probabilityLabel}>{item.label}</Text>
                    <Text
                      style={[
                        styles.probabilityValue,
                        {
                          color:
                            item.color === "#0da6f2" ? "#0da6f2" : "#64748b",
                        },
                      ]}
                    >
                      {item.value}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        },
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
                {waveformBars.map((height, index) => {
                  const progress = duration > 0 ? position / duration : 0;
                  const isActive = index / waveformBars.length <= progress;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.waveformBar,
                        {
                          height,
                          backgroundColor: isActive ? "#0da6f2" : "#cbd5e1",
                        },
                      ]}
                    />
                  );
                })}
              </View>

              <View style={styles.audioTimeContainer}>
                <Text style={styles.audioTimeText}>{formatTime(position)}</Text>
                <Text style={styles.audioTimeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.audioProgressContainer}>
                <View style={styles.audioProgressBarBg}>
                  <View
                    style={[
                      styles.audioProgressBarFill,
                      {
                        width:
                          duration > 0
                            ? `${(position / duration) * 100}%`
                            : "0%",
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.audioProgressKnob,
                      {
                        left:
                          duration > 0
                            ? `${(position / duration) * 100}%`
                            : "0%",
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.audioControls}>
                <TouchableOpacity>
                  <SkipBack size={24} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause size={24} color="#ffffff" fill="#ffffff" />
                  ) : (
                    <Play size={24} color="#ffffff" fill="#ffffff" />
                  )}
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
                    source={require("@/assets/images/Doctor-ava.jpeg")}
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>Dr. Emily Chen</Text>
                  <Text style={styles.doctorMeta}>
                    Cardiologist • Today, 10:42 AM
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.noteText}>
                Patient exhibits wheezing at the left upper lobe position.
                Moderate severity detected with 40% confidence. Crackles remain
                a secondary possibility. Recommend respiratory follow-up and
                clinical correlation.
              </Text>
            </View>
          </View>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              AI analysis is for reference only and does not replace
              professional diagnosis.{"\n"}
              Please consult with a certified medical professional.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Gap.medium,
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
