import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Send, Phone } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { authService } from "@/services/authService";
import {
  messagingService,
  MessageRecord,
  ConversationRecord,
} from "@/services/messagingService";
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

function formatBubbleTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayHeader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ─── Flat list item types ─────────────────────────────────────────────────────
// Using a flat data array (messages + separator items) avoids ordering issues
// caused by the double scaleY(-1) applied to cells in an inverted FlatList.

type FlatItem =
  | { type: "message"; data: MessageRecord }
  | { type: "separator"; label: string; dateKey: string };

// Messages are newest-first. A separator is inserted AFTER the oldest message
// of each day group so that, in the inverted FlatList, it renders visually
// ABOVE that group (higher index = closer to the top of the screen).
function buildFlatItems(messages: MessageRecord[]): FlatItem[] {
  const result: FlatItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    result.push({ type: "message", data: messages[i] });
    const isLastOverall = i === messages.length - 1;
    const isDayBoundary =
      isLastOverall ||
      new Date(messages[i].created).toDateString() !==
        new Date(messages[i + 1].created).toDateString();
    if (isDayBoundary) {
      result.push({
        type: "separator",
        label: formatDayHeader(messages[i].created),
        dateKey: new Date(messages[i].created).toDateString(),
      });
    }
  }
  return result;
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

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface BubbleProps {
  message: MessageRecord;
  isOwn: boolean;
  showAvatar: boolean;
  otherName: string;
  otherAvatarUrl: string | null;
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  otherName,
  otherAvatarUrl,
}: BubbleProps) {
  const colors = avatarColors(otherName);
  return (
    <View
      style={[
        styles.bubbleRow,
        isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther,
      ]}
    >
      {/* Other user avatar (left side) */}
      {!isOwn && (
        <View style={styles.bubbleAvatar}>
          {showAvatar ? (
            otherAvatarUrl ? (
              <Image
                source={{ uri: otherAvatarUrl }}
                style={styles.bubbleAvatarImage}
              />
            ) : (
              <View
                style={[
                  styles.bubbleAvatarPlaceholder,
                  { backgroundColor: colors.bg },
                ]}
              >
                <Text style={[styles.bubbleAvatarInitials, { color: colors.text }]}>
                  {getInitials(otherName)}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.bubbleAvatarSpacer} />
          )}
        </View>
      )}

      <View
        style={[
          styles.bubbleContainer,
          isOwn ? styles.bubbleContainerOwn : styles.bubbleContainerOther,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther,
            ]}
          >
            {message.body}
          </Text>
        </View>
        <Text
          style={[
            styles.bubbleTime,
            isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther,
          ]}
        >
          {formatBubbleTime(message.created)}
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { id, displayName } = useLocalSearchParams<{ id: string; displayName?: string }>();
  const router = useRouter();

  const currentUser = authService.getCurrentUser();

  const [conversation, setConversation] = useState<ConversationRecord | null>(
    null,
  );
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState("");

  const inputRef = useRef<TextInput>(null);

  // Flat data array for FlatList (messages interleaved with day separators)
  const flatItems = useMemo(() => buildFlatItems(messages), [messages]);

  // ── Derived other-participant info ────────────────────────────────────────

  const otherParticipant = conversation?.expand?.participants?.find(
    (p: any) => p.id !== currentUser?.id,
  );
  const otherName: string = otherParticipant?.name ?? displayName ?? "Chat";
  const otherAvatarUrl: string | null =
    otherParticipant?.avatar
      ? pb.files.getUrl(otherParticipant, otherParticipant.avatar)
      : null;
  const otherColors = avatarColors(otherName);

  // ── Load conversation + messages ──────────────────────────────────────────

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);

      const [convResult, msgResult] = await Promise.all([
        messagingService.getConversationById(id, "participants"),
        messagingService.getMessages(id, 1, 50, "sender"),
      ]);

      if (convResult.success && convResult.data) {
        setConversation(convResult.data);
      }

      if (msgResult.success && msgResult.data) {
        setMessages(msgResult.data); // newest-first for inverted FlatList
        // Mark all unread as read
        if (currentUser) {
          msgResult.data.forEach((msg) => {
            if (!msg.read_by.includes(currentUser.id)) {
              messagingService.markAsRead(msg.id, currentUser.id);
            }
          });
        }
      }

      setIsLoading(false);
    };

    load();
  }, [id]);

  // ── Real-time subscription ────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;

    let unsub: (() => void) | null = null;

    messagingService
      .subscribeToMessages(id, ({ action, record }) => {
        if (action === "create") {
          setMessages((prev) => {
            // Avoid duplicates (e.g. if optimistic update already added it)
            if (prev.find((m) => m.id === record.id)) return prev;
            return [record, ...prev];
          });
          if (currentUser) {
            messagingService.markAsRead(record.id, currentUser.id);
          }
        }
      })
      .then((fn) => {
        unsub = fn;
      });

    return () => {
      if (unsub) unsub();
      else messagingService.unsubscribeFromMessages();
    };
  }, [id]);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const body = inputText.trim();
    if (!body || !currentUser || !id) return;

    // Clear the input immediately so the user can keep typing.
    setInputText("");
    setIsSending(true);

    // We do NOT add an optimistic message here. The SSE subscription on the
    // messages collection is the single source of truth: as soon as the server
    // creates the record it pushes a "create" event and the subscription handler
    // prepends it to the list. This avoids any race between an optimistic entry
    // and the real record arriving through the socket.
    await messagingService.sendMessage(id, currentUser.id, body);

    setIsSending(false);
  }, [inputText, currentUser, id]);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: { item: FlatItem; index: number }) => {
      if (item.type === "separator") {
        return (
          <View style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{item.label}</Text>
          </View>
        );
      }

      const msg = item.data;
      const isOwn = msg.sender === currentUser?.id;
      // Next flat item (index + 1) is visually above in the inverted FlatList.
      // Show avatar at the bottom of a consecutive group from the other sender,
      // i.e. when the next item is a separator or from a different sender.
      const nextFlatItem = flatItems[index + 1];
      const showAvatar =
        !isOwn &&
        (!nextFlatItem ||
          nextFlatItem.type === "separator" ||
          (nextFlatItem.type === "message" &&
            nextFlatItem.data.sender !== msg.sender));

      return (
        <MessageBubble
          message={msg}
          isOwn={isOwn}
          showAvatar={showAvatar}
          otherName={otherName}
          otherAvatarUrl={otherAvatarUrl}
        />
      );
    },
    [flatItems, currentUser, otherName, otherAvatarUrl],
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={Colors.typography["0"]} />
        </TouchableOpacity>

        {/* Other participant info */}
        <View style={styles.headerCenter}>
          {otherAvatarUrl ? (
            <Image source={{ uri: otherAvatarUrl }} style={styles.headerAvatar} />
          ) : (
            <View
              style={[
                styles.headerAvatarPlaceholder,
                { backgroundColor: otherColors.bg },
              ]}
            >
              <Text
                style={[styles.headerAvatarInitials, { color: otherColors.text }]}
              >
                {getInitials(otherName)}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherName}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Phone size={20} color={Colors.info["400"]} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#1961F0" size="large" />
        </View>
      ) : (
        <FlatList
          data={flatItems}
          keyExtractor={(item) =>
            item.type === "message" ? item.data.id : `sep_${item.dateKey}`
          }
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No messages yet. Say hello!
              </Text>
            </View>
          }
        />
      )}

      {/* ── Input bar ── */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Type a message…"
          placeholderTextColor={Colors.typography["400"]}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={2000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={Colors.typography.white} />
          ) : (
            <Send size={18} color={Colors.typography.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Gap.small,
    paddingTop: Gap.medium,
    paddingBottom: Gap.extraSmall,
    backgroundColor: Colors.background["950"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline["800"],
    gap: Gap.extraSmall,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.extraSmall,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitials: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  // Loading / empty
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Gap.large,
  },
  emptyText: {
    color: Colors.typography["400"],
    fontSize: 14,
  },
  // Message list
  messageListContent: {
    paddingHorizontal: Gap.small,
    paddingVertical: Gap.small,
    flexGrow: 1,
  },
  // Day header
  dayHeader: {
    alignItems: "center",
    marginVertical: Gap.extraSmall,
  },
  dayHeaderText: {
    fontSize: 12,
    color: Colors.typography["400"],
    backgroundColor: Colors.background["900"],
    paddingHorizontal: Gap.extraSmall,
    paddingVertical: 4,
    borderRadius: Radius.round,
    overflow: "hidden",
  },
  // Bubble row
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  bubbleRowOwn: {
    justifyContent: "flex-end",
  },
  bubbleRowOther: {
    justifyContent: "flex-start",
  },
  // Avatar (other side only)
  bubbleAvatar: {
    width: 32,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  bubbleAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: Radius.round,
  },
  bubbleAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: Radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleAvatarInitials: {
    fontSize: 11,
    fontWeight: "700",
  },
  bubbleAvatarSpacer: {
    width: 32,
    height: 32,
  },
  // Bubble container
  bubbleContainer: {
    maxWidth: "72%",
  },
  bubbleContainerOwn: {
    alignItems: "flex-end",
  },
  bubbleContainerOther: {
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleOwn: {
    backgroundColor: Colors.info["400"],
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.background["900"],
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextOwn: {
    color: Colors.typography.white,
  },
  bubbleTextOther: {
    color: Colors.typography["0"],
  },
  bubbleTime: {
    fontSize: 11,
    color: Colors.typography["400"],
    marginTop: 3,
    marginHorizontal: 4,
  },
  bubbleTimeOwn: {
    textAlign: "right",
  },
  bubbleTimeOther: {
    textAlign: "left",
  },
  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Gap.small,
    paddingVertical: Gap.extraSmall,
    paddingBottom: Platform.OS === "ios" ? Gap.mediumSmall : Gap.extraSmall,
    backgroundColor: Colors.background["950"],
    borderTopWidth: 1,
    borderTopColor: Colors.outline["800"],
    gap: Gap.xxSmall,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.background["900"],
    borderRadius: 22,
    paddingHorizontal: Gap.small,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: Colors.typography["0"],
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    backgroundColor: Colors.info["400"],
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.background["700"],
  },
});
