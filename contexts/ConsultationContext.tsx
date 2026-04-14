import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  consultationService,
  ConsultationRecord,
  ConsultationCreateData,
} from "../services/consultationService";
import { authService } from "../services/authService";
import { doctorService } from "../services/doctorService";

interface ConsultationContextType {
  consultations: ConsultationRecord[];
  upcomingConsultations: ConsultationRecord[];
  selectedConsultation: ConsultationRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchConsultations: () => Promise<{
    success: boolean;
    data?: ConsultationRecord[];
    error?: string;
  }>;
  fetchConsultationsByPatient: (patientId: string) => Promise<{
    success: boolean;
    data?: ConsultationRecord[];
    error?: string;
  }>;
  fetchUpcoming: () => Promise<{
    success: boolean;
    data?: ConsultationRecord[];
    error?: string;
  }>;
  selectConsultation: (consultation: ConsultationRecord | null) => void;
  createConsultation: (
    data: Omit<ConsultationCreateData, "doctor">,
  ) => Promise<{
    success: boolean;
    data?: ConsultationRecord;
    error?: string;
  }>;
  updateConsultation: (
    id: string,
    data: Partial<Omit<ConsultationCreateData, "patient" | "doctor">>,
  ) => Promise<{
    success: boolean;
    data?: ConsultationRecord;
    error?: string;
  }>;
  deleteConsultation: (id: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  clearError: () => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(
  undefined,
);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [upcomingConsultations, setUpcomingConsultations] = useState<
    ConsultationRecord[]
  >([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch consultations.";
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

      const result = await consultationService.getConsultationsByDoctor(
        doctorResult.data.id,
        "patient",
      );
      if (result.success && result.data) {
        setConsultations(result.data);
      } else {
        setError(result.error || "Failed to fetch consultations.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while fetching consultations.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConsultationsByPatient = async (patientId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await consultationService.getConsultationsByPatient(
        patientId,
        "patient,doctor",
      );
      if (result.success && result.data) {
        setConsultations(result.data);
      } else {
        setError(result.error || "Failed to fetch consultations.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while fetching consultations.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch upcoming consultations.";
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

      const result = await consultationService.getUpcomingConsultations(
        doctorResult.data.id,
        "patient",
      );
      if (result.success && result.data) {
        setUpcomingConsultations(result.data);
      } else {
        setError(result.error || "Failed to fetch upcoming consultations.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while fetching upcoming consultations.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const selectConsultation = (consultation: ConsultationRecord | null) => {
    setSelectedConsultation(consultation);
  };

  const createConsultation = async (
    data: Omit<ConsultationCreateData, "doctor">,
  ) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to create a consultation.";
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

      const result = await consultationService.createConsultation({
        ...data,
        doctor: doctorResult.data.id,
      });
      if (result.success && result.data) {
        setConsultations((prev) => [result.data!, ...prev]);
      } else {
        setError(result.error || "Failed to create consultation.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while creating the consultation.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsultation = async (
    id: string,
    data: Partial<Omit<ConsultationCreateData, "patient" | "doctor">>,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await consultationService.updateConsultation(id, data);
      if (result.success && result.data) {
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? result.data! : c)),
        );
        if (selectedConsultation?.id === id) {
          setSelectedConsultation(result.data);
        }
      } else {
        setError(result.error || "Failed to update consultation.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while updating the consultation.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConsultation = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await consultationService.deleteConsultation(id);
      if (result.success) {
        setConsultations((prev) => prev.filter((c) => c.id !== id));
        if (selectedConsultation?.id === id) {
          setSelectedConsultation(null);
        }
      } else {
        setError(result.error || "Failed to delete consultation.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while deleting the consultation.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <ConsultationContext.Provider
      value={{
        consultations,
        upcomingConsultations,
        selectedConsultation,
        isLoading,
        error,
        fetchConsultations,
        fetchConsultationsByPatient,
        fetchUpcoming,
        selectConsultation,
        createConsultation,
        updateConsultation,
        deleteConsultation,
        clearError,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultations() {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error(
      "useConsultations must be used within a ConsultationProvider",
    );
  }
  return context;
}
