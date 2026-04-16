import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, ScrollView, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import HomeScreenHeader from "@/components/home/HomeScreenHeader";
import StatusCard from "@/components/home/StatusCard";
import DeviceConnectionCard from "@/components/home/DeviceConnectionCard";
import DoctorNoteCard from "@/components/home/DoctorNoteCard";
import QuickActions from "@/components/home/QuickActions";
import { useAudio } from "@/contexts/AudioContext";
import { useDiagnosis } from "@/contexts/DiagnosisContext";
import { useDevices } from "@/contexts/DeviceContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePatients } from "@/contexts/PatientContext";
import { patientService } from "@/services/patientService";
import { recordingService, RecordingRecord } from "@/services/recordingService";

export default function HomeScreen() {
  const router = useRouter();
  const { deviceId, setDeviceId, fetchLatestAudio, latestAudio } = useAudio();
  const { audioId, fetchDiagnosis } = useDiagnosis();
  const { devices, selectedDevice, fetchDevices } = useDevices();
  const { unreadCount, fetchNotifications } = useNotifications();
  const { patientProfile, fetchPatientProfile } = usePatients();

  const [refreshing, setRefreshing] = useState(false);
  const [latestRecording, setLatestRecording] =
    useState<RecordingRecord | null>(null);

  const patientName = patientProfile?.full_name || "User";
  const patientAvatarUri = patientProfile
    ? patientService.getAvatarUrl(patientProfile)
    : null;

  const activeDevice =
    selectedDevice ||
    devices.find((d) => d.status === "active") ||
    devices[0] ||
    null;

  const fetchLatestRecording = useCallback(async () => {
    if (!patientProfile?.id) return;
    const result = await recordingService.getRecordingsByPatient(
      patientProfile.id,
      "doctor",
    );
    if (result.success && result.data && result.data.length > 0) {
      setLatestRecording(result.data[0]);
    }
  }, [patientProfile?.id]);

  const doctor =
    latestRecording?.expand?.doctor || patientProfile?.expand?.doctor;
  const doctorName = doctor?.full_name ? `Dr. ${doctor.full_name}` : null;
  const doctorSpecialist = doctor?.specialist || null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPatientProfile(),
      fetchDevices(),
      fetchNotifications(),
      deviceId ? fetchLatestAudio() : Promise.resolve(),
    ]);
    if (audioId) {
      await fetchDiagnosis();
    }
    setRefreshing(false);
  }, [
    deviceId,
    audioId,
    fetchLatestAudio,
    fetchDiagnosis,
    fetchDevices,
    fetchNotifications,
    fetchPatientProfile,
  ]);

  useEffect(() => {
    fetchPatientProfile();
    fetchDevices();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeDevice?.device_code && activeDevice.device_code !== deviceId) {
      setDeviceId(activeDevice.device_code);
    }
  }, [activeDevice?.device_code]);

  useEffect(() => {
    if (deviceId) {
      fetchLatestAudio();
    }
  }, [deviceId]);

  useEffect(() => {
    if (audioId) {
      fetchDiagnosis();
    }
  }, [audioId]);

  useEffect(() => {
    fetchLatestRecording();
  }, [fetchLatestRecording]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HomeScreenHeader
          userName={patientName}
          avatarUri={patientAvatarUri}
          unreadCount={unreadCount}
          onNotificationPress={() => router.push("/notifications" as any)}
        />
        <StatusCard />
        <DeviceConnectionCard
          deviceName={activeDevice?.name || null}
          status={activeDevice?.status || null}
        />
        <DoctorNoteCard
          doctorName={doctorName}
          doctorAvatarUri={null}
          specialist={doctorSpecialist}
          note={latestRecording?.doctor_note || null}
          createdAt={latestRecording?.created || null}
          onReply={() => {
            if (doctor?.user) {
              router.push(`/messages/${doctor.user}` as any);
            }
          }}
        />
        <QuickActions />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    paddingHorizontal: Gap.mediumSmall,
    paddingTop: Gap.large,
    paddingBottom: Gap.large,
  },
});
