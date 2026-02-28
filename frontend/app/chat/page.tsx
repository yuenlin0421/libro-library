"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { chatbotApi } from "@/lib/api/chatbot";
import { Bot, User, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await chatbotApi.getConversations();
      const loadedMessages: Message[] = [];

      response.results.forEach((conv) => {
        loadedMessages.push({
          id: conv.id * 2 - 1,
          role: "user",
          content: conv.user_message,
          timestamp: new Date(conv.created_at),
        });
        loadedMessages.push({
          id: conv.id * 2,
          role: "assistant",
          content: conv.bot_response,
          timestamp: new Date(conv.created_at),
        });
      });

      setMessages(loadedMessages.reverse());
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatbotApi.sendMessage(input);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await chatbotApi.clearAllHistory();
      setMessages([]);
      setIsModalOpen(false);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Failed to clear chat:", error);
      toast.error("Failed to clear chat history");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-[linear-gradient(135deg,#0f172a_0%,#020617_100%)]">
          <header className="px-8 h-20 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                <Bot className="text-indigo-400" size={24} />
              </div>
              <h1 className="text-3xl font-bold">Libro AI Assistant</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 p-2 px-4 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <Trash2 size={18} />
              <span className="text-sm font-medium">Clear Chat</span>
            </button>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.length === 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                    <Bot size={16} className="text-emerald-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[80%] backdrop-blur-md">
                    <p className="text-sm leading-relaxed text-slate-200">
                      Hello! I'm your Libro AI Assistant. I can help you
                      summarize your books or find specific insights. How can I
                      help you today?
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                      <Bot size={16} className="text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl max-w-[80%] ${
                      message.role === "user"
                        ? "bg-indigo-600/90 text-white rounded-tr-none shadow-lg shadow-indigo-500/10"
                        : "bg-white/5 border border-white/10 rounded-tl-none backdrop-blur-md text-slate-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <User size={16} className="text-emerald-400" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                    <Bot size={16} className="text-emerald-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none backdrop-blur-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-8 pt-0">
            <div className="max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-end gap-2 bg-[#020617]/80 border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-indigo-500/50 backdrop-blur-2xl transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-3 px-2 resize-none max-h-40 min-h-[44px] text-white placeholder:text-slate-500 outline-none"
                    placeholder="Ask Libro anything about your collection..."
                    rows={1}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="h-10 w-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-[0.2em] font-bold">
                Libro AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </main>

        {/* Clear Chat Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-[440px] bg-[#0f172a] border border-white/10 rounded-[32px] p-10 shadow-2xl text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Trash2 className="text-slate-400" size={28} />
              </div>

              <h2 className="text-2xl font-bold mb-4 text-white">
                Clear Current Chat?
              </h2>

              <p className="text-slate-400 mb-10 leading-relaxed px-2">
                Are you sure you want to clear your current conversation? This
                action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 py-4 rounded-2xl bg-[#ff4b4b] hover:bg-[#ff3535] text-white font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
