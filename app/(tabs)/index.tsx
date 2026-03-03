import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import HomeScreenHeader from "@/components/home/HomeScreenHeader";
import StatusCard from "@/components/home/StatusCard";
import DeviceConnectionCard from "@/components/home/DeviceConnectionCard";
import DoctorNoteCard from "@/components/home/DoctorNoteCard";
import QuickActions from "@/components/home/QuickActions";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HomeScreenHeader />

        {/* Status Card */}
        <StatusCard />

        {/* Stethoscope Card */}
        <DeviceConnectionCard />

        {/* Doctor's Note */}
        <DoctorNoteCard />

        {/* Quick Actions */}
        <QuickActions />

        {/* Padding for bottom nav */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
});
