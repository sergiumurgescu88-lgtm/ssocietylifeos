import { Crown, Sparkles, Zap, Shield, Users, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const highlights = [
  { icon: Sparkles, text: "Unlimited AI queries" },
  { icon: Zap, text: "Real-time price alerts" },
  { icon: Shield, text: "Advanced analytics" },
  { icon: Users, text: "Family sharing" },
];

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-warning" />
            Unlock Premium Features
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {highlights.map((h) => (
            <div key={h.text} className="flex items-center gap-3 text-sm">
              <Check className="h-4 w-4 text-success shrink-0" />
              <span>{h.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing");
            }}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
          >
            <Crown className="h-4 w-4 mr-1" />
            View Plans & Pricing
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
