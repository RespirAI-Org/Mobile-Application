import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  SquarePen,
  Search,
  Plus,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { useMessaging } from "@/contexts/MessagingContext";
import { authService } from "@/services/authService";
import { doctorService } from "@/services/doctorService";
import { patientService } from "@/services/patientService";
import { messagingService } from "@/services/messagingService";
import {
  consultationService,
  ConsultationRecord,
} from "@/services/consultationService";
import { pb } from "@/lib/pocketbase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMessageTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatConsultationDate(dateString: string): {
  day: string;
  time: string;
} {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const day = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : date.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time };
}

const AVATAR_PALETTE = [
  { bg: "#DBEAFE", text: "#1961F0" },
  { bg: "#F3E8FF", text: "#9333EA" },
  { bg: "#DCFCE7", text: "#15803D" },
  { bg: "#FEF3C7", text: "#D97706" },
  { bg: "#FCE7F3", text: "#DB2777" },
];

function avatarColors(name: string) {
  const idx = (name || " ").charCodeAt(0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

const CONSULTATION_TYPE_LABELS: Record<ConsultationRecord["type"], string> = {
  video_call: "Video Call",
  voice_call: "Voice Call",
  in_person: "In Person",
  follow_up: "Follow-up",
};

type ActiveTab = "messages" | "consultation";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DoctorMessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useMessaging();

  const [activeTab, setActiveTab] = useState<ActiveTab>("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [upcomingConsultations, setUpcomingConsultations] = useState<ConsultationRecord[]>([]);
  const [pendingConsultations, setPendingConsultations] = useState<ConsultationRecord[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [patientNameMap, setPatientNameMap] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = authService.getCurrentUser();

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    await fetchConversations();

    if (!currentUser) return;
    const doctorResult = await doctorService.getDoctorByUserId(currentUser.id);
    if (!doctorResult.success || !doctorResult.data) return;
    const doctorId = doctorResult.data.id;

    const [consultResult, pendingResult, patientsResult] = await Promise.all([
      consultationService.getUpcomingConsultations(doctorId, "patient"),
      consultationService.getPendingConsultations(doctorId, "patient"),
      patientService.getPatientsByDoctor(doctorId),
    ]);

    if (consultResult.success && consultResult.data) {
      setUpcomingConsultations(consultResult.data.slice(0, 3));
    }

    if (pendingResult.success && pendingResult.data) {
      setPendingConsultations(pendingResult.data);
    }

    if (patientsResult.success && patientsResult.data) {
      // Build userId → full_name map so we can resolve participant names
      const map: Record<string, string> = {};
      for (const p of patientsResult.data) {
        if (p.user) map[p.user] = p.full_name;
      }
      setPatientNameMap(map);
    }
  }, []);

  // Fetch unread counts after conversations load
  useEffect(() => {
    if (!currentUser || conversations.length === 0) return;
    Promise.all(
      conversations.map((c) =>
        messagingService
          .getUnreadCount(c.id, currentUser.id)
          .then((count) => ({ id: c.id, count })),
      ),
    ).then((results) => {
      const map: Record<string, number> = {};
      results.forEach(({ id, count }) => {
        if (count > 0) map[id] = count;
      });
      setUnreadCounts(map);
    });
  }, [conversations]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // ── Filtered conversations ─────────────────────────────────────────────────

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const others =
      conv.expand?.participants?.filter((p: any) => p.id !== currentUser?.id) ||
      [];
    const other = others[0];
    const name: string = (other?.id && patientNameMap[other.id]) || other?.name || "";
    const preview = conv.last_message_preview ?? "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.wrapper}>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communication</Text>
        <TouchableOpacity style={styles.composeButton}>
          <SquarePen color="#1961F0" size={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "messages" && styles.activeTab]}
          onPress={() => setActiveTab("messages")}
        >
          <Text style={activeTab === "messages" ? styles.activeTabText : styles.inactiveTabText}>
            Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "consultation" && styles.activeTab]}
          onPress={() => setActiveTab("consultation")}
        >
          <Text style={activeTab === "consultation" ? styles.activeTabText : styles.inactiveTabText}>
            Consultation
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "messages" ? (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Search
              color={Colors.typography["400"]}
              size={18}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations"
              placeholderTextColor={Colors.typography["400"]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Patient Messages */}
          <Text style={styles.patientMessagesTitle}>Patient Messages</Text>

          {isLoading && conversations.length === 0 ? (
            <ActivityIndicator
              color="#1961F0"
              style={{ marginVertical: Gap.large }}
            />
          ) : filteredConversations.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No conversations match your search."
                : "No conversations yet."}
            </Text>
          ) : (
            <View style={styles.messagesList}>
              {filteredConversations.map((conv) => {
                const others =
                  conv.expand?.participants?.filter(
                    (p: any) => p.id !== currentUser?.id,
                  ) || [];
                const other = others[0];
                const name: string =
                  (other?.id && patientNameMap[other.id]) ||
                  other?.name ||
                  "Unknown";
                const avatarUrl = other?.avatar
                  ? pb.files.getUrl(other, other.avatar)
                  : null;
                const colors = avatarColors(name);
                const timeStr = formatMessageTime(
                  conv.last_message_at || conv.updated,
                );
                const unread = unreadCounts[conv.id] ?? 0;

                return (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.messageRow}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: `/(doctor)/(tabs)/messages/${conv.id}` as any,
                        params: { displayName: name },
                      })
                    }
                  >
                    <View style={styles.avatarContainer}>
                      {avatarUrl ? (
                        <Image
                          source={{ uri: avatarUrl }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <View
                          style={[
                            styles.avatarPlaceholder,
                            { backgroundColor: colors.bg },
                          ]}
                        >
                          <Text
                            style={[styles.avatarInitials, { color: colors.text }]}
                          >
                            {getInitials(name)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.messageContent}>
                      <View style={styles.messageHeaderRow}>
                        <Text style={styles.messageName}>{name}</Text>
                        <Text
                          style={[
                            styles.messageTime,
                            unread > 0 && styles.messageTimeUnread,
                          ]}
                        >
                          {timeStr}
                        </Text>
                      </View>
                      <View style={styles.messageFooterRow}>
                        <Text
                          style={[
                            styles.messagePreview,
                            unread > 0 && styles.messagePreviewUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {conv.last_message_preview || "No messages yet"}
                        </Text>
                        {unread > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unread}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <>
          {/* Pending Consultation Requests */}
          {pendingConsultations.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingConsultations.length}</Text>
                </View>
              </View>
              <View style={styles.consultationList}>
                {pendingConsultations.map((consult) => {
                  const patient = consult.expand?.patient;
                  const patientName: string = patient?.full_name ?? "Patient";
                  const colors = avatarColors(patientName);
                  return (
                    <TouchableOpacity
                      key={consult.id}
                      style={styles.consultationCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        router.push({
                          pathname: `/(doctor)/(tabs)/messages/consultation/${consult.id}` as any,
                        })
                      }
                    >
                      <View style={[styles.consultAvatar, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.consultAvatarText, { color: colors.text }]}>
                          {getInitials(patientName)}
                        </Text>
                      </View>
                      <View style={styles.consultationInfo}>
                        <Text style={styles.consultationName}>{patientName}</Text>
                        <Text style={styles.consultationType}>{consult.title || "Consultation Request"}</Text>
                      </View>
                      <View style={styles.pendingStatusBadge}>
                        <Text style={styles.pendingStatusText}>Review</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Scheduled Consultations */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scheduled Consultations</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>See Calendar</Text>
            </TouchableOpacity>
          </View>

          {upcomingConsultations.length === 0 ? (
            <View style={styles.emptyConsultations}>
              <Text style={styles.emptyConsultationsText}>
                No upcoming consultations
              </Text>
            </View>
          ) : (
            <View style={styles.consultationList}>
              {upcomingConsultations.map((consult) => {
                const patient = consult.expand?.patient;
                const patientName: string = patient?.full_name ?? "Patient";
                const { day, time } = formatConsultationDate(consult.scheduled_at);
                const colors = avatarColors(patientName);
                return (
                  <TouchableOpacity
                    key={consult.id}
                    style={styles.consultationCard}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.consultAvatar, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.consultAvatarText, { color: colors.text }]}>
                        {getInitials(patientName)}
                      </Text>
                    </View>
                    <View style={styles.consultationInfo}>
                      <Text style={styles.consultationName}>{patientName}</Text>
                      <Text style={styles.consultationType}>
                        {consult.title || CONSULTATION_TYPE_LABELS[consult.type] || "Consultation"}
                      </Text>
                      {!!consult.address && (
                        <Text style={styles.consultationAddress} numberOfLines={1}>
                          {consult.address}
                        </Text>
                      )}
                    </View>
                    <View style={styles.consultationTime}>
                      <View style={styles.consultTimeBlock}>
                        <Text style={styles.consultTimeDay}>{day}</Text>
                        <Text style={[styles.consultTimeHour, { color: Colors.info["200"] }]}>
                          {time}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>

    {activeTab === "consultation" && (
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(doctor)/(tabs)/messages/consultation/new" as any)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  container: {
    paddingHorizontal: Gap.mediumSmall,
    flex: 1,
    paddingTop: Gap.medium,
  },
  fab: {
    position: "absolute",
    bottom: Gap.large,
    right: Gap.mediumSmall,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1961F0",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#1961F0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Gap.small,
    marginTop: Gap.xxSmall,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.typography["0"],
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    backgroundColor: Colors.background["900"],
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    padding: 4,
    marginBottom: Gap.small,
  },
  tab: {
    flex: 1,
    paddingVertical: Gap.xxSmall,
    alignItems: "center",
    borderRadius: Radius.extraSmall,
  },
  activeTab: {
    backgroundColor: Colors.background["950"],
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  activeTabText: {
    color: "#1961F0",
    fontWeight: "600",
    fontSize: 14,
  },
  inactiveTabText: {
    color: Colors.typography["300"],
    fontWeight: "500",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    height: 48,
    marginBottom: Gap.medium,
    paddingHorizontal: Gap.small,
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
    marginBottom: Gap.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1961F0",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingBadgeText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "700",
  },
  pendingStatusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingStatusText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyConsultations: {
    paddingVertical: Gap.small,
    paddingHorizontal: Gap.extraSmall,
    marginBottom: Gap.small,
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    alignItems: "center",
  },
  emptyConsultationsText: {
    fontSize: 13,
    color: Colors.typography["400"],
  },
  consultationList: {
    gap: Gap.small,
    marginBottom: Gap.medium,
  },
  consultationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    padding: Gap.small,
    gap: Gap.small,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
  },
  consultAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  consultAvatarText: {
    fontSize: 15,
    fontWeight: "700",
  },
  consultationInfo: {
    flex: 1,
    gap: 2,
  },
  consultationName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  consultationType: {
    fontSize: 13,
    color: Colors.typography["300"],
  },
  consultationAddress: {
    fontSize: 12,
    color: Colors.typography["400"],
    marginTop: 2,
  },
  consultationTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  consultTimeBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  consultTimeDay: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.typography["0"],
  },
  consultTimeHour: {
    fontSize: 12,
    fontWeight: "500",
  },
  patientMessagesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
    marginBottom: Gap.small,
  },
  messagesList: {
    marginBottom: Gap.small,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Gap.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline["800"],
    gap: Gap.small,
  },
  avatarContainer: {
    width: 48,
    height: 48,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.round,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "700",
  },
  messageContent: {
    flex: 1,
    gap: 4,
  },
  messageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.typography["0"],
  },
  messageTime: {
    fontSize: 12,
    color: Colors.typography["300"],
  },
  messageTimeUnread: {
    color: "#1961F0",
    fontWeight: "600",
  },
  messageFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Gap.xxSmall,
  },
  messagePreview: {
    flex: 1,
    fontSize: 14,
    color: Colors.typography["300"],
  },
  messagePreviewUnread: {
    color: Colors.typography["0"],
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#1961F0",
    minWidth: 20,
    height: 20,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: Colors.typography.white,
    fontSize: 11,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: Colors.typography["400"],
    fontSize: 14,
    marginVertical: Gap.large,
    paddingHorizontal: Gap.small,
  },
});
