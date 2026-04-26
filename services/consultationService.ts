import { pb } from "../lib/pocketbase";

export interface ConsultationRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  patient: string;
  doctor: string;
  title: string;
  scheduled_at: string;
  type: "video_call" | "voice_call" | "in_person" | "follow_up";
  status: "pending" | "scheduled" | "completed" | "cancelled";
  notes: string;
  address: string;
  expand?: {
    patient?: any;
    doctor?: any;
  };
}

export type ConsultationCreateData = {
  patient: string;
  doctor: string;
  title?: string;
  scheduled_at?: string;
  type: ConsultationRecord["type"];
  status?: ConsultationRecord["status"];
  notes?: string;
  address?: string;
};

export const consultationService = {
  async getConsultationsByDoctor(
    doctorId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConsultationRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("consultations")
        .getFullList<ConsultationRecord>({
          filter: `doctor = "${doctorId}"`,
          sort: "-scheduled_at",
          expand: expand || "",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[ConsultationService] Fetch By Doctor Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching consultations.",
      };
    }
  },

  async getConsultationsByPatient(
    patientId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConsultationRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("consultations")
        .getFullList<ConsultationRecord>({
          filter: `patient = "${patientId}"`,
          sort: "-scheduled_at",
          expand: expand || "",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[ConsultationService] Fetch By Patient Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching consultations.",
      };
    }
  },

  async getConsultationById(
    id: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConsultationRecord; error?: string }> {
    try {
      const record = await pb
        .collection("consultations")
        .getOne<ConsultationRecord>(id, {
          expand: expand || "",
        });
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[ConsultationService] Fetch Consultation Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the consultation.",
      };
    }
  },

  async createConsultation(
    data: ConsultationCreateData,
  ): Promise<{ success: boolean; data?: ConsultationRecord; error?: string }> {
    try {
      const record = await pb
        .collection("consultations")
        .create<ConsultationRecord>(data);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[ConsultationService] Create Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while creating the consultation.",
      };
    }
  },

  async updateConsultation(
    id: string,
    data: Partial<Omit<ConsultationCreateData, "patient" | "doctor">>,
  ): Promise<{ success: boolean; data?: ConsultationRecord; error?: string }> {
    try {
      const updated = await pb
        .collection("consultations")
        .update<ConsultationRecord>(id, data);
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[ConsultationService] Update Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while updating the consultation.",
      };
    }
  },

  async deleteConsultation(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await pb.collection("consultations").delete(id);
      return { success: true };
    } catch (error: any) {
      console.error("[ConsultationService] Delete Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while deleting the consultation.",
      };
    }
  },

  async getPendingConsultations(
    doctorId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConsultationRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("consultations")
        .getFullList<ConsultationRecord>({
          filter: `doctor = "${doctorId}" && status = "pending"`,
          sort: "-created",
          expand: expand || "",
          $autoCancel: false,
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[ConsultationService] Fetch Pending Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching pending consultations.",
      };
    }
  },

  async getUpcomingConsultations(
    doctorId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConsultationRecord[]; error?: string }> {
    try {
      const now = new Date().toISOString();
      const records = await pb
        .collection("consultations")
        .getFullList<ConsultationRecord>({
          filter: `doctor = "${doctorId}" && scheduled_at > "${now}" && status = "scheduled"`,
          sort: "scheduled_at",
          expand: expand || "",
          $autoCancel: false,
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[ConsultationService] Fetch Upcoming Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching upcoming consultations.",
      };
    }
  },
};
