import React, { createContext, useContext, useState, ReactNode } from "react";
import { audioService, AudioRecord } from "../services/audioService";

interface AudioContextType {
  deviceId: string;
  setDeviceId: (id: string) => void;
  latestAudio: AudioRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchLatestAudio: () => Promise<{
    success: boolean;
    data?: AudioRecord;
    error?: string;
  }>;
  clearError: () => void;
  clearAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState("");
  const [latestAudio, setLatestAudio] = useState<AudioRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const clearError = () => setError(null);

  const clearAudio = () => {
    setLatestAudio(null);
    setDeviceId("");
    setError(null);
  };

  return (
    <AudioContext.Provider
      value={{
        deviceId,
        setDeviceId,
        latestAudio,
        isLoading,
        error,
        fetchLatestAudio,
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
