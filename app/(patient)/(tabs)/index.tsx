import React, { useEffect } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import HomeScreenHeader from "@/components/home/HomeScreenHeader";
import StatusCard from "@/components/home/StatusCard";
import DeviceConnectionCard from "@/components/home/DeviceConnectionCard";
import DoctorNoteCard from "@/components/home/DoctorNoteCard";
import QuickActions from "@/components/home/QuickActions";
import { useAudio } from "@/contexts/AudioContext";
import { useDiagnosis } from "@/contexts/DiagnosisContext";

export default function HomeScreen() {
  const {
    deviceId,
    setDeviceId,
    fetchLatestAudio,
    latestAudio,
    error: audioError,
  } = useAudio();
  const {
    audioId,
    fetchDiagnosis,
    diagnosisResult,
    error: diagnosisError,
  } = useDiagnosis();

  // Test fetching when the component mounts
  useEffect(() => {
    // TODO: Replace with the actual device ID (e.g., from user profile / auth context)
    setDeviceId("test");
  }, []);

  // Fetch audio once deviceId is set
  useEffect(() => {
    if (deviceId) {
      fetchLatestAudio();
    }
  }, [deviceId]);

  // Fetch diagnosis once audioId is automatically updated by the context
  useEffect(() => {
    if (audioId) {
      fetchDiagnosis();
    }
  }, [audioId]);

  // Log results to verify the services run properly
  useEffect(() => {
    if (latestAudio) console.log("Fetched Latest Audio ID:", latestAudio.id);
    if (audioError) console.error("Audio Fetch Error:", audioError);
  }, [latestAudio, audioError]);

  useEffect(() => {
    if (diagnosisResult)
      console.log("Fetched Diagnosis Result:", diagnosisResult);
    if (diagnosisError) console.error("Diagnosis Fetch Error:", diagnosisError);
  }, [diagnosisResult, diagnosisError]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeScreenHeader />
        <StatusCard />
        <DeviceConnectionCard />
        <DoctorNoteCard />
        <QuickActions />
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
    paddingHorizontal: Gap.medium,
    paddingTop: Gap.small,
    paddingBottom: Gap.large,
  },
});
