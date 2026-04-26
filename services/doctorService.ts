import { pb } from "../lib/pocketbase";

export interface DoctorRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  user: string;
  full_name: string;
  specialist: string;
  addresses: string[];
  expand?: {
    user?: any;
  };
}

export const doctorService = {
  async getDoctorByUserId(
    userId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: DoctorRecord; error?: string }> {
    try {
      const record = await pb
        .collection("doctors")
        .getFirstListItem<DoctorRecord>(`user = "${userId}"`, {
          expand: expand || "",
        });
      return { success: true, data: record };
    } catch (error: any) {
      if (error.status === 404) {
        return { success: false, error: "No doctor profile found for this user." };
      }
      console.error("[DoctorService] Fetch By User Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the doctor profile.",
      };
    }
  },

  async getDoctorById(
    id: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: DoctorRecord; error?: string }> {
    try {
      const record = await pb
        .collection("doctors")
        .getOne<DoctorRecord>(id, {
          expand: expand || "",
        });
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[DoctorService] Fetch Doctor Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the doctor.",
      };
    }
  },

  async getAllDoctors(
    expand?: string,
  ): Promise<{ success: boolean; data?: DoctorRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("doctors")
        .getFullList<DoctorRecord>({
          sort: "full_name",
          expand: expand || "",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[DoctorService] Fetch All Doctors Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching doctors.",
      };
    }
  },
};
