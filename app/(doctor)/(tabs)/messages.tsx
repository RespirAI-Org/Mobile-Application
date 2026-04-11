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
import {
  SquarePen,
  Search,
  Video,
  Stethoscope,
  CheckCheck,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";

type ConsultationType = "Follow-up" | "Audio Review";

interface Consultation {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  type: ConsultationType;
  time: string;
}

interface PatientMessage {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  time: string;
  preview: string;
  unreadCount?: number;
  isUnread?: boolean;
  isRead?: boolean;
  isOnline?: boolean;
}

const consultations: Consultation[] = [
  {
    id: "1",
    name: "John Doe",
    initials: "JD",
    avatarBg: Colors.info["900"],
    avatarTextColor: Colors.info["200"],
    type: "Follow-up",
    time: "10:00 AM",
  },
  {
    id: "2",
    name: "Jane Smith",
    initials: "JS",
    avatarBg: Colors.background["800"],
    avatarTextColor: Colors.typography["200"],
    type: "Audio Review",
    time: "11:30 AM",
  },
];

const patientMessages: PatientMessage[] = [
  {
    id: "1",
    name: "Michael Brown",
    initials: "MB",
    avatarBg: Colors.background["800"],
    avatarTextColor: Colors.typography["200"],
    time: "10:45 AM",
    preview: "I've uploaded the new heart sound recording...",
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "2",
    name: "Emily White",
    initials: "EW",
    avatarBg: Colors.warning["950"],
    avatarTextColor: Colors.warning["300"],
    time: "Yesterday",
    preview: "Can we reschedule our appointment to next Tues...",
    isUnread: true,
  },
  {
    id: "3",
    name: "David Wilson",
    initials: "DW",
    avatarBg: Colors.info["900"],
    avatarTextColor: Colors.info["200"],
    time: "Mon",
    preview: "The medication is working well, feeling much ...",
    isRead: true,
  },
];

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<"messages" | "video">("messages");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Communication</Text>
          <TouchableOpacity style={styles.composeButton}>
            <SquarePen size={20} color="#1961f0" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "messages" && styles.activeTab]}
            onPress={() => setActiveTab("messages")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "messages" ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Messages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "video" && styles.activeTab]}
            onPress={() => setActiveTab("video")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "video" ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Video Call
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.typography["400"]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor={Colors.typography["400"]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Scheduled Consultations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scheduled Consultations</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>See Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.consultationList}>
          {consultations.map((item) => {
            const isVideo = item.type === "Follow-up";
            return (
              <TouchableOpacity key={item.id} style={styles.consultationCard} activeOpacity={0.7}>
                <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
                  <Text style={[styles.avatarText, { color: item.avatarTextColor }]}>
                    {item.initials}
                  </Text>
                </View>
                <View style={styles.consultationInfo}>
                  <Text style={styles.consultationName}>{item.name}</Text>
                  <Text style={styles.consultationType}>{item.type}</Text>
                </View>
                <View style={styles.consultationTime}>
                  {isVideo ? (
                    <Video size={14} color={Colors.info["400"]} />
                  ) : (
                    <Stethoscope size={14} color={Colors.info["200"]} />
                  )}
                  <Text
                    style={[
                      styles.consultationTimeText,
                      { color: isVideo ? Colors.info["400"] : Colors.info["200"] },
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Patient Messages */}
        <Text style={[styles.sectionTitle, styles.patientMessagesTitle]}>
          Patient Messages
        </Text>

        <View>
          {patientMessages.map((msg) => (
            <TouchableOpacity key={msg.id} style={styles.messageRow} activeOpacity={0.7}>
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatar, { backgroundColor: msg.avatarBg }]}>
                  <Text style={[styles.avatarText, { color: msg.avatarTextColor }]}>
                    {msg.initials}
                  </Text>
                </View>
                {msg.isOnline && <View style={styles.onlineDot} />}
              </View>

              {/* Content */}
              <View style={styles.messageContent}>
                <View style={styles.messageHeaderRow}>
                  <Text style={styles.messageName}>{msg.name}</Text>
                  <Text
                    style={[
                      styles.messageTime,
                      msg.unreadCount ? styles.messageTimeUnread : null,
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
                <View style={styles.messageFooterRow}>
                  <Text
                    style={[
                      styles.messagePreview,
                      msg.isUnread && styles.messagePreviewUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {msg.preview}
                  </Text>
                  {msg.unreadCount ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{msg.unreadCount}</Text>
                    </View>
                  ) : msg.isRead ? (
                    <CheckCheck size={16} color={Colors.typography["400"]} />
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Gap.small,
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
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1961f0",
    fontWeight: "600",
  },
  inactiveTabText: {
    color: Colors.typography["300"],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    paddingHorizontal: Gap.small,
    height: 48,
    marginBottom: Gap.small,
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
    color: "#1961f0",
  },
  consultationList: {
    gap: Gap.small,
    marginBottom: Gap.small,
  },
  consultationCard: {
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
  },
  consultationInfo: {
    flex: 1,
    gap: 2,
  },
  consultationName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  consultationType: {
    fontSize: 13,
    color: Colors.typography["300"],
  },
  consultationTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  consultationTimeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  patientMessagesTitle: {
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
  avatarWrapper: {
    position: "relative",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: Radius.round,
    backgroundColor: Colors.success["600"],
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  messageContent: {
    flex: 1,
    gap: 4,
  },
  messageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  messageTime: {
    fontSize: 12,
    color: Colors.typography["300"],
  },
  messageTimeUnread: {
    color: "#1961f0",
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
    color: "#1961f0",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#1961f0",
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
});
