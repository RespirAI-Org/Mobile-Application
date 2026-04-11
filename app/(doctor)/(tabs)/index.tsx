import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Search, Clock } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";

type PatientStatus = "Review" | "Follow-up" | null;

interface Patient {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  gender: string;
  age: number;
  date: string;
  isToday: boolean;
  status: PatientStatus;
  onlineStatus?: "online" | "offline";
}

const patients: Patient[] = [
  {
    id: "1",
    name: "John Doe",
    initials: "JD",
    avatarBg: Colors.info["900"],
    avatarTextColor: Colors.info["200"],
    gender: "Male",
    age: 45,
    date: "Today, 10:30 AM",
    isToday: true,
    status: "Review",
    onlineStatus: "online",
  },
  {
    id: "2",
    name: "Jane Smith",
    initials: "JS",
    avatarBg: Colors.background["800"],
    avatarTextColor: Colors.typography["200"],
    gender: "Female",
    age: 32,
    date: "Yesterday, 4:15 PM",
    isToday: false,
    status: null,
  },
  {
    id: "3",
    name: "Robert Brown",
    initials: "RB",
    avatarBg: Colors.info["900"],
    avatarTextColor: Colors.info["100"],
    gender: "Male",
    age: 58,
    date: "Oct 24, 9:00 AM",
    isToday: false,
    status: null,
  },
  {
    id: "4",
    name: "Sarah Miller",
    initials: "SM",
    avatarBg: Colors.error["900"],
    avatarTextColor: Colors.error["300"],
    gender: "Female",
    age: 62,
    date: "Oct 20, 11:45 AM",
    isToday: false,
    status: "Follow-up",
    onlineStatus: "offline",
  },
  {
    id: "5",
    name: "Michael Park",
    initials: "MP",
    avatarBg: Colors.success["900"],
    avatarTextColor: Colors.info["300"],
    gender: "Male",
    age: 28,
    date: "Oct 18, 2:20 PM",
    isToday: false,
    status: null,
  },
];

const getStatusStyle = (status: PatientStatus) => {
  if (status === "Review") {
    return { bg: Colors.error["950"], text: Colors.error["200"] };
  }
  if (status === "Follow-up") {
    return { bg: Colors.warning["950"], text: Colors.warning["200"] };
  }
  return null;
};

export default function DoctorHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Patients</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.typography["400"]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
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
        <View style={styles.listContainer}>
          {filtered.map((patient) => {
            const statusStyle = getStatusStyle(patient.status);
            return (
              <TouchableOpacity key={patient.id} style={styles.card} activeOpacity={0.7}>
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: patient.avatarBg }]}>
                    <Text style={[styles.avatarText, { color: patient.avatarTextColor }]}>
                      {patient.initials}
                    </Text>
                  </View>
                  {patient.onlineStatus && (
                    <View
                      style={[
                        styles.onlineDot,
                        {
                          backgroundColor:
                            patient.onlineStatus === "online"
                              ? Colors.success["600"]
                              : Colors.error["500"],
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Info */}
                <View style={styles.patientInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    {statusStyle && (
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                          {patient.status}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.demographicsText}>
                    {patient.gender}, {patient.age} yrs
                  </Text>
                  <View style={styles.dateRow}>
                    {patient.isToday && (
                      <Clock size={13} color={Colors.info["400"]} style={styles.clockIcon} />
                    )}
                    <Text
                      style={[
                        styles.dateText,
                        patient.isToday && { color: Colors.info["400"] },
                      ]}
                    >
                      {patient.date}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Gap.medium,
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    paddingHorizontal: Gap.medium,
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
    borderRadius: Radius.medium,
    paddingHorizontal: Gap.small,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    padding: Gap.small,
    gap: Gap.small,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
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
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: Radius.round,
    borderWidth: 2,
    borderColor: Colors.background["950"],
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
