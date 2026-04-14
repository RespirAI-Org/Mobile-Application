import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Repeat2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface DoctorNoteCardProps {
  doctorName: string | null;
  doctorAvatarUri: string | null;
  specialist: string | null;
  note: string | null;
  createdAt: string | null;
  onReply?: () => void;
}

export default function DoctorNoteCard({
  doctorName,
  doctorAvatarUri,
  specialist,
  note,
  createdAt,
  onReply,
}: DoctorNoteCardProps) {
  if (!note) return null;

  const timeAgo = createdAt ? formatTimeAgo(createdAt) : "";
  const roleParts = [specialist, timeAgo].filter(Boolean);
  const roleLabel = roleParts.join(" • ");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{"Doctor's Note"}</Text>
      <View style={styles.noteCard}>
        <View style={styles.doctorHeader}>
          {doctorAvatarUri ? (
            <Image
              source={{ uri: doctorAvatarUri }}
              style={styles.doctorImage}
            />
          ) : (
            <Image
              source={require("@/assets/images/Doctor-ava.jpeg")}
              style={styles.doctorImage}
            />
          )}
          <View>
            <Text style={styles.doctorName}>
              {doctorName || "Your Doctor"}
            </Text>
            <Text style={styles.doctorRole}>{roleLabel}</Text>
          </View>
        </View>
        <View style={styles.noteContent}>
          <Text style={styles.noteText}>{stripHtml(note)}</Text>
        </View>
        <TouchableOpacity style={styles.replyButton} onPress={onReply}>
          <Text style={styles.replyButtonText}>Reply to Doctor</Text>
          <Repeat2
            size={16}
            color={Colors.info["200"]}
            style={{ transform: [{ scaleX: 1 }] }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.typography["0"],
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: Colors.background["950"],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline["900"],
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  doctorRole: {
    fontSize: 12,
    color: Colors.typography["200"],
    fontWeight: "400",
  },
  noteContent: {
    backgroundColor: Colors.background["900"],
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  noteText: {
    color: Colors.typography["100"],
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  replyButtonText: {
    color: Colors.info["200"],
    fontSize: 14,
    fontWeight: "600",
  },
});
