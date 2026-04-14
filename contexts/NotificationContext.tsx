import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  notificationService,
  NotificationRecord,
} from "../services/notificationService";
import { authService } from "../services/authService";

interface NotificationContextType {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<{
    success: boolean;
    data?: NotificationRecord[];
    error?: string;
  }>;
  markAsRead: (notificationId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  markAllAsRead: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  deleteNotification: (id: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    notificationService.subscribeToNotifications(
      user.id,
      ({ action, record }) => {
        if (action === "create") {
          setNotifications((prev) => [record, ...prev]);
          if (!record.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      },
    );

    return () => {
      notificationService.unsubscribeFromNotifications();
    };
  }, []);

  const fetchNotifications = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch notifications.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await notificationService.getNotificationsByUser(user.id);
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter((n) => !n.read).length);
      } else {
        setError(result.error || "Failed to fetch notifications.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while fetching notifications.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while marking notification as read.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const markAllAsRead = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, error: "User must be logged in." };
    }

    setIsLoading(true);

    try {
      const result = await notificationService.markAllAsRead(user.id);
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while marking all notifications as read.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      const result = await notificationService.deleteNotification(id);
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while deleting the notification.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
