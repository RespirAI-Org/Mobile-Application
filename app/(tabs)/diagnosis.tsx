import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  SquarePen,
  Search,
  Activity,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react-native";

type DiagnosisStatus = "Abnormal" | "Normal" | "Review";

interface DiagnosisRecord {
  id: string;
  location: string;
  date: string;
  status: DiagnosisStatus;
  result: string;
  confidence: number;
}

const diagnosisData: DiagnosisRecord[] = [
  {
    id: "1",
    location: "At Hospital",
    date: "Today, 10:30 AM",
    status: "Abnormal",
    result: "Wheeze Detected",
    confidence: 92,
  },
  {
    id: "2",
    location: "At Home",
    date: "Yesterday, 8:15 PM",
    status: "Normal",
    result: "Healthy Lung Sounds",
    confidence: 98,
  },
  {
    id: "3",
    location: "At Home",
    date: "Oct 24, 9:00 AM",
    status: "Review",
    result: "Fine Crackles",
    confidence: 85,
  },
  {
    id: "4",
    location: "Clinic Visit",
    date: "Oct 20, 11:45 AM",
    status: "Normal",
    result: "Healthy Lung Sounds",
    confidence: 95,
  },
];

const getStatusColor = (status: DiagnosisStatus) => {
  switch (status) {
    case "Abnormal":
      return {
        text: "#b91c1c",
        bg: "#fef2f2",
        border: "#fee2e2",
        bar: "#ef4444",
        icon: AlertCircle,
      };
    case "Normal":
      return {
        text: "#047857",
        bg: "#ecfdf5",
        border: "#d1fae5",
        bar: "#10b981",
        icon: CheckCircle2,
      };
    case "Review":
      return {
        text: "#b45309",
        bg: "#fffbeb",
        border: "#fef3c7",
        bar: "#f59e0b",
        icon: AlertTriangle,
      };
  }
};

export default function DiagnosisScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diagnosis History</Text>
        <TouchableOpacity style={styles.headerButton}>
          <SquarePen size={20} color="#0d121c" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by date or result..."
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT RECORDINGS</Text>
          <TouchableOpacity>
            <Text style={styles.filterButton}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {diagnosisData.map((item) => {
            const colors = getStatusColor(item.status);
            const ResultIcon = colors.icon;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => router.push("/diagnosis-details")}
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
            );
          })}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    borderRadius: 20,
    backgroundColor: "#f8f9fc",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f6f6f8",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f6f6f8",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
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
    marginRight: 12,
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
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
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
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "transparent", // Added to match style structure but keep transparent usually unless specified
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
