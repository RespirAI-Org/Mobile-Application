import React, { createContext, useContext, useState, ReactNode } from "react";
import { authService } from "../services/authService";

interface SignupContextType {
  isLoading: boolean;
  error: string | null;
  signup: (
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<{ success: boolean; user?: any; error?: string }>;
  clearError: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signup(
        email,
        password,
        passwordConfirm
      );

      if (!response.success) {
        setError(response.error || "Signup failed. Please try again.");
      }

      return response;
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <SignupContext.Provider value={{ isLoading, error, signup, clearError }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
};
