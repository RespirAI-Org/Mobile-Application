import { pb } from "../lib/pocketbase";

export interface AudioRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  device_id: string;
  audio_file?: string;
  [key: string]: any; // Catch-all for other fields that might exist
}

export const audioService = {
  async getLatestAudioByDeviceId(
    deviceId: string,
  ): Promise<{ success: boolean; data?: AudioRecord; error?: string }> {
    try {
      const record = await pb
        .collection("respirai_audio")
        .getFirstListItem<AudioRecord>(`device_id = "${deviceId}"`, {
          sort: "-created",
        });

      return { success: true, data: record };
    } catch (error: any) {
      if (error.status === 404) {
        return {
          success: false,
          error: "No audio records found for this device.",
        };
      }

      console.error("[AudioService] Fetch Latest Audio Error:", error.message);
      return {
        success: false,
        error:
          error.message || "An error occurred while fetching the latest audio.",
      };
    }
  },

  async getAllAudioByDeviceId(
    deviceId: string,
  ): Promise<{ success: boolean; data?: AudioRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("respirai_audio")
        .getFullList<AudioRecord>({
          filter: `device_id = "${deviceId}"`,
          sort: "-created",
        });

      return { success: true, data: records };
    } catch (error: any) {
      console.error("[AudioService] Fetch All Audio Error:", error.message);

      return {
        success: false,
        error:
          error.message || "An error occurred while fetching audio records.",
      };
    }
  },

  async getAudioById(
    id: string,
  ): Promise<{ success: boolean; data?: AudioRecord; error?: string }> {
    try {
      const record = await pb
        .collection("respirai_audio")
        .getOne<AudioRecord>(id);

      return { success: true, data: record };
    } catch (error: any) {
      console.error("[AudioService] Fetch Audio Error:", error.message);

      return {
        success: false,
        error: error.message || "An error occurred while fetching the audio.",
      };
    }
  },

  getAudioUrl(record: AudioRecord): string | null {
    if (!record || !record.audio_file) {
      return null;
    }
    return pb.files.getUrl(record, record.audio_file);
  },
};
