import { pb } from "../lib/pocketbase";

export interface ConversationRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  participants: string[];
  last_message_at: string;
  last_message_preview: string;
  expand?: {
    participants?: any[];
  };
}

export interface MessageRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  conversation: string;
  sender: string;
  body: string;
  attachments: string[];
  read_by: string[];
  expand?: {
    sender?: any;
  };
}

export const messagingService = {
  async getConversationsByUser(
    userId: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConversationRecord[]; error?: string }> {
    try {
      const records = await pb
        .collection("conversations")
        .getFullList<ConversationRecord>({
          filter: `participants ~ "${userId}"`,
          sort: "-last_message_at",
          expand: expand || "",
        });
      return { success: true, data: records };
    } catch (error: any) {
      console.error("[MessagingService] Fetch Conversations Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching conversations.",
      };
    }
  },

  async getConversationById(
    id: string,
    expand?: string,
  ): Promise<{ success: boolean; data?: ConversationRecord; error?: string }> {
    try {
      const record = await pb
        .collection("conversations")
        .getOne<ConversationRecord>(id, {
          expand: expand || "",
        });
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[MessagingService] Fetch Conversation Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching the conversation.",
      };
    }
  },

  async getOrCreateConversation(
    participantIds: string[],
  ): Promise<{ success: boolean; data?: ConversationRecord; error?: string }> {
    try {
      const filterParts = participantIds.map((id) => `participants ~ "${id}"`);
      const filter = filterParts.join(" && ");
      const existing = await pb
        .collection("conversations")
        .getFullList<ConversationRecord>({ filter });

      const match = existing.find(
        (c) => c.participants.length === participantIds.length,
      );
      if (match) {
        return { success: true, data: match };
      }

      const record = await pb
        .collection("conversations")
        .create<ConversationRecord>({ participants: participantIds });
      return { success: true, data: record };
    } catch (error: any) {
      console.error("[MessagingService] Get/Create Conversation Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred with the conversation.",
      };
    }
  },

  async getMessages(
    conversationId: string,
    page: number = 1,
    perPage: number = 50,
    expand?: string,
  ): Promise<{
    success: boolean;
    data?: MessageRecord[];
    totalPages?: number;
    error?: string;
  }> {
    try {
      const result = await pb
        .collection("messages")
        .getList<MessageRecord>(page, perPage, {
          filter: `conversation = "${conversationId}"`,
          sort: "-created",
          expand: expand || "",
        });
      return {
        success: true,
        data: result.items,
        totalPages: result.totalPages,
      };
    } catch (error: any) {
      console.error("[MessagingService] Fetch Messages Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while fetching messages.",
      };
    }
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
    attachments?: File[] | Blob[],
  ): Promise<{ success: boolean; data?: MessageRecord; error?: string }> {
    try {
      const formData = new FormData();
      formData.append("conversation", conversationId);
      formData.append("sender", senderId);
      formData.append("body", body);

      if (attachments) {
        for (const file of attachments) {
          formData.append("attachments", file);
        }
      }

      const record = await pb
        .collection("messages")
        .create<MessageRecord>(formData);

      await pb.collection("conversations").update(conversationId, {
        last_message_at: new Date().toISOString(),
        last_message_preview: body.substring(0, 100),
      });

      return { success: true, data: record };
    } catch (error: any) {
      console.error("[MessagingService] Send Message Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while sending the message.",
      };
    }
  },

  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = await pb
        .collection("messages")
        .getOne<MessageRecord>(messageId);
      if (!message.read_by.includes(userId)) {
        await pb.collection("messages").update(messageId, {
          "read_by+": userId,
        });
      }
      return { success: true };
    } catch (error: any) {
      console.error("[MessagingService] Mark Read Error:", error.message);
      return {
        success: false,
        error: error.message || "An error occurred while marking message as read.",
      };
    }
  },

  async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    try {
      const result = await pb.collection("messages").getList(1, 1, {
        filter: `conversation = "${conversationId}" && read_by !~ "${userId}"`,
      });
      return result.totalItems;
    } catch {
      return 0;
    }
  },

  subscribeToMessages(
    conversationId: string,
    callback: (data: { action: string; record: MessageRecord }) => void,
  ) {
    return pb
      .collection("messages")
      .subscribe<MessageRecord>("*", (e) => {
        if (e.record.conversation === conversationId) {
          callback(e);
        }
      });
  },

  unsubscribeFromMessages() {
    pb.collection("messages").unsubscribe("*");
  },
};
