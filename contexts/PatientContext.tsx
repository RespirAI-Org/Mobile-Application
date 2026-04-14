import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  patientService,
  PatientRecord,
  PatientCreateData,
} from "../services/patientService";
import { authService } from "../services/authService";

interface PatientContextType {
  patients: PatientRecord[];
  selectedPatient: PatientRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchPatients: () => Promise<{
    success: boolean;
    data?: PatientRecord[];
    error?: string;
  }>;
  selectPatient: (patient: PatientRecord | null) => void;
  createPatient: (data: Omit<PatientCreateData, "doctor">) => Promise<{
    success: boolean;
    data?: PatientRecord;
    error?: string;
  }>;
  updatePatient: (
    id: string,
    data: Partial<Omit<PatientCreateData, "doctor">>,
  ) => Promise<{
    success: boolean;
    data?: PatientRecord;
    error?: string;
  }>;
  deletePatient: (id: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  clearError: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch patients.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await patientService.getPatientsByDoctor(user.id);
      if (result.success && result.data) {
        setPatients(result.data);
      } else {
        setError(result.error || "Failed to fetch patients.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching patients.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = (patient: PatientRecord | null) => {
    setSelectedPatient(patient);
  };

  const createPatient = async (data: Omit<PatientCreateData, "doctor">) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to create a patient.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await patientService.createPatient({
        ...data,
        doctor: user.id,
      });
      if (result.success && result.data) {
        setPatients((prev) => [result.data!, ...prev]);
      } else {
        setError(result.error || "Failed to create patient.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while creating the patient.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (
    id: string,
    data: Partial<Omit<PatientCreateData, "doctor">>,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await patientService.updatePatient(id, data);
      if (result.success && result.data) {
        setPatients((prev) =>
          prev.map((p) => (p.id === id ? result.data! : p)),
        );
        if (selectedPatient?.id === id) {
          setSelectedPatient(result.data);
        }
      } else {
        setError(result.error || "Failed to update patient.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while updating the patient.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await patientService.deletePatient(id);
      if (result.success) {
        setPatients((prev) => prev.filter((p) => p.id !== id));
        if (selectedPatient?.id === id) {
          setSelectedPatient(null);
        }
      } else {
        setError(result.error || "Failed to delete patient.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while deleting the patient.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <PatientContext.Provider
      value={{
        patients,
        selectedPatient,
        isLoading,
        error,
        fetchPatients,
        selectPatient,
        createPatient,
        updatePatient,
        deletePatient,
        clearError,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientProvider");
  }
  return context;
}
