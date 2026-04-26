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
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ChevronDown,
  User,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Gap } from "@/constants/gap";
import { Radius } from "@/constants/radius";
import { authService } from "@/services/authService";
import { doctorService, DoctorRecord } from "@/services/doctorService";
import { patientService, PatientRecord } from "@/services/patientService";
import { consultationService } from "@/services/consultationService";
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
      <View style={calStyles.row}>
        {WEEKDAY_LABELS.map((d) => (
          <Text key={d} style={calStyles.weekdayLabel}>{d}</Text>
        ))}
      </View>
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
                style={[calStyles.cell, isSelected && calStyles.cellSelected, isPast && calStyles.cellDisabled]}
                onPress={() => !isPast && onSelect(cellDate)}
                disabled={isPast}
              >
                <Text style={[calStyles.cellText, isSelected && calStyles.cellTextSelected, isPast && calStyles.cellTextDisabled]}>
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

// ─── Generic Picker Modal ─────────────────────────────────────────────────────

function PickerModal<T>({
  visible, title, items, selected, onSelect, onClose, labelFn,
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

export default function NewConsultationScreen() {
  const router = useRouter();

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const currentUser = authService.getCurrentUser();
    if (!currentUser) { setIsLoading(false); return; }

    const doctorResult = await doctorService.getDoctorByUserId(currentUser.id);
    if (!doctorResult.success || !doctorResult.data) { setIsLoading(false); return; }

    const doc = doctorResult.data;
    setDoctor(doc);

    const patientsResult = await patientService.getPatientsByDoctor(doc.id);
    if (patientsResult.success && patientsResult.data) {
      setPatients(patientsResult.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const handleConfirm = async () => {
    if (!selectedPatient || !selectedDate || !selectedTime || !selectedAddress) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }
    if (!doctor) return;

    const scheduledAt = parseTimeSlot(selectedDate, selectedTime);
    setIsSubmitting(true);

    const result = await consultationService.createConsultation({
      patient: selectedPatient.id,
      doctor: doctor.id,
      title: title.trim() || "Consultation",
      status: "scheduled",
      type: "in_person",
      scheduled_at: scheduledAt.toISOString(),
      address: selectedAddress,
    });

    if (result.success) {
      const patientUserId = selectedPatient.user;
      if (patientUserId) {
        await notificationService.createNotification({
          user: patientUserId,
          type: "consultation",
          title: "New Consultation Scheduled",
          body: `A consultation has been scheduled for you on ${formatDateLabel(selectedDate)} at ${selectedTime}.`,
        });
      }
      setIsSubmitting(false);
      Alert.alert("Created", "Consultation has been scheduled.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      setIsSubmitting(false);
      Alert.alert("Error", result.error || "Failed to create consultation.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1961F0" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>New Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Patient */}
        <Text style={styles.sectionLabel}>Patient</Text>
        <TouchableOpacity style={styles.pickerRow} onPress={() => setShowPatientPicker(true)}>
          <User size={18} color="#1961F0" />
          {selectedPatient ? (
            <View style={styles.patientPickerContent}>
              <View style={[styles.patientPickerAvatar, { backgroundColor: avatarColors(selectedPatient.full_name).bg }]}>
                <Text style={[styles.patientPickerAvatarText, { color: avatarColors(selectedPatient.full_name).text }]}>
                  {getInitials(selectedPatient.full_name)}
                </Text>
              </View>
              <Text style={styles.pickerText}>{selectedPatient.full_name}</Text>
            </View>
          ) : (
            <Text style={[styles.pickerText, styles.pickerPlaceholder]}>Select patient</Text>
          )}
          <ChevronDown size={16} color={Colors.typography["300"]} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.sectionLabel}>Title (optional)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Follow-up visit"
            placeholderTextColor={Colors.typography["400"]}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date */}
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
            : <Text style={styles.confirmButtonText}>Schedule Consultation</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <PickerModal
        visible={showPatientPicker}
        title="Select Patient"
        items={patients}
        selected={selectedPatient}
        onSelect={setSelectedPatient}
        onClose={() => setShowPatientPicker(false)}
        labelFn={(p) => p.full_name}
      />
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
  container: { paddingVertical: Gap.extraSmall },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Gap.small },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: 15, fontWeight: "700", color: Colors.typography["0"] },
  row: { flexDirection: "row" },
  weekdayLabel: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600", color: Colors.typography["300"], paddingBottom: 6 },
  cell: { flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 100 },
  cellSelected: { backgroundColor: "#1961F0" },
  cellDisabled: { opacity: 0.3 },
  cellText: { fontSize: 14, color: Colors.typography["0"] },
  cellTextSelected: { color: "#fff", fontWeight: "700" },
  cellTextDisabled: { color: Colors.typography["400"] },
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.typography["300"],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: Gap.small,
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
  patientPickerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.extraSmall,
  },
  patientPickerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  patientPickerAvatarText: {
    fontSize: 11,
    fontWeight: "700",
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.typography["0"],
  },
  pickerPlaceholder: {
    color: Colors.typography["400"],
  },
  inputRow: {
    backgroundColor: Colors.background["950"],
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: Colors.outline["800"],
    paddingHorizontal: Gap.small,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    color: Colors.typography["0"],
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
  confirmButton: {
    backgroundColor: "#1961F0",
    borderRadius: Radius.small,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: Gap.medium,
  },
  confirmButtonDisabled: { opacity: 0.6 },
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
  modalItemSelected: { backgroundColor: "#EFF6FF" },
  modalItemText: {
    fontSize: 15,
    color: Colors.typography["0"],
  },
  modalItemTextSelected: {
    color: "#1961F0",
    fontWeight: "600",
  },
});
