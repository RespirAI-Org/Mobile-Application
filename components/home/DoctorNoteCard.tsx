import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Repeat2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function DoctorNoteCard() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Doctor's Note</Text>
      <View style={styles.noteCard}>
        <View style={styles.doctorHeader}>
          <Image
            source={require("@/assets/images/Doctor-ava.jpeg")}
            style={styles.doctorImage}
          />
          <View>
            <Text style={styles.doctorName}>Dr. Emily Chen</Text>
            <Text style={styles.doctorRole}>Cardiologist • 2 hours ago</Text>
          </View>
        </View>
        <View style={styles.noteContent}>
          <Text style={styles.noteText}>
            Your heart sounds are clear. Please continue with the prescribed
            medication and record again in 3 days. Let me know if you feel any
            shortness of breath.
          </Text>
        </View>
        <TouchableOpacity style={styles.replyButton}>
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
