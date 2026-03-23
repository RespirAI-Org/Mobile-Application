import React, { createContext, useContext, useState, ReactNode } from "react";
import { audioService, AudioRecord } from "../services/audioService";

interface AudioContextType {
  deviceId: string;
  setDeviceId: (id: string) => void;
  latestAudio: AudioRecord | null;
  allAudio: AudioRecord[];
  isLoading: boolean;
  error: string | null;
  fetchLatestAudio: () => Promise<{
    success: boolean;
    data?: AudioRecord;
    error?: string;
  }>;
  fetchAllAudio: () => Promise<{
    success: boolean;
    data?: AudioRecord[];
    error?: string;
  }>;
  isFetchingAll: boolean;
  clearError: () => void;
  clearAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState("");
  const [latestAudio, setLatestAudio] = useState<AudioRecord | null>(null);
  const [allAudio, setAllAudio] = useState<AudioRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestAudio = async () => {
    // Error handling when no deviceID provided
    if (!deviceId) {
      const errorMessage = "Device ID is required to fetch the latest audio.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await audioService.getLatestAudioByDeviceId(deviceId);
      if (result.success && result.data) {
        setLatestAudio(result.data);
      } else {
        setError(result.error || "Failed to fetch latest audio record.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching audio.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAudio = async () => {
    if (!deviceId) {
      const errorMessage = "Device ID is required to fetch audio records.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsFetchingAll(true);
    setError(null);

    try {
      const result = await audioService.getAllAudioByDeviceId(deviceId);
      if (result.success && result.data) {
        setAllAudio(result.data);
      } else {
        setError(result.error || "Failed to fetch audio records.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching audio.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsFetchingAll(false);
    }
  };

  const clearError = () => setError(null);

  const clearAudio = () => {
    setLatestAudio(null);
    setAllAudio([]);
    setDeviceId("");
    setError(null);
  };

  return (
    <AudioContext.Provider
      value={{
        deviceId,
        setDeviceId,
        latestAudio,
        allAudio,
        isLoading,
        isFetchingAll,
        error,
        fetchLatestAudio,
        fetchAllAudio,
        clearError,
        clearAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
