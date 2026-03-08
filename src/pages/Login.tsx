import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(1, "Parola este obligatorie"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Email invalid"),
  password: z
    .string()
    .min(8, "Minim 8 caractere")
    .regex(/[0-9]/, "Trebuie să conțină cel puțin o cifră")
    .regex(/[^a-zA-Z0-9]/, "Trebuie să conțină cel puțin un caracter special"),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "Trebuie să accepți termenii" }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"],
});

export default function Login() {
  const { login, signup, isAuthenticated, resetPassword, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const clearErrors = () => setErrors({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (failedAttempts >= 3) {
      setErrors({ general: "Prea multe încercări. Așteaptă câteva secunde." });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setFailedAttempts((p) => p + 1);
      setErrors({ general: err.message || "Email sau parolă incorectă" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = signupSchema.safeParse({ fullName, email, password, confirmPassword, terms });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password, fullName);
      setMode("login");
    } catch (err: any) {
      setErrors({ general: err.message || "Eroare la înregistrare" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!email || !z.string().email().safeParse(email).success) {
      setErrors({ email: "Introdu un email valid" });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setMode("login");
    } catch (err: any) {
      setErrors({ general: err.message || "Eroare la trimitere" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/30">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">LifeOS AI</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" && "Bine ai revenit"}
              {mode === "signup" && "Creează-ți contul"}
              {mode === "forgot" && "Resetează parola"}
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          {/* LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border/50 pl-10"
                  />
                </div>
                <ErrorText field="email" />
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Parola"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/50 border-border/50 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ErrorText field="password" />
              </div>

              <button
                type="button"
                onClick={() => { setMode("forgot"); clearErrors(); }}
                className="text-xs text-primary hover:underline"
              >
                Ai uitat parola?
              </button>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                disabled={isSubmitting || failedAttempts >= 3}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </form>
          )}

          {/* SIGNUP */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nume complet"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary/50 border-border/50 pl-10"
                  />
                </div>
                <ErrorText field="fullName" />
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border/50 pl-10"
                  />
                </div>
                <ErrorText field="email" />
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Parola (min 8 car, 1 cifră, 1 special)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/50 border-border/50 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ErrorText field="password" />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Confirmă parola"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary/50 border-border/50"
                />
                <ErrorText field="confirmPassword" />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={terms}
                  onCheckedChange={(c) => setTerms(c === true)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                  Accept <span className="text-primary underline cursor-pointer">Termenii și Condițiile</span> și{" "}
                  <span className="text-primary underline cursor-pointer">Politica de Confidențialitate</span>
                </label>
              </div>
              <ErrorText field="terms" />

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>Creează Cont <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Introdu emailul și îți vom trimite un link pentru resetarea parolei.
              </p>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border/50 pl-10"
                  />
                </div>
                <ErrorText field="email" />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "Trimite Link"
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setMode("login"); clearErrors(); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Înapoi la Login
              </button>
            </form>
          )}

          {/* Toggle login/signup */}
          {mode !== "forgot" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "Nu ai cont?" : "Ai deja cont?"}{" "}
              <button
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); clearErrors(); }}
                className="font-medium text-primary hover:underline"
              >
                {mode === "login" ? "Înregistrează-te" : "Autentifică-te"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
