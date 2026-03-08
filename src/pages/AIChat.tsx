import { useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

const initialMessages: Message[] = [
  { id: 1, role: "ai", content: "Hey! I'm your LifeOS AI assistant. How can I help you today? I can help with task planning, financial insights, health tips, and more." },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: "This is a mock response. In production, this would connect to a real AI API. Your query was noted and I'll help you with that! 🚀",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="gradient-text">AI Assistant</span>
        </h1>
        <p className="text-sm text-muted-foreground">Ask me anything about your life dashboard</p>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "ai" && (
              <div className="h-8 w-8 shrink-0 rounded-lg gradient-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "glass-card"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-foreground" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Input
          placeholder="Ask LifeOS AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="bg-secondary/50 border-border/50"
        />
        <Button onClick={handleSend} className="gradient-primary text-primary-foreground shrink-0" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
