import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";

import {
  House,
  Activity,
  MessageCircleMore,
  Settings,
  ScanLine,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.info["400"],
        tabBarInactiveTintColor: Colors.background["400"],
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 10,
          backgroundColor: Colors.background["950"],
          borderTopWidth: 1,
          borderTopColor: Colors.outline["900"],
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarButton: (props) => <TouchableOpacity {...(props as any)} />,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Platform.select({
            ios: "System",
            android: "sans-serif-medium",
          }),
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: "Diagnosis",
          tabBarIcon: ({ color, focused }) => (
            <Activity size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.scanButton}>
              <ScanLine size={28} color={Colors.background["950"]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <MessageCircleMore size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Settings size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.info["400"],
    justifyContent: "center",
    alignItems: "center",
    marginTop: -24,
    shadowColor: Colors.info["400"],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 4,
    borderColor: Colors.background["950"],
  },
});
