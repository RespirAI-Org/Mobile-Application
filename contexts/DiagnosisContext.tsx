import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  diagnosisService,
  DiagnosisResult,
} from "../services/diagnosisService";
import { useAudio } from "./AudioContext";

interface DiagnosisContextType {
  audioId: string;
  setAudioId: (id: string) => void;
  diagnosisResult: DiagnosisResult | null;
  diagnosisResults: DiagnosisResult[];
  isLoading: boolean;
  error: string | null;
  fetchDiagnosis: () => Promise<{
    success: boolean;
    data?: DiagnosisResult;
    error?: string;
  }>;
  fetchDiagnosisResults: (audioIds: string[]) => Promise<{
    success: boolean;
    data?: DiagnosisResult[];
    error?: string;
  }>;
  waitForDiagnosis: (
    maxRetries?: number,
    delayMs?: number,
  ) => Promise<{
    success: boolean;
    data?: DiagnosisResult;
    error?: string;
  }>;
  clearError: () => void;
  clearDiagnosis: () => void;
}

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(
  undefined,
);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const { latestAudio } = useAudio();
  const [audioId, setAudioId] = useState("");
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>(
    [],
  );

  // Automatically update the audio ID when a new audio record is fetched
  useEffect(() => {
    if (latestAudio?.id && latestAudio.id !== audioId) {
      setAudioId(latestAudio.id);
      setDiagnosisResult(null); // Clear previous result when listening to a new audio record
      setError(null);
    }
  }, [latestAudio, audioId]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnosis = async () => {
    if (!audioId) {
      const errorMessage = "Audio ID is required to fetch a diagnosis.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await diagnosisService.getResultByAudioId(audioId);
      if (result.success && result.data) {
        setDiagnosisResult(result.data);
      } else {
        setError(result.error || "Failed to fetch diagnosis result");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching diagnosis.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiagnosisResults = async (audioIds: string[]) => {
    if (!audioIds || audioIds.length === 0) {
      setDiagnosisResults([]);
      return { success: true, data: [] };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await diagnosisService.getResultsByAudioIds(audioIds);
      if (result.success && result.data) {
        setDiagnosisResults(result.data);
      } else {
        setError(result.error || "Failed to fetch diagnosis results");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while fetching diagnosis results.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const waitForDiagnosis = async (maxRetries?: number, delayMs?: number) => {
    if (!audioId) {
      const errorMessage = "Audio ID is required to wait for a diagnosis.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await diagnosisService.waitForResult(
        audioId,
        maxRetries,
        delayMs,
      );
      if (result.success && result.data) {
        setDiagnosisResult(result.data);
      } else {
        setError(result.error || "Failed to wait for diagnosis result");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while waiting for diagnosis.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const clearDiagnosis = () => {
    setDiagnosisResult(null);
    setDiagnosisResults([]);
    setAudioId("");
    setError(null);
  };

  return (
    <DiagnosisContext.Provider
      value={{
        audioId,
        setAudioId,
        diagnosisResult,
        diagnosisResults,
        isLoading,
        error,
        fetchDiagnosis,
        fetchDiagnosisResults,
        waitForDiagnosis,
        clearError,
        clearDiagnosis,
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error("useDiagnosis must be used within a DiagnosisProvider");
  }
  return context;
}
