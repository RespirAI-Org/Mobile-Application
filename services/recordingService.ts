import { pb } from "../lib/pocketbase";

export interface RecordingRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  patient: string;
  doctor: string;
  audio: string;
  result: string;
  location: "at_hospital" | "at_home" | "clinic_visit";
  body_position: "mitral" | "aortic" | "pulmonic" | "tricuspid";
  diagnosis_title: string;
  severity: "normal" | "low" | "medium" | "high";
  confidence: number;
  confirmed: boolean;
  doctor_note: string;
  expand?: {
    audio?: any;
    result?: any;
    patient?: any;
  };
}

export type RecordingCreateData = {
  patient: string;
  doctor: string;
  audio: string;
  result?: string;
  location?: RecordingRecord["location"];
  body_position?: RecordingRecord["body_position"];
  diagnosis_title?: string;
  severity?: RecordingRecord["severity"];
  confidence?: number;
  confirmed?: boolean;
  doctor_note?: string;
};

export const recordingService = {
  async getRecordingsByPatient(
    patientId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: RecordingRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("recordings")
        .getFullList<RecordingRecord>({
          filter: `patient = "${patientId}"`,
          sort: "-created",
          expand: expand || "",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[RecordingService] Fetch By Patient Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching recordings.",
      };
    }
  },

  async getRecordingsByDoctor(
    doctorId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: RecordingRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("recordings")
        .getFullList<RecordingRecord>({
          filter: `doctor = "${doctorId}"`,
          sort: "-created",
          expand: expand || "",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[RecordingService] Fetch By Doctor Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching recordings.",
      };
    }
  },

  async getRecordingById(
    id: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: RecordingRecord; error?: string }> {
    try {
      const record = await pb
        .collection("recordings")
        .getOne<RecordingRecord>(id, {
          expand: expand || "",
        });
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[RecordingService] Fetch Recording Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the recording.",
      };
    }
  },

  async createRecording(
    data: RecordingCreateData,
  ): Promise<{ success: boolean; data?: RecordingRecord; error?: string }> {
    try {
      const record = await pb
        .collection("recordings")
        .create<RecordingRecord>(data);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[RecordingService] Create Recording Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while creating the recording.",
      };
    }
  },

  async updateRecording(
    id: string,
    data: Partial<Omit<RecordingCreateData, "patient" | "doctor" | "audio">>,
  ): Promise<{ success: boolean; data?: RecordingRecord; error?: string }> {
    try {
      const updated = await pb
        .collection("recordings")
        .update<RecordingRecord>(id, data);
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[RecordingService] Update Recording Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while updating the recording.",
      };
    }
  },

  async deleteRecording(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await pb.collection("recordings").delete(id);
      return { success: true };
    } catch (error: any) {
      console.error("[RecordingService] Delete Recording Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while deleting the recording.",
      };
    }
  },
};
