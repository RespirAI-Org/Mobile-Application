import { pb, PB_URL } from "../lib/pocketbase";

export interface PatientRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  doctor: string;
  user: string;
  full_name: string;
  gender: "male" | "female" | "other";
  date_of_birth: string;
  age: number;
  avatar: string;
  medical_history: string;
  status: "review" | "follow_up" | "normal";
  expand?: {
    doctor?: any;
  };
}

export type PatientCreateData = {
  doctor: string;
  full_name: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  medical_history?: string;
  status?: "review" | "follow_up" | "normal";
};

export const patientService = {
  async getPatientsByDoctor(
    doctorId: string,
  ): Promise<{ success: boolean; data?: PatientRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("patients")
        .getFullList<PatientRecord>({
          filter: `doctor = "${doctorId}"`,
          sort: "-created",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[PatientService] Fetch Patients Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching patients.",
      };
    }
  },

  async getPatientByUserId(
    userId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: PatientRecord; error?: string }> {
    try {
      const record = await pb
        .collection("patients")
        .getFirstListItem<PatientRecord>(`user = "${userId}"`, {
          expand: expand || "",
        });
      return { success: true, data: record };
    } catch (error: any) {
      if (error.status === 404) {
        return { success: false, error: "No patient profile found for this user." };
      }
      console.error("[PatientService] Fetch Patient By User Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the patient profile.",
      };
    }
  },

  async getPatientById(
    id: string,
  ): Promise<{ success: boolean; data?: PatientRecord; error?: string }> {
    try {
      const record = await pb
        .collection("patients")
        .getOne<PatientRecord>(id);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[PatientService] Fetch Patient Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the patient.",
      };
    }
  },

  async createPatient(
    data: PatientCreateData,
  ): Promise<{ success: boolean; data?: PatientRecord; error?: string }> {
    try {
      const record = await pb
        .collection("patients")
        .create<PatientRecord>(data);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[PatientService] Create Patient Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while creating the patient.",
      };
    }
  },

  async updatePatient(
    id: string,
    data: Partial<Omit<PatientCreateData, "doctor">>,
  ): Promise<{ success: boolean; data?: PatientRecord; error?: string }> {
    try {
      const updated = await pb
        .collection("patients")
        .update<PatientRecord>(id, data);
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[PatientService] Update Patient Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while updating the patient.",
      };
    }
  },

  async deletePatient(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await pb.collection("patients").delete(id);
      return { success: true };
    } catch (error: any) {
      console.error("[PatientService] Delete Patient Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while deleting the patient.",
      };
    }
  },

  async uploadAvatar(
    patientId: string,
    avatarFile: File | Blob,
  ): Promise<{ success: boolean; data?: PatientRecord; error?: string }> {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const updated = await pb
        .collection("patients")
        .update<PatientRecord>(patientId, formData);
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[PatientService] Upload Avatar Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while uploading the avatar.",
      };
    }
  },

  getAvatarUrl(record: PatientRecord): string | null {
    if (!record || !record.avatar) {
      return null;
    }
    return pb.files.getUrl(record, record.avatar);
  },
};
