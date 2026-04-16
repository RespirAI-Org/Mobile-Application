import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  MessageCircleMore,
  Activity,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  UserRound,
  ClipboardList,
  Video,
  MapPin,
  Stethoscope,
  BadgeCheck,
  FileText,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { patientService, PatientRecord } from "@/services/patientService";
import { recordingService, RecordingRecord } from "@/services/recordingService";
import { messagingService } from "@/services/messagingService";
import { authService } from "@/services/authService";

// ─── Helpers ──────────────────────────────────────────────────────────────────


/** Strip HTML tags produced by PocketBase's `editor` field type. */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatRecordingDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_PALETTE = [
  { bg: Colors.info["900"], text: Colors.info["200"] },
  { bg: Colors.background["800"], text: Colors.typography["200"] },
  { bg: Colors.error["900"], text: Colors.error["300"] },
  { bg: Colors.success["900"], text: Colors.success["300"] },
  { bg: Colors.warning["900"], text: Colors.warning["200"] },
];

function avatarColors(name: string) {
  const idx = (name || " ").charCodeAt(0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

const LOCATION_LABELS: Record<string, string> = {
  at_hospital: "At Hospital",
  at_home: "At Home",
  clinic_visit: "Clinic Visit",
};

const POSITION_LABELS: Record<string, string> = {
  mitral: "Mitral",
  aortic: "Aortic",
  pulmonic: "Pulmonic",
  tricuspid: "Tricuspid",
};

const STATUS_LABELS: Record<PatientRecord["status"], string> = {
  review: "Needs Review",
  follow_up: "Follow-up",
  normal: "Normal",
};

function getPatientStatusStyle(status: PatientRecord["status"]) {
  if (status === "review")
    return { bg: Colors.error["950"], text: Colors.error["400"], dot: Colors.error["400"] };
  if (status === "follow_up")
    return { bg: Colors.warning["950"], text: Colors.warning["400"], dot: Colors.warning["400"] };
  return { bg: Colors.success["950"], text: Colors.success["400"], dot: Colors.success["400"] };
}

// ─── Recording analysis helpers ───────────────────────────────────────────────

type DiagnosisStatus = "Abnormal" | "Normal" | "Review";

interface AnalysisResult {
  status: DiagnosisStatus;
  result: string;
  confidence: number;
  probNormal: number;
  probCrackles: number;
  probWheezes: number;
  probBoth: number;
}

function getAnalysisResult(recording: RecordingRecord): AnalysisResult {
  const diagResult = recording.expand?.result;
  let status: DiagnosisStatus = "Review";
  let result = "Pending Analysis";
  let confidence = recording.confidence || 0;
  let probNormal = 0, probCrackles = 0, probWheezes = 0, probBoth = 0;

  if (diagResult) {
    probNormal = Math.round((diagResult.prob_normal || 0) * 100);
    probCrackles = Math.round((diagResult.prob_crackles || 0) * 100);
    probWheezes = Math.round((diagResult.prob_wheezes || 0) * 100);
    probBoth = Math.round((diagResult.prob_both || 0) * 100);

    if (diagResult.pred_name) {
      const pred = diagResult.pred_name.toLowerCase();
      if (pred === "normal") {
        status = "Normal";
        result = "Healthy Lung Sounds";
        if (!recording.confidence) confidence = probNormal;
      } else if (pred === "wheezes") {
        status = "Abnormal";
        result = "Wheeze Detected";
        if (!recording.confidence) confidence = probWheezes;
      } else if (pred === "crackles") {
        status = "Abnormal";
        result = "Crackles Detected";
        if (!recording.confidence) confidence = probCrackles;
      } else if (pred === "both") {
        status = "Abnormal";
        result = "Wheezes & Crackles";
        if (!recording.confidence) confidence = probBoth;
      }
    } else if (diagResult.status === "queued" || diagResult.status === "processing") {
      result = "Processing…";
    }
  }

  if (recording.diagnosis_title) result = recording.diagnosis_title;
  return { status, result, confidence, probNormal, probCrackles, probWheezes, probBoth };
}

function getStatusTheme(status: DiagnosisStatus) {
  switch (status) {
    case "Abnormal":
      return {
        text: Colors.error["400"],
        bg: Colors.error["950"],
        border: Colors.error["900"],
        bar: Colors.error["500"],
        icon: AlertCircle,
      };
    case "Normal":
      return {
        text: Colors.success["400"],
        bg: Colors.success["950"],
        border: Colors.success["900"],
        bar: Colors.success["500"],
        icon: CheckCircle2,
      };
    case "Review":
      return {
        text: Colors.warning["400"],
        bg: Colors.warning["950"],
        border: Colors.warning["900"],
        bar: Colors.warning["500"],
        icon: AlertTriangle,
      };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={probStyles.row}>
      <View style={probStyles.labelRow}>
        <Text style={probStyles.label}>{label}</Text>
        <Text style={[probStyles.value, { color }]}>{value}%</Text>
      </View>
      <View style={probStyles.track}>
        <View style={[probStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const probStyles = StyleSheet.create({
  row: { gap: 5 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 13, color: Colors.typography["200"], fontWeight: "500" },
  value: { fontSize: 13, fontWeight: "700" },
  track: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: Radius.round,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: Radius.round },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PatientProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [patientResult, recordingsResult] = await Promise.all([
      patientService.getPatientById(id),
      recordingService.getRecordingsByPatient(id, "result"),
    ]);
    if (patientResult.success && patientResult.data) {
      setPatient(patientResult.data);
    }
    if (recordingsResult.success && recordingsResult.data) {
      setRecordings(recordingsResult.data);
    }
  }, [id]);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleMessage = useCallback(async () => {
    if (!patient?.user) return;
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;
    setIsMessaging(true);
    const result = await messagingService.getOrCreateConversation([
      currentUser.id,
      patient.user,
    ]);
    setIsMessaging(false);
    if (result.success && result.data) {
      router.navigate(`/(doctor)/(tabs)/messages` as any);
    }
  }, [patient, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.info["400"]} />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Patient not found.</Text>
      </View>
    );
  }

  const avatarUrl = patientService.getAvatarUrl(patient);
  const colors = avatarColors(patient.full_name);
  const age: number | null = patient.age ?? null;
  const patientStatus = getPatientStatusStyle(patient.status);
  const gender = patient.gender
    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
    : null;

  const latestRec = recordings[0] ?? null;
  const previousRecs = recordings.slice(1, 5);

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={Colors.typography["0"]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Profile</Text>
        <View style={styles.headerIconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Hero Card ── */}
        <View style={styles.heroCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
                <Text style={[styles.avatarInitials, { color: colors.text }]}>
                  {getInitials(patient.full_name)}
                </Text>
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: patientStatus.dot }]} />
          </View>

          <Text style={styles.patientName}>{patient.full_name}</Text>

          <View style={[styles.statusPill, { backgroundColor: patientStatus.bg }]}>
            <View style={[styles.statusPillDot, { backgroundColor: patientStatus.dot }]} />
            <Text style={[styles.statusPillText, { color: patientStatus.text }]}>
              {STATUS_LABELS[patient.status]}
            </Text>
          </View>

          {(gender || age !== null) && (
            <Text style={styles.demographics}>
              {[gender, age !== null ? `${age} years old` : null].filter(Boolean).join(" · ")}
            </Text>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            {patient.user && (
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={handleMessage}
                disabled={isMessaging}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.info["950"] }]}>
                  <MessageCircleMore size={20} color={Colors.info["400"]} />
                </View>
                <Text style={styles.quickActionLabel}>Message</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#f3e8ff" }]}>
                <Video size={20} color="#9333ea" />
              </View>
              <Text style={styles.quickActionLabel}>Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.warning["950"] }]}>
                <FileText size={20} color={Colors.warning["400"]} />
              </View>
              <Text style={styles.quickActionLabel}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Patient Info ── */}
        <Text style={styles.sectionLabel}>PATIENT INFO</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.info["950"] }]}>
              <CalendarDays size={16} color={Colors.info["400"]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {age !== null ? `${age} years old` : "—"}
              </Text>
            </View>
          </View>

          {gender && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBox, { backgroundColor: Colors.success["950"] }]}>
                  <UserRound size={16} color={Colors.success["400"]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{gender}</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: patientStatus.bg }]}>
              <Stethoscope size={16} color={patientStatus.dot} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Current Status</Text>
              <Text style={[styles.infoValue, { color: patientStatus.text }]}>
                {STATUS_LABELS[patient.status]}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Medical History ── */}
        {!!patient.medical_history && (
          <>
            <Text style={styles.sectionLabel}>MEDICAL HISTORY</Text>
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <ClipboardList size={18} color={Colors.info["400"]} />
                <Text style={styles.historyHeaderText}>Patient Notes</Text>
              </View>
              <Text style={styles.historyText}>{stripHtml(patient.medical_history)}</Text>
            </View>
          </>
        )}

        {/* ── Latest Analysis ── */}
        <View style={styles.analysisSectionRow}>
          <Text style={styles.sectionLabel}>LATEST ANALYSIS</Text>
          <Text style={styles.recordingCountText}>
            {recordings.length} recording{recordings.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {recordings.length === 0 ? (
          <View style={styles.emptyAnalysis}>
            <Activity size={36} color={Colors.typography["400"]} />
            <Text style={styles.emptyAnalysisTitle}>No Recordings Yet</Text>
            <Text style={styles.emptyAnalysisSubtitle}>
              Recordings from this patient will appear here.
            </Text>
          </View>
        ) : (
          <>
            {/* Featured latest recording */}
            {latestRec && (
              <FeaturedRecordingCard
                recording={latestRec}
                onPress={() =>
                  router.push({
                    pathname: "/(doctor)/(tabs)/diagnosis/diagnosis-details" as any,
                    params: { id: latestRec.id },
                  })
                }
              />
            )}

            {/* Previous recordings */}
            {previousRecs.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: Gap.small }]}>
                  PREVIOUS RECORDINGS
                </Text>
                <View style={styles.recordingList}>
                  {previousRecs.map((rec) => (
                    <CompactRecordingCard
                      key={rec.id}
                      recording={rec}
                      onPress={() =>
                        router.push({
                          pathname: "/(doctor)/(tabs)/diagnosis/diagnosis-details" as any,
                          params: { id: rec.id },
                        })
                      }
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Bottom spacer */}
        <View style={{ height: Gap.small }} />
      </ScrollView>
    </View>
  );
}

// ─── Featured Recording Card ──────────────────────────────────────────────────

function FeaturedRecordingCard({ recording, onPress }: { recording: RecordingRecord; onPress: () => void }) {
  const analysis = getAnalysisResult(recording);
  const theme = getStatusTheme(analysis.status);
  const ResultIcon = theme.icon;
  const hasProbData =
    analysis.probNormal > 0 ||
    analysis.probCrackles > 0 ||
    analysis.probWheezes > 0 ||
    analysis.probBoth > 0;

  return (
    <TouchableOpacity style={featStyles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Card header: location + date + status badge */}
      <View style={featStyles.headerRow}>
        <View style={featStyles.headerLeft}>
          <View style={[featStyles.iconCircle, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Activity size={22} color={theme.bar} />
          </View>
          <View style={featStyles.headerMeta}>
            <View style={featStyles.locationRow}>
              <MapPin size={12} color={Colors.typography["400"]} />
              <Text style={featStyles.locationText}>
                {LOCATION_LABELS[recording.location] || recording.location || "Unknown"}
              </Text>
              {recording.body_position && (
                <>
                  <Text style={featStyles.locationSep}>·</Text>
                  <Text style={featStyles.locationText}>
                    {POSITION_LABELS[recording.body_position] || recording.body_position}
                  </Text>
                </>
              )}
            </View>
            <Text style={featStyles.dateText}>{formatRecordingDate(recording.created)}</Text>
          </View>
        </View>
        <View style={[featStyles.statusBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Text style={[featStyles.statusBadgeText, { color: theme.text }]}>
            {analysis.status}
          </Text>
        </View>
      </View>

      {/* Confirmed badge */}
      {recording.confirmed && (
        <View style={featStyles.confirmedBadge}>
          <BadgeCheck size={13} color={Colors.info["400"]} />
          <Text style={featStyles.confirmedText}>CONFIRMED BY DOCTOR</Text>
        </View>
      )}

      {/* Result summary */}
      <View style={[featStyles.resultBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <View style={featStyles.resultRow}>
          <View style={featStyles.resultLeft}>
            <ResultIcon size={16} color={theme.text} />
            <Text style={[featStyles.resultTitle, { color: theme.text }]}>{analysis.result}</Text>
          </View>
          <Text style={[featStyles.confidenceValue, { color: theme.text }]}>
            {analysis.confidence}%
          </Text>
        </View>
        <View style={featStyles.progressTrack}>
          <View style={[featStyles.progressFill, { width: `${analysis.confidence}%`, backgroundColor: theme.bar }]} />
        </View>
        <Text style={featStyles.confidenceLabel}>Confidence Score</Text>
      </View>

      {/* AI Probability Breakdown */}
      {hasProbData && (
        <View style={featStyles.probSection}>
          <Text style={featStyles.probTitle}>Symptom Probability</Text>
          <View style={featStyles.probList}>
            <ProbabilityBar
              label="Normal"
              value={analysis.probNormal}
              color={Colors.success["400"]}
            />
            <ProbabilityBar
              label="Wheezes"
              value={analysis.probWheezes}
              color={Colors.warning["400"]}
            />
            <ProbabilityBar
              label="Crackles"
              value={analysis.probCrackles}
              color={Colors.error["400"]}
            />
            <ProbabilityBar
              label="Wheezes & Crackles"
              value={analysis.probBoth}
              color={Colors.error["300"]}
            />
          </View>
        </View>
      )}

      {/* Doctor's Note */}
      {!!recording.doctor_note && (
        <View style={featStyles.noteBox}>
          <Text style={featStyles.noteLabel}>Doctor&apos;s Note</Text>
          <Text style={featStyles.noteText}>{stripHtml(recording.doctor_note)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const featStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: Gap.mediumSmall,
    gap: Gap.extraSmall,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.extraSmall,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerMeta: { gap: 3, flex: 1 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13, fontWeight: "600", color: Colors.typography["100"] },
  locationSep: { fontSize: 13, color: Colors.typography["400"] },
  dateText: { fontSize: 12, color: Colors.typography["400"] },
  statusBadge: {
    paddingHorizontal: Gap.xxSmall,
    paddingVertical: 4,
    borderRadius: Radius.round,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.info["950"],
    paddingHorizontal: Gap.xxSmall,
    paddingVertical: 5,
    borderRadius: Radius.extraSmall,
    alignSelf: "flex-start",
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.info["400"],
    letterSpacing: 0.5,
  },
  resultBox: {
    borderRadius: Radius.extraSmall,
    padding: Gap.extraSmall,
    borderWidth: 1,
    gap: Gap.xxSmall,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  resultTitle: { fontSize: 15, fontWeight: "700" },
  confidenceValue: { fontSize: 22, fontWeight: "800" },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: Radius.round,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: Radius.round },
  confidenceLabel: { fontSize: 11, color: Colors.typography["400"], fontWeight: "500" },
  probSection: {
    backgroundColor: "#f8fafc",
    borderRadius: Radius.extraSmall,
    padding: Gap.extraSmall,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: Gap.xxSmall,
  },
  probTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.typography["300"],
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  probList: { gap: Gap.xxSmall },
  noteBox: {
    backgroundColor: Colors.info["950"],
    borderRadius: Radius.extraSmall,
    padding: Gap.extraSmall,
    gap: 5,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.info["300"],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noteText: { fontSize: 13, color: Colors.info["100"], lineHeight: 20 },
});

// ─── Compact Recording Card ───────────────────────────────────────────────────

function CompactRecordingCard({ recording, onPress }: { recording: RecordingRecord; onPress: () => void }) {
  const analysis = getAnalysisResult(recording);
  const theme = getStatusTheme(analysis.status);
  const ResultIcon = theme.icon;

  return (
    <TouchableOpacity style={compactStyles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[compactStyles.iconBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <Activity size={18} color={theme.bar} />
      </View>
      <View style={compactStyles.content}>
        <View style={compactStyles.topRow}>
          <Text style={compactStyles.location} numberOfLines={1}>
            {LOCATION_LABELS[recording.location] || recording.location || "Unknown"}
          </Text>
          <View style={[compactStyles.badge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text style={[compactStyles.badgeText, { color: theme.text }]}>{analysis.status}</Text>
          </View>
        </View>
        <View style={compactStyles.resultRow}>
          <ResultIcon size={13} color={theme.text} />
          <Text style={compactStyles.resultText} numberOfLines={1}>{analysis.result}</Text>
          <Text style={compactStyles.confidenceText}>{analysis.confidence}%</Text>
        </View>
        <View style={compactStyles.progressTrack}>
          <View style={[compactStyles.progressFill, { width: `${analysis.confidence}%`, backgroundColor: theme.bar }]} />
        </View>
        <Text style={compactStyles.dateText}>{formatRecordingDate(recording.created)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const compactStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: Gap.extraSmall,
    gap: Gap.extraSmall,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 2,
  },
  content: { flex: 1, gap: 4 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: { fontSize: 14, fontWeight: "700", color: Colors.typography["0"], flex: 1 },
  badge: {
    paddingHorizontal: Gap.xxSmall,
    paddingVertical: 2,
    borderRadius: Radius.round,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  resultText: { fontSize: 13, fontWeight: "500", color: Colors.typography["100"], flex: 1 },
  confidenceText: { fontSize: 12, fontWeight: "700", color: Colors.typography["300"] },
  progressTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: Radius.round,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: Radius.round },
  dateText: { fontSize: 11, color: Colors.typography["400"] },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background.light },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.light,
  },
  errorText: { fontSize: 16, color: Colors.typography["400"] },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Gap.small,
    paddingTop: Gap.medium,
    paddingBottom: Gap.extraSmall,
    backgroundColor: Colors.background["950"],
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.typography["0"],
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Gap.mediumSmall,
    paddingTop: Gap.mediumSmall,
    paddingBottom: Gap.large,
    gap: Gap.extraSmall,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: Gap.mediumSmall,
    paddingHorizontal: Gap.small,
    alignItems: "center",
    gap: Gap.xxSmall,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: Gap.xxSmall,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 30, fontWeight: "700" },
  statusDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.background["950"],
  },
  patientName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.typography["0"],
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Gap.extraSmall,
    paddingVertical: 5,
    borderRadius: Radius.round,
  },
  statusPillDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: 13, fontWeight: "600" },
  demographics: {
    fontSize: 14,
    color: Colors.typography["300"],
    textAlign: "center",
    marginTop: 2,
  },

  // Quick Actions row inside hero
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Gap.medium,
    marginTop: Gap.xxSmall,
    paddingTop: Gap.xxSmall,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignSelf: "stretch",
  },
  quickActionBtn: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.typography["200"],
  },

  // Section labels
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.typography["300"],
    letterSpacing: 0.8,
    marginTop: Gap.extraSmall,
  },
  analysisSectionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: Gap.extraSmall,
  },
  recordingCountText: { fontSize: 13, color: Colors.typography["400"], marginBottom: 1 },

  // Info card
  infoCard: {
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Gap.small,
    paddingVertical: Gap.extraSmall,
    gap: Gap.extraSmall,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.extraSmall,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.typography["400"], marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "500", color: Colors.typography["0"] },
  infoDivider: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 66 },

  // History card
  historyCard: {
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: Gap.small,
    gap: Gap.xxSmall,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  historyHeader: { flexDirection: "row", alignItems: "center", gap: Gap.xxSmall },
  historyHeaderText: { fontSize: 14, fontWeight: "600", color: Colors.typography["200"] },
  historyText: { fontSize: 14, color: Colors.typography["100"], lineHeight: 22 },

  // Empty analysis
  emptyAnalysis: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Gap.large,
    gap: Gap.xxSmall,
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyAnalysisTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.typography["200"],
    marginTop: 4,
  },
  emptyAnalysisSubtitle: {
    fontSize: 13,
    color: Colors.typography["400"],
    textAlign: "center",
    paddingHorizontal: Gap.large,
  },

  // Recording list
  recordingList: { gap: Gap.xxSmall },
});
