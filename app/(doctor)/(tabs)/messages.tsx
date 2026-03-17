import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import {
  SquarePen,
  Search,
  BriefcaseMedical,
  Video,
  CheckCheck,
  Check,
} from "lucide-react-native";

const MESSAGES = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?img=47",
    time: "10:30 AM",
    text: "Your heart sounds look stable, continue takin...",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Cardiology Dept",
    initials: "CD",
    bgColor: "#DBEAFE",
    textColor: "#1961F0",
    time: "Yesterday",
    text: "Appointment confirmed for Friday at 2:00 PM. Ple...",
  },
  {
    id: 3,
    name: "Nurse Ratched",
    avatar: "https://i.pravatar.cc/150?img=11",
    time: "Mon",
    text: "Please upload your latest lung sound recordin...",
    read: true,
  },
  {
    id: 4,
    name: "Technical Support",
    initials: "IT",
    bgColor: "#F3E8FF",
    textColor: "#9333EA",
    time: "Last Week",
    text: "Ticket #4092: Sync issues resolved.",
    delivered: true,
  },
];

export default function MessagesScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color="#94A3B8" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Urgent Help Card */}
      <View style={styles.triageCard}>
        <View style={styles.triageHeader}>
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
      <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
      <View style={styles.consultCard}>
        <View style={styles.consultHeader}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={styles.avatar}
          />
          <View style={styles.consultInfo}>
            <Text style={styles.doctorName}>Dr. Sarah Jenkins</Text>
            <Text style={styles.doctorSpec}>Heart Rhythm Analysis</Text>
          </View>
          <View style={styles.consultTimeInfo}>
            <Text style={styles.timeDay}>Today</Text>
            <Text style={styles.timeHour}>2:00 PM</Text>
          </View>
        </View>
        <View style={styles.consultActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
          >
            <Text style={styles.primaryActionButtonText}>Join Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryActionButton]}
          >
            <Text style={styles.secondaryActionButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <Text style={styles.sectionTitle}>Messages</Text>
      <View style={styles.messagesList}>
        {MESSAGES.map((msg, index) => (
          <View key={msg.id} style={styles.messageRow}>
            <View style={styles.messageAvatarContainer}>
              {msg.avatar ? (
                <Image source={{ uri: msg.avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: msg.bgColor },
                  ]}
                >
                  <Text
                    style={[styles.avatarInitials, { color: msg.textColor }]}
                  >
                    {msg.initials}
                  </Text>
                </View>
              )}
              {msg.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeaderRow}>
                <Text style={styles.messageName}>{msg.name}</Text>
                <Text
                  style={[
                    styles.messageTime,
                    msg.unread ? styles.messageTimeUnread : null,
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
              <View style={styles.messageFooterRow}>
                <Text
                  style={[
                    styles.messageText,
                    msg.unread ? styles.messageTextUnread : null,
                  ]}
                  numberOfLines={1}
                >
                  {msg.text}
                </Text>
                {msg.unread ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{msg.unread}</Text>
                  </View>
                ) : null}
                {msg.read ? <CheckCheck size={16} color="#94A3B8" /> : null}
                {msg.delivered ? <Check size={16} color="#94A3B8" /> : null}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom padding spacing for Tab Bar */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0D121C",
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FC",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FC",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTabText: {
    color: "#1961F0",
    fontWeight: "600",
    fontSize: 14,
  },
  inactiveTabText: {
    color: "#4B659B",
    fontWeight: "500",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0D121C",
    height: 24,
  },
  triageCard: {
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  triageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
    paddingHorizontal: 12,
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
    color: "#0D121C",
    marginBottom: 6,
  },
  triageDesc: {
    fontSize: 14,
    color: "#4B659B",
    marginBottom: 16,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#0DA6F2",
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D121C",
    marginBottom: 16,
  },
  consultCard: {
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  consultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  consultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D121C",
    marginBottom: 4,
  },
  doctorSpec: {
    fontSize: 14,
    color: "#4B659B",
  },
  consultTimeInfo: {
    alignItems: "flex-end",
  },
  timeDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D121C",
    marginBottom: 4,
  },
  timeHour: {
    fontSize: 14,
    color: "#1961F0",
    fontWeight: "500",
  },
  consultActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionButton: {
    backgroundColor: "#0DA6F2",
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryActionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryActionButtonText: {
    color: "#4B659B",
    fontSize: 14,
    fontWeight: "500",
  },
  messagesList: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  messageAvatarContainer: {
    position: "relative",
    marginRight: 14,
    width: 48,
    height: 48,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "700",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  messageContent: {
    flex: 1,
  },
  messageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  messageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D121C",
  },
  messageTime: {
    fontSize: 12,
    color: "#4B659B",
  },
  messageTimeUnread: {
    color: "#1961F0",
  },
  messageFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#4B659B",
    marginRight: 12,
  },
  messageTextUnread: {
    color: "#0D121C",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#1961F0",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
