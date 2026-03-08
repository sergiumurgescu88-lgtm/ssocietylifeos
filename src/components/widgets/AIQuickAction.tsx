import { memo, useState } from "react";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/WidgetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const quickActions = [
  "Scrie un email",
  "Rezumă ultimele task-uri",
  "Sugerează exerciții",
  "Analizează cheltuielile",
];

function AIQuickActionInner() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      navigate("/ai-chat");
    }
  };

  return (
    <WidgetCard
      title="AI Quick Action"
      icon={<Sparkles className="h-4 w-4" />}
      accentColor="hsl(262, 83%, 58%)"
      delay={2}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Întreabă ceva..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-secondary/50 border-border/50 text-sm"
          />
          <Button
            size="icon"
            className="gradient-primary text-primary-foreground shrink-0"
            onClick={handleSubmit}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => navigate("/ai-chat")}
              className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {action}
              <ArrowRight className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

export const AIQuickAction = memo(AIQuickActionInner);
