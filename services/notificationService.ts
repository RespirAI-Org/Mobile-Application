import { pb } from "../lib/pocketbase";

export interface NotificationRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  user: string;
  type: "recording_ready" | "message" | "consultation" | "system";
  title: string;
  body: string;
  link: string;
  read: boolean;
}

export const notificationService = {
  async getNotificationsByUser(
    userId: string,
  ): Promise<{ success: boolean; data?: NotificationRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("notifications")
        .getFullList<NotificationRecord>({
          filter: `user = "${userId}"`,
          sort: "-created",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[NotificationService] Fetch Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching notifications.",
      };
    }
  },

  async getUnreadNotifications(
    userId: string,
  ): Promise<{ success: boolean; data?: NotificationRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("notifications")
        .getFullList<NotificationRecord>({
          filter: `user = "${userId}" && read = false`,
          sort: "-created",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[NotificationService] Fetch Unread Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching unread notifications.",
      };
    }
  },

  async getUnreadCount(
    userId: string,
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const result = await pb
        .collection("notifications")
        .getList<NotificationRecord>(1, 1, {
          filter: `user = "${userId}" && read = false`,
        });
      return { success: true, count: result.totalItems };
    } catch (error: any) {
      console.error("[NotificationService] Count Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while counting notifications.",
      };
    }
  },

  async markAsRead(
    notificationId: string,
  ): Promise<{ success: boolean; data?: NotificationRecord; error?: string }> {
    try {
      const updated = await pb
        .collection("notifications")
        .update<NotificationRecord>(notificationId, { read: true });
      return { success: true, data: updated };
    } catch (error: any) {
      console.error("[NotificationService] Mark Read Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while marking notification as read.",
      };
    }
  },

  async markAllAsRead(
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const unread = await pb
        .collection("notifications")
        .getFullList<NotificationRecord>({
          filter: `user = "${userId}" && read = false`,
        });
      await Promise.all(
        unread.map((n) =>
          pb.collection("notifications").update(n.id, { read: true }),
        ),
      );
      return { success: true };
    } catch (error: any) {
      console.error("[NotificationService] Mark All Read Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while marking all notifications as read.",
      };
    }
  },

  async deleteNotification(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await pb.collection("notifications").delete(id);
      return { success: true };
    } catch (error: any) {
      console.error("[NotificationService] Delete Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while deleting the notification.",
      };
    }
  },

  subscribeToNotifications(
    userId: string,
    callback: (data: { action: string; record: NotificationRecord }) => void,
  ) {
    return pb
      .collection("notifications")
      .subscribe<NotificationRecord>("*", (e) => {
        if (e.record.user === userId) {
          callback(e);
        }
      });
  },

  unsubscribeFromNotifications() {
    pb.collection("notifications").unsubscribe("*");
  },
};
