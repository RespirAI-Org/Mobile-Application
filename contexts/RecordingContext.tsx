import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  recordingService,
  RecordingRecord,
  RecordingCreateData,
} from "../services/recordingService";
import { authService } from "../services/authService";
import { doctorService } from "../services/doctorService";

interface RecordingContextType {
  recordings: RecordingRecord[];
  selectedRecording: RecordingRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchRecordingsByPatient: (patientId: string) => Promise<{
    success: boolean;
    data?: RecordingRecord[];
    error?: string;
  }>;
  fetchRecordingsByDoctor: () => Promise<{
    success: boolean;
    data?: RecordingRecord[];
    error?: string;
  }>;
  fetchRecordingById: (id: string) => Promise<{
    success: boolean;
    data?: RecordingRecord;
    error?: string;
  }>;
  selectRecording: (recording: RecordingRecord | null) => void;
  createRecording: (data: RecordingCreateData) => Promise<{
    success: boolean;
    data?: RecordingRecord;
    error?: string;
  }>;
  updateRecording: (
    id: string,
    data: Partial<Omit<RecordingCreateData, "patient" | "doctor" | "audio">>,
  ) => Promise<{
    success: boolean;
    data?: RecordingRecord;
    error?: string;
  }>;
  deleteRecording: (id: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  clearError: () => void;
  clearRecordings: () => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined,
);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [selectedRecording, setSelectedRecording] =
    useState<RecordingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordingsByPatient = async (patientId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await recordingService.getRecordingsByPatient(
        patientId,
        "audio,result,patient",
      );
      if (result.success && result.data) {
        setRecordings(result.data);
      } else {
        setError(result.error || "Failed to fetch recordings.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching recordings.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordingsByDoctor = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch recordings.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const doctorResult = await doctorService.getDoctorByUserId(user.id);
      if (!doctorResult.success || !doctorResult.data) {
        const errorMessage = doctorResult.error || "Doctor profile not found.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const result = await recordingService.getRecordingsByDoctor(
        doctorResult.data.id,
        "audio,result,patient",
      );
      if (result.success && result.data) {
        setRecordings(result.data);
      } else {
        setError(result.error || "Failed to fetch recordings.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching recordings.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordingById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await recordingService.getRecordingById(
        id,
        "audio,result,patient",
      );
      if (result.success && result.data) {
        setSelectedRecording(result.data);
      } else {
        setError(result.error || "Failed to fetch recording.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching the recording.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const selectRecording = (recording: RecordingRecord | null) => {
    setSelectedRecording(recording);
  };

  const createRecording = async (data: RecordingCreateData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await recordingService.createRecording(data);
      if (result.success && result.data) {
        setRecordings((prev) => [result.data!, ...prev]);
      } else {
        setError(result.error || "Failed to create recording.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while creating the recording.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecording = async (
    id: string,
    data: Partial<Omit<RecordingCreateData, "patient" | "doctor" | "audio">>,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await recordingService.updateRecording(id, data);
      if (result.success && result.data) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === id ? result.data! : r)),
        );
        if (selectedRecording?.id === id) {
          setSelectedRecording(result.data);
        }
      } else {
        setError(result.error || "Failed to update recording.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while updating the recording.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecording = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await recordingService.deleteRecording(id);
      if (result.success) {
        setRecordings((prev) => prev.filter((r) => r.id !== id));
        if (selectedRecording?.id === id) {
          setSelectedRecording(null);
        }
      } else {
        setError(result.error || "Failed to delete recording.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while deleting the recording.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const clearRecordings = () => {
    setRecordings([]);
    setSelectedRecording(null);
    setError(null);
  };

  return (
    <RecordingContext.Provider
      value={{
        recordings,
        selectedRecording,
        isLoading,
        error,
        fetchRecordingsByPatient,
        fetchRecordingsByDoctor,
        fetchRecordingById,
        selectRecording,
        createRecording,
        updateRecording,
        deleteRecording,
        clearError,
        clearRecordings,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecordings() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecordings must be used within a RecordingProvider");
  }
  return context;
}
