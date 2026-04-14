import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  messagingService,
  ConversationRecord,
  MessageRecord,
} from "../services/messagingService";
import { authService } from "../services/authService";

interface MessagingContextType {
  conversations: ConversationRecord[];
  activeConversation: ConversationRecord | null;
  messages: MessageRecord[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  fetchConversations: () => Promise<{
    success: boolean;
    data?: ConversationRecord[];
    error?: string;
  }>;
  openConversation: (conversationId: string) => Promise<{
    success: boolean;
    data?: MessageRecord[];
    error?: string;
  }>;
  startConversation: (participantIds: string[]) => Promise<{
    success: boolean;
    data?: ConversationRecord;
    error?: string;
  }>;
  sendMessage: (
    body: string,
    attachments?: File[] | Blob[],
  ) => Promise<{
    success: boolean;
    data?: MessageRecord;
    error?: string;
  }>;
  loadMoreMessages: () => Promise<{
    success: boolean;
    data?: MessageRecord[];
    error?: string;
  }>;
  closeConversation: () => void;
  clearError: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined,
);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ConversationRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeConversation) return;

    messagingService.subscribeToMessages(
      activeConversation.id,
      ({ action, record }) => {
        if (action === "create") {
          setMessages((prev) => [record, ...prev]);
        }
      },
    );

    return () => {
      messagingService.unsubscribeFromMessages();
    };
  }, [activeConversation]);

  const fetchConversations = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to fetch conversations.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await messagingService.getConversationsByUser(
        user.id,
        "participants",
      );
      if (result.success && result.data) {
        setConversations(result.data);
      } else {
        setError(result.error || "Failed to fetch conversations.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while fetching conversations.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const openConversation = async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const convResult = await messagingService.getConversationById(
        conversationId,
        "participants",
      );
      if (convResult.success && convResult.data) {
        setActiveConversation(convResult.data);
      }

      const msgResult = await messagingService.getMessages(
        conversationId,
        1,
        50,
        "sender",
      );
      if (msgResult.success && msgResult.data) {
        setMessages(msgResult.data);
        setTotalPages(msgResult.totalPages || 1);
      } else {
        setError(msgResult.error || "Failed to fetch messages.");
      }
      return msgResult;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while opening the conversation.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (participantIds: string[]) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const errorMessage = "User must be logged in to start a conversation.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const allParticipants = [...new Set([user.id, ...participantIds])];
      const result =
        await messagingService.getOrCreateConversation(allParticipants);
      if (result.success && result.data) {
        setActiveConversation(result.data);
        setConversations((prev) => {
          if (prev.find((c) => c.id === result.data!.id)) return prev;
          return [result.data!, ...prev];
        });
      } else {
        setError(result.error || "Failed to start conversation.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while starting the conversation.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (body: string, attachments?: File[] | Blob[]) => {
    const user = authService.getCurrentUser();
    if (!user || !activeConversation) {
      const errorMessage = "Must be in an active conversation to send a message.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await messagingService.sendMessage(
        activeConversation.id,
        user.id,
        body,
        attachments,
      );
      if (!result.success) {
        setError(result.error || "Failed to send message.");
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while sending the message.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeConversation || currentPage >= totalPages) {
      return { success: true, data: [] };
    }

    const nextPage = currentPage + 1;
    setIsLoading(true);

    try {
      const result = await messagingService.getMessages(
        activeConversation.id,
        nextPage,
        50,
        "sender",
      );
      if (result.success && result.data) {
        setMessages((prev) => [...prev, ...result.data!]);
        setCurrentPage(nextPage);
      }
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "An unexpected error occurred while loading more messages.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setCurrentPage(1);
    setTotalPages(1);
  }, []);

  const clearError = () => setError(null);

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoading,
        isSending,
        error,
        fetchConversations,
        openConversation,
        startConversation,
        sendMessage,
        loadMoreMessages,
        closeConversation,
        clearError,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
