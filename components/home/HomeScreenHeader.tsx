import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Bell } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function HomeScreenHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require("@/assets/images/Patient-ava.jpeg")}
            style={styles.profileImage}
          />
        </View>
        <View>
          <Text style={styles.greetingText}>Good Morning,</Text>
          <Text style={styles.userName}>Sarah</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Bell size={20} color={Colors.typography["0"]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.background["950"],
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  greetingText: {
    fontSize: 18,
    color: Colors.typography["0"],
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  userName: {
    fontSize: 14,
    color: Colors.typography["200"],
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.background["950"],
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
