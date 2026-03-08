import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Sparkles, Bot, User, Mic, MicOff, Copy, Check, RefreshCw,
  Trash2, Crown, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { streamChat } from "@/lib/chatService";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Salut! 👋 Sunt **LifeOS AI**, asistentul tău personal. Pot să te ajut cu:\n\n- 📋 Planificarea task-urilor\n- 💰 Sfaturi financiare\n- 🏃 Tips de sănătate\n- ✍️ Scriere de email-uri\n- 🧠 Orice altceva ai nevoie!\n\nCu ce te pot ajuta azi?",
  timestamp: new Date(),
};

export default function AIChat() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  const isLimitReached =
    profile?.plan_type === "free" &&
    (profile?.ai_queries_used ?? 0) >= (profile?.ai_queries_limit ?? 50);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const incrementAIUsage = async () => {
    if (!user) return;
    const current = profile?.ai_queries_used ?? 0;
    await supabase
      .from("profiles")
      .update({ ai_queries_used: current + 1 })
      .eq("user_id", user.id);
  };

  const getContextData = () => {
    try {
      const weatherCache = localStorage.getItem("lifeos_widget_weather");
      const cryptoCache = localStorage.getItem("lifeos_widget_crypto");
      const healthCache = localStorage.getItem("lifeos_widget_health");
      return {
        userName: profile?.full_name || undefined,
        weather: weatherCache ? JSON.parse(weatherCache)?.data : undefined,
        crypto: cryptoCache ? JSON.parse(cryptoCache)?.data : undefined,
        health: healthCache ? JSON.parse(healthCache)?.data : undefined,
      };
    } catch {
      return { userName: profile?.full_name || undefined };
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (isLimitReached) {
      setShowLimitModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const abortController = new AbortController();
    abortRef.current = abortController;

    let assistantContent = "";

    const allMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamChat({
      messages: allMessages,
      contextData: getContextData(),
      signal: abortController.signal,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            { id: assistantId, role: "assistant", content: assistantContent, timestamp: new Date() },
          ];
        });
      },
      onDone: () => {
        setIsStreaming(false);
        abortRef.current = null;
        incrementAIUsage();
      },
      onError: (error) => {
        setIsStreaming(false);
        abortRef.current = null;
        toast.error(error);
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ ${error}`,
            timestamp: new Date(),
          },
        ]);
      },
    });
  };

  const handleRegenerate = () => {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const realIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[realIdx];

    // Remove messages after the last user message
    setMessages((prev) => prev.slice(0, realIdx));

    // Re-send
    setTimeout(() => sendMessage(lastUserMsg.content), 100);
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copiat!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MSG]);
    toast.success("Chat șters");
  };

  // Voice input
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Browser-ul tău nu suportă Speech-to-Text");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ro-RO";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Eroare la recunoașterea vocală");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="gradient-text">AI Assistant</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.plan_type === "free"
              ? `${profile.ai_queries_used ?? 0}/${profile.ai_queries_limit ?? 50} queries folosite`
              : "Unlimited queries"}
          </p>
        </div>
        <div className="flex gap-2">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs"
              onClick={handleClearChat}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Șterge
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 group ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 shrink-0 rounded-lg gradient-primary flex items-center justify-center mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <div className="flex flex-col max-w-[75%] gap-1">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground"
                      : "glass-card"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Action buttons for AI messages */}
                {msg.role === "assistant" && msg.id !== "welcome" && !isStreaming && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(msg.id, msg.content)}
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    {messages[messages.length - 1]?.id === msg.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={handleRegenerate}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center mt-1">
                  <User className="h-4 w-4 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="h-8 w-8 shrink-0 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="glass-card rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-3 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        {isLimitReached ? (
          <div className="glass-card p-4 text-center">
            <AlertCircle className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">Limita de queries atinsă</p>
            <p className="text-xs text-muted-foreground mb-3">
              Ai folosit toate cele {profile?.ai_queries_limit} queries gratuite.
            </p>
            <Button className="gradient-primary text-primary-foreground text-xs">
              <Crown className="h-3 w-3 mr-1" /> Upgrade la PRO
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-10 w-10 ${isListening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
              onClick={toggleVoice}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Ascult..." : "Scrie un mesaj..."}
                rows={1}
                className="w-full resize-none rounded-xl bg-secondary/50 border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                disabled={isStreaming}
              />
            </div>

            <Button
              size="icon"
              className="shrink-0 h-10 w-10 gradient-primary text-primary-foreground"
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
            >
              {isStreaming ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
