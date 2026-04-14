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

interface HomeScreenHeaderProps {
  userName: string;
  avatarUri: string | null;
  unreadCount: number;
  onNotificationPress?: () => void;
}

export default function HomeScreenHeader({
  userName,
  avatarUri,
  unreadCount,
  onNotificationPress,
}: HomeScreenHeaderProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning," : hour < 18 ? "Good Afternoon," : "Good Evening,";

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.profileImageContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.profileImage} />
          ) : (
            <Image
              source={require("@/assets/images/Patient-ava.jpeg")}
              style={styles.profileImage}
            />
          )}
        </View>
        <View>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
      >
        <Bell size={20} color={Colors.typography["0"]} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
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
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.error["500"],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.typography.white,
    fontSize: 10,
    fontWeight: "700",
  },
});
