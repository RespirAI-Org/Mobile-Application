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
import {
  SquarePen,
  Search,
  BriefcaseMedical,
  Video,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { useMessaging } from "@/contexts/MessagingContext";
import { usePatients } from "@/contexts/PatientContext";
import { authService } from "@/services/authService";
import { messagingService } from "@/services/messagingService";
import {
  consultationService,
  ConsultationRecord,
} from "@/services/consultationService";
import { pb } from "@/lib/pocketbase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  if (diffDays < 7)
    return date.toLocaleDateString([], { weekday: "short" });
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useMessaging();
  const { patientProfile, fetchPatientProfile } = usePatients();

  const [searchQuery, setSearchQuery] = useState("");
  const [upcomingConsultations, setUpcomingConsultations] = useState<
    ConsultationRecord[]
  >([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = authService.getCurrentUser();

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    // Conversations
    await fetchConversations();

    // Patient profile + consultations
    let profile = patientProfile;
    if (!profile) {
      const r = await fetchPatientProfile();
      if (r.success && r.data) profile = r.data;
    }
    if (profile?.id) {
      const r = await consultationService.getConsultationsByPatient(
        profile.id,
        "doctor",
      );
      if (r.success && r.data) {
        const now = new Date();
        setUpcomingConsultations(
          r.data
            .filter(
              (c) =>
                c.status === "scheduled" && new Date(c.scheduled_at) > now,
            )
            .sort(
              (a, b) =>
                new Date(a.scheduled_at).getTime() -
                new Date(b.scheduled_at).getTime(),
            )
            .slice(0, 3),
        );
      }
    }
  }, [patientProfile]);

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

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // ── Filtered conversations ────────────────────────────────────────────────

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const others =
      conv.expand?.participants?.filter((p: any) => p.id !== currentUser?.id) ||
      [];
    const name: string = others[0]?.name ?? "";
    const preview = conv.last_message_preview ?? "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
  });

  // ── Render ───────────────────────────────────────────────────────────────

  return (
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
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.inactiveTabText}>Video Call</Text>
        </TouchableOpacity>
      </View>

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

      {/* Urgent Help Card */}
      <View style={styles.triageCard}>
        <View style={styles.triageCardHeader}>
          <View style={styles.iconCircle}>
            <BriefcaseMedical color="#1961F0" size={22} />
          </View>
          <View style={styles.triageBadge}>
            <Text style={styles.triageBadgeText}>Available Now</Text>
          </View>
        </View>
        <Text style={styles.triageTitle}>Need immediate help?</Text>
        <Text style={styles.triageDesc}>
          Start a triage call with an on-call specialist for urgent symptoms.
        </Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Video color="#FFFFFF" size={20} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Start Instant Call</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Consultations */}
      {upcomingConsultations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
          {upcomingConsultations.map((consult) => {
            const doctor = consult.expand?.doctor;
            const doctorName: string = doctor?.full_name ?? "Doctor";
            const { day, time } = formatConsultationDate(consult.scheduled_at);
            const colors = avatarColors(doctorName);
            return (
              <View key={consult.id} style={styles.consultCard}>
                <View style={styles.consultHeader}>
                  <View
                    style={[
                      styles.consultAvatar,
                      { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.consultAvatarText,
                        { color: colors.text },
                      ]}
                    >
                      {getInitials(doctorName)}
                    </Text>
                  </View>
                  <View style={styles.consultInfo}>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                    <Text style={styles.doctorSpec}>
                      {consult.title || doctor?.specialist || "Consultation"}
                    </Text>
                  </View>
                  <View style={styles.consultTimeBlock}>
                    <Text style={styles.timeDay}>{day}</Text>
                    <Text style={styles.timeHour}>{time}</Text>
                  </View>
                </View>
                <View style={styles.consultActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryActionButton]}
                  >
                    <Text style={styles.primaryActionText}>Join Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryActionButton]}
                  >
                    <Text style={styles.secondaryActionText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Messages List */}
      <Text style={styles.sectionTitle}>Messages</Text>

      {isLoading && conversations.length === 0 ? (
        <ActivityIndicator
          color="#1961F0"
          style={{ marginVertical: Gap.large }}
        />
      ) : filteredConversations.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery ? "No conversations match your search." : "No conversations yet."}
        </Text>
      ) : (
        <View style={styles.messagesList}>
          {filteredConversations.map((conv) => {
            const others =
              conv.expand?.participants?.filter(
                (p: any) => p.id !== currentUser?.id,
              ) || [];
            const other = others[0];
            const name: string = other?.name ?? "Unknown";
            const avatarUrl =
              other?.avatar
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
                  router.push(`/messages/${conv.id}` as any)
                }
              >
                {/* Avatar */}
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
                        style={[
                          styles.avatarInitials,
                          { color: colors.text },
                        ]}
                      >
                        {getInitials(name)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Content */}
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

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
    paddingTop: Gap.medium,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Gap.small,
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
  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    padding: 4,
    marginHorizontal: Gap.small,
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
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    paddingHorizontal: Gap.small,
    height: 48,
    marginHorizontal: Gap.small,
    marginBottom: Gap.medium,
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
  // Triage card
  triageCard: {
    backgroundColor: Colors.background["900"],
    borderRadius: 16,
    padding: Gap.small,
    marginHorizontal: Gap.small,
    marginBottom: Gap.medium,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
  },
  triageCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Gap.extraSmall,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  triageBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: Gap.extraSmall,
    paddingVertical: 6,
    borderRadius: 16,
  },
  triageBadgeText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },
  triageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
    marginBottom: 6,
  },
  triageDesc: {
    fontSize: 14,
    color: Colors.typography["300"],
    marginBottom: Gap.small,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: Colors.info["400"],
    borderRadius: Radius.extraSmall,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: Gap.xxSmall,
  },
  primaryButtonText: {
    color: Colors.typography.white,
    fontSize: 14,
    fontWeight: "600",
  },
  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
    marginBottom: Gap.small,
    paddingHorizontal: Gap.small,
  },
  // Consultation card
  consultCard: {
    backgroundColor: Colors.background["950"],
    borderRadius: 16,
    padding: Gap.small,
    marginHorizontal: Gap.small,
    marginBottom: Gap.small,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  consultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Gap.small,
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
  consultInfo: {
    flex: 1,
    marginLeft: Gap.extraSmall,
    gap: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.typography["0"],
  },
  doctorSpec: {
    fontSize: 14,
    color: Colors.typography["300"],
  },
  consultTimeBlock: {
    alignItems: "flex-end",
    gap: 4,
  },
  timeDay: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  timeHour: {
    fontSize: 14,
    color: "#1961F0",
    fontWeight: "500",
  },
  consultActions: {
    flexDirection: "row",
    gap: Gap.extraSmall,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.extraSmall,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionButton: {
    backgroundColor: Colors.info["400"],
  },
  primaryActionText: {
    color: Colors.typography.white,
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryActionButton: {
    backgroundColor: Colors.background["950"],
    borderWidth: 1,
    borderColor: Colors.outline["800"],
  },
  secondaryActionText: {
    color: Colors.typography["300"],
    fontSize: 14,
    fontWeight: "500",
  },
  // Messages list
  messagesList: {
    marginBottom: Gap.small,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Gap.small,
    paddingHorizontal: Gap.small,
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
