import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PRODUCT_TO_PLAN, PlanKey } from "@/lib/stripeConfig";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan_type: string;
  timezone: string | null;
  ai_queries_used: number;
  ai_queries_limit: number;
}

interface SubscriptionInfo {
  subscribed: boolean;
  planKey: PlanKey;
  subscriptionEnd: string | null;
  productId: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: SubscriptionInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  };

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Subscription check error:", error);
        return;
      }
      const planKey = data?.product_id ? (PRODUCT_TO_PLAN[data.product_id] ?? "free") : "free";
      setSubscription({
        subscribed: data?.subscribed ?? false,
        planKey,
        subscriptionEnd: data?.subscription_end ?? null,
        productId: data?.product_id ?? null,
      });

      // Sync plan_type in profile if it changed
      if (data?.subscribed && planKey !== "free") {
        const currentProfile = profile;
        if (currentProfile && currentProfile.plan_type !== planKey) {
          await supabase.from("profiles").update({ plan_type: planKey }).eq("user_id", currentProfile.user_id);
          setProfile((p) => p ? { ...p, plan_type: planKey } : p);
        }
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  }, [profile]);

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(async () => {
            const p = await fetchProfile(session.user.id);
            setProfile(p);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  // Check subscription when profile is loaded
  useEffect(() => {
    if (profile) {
      checkSubscription();
    }
  }, [profile?.user_id]);

  // Periodic subscription check every 60s
  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [profile?.user_id, checkSubscription]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success("Autentificare reușită!");
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    toast.success("Cont creat! Verifică-ți emailul pentru confirmare.");
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setSubscription(null);
    toast.success("Te-ai deconectat.");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    toast.success("Link de resetare trimis pe email!");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    if (error) throw error;
    await refreshProfile();
    toast.success("Profil actualizat!");
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await updateProfile({ avatar_url: data.publicUrl });
    return data.publicUrl;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        subscription,
        isAuthenticated: !!session,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        uploadAvatar,
        refreshProfile,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
