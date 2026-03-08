import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Heart,
  Newspaper,
  Settings,
  Sparkles,
  Crown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Chat", url: "/ai-chat", icon: MessageSquare },
  { title: "Finance", url: "/finance", icon: Wallet },
  { title: "Health", url: "/health", icon: Heart },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription, profile } = useAuth();
  const isPaid = subscription?.subscribed || (profile?.plan_type !== "free");

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-4 mb-2">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold gradient-text">LifeOS AI</span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary mx-auto">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                          isActive
                            ? "gradient-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && !isPaid && (
        <SidebarFooter className="p-4">
          <div
            className="rounded-xl gradient-primary p-4 text-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/pricing")}
          >
            <Crown className="h-4 w-4 text-primary-foreground mx-auto mb-1" />
            <p className="text-xs font-semibold text-primary-foreground">Upgrade to PRO</p>
            <p className="mt-1 text-[10px] text-primary-foreground/70">Unlock unlimited AI queries</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
