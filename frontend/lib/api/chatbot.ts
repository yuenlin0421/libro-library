// lib/api/chatbot.ts
import axios from "./client";

export interface Conversation {
  id: number;
  book: number | null;
  user_message: string;
  bot_response: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedConversations {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
}

export interface ConversationStats {
  total_conversations: number;
  books_with_conversations: number;
}

export const chatbotApi = {
  /**
   * Get all conversation history
   */
  async getConversations(): Promise<PaginatedConversations> {
    const response = await axios.get<PaginatedConversations>(
      "/api/chatbot/conversations/",
    );
    return response.data;
  },

  /**
   * Get conversation history for a specific book
   */
  async getBookConversations(bookId: number): Promise<PaginatedConversations> {
    const response = await axios.get<PaginatedConversations>(
      "/api/chatbot/conversations/",
      {
        params: { book_id: bookId },
      },
    );
    return response.data;
  },

  /**
   * Get a specific conversation by ID
   */
  async getConversation(id: number): Promise<Conversation> {
    const response = await axios.get<Conversation>(
      `/api/chatbot/conversations/${id}/`,
    );
    return response.data;
  },

  /**
   * Send a message to the chatbot
   */
  async sendMessage(message: string, bookId?: number): Promise<ChatResponse> {
    const response = await axios.post<ChatResponse>(
      "/api/chatbot/conversations/chat/",
      {
        message,
        ...(bookId && { book_id: bookId }),
      },
    );
    return response.data;
  },

  /**
   * Clear all conversation history
   */
  async clearAllHistory(): Promise<{ message: string }> {
    const response = await axios.delete<{ message: string }>(
      "/api/chatbot/conversations/clear-history/",
    );
    return response.data;
  },

  /**
   * Clear conversation history for a specific book
   */
  async clearBookHistory(bookId: number): Promise<{ message: string }> {
    const response = await axios.delete<{ message: string }>(
      "/api/chatbot/conversations/clear-history/",
      {
        params: { book_id: bookId },
      },
    );
    return response.data;
  },

  /**
   * Get conversation statistics
   */
  async getStats(): Promise<ConversationStats> {
    const response = await axios.get<ConversationStats>(
      "/api/chatbot/conversations/stats/",
    );
    return response.data;
  },
};
