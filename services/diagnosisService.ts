import { pb } from "../lib/pocketbase";

export interface FramePrediction {
  frame_idx: number;
  pred_class: number;
  pred_name: string;
  probs: number[];
}

export interface DiagnosisResult {
  audio_id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  frame_predictions: FramePrediction[];
  id: string;
  num_frames: number;
  pred_class: number;
  pred_method: string;
  pred_name: string;
  prob_both: number;
  prob_crackles: number;
  prob_normal: number;
  prob_wheezes: number;
  status: string;
  updated: string;
}

export const diagnosisService = {
  async getResultById(
    resultId: string,
  ): Promise<{ success: boolean; data?: DiagnosisResult; error?: string }> {
    try {
      const record = await pb
        .collection("respirai_results")
        .getOne<DiagnosisResult>(resultId);
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[DiagnosisService] Fetch Error:", error.message);
      return {
        success: false,
        error:
          error.message ||
          "An error occurred while fetching the diagnosis result.",
      };
    }
  },

  /**
   * Fetch the diagnosis result associated with a specific audio ID
   * @param audioId The ID of the audio file to look up
   * @returns The first matching diagnosis result object
   */
  async getResultByAudioId(
    audioId: string,
  ): Promise<{ success: boolean; data?: DiagnosisResult; error?: string }> {
    try {
      const records = await pb
        .collection("respirai_results")
        .getFullList<DiagnosisResult>({
          filter: `audio_id = "${audioId}"`,
        });

      if (records.length > 0) {
        return { success: true, data: records[0] };
      } else {
        return {
          success: false,
          error: "Diagnosis result not found for this audio.",
        };
      }
    } catch (error: any) {
      console.error(
        "[DiagnosisService] Fetch By Audio ID Error:",
        error.message,
      );
      return {
        success: false,
        error:
          error.message ||
          "An error occurred while fetching the diagnosis result.",
      };
    }
  },

  /**
   * Fetch the diagnosis results associated with multiple audio IDs
   * @param audioIds The list of audio IDs to look up
   * @returns The matching diagnosis result objects
   */
  async getResultsByAudioIds(
    audioIds: string[],
  ): Promise<{ success: boolean; data?: DiagnosisResult[]; error?: string }> {
    try {
      if (audioIds.length === 0) {
        return { success: true, data: [] };
      }

      const filterString = audioIds
        .map((id) => `audio_id = "${id}"`)
        .join(" || ");

      const records = await pb
        .collection("respirai_results")
        .getFullList<DiagnosisResult>({
          filter: filterString,
        });

      return { success: true, data: records };
    } catch (error: any) {
      console.error(
        "[DiagnosisService] Fetch By Audio IDs Error:",
        error.message,
      );
      return {
        success: false,
        error:
          error.message ||
          "An error occurred while fetching the diagnosis results.",
      };
    }
  },

  /**
   * Poll for a diagnosis result until the status is 'completed'
   * @param audioId The ID of the audio file to wait for
   * @param maxRetries Maximum number of polling attempts
   * @param delayMs Delay between polling attempts in milliseconds
   */
  async waitForResult(
    audioId: string,
    maxRetries = 20,
    delayMs = 3000,
  ): Promise<{ success: boolean; data?: DiagnosisResult; error?: string }> {
    for (let i = 0; i < maxRetries; i++) {
      const response = await this.getResultByAudioId(audioId);

      if (response.success && response.data) {
        if (response.data.status === "completed") {
          return { success: true, data: response.data };
        } else if (response.data.status === "failed") {
          return {
            success: false,
            error: "Diagnosis processing failed on the server.",
          };
        }
      }

      // Wait before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return { success: false, error: "Timed out waiting for diagnosis result." };
  },
};
