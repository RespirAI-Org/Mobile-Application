import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ClipboardPen,
  XCircle,
} from "lucide-react-native";
import { Audio } from "expo-av";
import { audioService } from "@/services/audioService";
import { recordingService, RecordingRecord } from "@/services/recordingService";
import { Gap } from "@/constants/gap";
import { Colors } from "@/constants/colors";

// ─── Constants ────────────────────────────────────────────────────────────────

const BODY_POSITION_LABELS: Record<string, string> = {
  mitral: "Mitral",
  aortic: "Aortic",
  pulmonic: "Pulmonic",
  tricuspid: "Tricuspid",
};

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DoctorDiagnosisDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [audioMode, setAudioMode] = useState<"Raw" | "AI">("Raw");
  const [recording, setRecording] = useState<RecordingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  const waveformBars = React.useMemo(
    () => Array.from({ length: 30 }, () => Math.max(10, Math.min(40, Math.random() * 40 + 10))),
    [],
  );

  useEffect(() => {
    async function loadData() {
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      if (!id) { setIsLoading(false); return; }
      setIsLoading(true);
      const res = await recordingService.getRecordingById(id, "audio,result");
      if (res.success && res.data) setRecording(res.data);
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const audioRecord = recording?.expand?.audio;
  const diagResult = recording?.expand?.result;

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
            if (status.didJustFinish) { setIsPlaying(false); setPosition(0); }
          }
        },
      );
      setSound(newSound);
    } catch (e) {
      console.error("Error loading audio", e);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      await loadAudio();
    } else {
      isPlaying ? await sound.pauseAsync() : await sound.playAsync();
    }
  };

  const handleToggleConfirm = async () => {
    if (!recording) return;
    const next = !recording.confirmed;
    const action = next ? "confirm" : "unconfirm";
    Alert.alert(
      next ? "Confirm Diagnosis" : "Remove Confirmation",
      next
        ? "Mark this diagnosis as confirmed?"
        : "Remove your confirmation from this diagnosis?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: next ? "Confirm" : "Remove",
          style: next ? "default" : "destructive",
          onPress: async () => {
            setIsConfirming(true);
            const result = await recordingService.updateRecording(recording.id, {
              confirmed: next,
            });
            setIsConfirming(false);
            if (result.success && result.data) {
              setRecording(result.data);
            } else {
              Alert.alert("Error", `Failed to ${action} diagnosis. Please try again.`);
            }
          },
        },
      ],
    );
  };

  const formatTime = (millis: number) => {
    const s = Math.floor(millis / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ── Derived display values ──────────────────────────────────────────────────

  let diagnosisTitle = recording?.diagnosis_title || "Pending Analysis";
  let confidenceValue = recording?.confidence || 0;
  let severityText = "PENDING";
  let severityBg = "#f1f5f9";
  let severityColor = "#64748b";
  let probabilities = [
    { label: "Normal", value: 0, color: "#cbd5e1" },
    { label: "Wheezes", value: 0, color: "#cbd5e1" },
    { label: "Crackles", value: 0, color: "#cbd5e1" },
    { label: "Both", value: 0, color: "#cbd5e1" },
  ];

  if (recording?.severity) {
    const severityMap: Record<string, { text: string; bg: string; color: string }> = {
      normal:  { text: "NORMAL",            bg: "#dcfce7", color: "#15803d" },
      low:     { text: "LOW SEVERITY",      bg: "#dcfce7", color: "#15803d" },
      medium:  { text: "MODERATE SEVERITY", bg: "#fef9c3", color: "#a16207" },
      high:    { text: "HIGH SEVERITY",     bg: "#fee2e2", color: "#b91c1c" },
    };
    const s = severityMap[recording.severity];
    if (s) { severityText = s.text; severityBg = s.bg; severityColor = s.color; }
  }

  if (diagResult?.pred_name) {
    const predName = diagResult.pred_name.toLowerCase();
    if (!recording?.diagnosis_title) {
      if      (predName === "normal")   diagnosisTitle = "Healthy Lung Sounds";
      else if (predName === "wheezes")  diagnosisTitle = "Wheeze Detected";
      else if (predName === "crackles") diagnosisTitle = "Crackles Detected";
      else if (predName === "both")     diagnosisTitle = "Wheezes & Crackles Detected";
      else                              diagnosisTitle = diagResult.pred_name || "Unknown";
    }

    if (!recording?.confidence) {
      if      (predName === "normal")   confidenceValue = Math.round(diagResult.prob_normal   * 100);
      else if (predName === "wheezes")  confidenceValue = Math.round(diagResult.prob_wheezes  * 100);
      else if (predName === "crackles") confidenceValue = Math.round(diagResult.prob_crackles * 100);
      else if (predName === "both")     confidenceValue = Math.round(diagResult.prob_both     * 100);
    }

    if (!recording?.severity) {
      severityText  = predName === "normal" ? "NORMAL" : "MODERATE SEVERITY";
      severityBg    = predName === "normal" ? "#dcfce7" : "#fef9c3";
      severityColor = predName === "normal" ? "#15803d" : "#a16207";
    }

    probabilities = [
      { label: "Normal",   value: Math.round(diagResult.prob_normal   * 100) },
      { label: "Wheezes",  value: Math.round(diagResult.prob_wheezes  * 100) },
      { label: "Crackles", value: Math.round(diagResult.prob_crackles * 100) },
      { label: "Both",     value: Math.round(diagResult.prob_both     * 100) },
    ]
      .sort((a, b) => b.value - a.value)
      .map((p, i) => ({ ...p, color: i === 0 ? "#0da6f2" : "#cbd5e1" }));
  } else if (diagResult?.status === "queued" || diagResult?.status === "processing") {
    diagnosisTitle = "Processing...";
  }

  const bodyPositionLabel =
    BODY_POSITION_LABELS[recording?.body_position || ""] || recording?.body_position || "Unknown";

  const recordingDate = recording
    ? new Date(recording.created).toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      })
    : "";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#0d121c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Report</Text>
        <View style={styles.iconButton} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0da6f2" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Main result card ── */}
          <View style={styles.mainCard}>
            <View style={styles.badgeRow}>
              <View style={[styles.confirmedBadge, !recording?.confirmed && { backgroundColor: "#f1f5f9" }]}>
                {recording?.confirmed ? (
                  <CheckCircle2 size={12} color="#0da6f2" style={styles.badgeIcon} />
                ) : (
                  <Clock size={12} color="#64748b" style={styles.badgeIcon} />
                )}
                <Text style={[styles.confirmedText, !recording?.confirmed && { color: "#64748b" }]}>
                  {recording?.confirmed ? "CONFIRMED" : "PENDING REVIEW"}
                </Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
                <Text style={[styles.severityText, { color: severityColor }]}>{severityText}</Text>
              </View>
            </View>

            <Text style={styles.diagnosisTitle}>{diagnosisTitle}</Text>
            <Text style={styles.diagnosisSubtitle}>
              Recording taken at {bodyPositionLabel} position.
            </Text>
            {recordingDate ? (
              <Text style={styles.recordingDate}>{recordingDate}</Text>
            ) : null}

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence Score</Text>
              <Text style={styles.confidenceValue}>{confidenceValue}%</Text>
            </View>
          </View>

          {/* ── Symptom Probability ── */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Symptom Probability</Text>
            <View style={styles.card}>
              {probabilities.map((item) => (
                <View key={item.label} style={styles.probabilityRow}>
                  <View style={styles.probabilityHeader}>
                    <Text style={styles.probabilityLabel}>{item.label}</Text>
                    <Text style={[styles.probabilityValue, { color: item.color === "#0da6f2" ? "#0da6f2" : "#64748b" }]}>
                      {item.value}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${item.value}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── Audio Player ── */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Audio</Text>
            <View style={styles.card}>
              <View style={styles.audioTabs}>
                {(["Raw", "AI"] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.audioTab, audioMode === mode && styles.audioTabActive]}
                    onPress={() => setAudioMode(mode)}
                  >
                    <Text style={[styles.audioTabText, audioMode === mode && styles.audioTabTextActive]}>
                      {mode === "Raw" ? "Raw Audio" : "AI Filtered"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.waveformContainer}>
                {waveformBars.map((height, index) => {
                  const progress = duration > 0 ? position / duration : 0;
                  const isActive = index / waveformBars.length <= progress;
                  return (
                    <View
                      key={index}
                      style={[styles.waveformBar, { height, backgroundColor: isActive ? "#0da6f2" : "#cbd5e1" }]}
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
                      { width: duration > 0 ? `${(position / duration) * 100}%` : "0%" },
                    ]}
                  />
                  <View
                    style={[
                      styles.audioProgressKnob,
                      { left: duration > 0 ? `${(position / duration) * 100}%` : "0%" },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.audioControls}>
                <TouchableOpacity><SkipBack size={24} color="#94a3b8" /></TouchableOpacity>
                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  {isPlaying
                    ? <Pause size={24} color="#ffffff" fill="#ffffff" />
                    : <Play size={24} color="#ffffff" fill="#ffffff" />
                  }
                </TouchableOpacity>
                <TouchableOpacity><SkipForward size={24} color="#94a3b8" /></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── My Note ── */}
          {recording?.doctor_note ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>My Note</Text>
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteIconBox}>
                    <ClipboardPen size={18} color="#0da6f2" />
                  </View>
                  <Text style={styles.noteTitleText}>Doctor's Note</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.noteText}>{stripHtml(recording.doctor_note)}</Text>
              </View>
            </View>
          ) : null}

          {/* ── Confirm / Unconfirm ── */}
          {recording && (
            <View style={styles.confirmContainer}>
              {recording.confirmed ? (
                <TouchableOpacity
                  style={styles.unconfirmButton}
                  onPress={handleToggleConfirm}
                  disabled={isConfirming}
                  activeOpacity={0.8}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color={Colors.error["400"]} />
                  ) : (
                    <>
                      <XCircle size={18} color={Colors.error["400"]} />
                      <Text style={styles.unconfirmText}>Remove Confirmation</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleToggleConfirm}
                  disabled={isConfirming}
                  activeOpacity={0.8}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} color="#ffffff" />
                      <Text style={styles.confirmText}>Confirm Diagnosis</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    width: 40,
    alignItems: "center",
    justifyContent: "center",
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
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 2 },
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
  badgeIcon: { marginRight: 6 },
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
    lineHeight: 21,
  },
  recordingDate: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    marginBottom: 4,
  },
  confidenceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 16,
    marginTop: 12,
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
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  probabilityRow: { gap: 8 },
  probabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  probabilityLabel: { fontSize: 14, fontWeight: "600", color: "#0d121c" },
  probabilityValue: { fontSize: 14, fontWeight: "700" },
  progressBarBg: {
    height: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 6 },
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
  audioTabText: { fontSize: 12, fontWeight: "500", color: "#64748b" },
  audioTabTextActive: { color: "#0f172a", fontWeight: "700" },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    marginBottom: 8,
  },
  waveformBar: { width: 4, borderRadius: 2 },
  audioTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  audioTimeText: { fontSize: 10, color: "#94a3b8" },
  audioProgressContainer: { marginBottom: 20 },
  audioProgressBarBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    position: "relative",
    justifyContent: "center",
  },
  audioProgressBarFill: {
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
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  noteIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  noteTitleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d121c",
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
  confirmContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 12,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0da6f2",
    borderRadius: 12,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0da6f2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  unconfirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.error["950"],
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.error["900"],
  },
  unconfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error["400"],
  },
});
