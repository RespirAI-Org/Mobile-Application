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
      console.error("[AudioService] Fetch Latest Audio Error:", error.message);

      // PocketBase throws a 404 error if getFirstListItem doesn't find any matches
      if (error.status === 404) {
        return {
          success: false,
          error: "No audio records found for this device.",
        };
      }

      return {
        success: false,
        error:
          error.message || "An error occurred while fetching the latest audio.",
      };
    }
  },
};
