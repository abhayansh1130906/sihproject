"use client";

import React, { useState, useRef, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AssistantSource } from "@/lib/types";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sources?: AssistantSource[];
  timestamp: string;
}

const PRESET_PROMPTS = [
  "Explain my competency gaps",
  "Recommend courses for my skill gaps",
  "Explain my learning progress",
  "What are the responsibilities of DIID?",
];

export default function AssistantPage() {
  const { official } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      sender: "assistant",
      text: `Hello ${
        official?.name ? official.name : "Officer"
      }. I am the SkillIntel AI Assistant, connected to MoSPI's official statistical competency matrix, iGOT Karmayogi course repository, and NSSTA training records. How can I assist with your cadre development today?`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setError(null);
    setLoading(true);

    try {
      const response = await api.askAssistant({ question: query });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: response.answer,
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to generate response from the AI assistant. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "cleared-greeting",
        sender: "assistant",
        text: "Conversation cleared. How can I assist you with your competency and training goals?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setError(null);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Chat Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#002045] dark:bg-sky-950 flex items-center justify-center text-white shadow-2xs border border-transparent dark:border-sky-800/60">
              <Bot className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  SkillIntel Cadre Intelligence AI
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                  RAG Enabled
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                MoSPI Statistical Cadre & Karmayogi Knowledge Base
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Chat"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Quick Prompt Suggestions Bar */}
        <div className="px-4 sm:px-6 py-2 bg-[#f8f9ff] dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Prompts:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#002045] dark:hover:bg-sky-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isSourcesExpanded = !!expandedSources[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#002045] dark:bg-sky-950 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-2xs border border-transparent dark:border-sky-800/60">
                    <Bot className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-xl">
                  <div
                    className={`p-4 rounded-xl text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#002045] dark:bg-sky-700 text-white rounded-br-none shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Sources Citations for AI messages */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700">
                        <button
                          onClick={() => toggleSourceExpand(msg.id)}
                          className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-1 text-[#006a61] dark:text-teal-400">
                            <BookOpen className="w-3 h-3" />
                            Retrieved Sources ({msg.sources.length})
                          </span>
                          {isSourcesExpanded ? (
                            <ChevronUp className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          )}
                        </button>

                        {isSourcesExpanded && (
                          <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                            {msg.sources.map((src, i) => (
                              <div
                                key={i}
                                className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 flex items-start justify-between gap-2"
                              >
                                <div className="flex items-start gap-1.5">
                                  <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="text-slate-800 dark:text-slate-200 block">
                                      {src.title}
                                    </strong>
                                    <span className="text-slate-400 dark:text-slate-500">
                                      Source: {src.source} • Doc: {src.document_id}
                                    </span>
                                  </div>
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono shrink-0">
                                  {(src.similarity * 100).toFixed(0)}% Match
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] text-slate-400 dark:text-slate-500 ${
                      isUser ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading typing indicator */}
          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-lg bg-[#002045] dark:bg-sky-950 flex items-center justify-center text-white shrink-0 border border-transparent dark:border-sky-800/60">
                <Bot className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#006a61] dark:text-teal-400" />
                <span className="animate-pulse">
                  Querying cadre knowledge base & synthesizing answer...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-start gap-2 max-w-xl">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Query Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 transition-colors">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about competencies, gap mitigation, or iGOT training programs..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#006a61] dark:text-teal-400" />
            <span>AI responses are grounded in MoSPI datasets & FRAC documentation</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

