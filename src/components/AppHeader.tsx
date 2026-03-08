import { Bell, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader() {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {profile?.plan_type === "free" && (
          <Button size="sm" className="gradient-primary text-primary-foreground text-xs gap-1.5 rounded-lg shadow-md shadow-primary/20">
            <Crown className="h-3 w-3" />
            Upgrade
          </Button>
        )}

        <Avatar className="h-8 w-8 border border-border">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {profile?.full_name?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
