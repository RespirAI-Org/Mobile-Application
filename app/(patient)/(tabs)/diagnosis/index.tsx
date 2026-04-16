import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  SquarePen,
  Search,
  Activity,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { usePatients } from "@/contexts/PatientContext";
import { recordingService, RecordingRecord } from "@/services/recordingService";

type DiagnosisStatus = "Abnormal" | "Normal" | "Review";

interface DiagnosisListItem {
  id: string;
  location: string;
  date: string;
  status: DiagnosisStatus;
  result: string;
  confidence: number;
}

const LOCATION_LABELS: Record<string, string> = {
  at_hospital: "At Hospital",
  at_home: "At Home",
  clinic_visit: "Clinic Visit",
};

const getStatusColor = (status: DiagnosisStatus) => {
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
};

export default function DiagnosisScreen() {
  const router = useRouter();
  const { patientProfile } = usePatients();
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Edit / multi-select state ───────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecordings = async () => {
    if (!patientProfile?.id) return;
    setIsLoading(true);
    const result = await recordingService.getRecordingsByPatient(
      patientProfile.id,
      "result",
    );
    if (result.success && result.data) {
      setRecordings(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecordings();
  }, [patientProfile?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecordings();
    setRefreshing(false);
  };

  const enterEditMode = () => {
    setIsEditing(true);
    setSelectedIds(new Set());
  };

  const exitEditMode = () => {
    setIsEditing(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === combinedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(combinedData.map((item) => item.id)));
    }
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    Alert.alert(
      "Delete Recordings",
      `Delete ${count} recording${count > 1 ? "s" : ""}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            await Promise.all(
              [...selectedIds].map((id) => recordingService.deleteRecording(id)),
            );
            setRecordings((prev) =>
              prev.filter((r) => !selectedIds.has(r.id)),
            );
            setSelectedIds(new Set());
            setIsEditing(false);
            setIsDeleting(false);
          },
        },
      ],
    );
  };

  const combinedData: DiagnosisListItem[] = useMemo(() => {
    const data = recordings.map((recording) => {
      const diagResult = recording.expand?.result;
      let status: DiagnosisStatus = "Review";
      let resultText = "Pending Analysis";
      let confidence = recording.confidence || 0;

      if (diagResult?.pred_name) {
        const predName = diagResult.pred_name.toLowerCase();
        if (predName === "normal") {
          status = "Normal";
          resultText = "Healthy Lung Sounds";
          if (!recording.confidence)
            confidence = Math.round(diagResult.prob_normal * 100);
        } else if (predName === "wheezes") {
          status = "Abnormal";
          resultText = "Wheeze Detected";
          if (!recording.confidence)
            confidence = Math.round(diagResult.prob_wheezes * 100);
        } else if (predName === "crackles") {
          status = "Abnormal";
          resultText = "Crackles Detected";
          if (!recording.confidence)
            confidence = Math.round(diagResult.prob_crackles * 100);
        } else if (predName === "both") {
          status = "Abnormal";
          resultText = "Wheezes & Crackles";
          if (!recording.confidence)
            confidence = Math.round(diagResult.prob_both * 100);
        }
      } else if (
        diagResult?.status === "queued" ||
        diagResult?.status === "processing"
      ) {
        status = "Review";
        resultText = "Processing...";
      }

      if (recording.diagnosis_title) {
        resultText = recording.diagnosis_title;
      }

      const dateObj = new Date(recording.created);
      const dateFormatted = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: recording.id,
        location:
          LOCATION_LABELS[recording.location] ||
          recording.location ||
          "Unknown",
        date: dateFormatted,
        status,
        result: resultText,
        confidence,
      };
    });

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return data.filter(
        (item) =>
          item.date.toLowerCase().includes(lowerQuery) ||
          item.result.toLowerCase().includes(lowerQuery) ||
          item.status.toLowerCase().includes(lowerQuery) ||
          item.location.toLowerCase().includes(lowerQuery),
      );
    }

    return data;
  }, [recordings, searchQuery]);

  const allSelected =
    combinedData.length > 0 && selectedIds.size === combinedData.length;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diagnosis History</Text>
        {isEditing ? (
          <TouchableOpacity onPress={exitEditMode} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={enterEditMode}
          >
            <SquarePen size={20} color={Colors.typography["0"]} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          isEditing && styles.contentContainerEditing,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          !isEditing ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {/* Search (hidden in edit mode) */}
        {!isEditing && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by date or result..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isEditing
              ? `${selectedIds.size} selected`
              : "RECENT RECORDINGS"}
          </Text>
          {!isEditing && (
            <TouchableOpacity>
              <Text style={styles.filterButton}>Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color="#1961f0"
            style={{ marginTop: Gap.large }}
          />
        ) : combinedData.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: Gap.large }}>
            <Text style={{ color: "#64748b" }}>No recordings found.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {combinedData.map((item) => {
              const colors = getStatusColor(item.status);
              const ResultIcon = colors.icon;
              const isSelected = selectedIds.has(item.id);

              return (
                <View key={item.id} style={styles.cardRow}>
                  {/* Checkbox sits outside the card boundary */}
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => toggleSelect(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {isSelected ? (
                        <CheckSquare size={22} color="#1961f0" />
                      ) : (
                        <Square size={22} color="#94a3b8" />
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.card,
                      isEditing && isSelected && styles.cardSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isEditing) {
                        toggleSelect(item.id);
                      } else {
                        router.push({
                          pathname:
                            "/(patient)/(tabs)/diagnosis/diagnosis-details",
                          params: { id: item.id },
                        });
                      }
                    }}
                  >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Activity size={24} color={colors.bar} />
                      </View>
                      <View style={styles.cardHeaderText}>
                        <Text style={styles.locationText}>{item.location}</Text>
                        <Text style={styles.dateText}>{item.date}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: colors.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultContainer}>
                    <View style={styles.resultRow}>
                      <View style={styles.resultInfo}>
                        <ResultIcon size={16} color={colors.text} />
                        <Text style={styles.resultText}>{item.result}</Text>
                      </View>
                      <Text style={styles.confidenceText}>
                        {item.confidence}% Confidence
                      </Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${item.confidence}%`,
                            backgroundColor: colors.bar,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom action bar (edit mode only) ── */}
      {isEditing && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={toggleSelectAll}
          >
            <Text style={styles.selectAllText}>
              {allSelected ? "Deselect All" : "Select All"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              (selectedIds.size === 0 || isDeleting) &&
                styles.deleteButtonDisabled,
            ]}
            onPress={handleDelete}
            disabled={selectedIds.size === 0 || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Trash2 size={16} color="#ffffff" />
                <Text style={styles.deleteButtonText}>
                  Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Gap.medium,
    paddingHorizontal: Gap.mediumSmall,
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Gap.small,
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0d121c",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    backgroundColor: "#f8f9fc",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    paddingHorizontal: Gap.extraSmall,
    paddingVertical: Gap.xxxSmall,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1961f0",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    paddingBottom: Gap.large,
  },
  contentContainerEditing: {
    // Extra bottom padding so the last card isn't hidden behind the action bar
    paddingBottom: 100,
  },
  searchContainer: {
    paddingVertical: Gap.extraSmall,
    backgroundColor: "white",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
      android: {
        elevation: 1,
      },
    }),
  },
  searchIcon: {
    marginRight: Gap.extraSmall,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    height: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: Gap.extraSmall,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  filterButton: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1961f0",
  },
  listContainer: {
    gap: Gap.small,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: Gap.mediumSmall,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSelected: {
    borderColor: "#1961f0",
    backgroundColor: "#f0f4ff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardHeaderText: {
    gap: 2,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: Gap.xxSmall,
    paddingVertical: Gap.xxxSmall,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: Radius.extraSmall,
    padding: Gap.extraSmall,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: Gap.xxSmall,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.xxSmall,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: Radius.round,
    overflow: "hidden",
    marginTop: Gap.xxxSmall,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: Radius.round,
  },
  // ── Edit mode action bar ───────────────────────────────────────────────────
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Gap.mediumSmall,
    paddingVertical: Gap.extraSmall,
    marginHorizontal: Gap.mediumSmall,
    marginBottom: Gap.extraSmall,
    backgroundColor: "#ffffff",
    borderRadius: 12,
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
  selectAllButton: {
    paddingVertical: Gap.xxSmall,
    paddingHorizontal: Gap.extraSmall,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1961f0",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.xxSmall,
    backgroundColor: Colors.error["500"],
    paddingVertical: Gap.xxSmall,
    paddingHorizontal: Gap.small,
    borderRadius: Radius.small,
    minWidth: 100,
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
