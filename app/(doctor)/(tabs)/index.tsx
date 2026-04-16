import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { Search, Clock } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { authService } from "@/services/authService";
import { doctorService } from "@/services/doctorService";
import { patientService, PatientRecord } from "@/services/patientService";
import { recordingService, RecordingRecord } from "@/services/recordingService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

function isToday(dateString: string): boolean {
  return new Date(dateString).toDateString() === new Date().toDateString();
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

const STATUS_LABELS: Record<PatientRecord["status"], string | null> = {
  review: "Review",
  follow_up: "Follow-up",
  normal: null,
};

function getStatusStyle(label: string | null) {
  if (label === "Review") return { bg: Colors.error["950"], text: Colors.error["200"] };
  if (label === "Follow-up") return { bg: Colors.warning["950"], text: Colors.warning["200"] };
  return null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DoctorHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [latestRecByPatient, setLatestRecByPatient] = useState<
    Record<string, RecordingRecord>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const doctorResult = await doctorService.getDoctorByUserId(currentUser.id);
    if (!doctorResult.success || !doctorResult.data) return;

    const doctorId = doctorResult.data.id;

    const [patientsResult, recordingsResult] = await Promise.all([
      patientService.getPatientsByDoctor(doctorId),
      recordingService.getRecordingsByDoctor(doctorId),
    ]);

    if (patientsResult.success && patientsResult.data) {
      setPatients(patientsResult.data);
    }

    if (recordingsResult.success && recordingsResult.data) {
      // Map patientId → most recent recording (already sorted -created)
      const map: Record<string, RecordingRecord> = {};
      for (const rec of recordingsResult.data) {
        if (!map[rec.patient]) map[rec.patient] = rec;
      }
      setLatestRecByPatient(map);
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>My Patients</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search
            size={18}
            color={Colors.typography["400"]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={Colors.typography["400"]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Patient list */}
        {isLoading ? (
          <ActivityIndicator
            color={Colors.info["400"]}
            style={{ marginTop: Gap.large }}
          />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? "No patients match your search." : "No patients yet."}
          </Text>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((patient) => {
              const latestRec = latestRecByPatient[patient.id];
              const dateStr = latestRec?.created ?? patient.updated;
              const today = isToday(dateStr);
              const statusLabel = STATUS_LABELS[patient.status] ?? null;
              const statusStyle = getStatusStyle(statusLabel);
              const colors = avatarColors(patient.full_name);
              const avatarUrl = patientService.getAvatarUrl(patient);
              const age = calculateAge(patient.date_of_birth);
              const gender = patient.gender
                ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                : null;
              const demographics = [gender, age !== null ? `${age} yrs` : null]
                .filter(Boolean)
                .join(", ");

              return (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.card}
                  activeOpacity={0.7}
                >
                  {/* Avatar */}
                  <View style={styles.avatarWrapper}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View
                        style={[styles.avatar, { backgroundColor: colors.bg }]}
                      >
                        <Text style={[styles.avatarText, { color: colors.text }]}>
                          {getInitials(patient.full_name)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.patientInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.patientName} numberOfLines={1}>
                        {patient.full_name}
                      </Text>
                      {statusStyle && (
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusStyle.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: statusStyle.text },
                            ]}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      )}
                    </View>
                    {demographics.length > 0 && (
                      <Text style={styles.demographicsText}>{demographics}</Text>
                    )}
                    <View style={styles.dateRow}>
                      {today && (
                        <Clock
                          size={13}
                          color={Colors.info["400"]}
                          style={styles.clockIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.dateText,
                          today && { color: Colors.info["400"] },
                        ]}
                      >
                        {formatDate(dateStr)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingTop: Gap.medium,
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    paddingHorizontal: Gap.mediumSmall,
    paddingTop: Gap.small,
    paddingBottom: Gap.large,
    gap: Gap.small,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.typography["0"],
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    paddingHorizontal: Gap.small,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  searchIcon: {
    marginRight: Gap.xxSmall,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.typography["0"],
    height: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.typography["300"],
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1961f0",
  },
  listContainer: {
    gap: Gap.small,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.typography["400"],
    fontSize: 14,
    marginTop: Gap.large,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    padding: Gap.mediumSmall,
    gap: Gap.small,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  patientInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.xxSmall,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: Gap.xxSmall,
    paddingVertical: 3,
    borderRadius: Radius.round,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  demographicsText: {
    fontSize: 14,
    color: Colors.typography["300"],
    fontWeight: "400",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clockIcon: {
    marginTop: 1,
  },
  dateText: {
    fontSize: 12,
    color: Colors.typography["400"],
  },
});
