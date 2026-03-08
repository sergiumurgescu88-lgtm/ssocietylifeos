import { Settings as SettingsIcon, User, Bell, Shield, Crown, Sparkles } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account</p>
      </div>

      {/* PRO Upgrade */}
      <div className="glass-card p-6 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-primary-foreground" />
            <h2 className="text-lg font-bold text-primary-foreground">Upgrade to PRO</h2>
          </div>
          <p className="text-sm text-primary-foreground/80 mb-4">
            Unlimited AI queries, advanced analytics, priority support
          </p>
          <Button variant="secondary" className="font-semibold">
            <Sparkles className="h-4 w-4 mr-1" /> Get PRO — $9.99/mo
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <WidgetCard title="Profile" icon={<User className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium capitalize">{user?.plan}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">AI Usage</span>
              <span className="font-medium">{user?.aiQueriesUsed}/{user?.aiQueriesLimit}</span>
            </div>
            <Progress value={((user?.aiQueriesUsed ?? 0) / (user?.aiQueriesLimit ?? 1)) * 100} className="h-2 bg-secondary" />
          </div>
        </WidgetCard>

        <WidgetCard title="Notifications" icon={<Bell className="h-4 w-4" />}>
          <div className="space-y-4">
            {["Email notifications", "Push notifications", "Weekly digest"].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm">{item}</span>
                <Switch />
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Security" icon={<Shield className="h-4 w-4" />}>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-sm border-border/50">
              Change password
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm border-border/50">
              Two-factor authentication
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
