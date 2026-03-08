import { useState, useRef } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Crown, Sparkles, Camera, Globe } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const timezones = [
  "Europe/Bucharest",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "UTC",
];

export default function SettingsPage() {
  const { profile, logout, updateProfile, uploadAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "Europe/Bucharest");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ full_name: fullName, timezone });
    } catch (err: any) {
      toast.error(err.message || "Eroare la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Fișierul trebuie să fie mai mic de 2MB");
      return;
    }
    setIsUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err: any) {
      toast.error(err.message || "Eroare la upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gestionează-ți contul</p>
      </div>

      {/* PRO Upgrade */}
      {profile?.plan_type === "free" && (
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
      )}

      <div className="grid gap-4">
        {/* Profile */}
        <WidgetCard title="Profile" icon={<User className="h-4 w-4" />}>
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-16 w-16 border-2 border-border">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                  <AvatarFallback className="bg-secondary text-lg font-medium">
                    {profile?.full_name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="font-medium">{profile?.full_name || "Unnamed"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <SubscriptionBadge plan={profile?.plan_type ?? "free"} />
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nume complet</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Timezone
                </label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">AI Usage</span>
                <span className="font-medium">{profile?.ai_queries_used ?? 0}/{profile?.ai_queries_limit ?? 50}</span>
              </div>
              <Progress
                value={((profile?.ai_queries_used ?? 0) / (profile?.ai_queries_limit ?? 1)) * 100}
                className="h-2 bg-secondary"
              />

              <Button
                onClick={handleSaveProfile}
                className="w-full sm:w-auto gradient-primary text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "Salvează Modificările"
                )}
              </Button>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Notificări" icon={<Bell className="h-4 w-4" />}>
          <div className="space-y-4">
            {["Email notifications", "Push notifications", "Weekly digest"].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm">{item}</span>
                <Switch />
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Securitate" icon={<Shield className="h-4 w-4" />}>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-sm border-border/50">
              Schimbă parola
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm border-border/50">
              Two-factor authentication
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={logout}
            >
              Deconectare
            </Button>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
