import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, ChevronDown } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { authService } from "@/services/authService";
import { doctorService, DoctorRecord } from "@/services/doctorService";
import { consultationService, ConsultationRecord } from "@/services/consultationService";
import { notificationService } from "@/services/notificationService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m === 30) continue;
      const hour = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour}:${m === 0 ? "00" : "30"} ${ampm}`);
    }
  }
  return slots;
}

function parseTimeSlot(date: Date, timeSlot: string): Date {
  const [timePart, ampm] = timeSlot.split(" ");
  const [hourStr, minStr] = timePart.split(":");
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const result = new Date(date);
  result.setHours(hour, min, 0, 0);
  return result;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const TIME_SLOTS = generateTimeSlots();

// ─── Calendar ─────────────────────────────────────────────────────────────────

function CalendarPicker({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={calStyles.container}>
      {/* Month navigation */}
      <View style={calStyles.nav}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
          <ChevronLeft size={20} color={Colors.typography["0"]} />
        </TouchableOpacity>
        <Text style={calStyles.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
          <ChevronRight size={20} color={Colors.typography["0"]} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={calStyles.row}>
        {WEEKDAY_LABELS.map((d) => (
          <Text key={d} style={calStyles.weekdayLabel}>{d}</Text>
        ))}
      </View>

      {/* Day cells */}
      {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
        <View key={rowIdx} style={calStyles.row}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
            if (!day) return <View key={colIdx} style={calStyles.cell} />;

            const cellDate = new Date(viewYear, viewMonth, day);
            cellDate.setHours(0, 0, 0, 0);
            const isPast = cellDate <= today;
            const isSelected =
              selected !== null &&
              selected.getFullYear() === viewYear &&
              selected.getMonth() === viewMonth &&
              selected.getDate() === day;

            return (
              <TouchableOpacity
                key={colIdx}
                style={[
                  calStyles.cell,
                  isSelected && calStyles.cellSelected,
                  isPast && calStyles.cellDisabled,
                ]}
                onPress={() => !isPast && onSelect(cellDate)}
                disabled={isPast}
              >
                <Text
                  style={[
                    calStyles.cellText,
                    isSelected && calStyles.cellTextSelected,
                    isPast && calStyles.cellTextDisabled,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Time / Address Picker Modal ──────────────────────────────────────────────

function PickerModal<T>({
  visible,
  title,
  items,
  selected,
  onSelect,
  onClose,
  labelFn,
}: {
  visible: boolean;
  title: string;
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  onClose: () => void;
  labelFn: (item: T) => string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalDone}>Done</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => {
            const label = labelFn(item);
            const isSelected = selected !== null && labelFn(selected as T) === label;
            return (
              <TouchableOpacity
                style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [consultation, setConsultation] = useState<ConsultationRecord | null>(null);
  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const currentUser = authService.getCurrentUser();
    const [consultResult, doctorResult] = await Promise.all([
      consultationService.getConsultationById(id, "patient"),
      currentUser ? doctorService.getDoctorByUserId(currentUser.id) : Promise.resolve({ success: false, data: undefined }),
    ]);
    if (consultResult.success && consultResult.data) setConsultation(consultResult.data);
    if (doctorResult.success && doctorResult.data) setDoctor(doctorResult.data as DoctorRecord);
    setIsLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, []);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedAddress) {
      Alert.alert("Missing Info", "Please select a date, time, and address.");
      return;
    }
    if (!consultation) return;

    const scheduledAt = parseTimeSlot(selectedDate, selectedTime);
    setIsSubmitting(true);

    const result = await consultationService.updateConsultation(consultation.id, {
      status: "scheduled",
      scheduled_at: scheduledAt.toISOString(),
      address: selectedAddress,
    });

    if (result.success) {
      const patientUserId = consultation.expand?.patient?.user;
      if (patientUserId) {
        await notificationService.createNotification({
          user: patientUserId,
          type: "consultation",
          title: "Consultation Scheduled",
          body: `Your consultation has been scheduled for ${formatDateLabel(selectedDate)} at ${selectedTime}.`,
        });
      }
      setIsSubmitting(false);
      Alert.alert("Scheduled", "The consultation has been confirmed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      setIsSubmitting(false);
      Alert.alert("Error", result.error || "Failed to schedule consultation.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1961F0" />
      </View>
    );
  }

  if (!consultation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Consultation not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const patient = consultation.expand?.patient;
  const patientName: string = patient?.full_name ?? "Patient";
  const addresses: string[] = doctor?.addresses && typeof doctor.addresses === "object"
    ? Object.values(doctor.addresses as Record<string, string>)
    : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.typography["0"]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient card */}
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientAvatarText}>{getInitials(patientName)}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.consultationTitle}>{consultation.title || "Consultation Request"}</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Pending</Text>
          </View>
        </View>

        {/* Date — calendar */}
        <Text style={styles.sectionLabel}>Select Date</Text>
        <View style={styles.card}>
          <CalendarPicker selected={selectedDate} onSelect={setSelectedDate} />
        </View>
        {selectedDate && (
          <Text style={styles.selectedHint}>Selected: {formatDateLabel(selectedDate)}</Text>
        )}

        {/* Time */}
        <Text style={styles.sectionLabel}>Select Time</Text>
        <TouchableOpacity style={styles.pickerRow} onPress={() => setShowTimePicker(true)}>
          <Clock size={18} color="#1961F0" />
          <Text style={[styles.pickerText, !selectedTime && styles.pickerPlaceholder]}>
            {selectedTime ?? "Select time"}
          </Text>
          <ChevronDown size={16} color={Colors.typography["300"]} />
        </TouchableOpacity>

        {/* Address */}
        <Text style={styles.sectionLabel}>Location</Text>
        {addresses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No addresses saved in your profile.</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.pickerRow} onPress={() => setShowAddressPicker(true)}>
            <MapPin size={18} color="#1961F0" />
            <Text style={[styles.pickerText, !selectedAddress && styles.pickerPlaceholder]}>
              {selectedAddress ?? "Select address"}
            </Text>
            <ChevronDown size={16} color={Colors.typography["300"]} />
          </TouchableOpacity>
        )}

        {/* Confirm */}
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.confirmButtonText}>Confirm & Schedule</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <PickerModal
        visible={showTimePicker}
        title="Select Time"
        items={TIME_SLOTS}
        selected={selectedTime}
        onSelect={setSelectedTime}
        onClose={() => setShowTimePicker(false)}
        labelFn={(t) => t}
      />
      <PickerModal
        visible={showAddressPicker}
        title="Select Address"
        items={addresses}
        selected={selectedAddress}
        onSelect={setSelectedAddress}
        onClose={() => setShowAddressPicker(false)}
        labelFn={(a) => a}
      />
    </View>
  );
}

// ─── Calendar Styles ──────────────────────────────────────────────────────────

const calStyles = StyleSheet.create({
  container: {
    paddingVertical: Gap.extraSmall,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Gap.small,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  row: {
    flexDirection: "row",
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.typography["300"],
    paddingBottom: 6,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  cellSelected: {
    backgroundColor: "#1961F0",
  },
  cellDisabled: {
    opacity: 0.3,
  },
  cellText: {
    fontSize: 14,
    color: Colors.typography["0"],
  },
  cellTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  cellTextDisabled: {
    color: Colors.typography["400"],
  },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
    paddingTop: Gap.medium,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Gap.small,
    paddingHorizontal: Gap.mediumSmall,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Gap.mediumSmall,
    paddingVertical: Gap.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline["800"],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  scroll: {
    paddingHorizontal: Gap.mediumSmall,
    paddingTop: Gap.medium,
    paddingBottom: Gap.large,
    gap: Gap.extraSmall,
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    padding: Gap.small,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
    gap: Gap.small,
    marginBottom: Gap.small,
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  patientAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1961F0",
  },
  patientInfo: {
    flex: 1,
    gap: 3,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  consultationTitle: {
    fontSize: 13,
    color: Colors.typography["300"],
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.typography["300"],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: Gap.small,
  },
  card: {
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
    paddingHorizontal: Gap.small,
    paddingVertical: Gap.extraSmall,
  },
  selectedHint: {
    fontSize: 13,
    color: "#1961F0",
    fontWeight: "500",
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
    paddingHorizontal: Gap.small,
    paddingVertical: 14,
    gap: Gap.extraSmall,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.typography["0"],
  },
  pickerPlaceholder: {
    color: Colors.typography["400"],
  },
  emptyBox: {
    backgroundColor: Colors.background["900"],
    borderRadius: Radius.small,
    padding: Gap.small,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.typography["400"],
  },
  backLink: {
    fontSize: 14,
    color: "#1961F0",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#1961F0",
    borderRadius: Radius.small,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: Gap.medium,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: Colors.background["950"],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "55%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Gap.mediumSmall,
    paddingVertical: Gap.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline["800"],
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.typography["0"],
  },
  modalDone: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1961F0",
  },
  modalItem: {
    paddingHorizontal: Gap.mediumSmall,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline["900"],
  },
  modalItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  modalItemText: {
    fontSize: 15,
    color: Colors.typography["0"],
  },
  modalItemTextSelected: {
    color: "#1961F0",
    fontWeight: "600",
  },
});
