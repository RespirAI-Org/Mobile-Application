import React, { createContext, useContext, useState, ReactNode } from "react";
import { deviceService, DeviceRecord } from "../services/deviceService";
import { authService } from "../services/authService";

interface DeviceContextType {
  devices: DeviceRecord[];
  selectedDevice: DeviceRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchDevices: () => Promise<{
    success: boolean;
    data?: DeviceRecord[];
    error?: string;
  }>;
  selectDevice: (device: DeviceRecord | null) => void;
  pairDevice: (deviceCode: string) => Promise<{
    success: boolean;
    data?: DeviceRecord;
    error?: string;
  }>;
  unpairDevice: (deviceId: string) => Promise<{
    success: boolean;
    data?: DeviceRecord;
    error?: string;
  }>;
  clearError: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch devices.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deviceService.getDevicesByOwner(user.id);
      if (result.success && result.data) {
        setDevices(result.data);
      } else {
        setError(result.error || "Failed to fetch devices.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while fetching devices.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const selectDevice = (device: DeviceRecord | null) => {
    setSelectedDevice(device);
  };

  const pairDevice = async (deviceCode: string) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to pair a device.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deviceService.pairDevice(deviceCode, user.id);
      if (result.success && result.data) {
        setDevices((prev) => [result.data!, ...prev]);
      } else {
        setError(result.error || "Failed to pair device.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while pairing device.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const unpairDevice = async (deviceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deviceService.unpairDevice(deviceId);
      if (result.success) {
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        if (selectedDevice?.id === deviceId) {
          setSelectedDevice(null);
        }
      } else {
        setError(result.error || "Failed to unpair device.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred while unpairing device.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <DeviceContext.Provider
      value={{
        devices,
        selectedDevice,
        isLoading,
        error,
        fetchDevices,
        selectDevice,
        pairDevice,
        unpairDevice,
        clearError,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevices must be used within a DeviceProvider");
  }
  return context;
}
