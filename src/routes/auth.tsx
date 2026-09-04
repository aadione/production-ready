import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth, isValidPhone, isValidPin } from "@/lib/auth";

type Search = { redirect?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s['redirect'] === "string" ? (s['redirect'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login with Mobile & PIN — Jamshedpurwala" },
      {
        name: "description",
        content:
          "Sign in to Jamshedpurwala with your mobile number and login PIN to track orders, save addresses and check out faster.",
      },
      { property: "og:title", content: "Login with Mobile & PIN — Jamshedpurwala" },
      { property: "og:description", content: "Fast, secure PIN login for Jamshedpurwala shoppers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground outline-none focus:border-primary";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loginWithPhonePin, signupWithPhonePin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect ?? "/account", replace: true });
  }, [user, redirect, navigate]);

  const onlyDigits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!isValidPin(pin)) {
      toast.error("PIN must be 4–6 digits.");
      return;
    }
    if (mode === "signup") {
      if (fullName.trim().length < 2) {
        toast.error("Please enter your full name.");
        return;
      }
      if (pin !== confirmPin) {
        toast.error("PINs do not match.");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await loginWithPhonePin(phone, pin);
        toast.success("Logged in");
      } else {
        await signupWithPhonePin(fullName, phone, pin);
        toast.success("Account created");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[440px] px-4 pb-16 pt-4 md:pt-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <ArrowLeft size={14} /> Back to shopping
      </Link>

      <div className="card-surface p-4">
        <h1 className="text-[19px] font-extrabold tracking-tight text-foreground">
          {mode === "login" ? "Login" : "Create account"}
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {mode === "login"
            ? "Enter your mobile number and login PIN."
            : "Enter your details and choose a 4–6 digit login PIN."}
        </p>

        <form onSubmit={submit} className="mt-4 space-y-2.5">
          {mode === "signup" && (
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="Enter your full name"
                className={inputClass}
              />
            </label>
          )}

          <label className="block">
            <span className="text-[11px] font-semibold text-muted-foreground">Phone number</span>
            <div className="mt-1 flex h-10 items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary">
              <Phone size={14} className="mr-2 text-muted-foreground" />
              <span className="mr-1.5 text-[13.5px] text-muted-foreground">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(onlyDigits(e.target.value, 10))}
                placeholder="Enter 10-digit mobile number"
                className="h-full w-full bg-transparent text-[13.5px] text-foreground outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold text-muted-foreground">Login PIN</span>
            <div className="mt-1 flex h-10 items-center rounded-lg border border-border bg-surface px-3 focus-within:border-primary">
              <Lock size={14} className="mr-2 text-muted-foreground" />
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(onlyDigits(e.target.value, 6))}
                placeholder="Enter your PIN"
                className="h-full w-full bg-transparent text-[13.5px] tracking-[0.25em] text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                className="ml-2 text-muted-foreground"
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">Confirm PIN</span>
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(onlyDigits(e.target.value, 6))}
                placeholder="Re-enter your PIN"
                className={`${inputClass} tracking-[0.25em]`}
              />
            </label>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-strong text-[14px] font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between text-[12px]">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setPin("");
              setConfirmPin("");
            }}
            className="font-semibold text-primary"
          >
            {mode === "login" ? "Create Account" : "Already have an account? Login"}
          </button>
          {mode === "login" && (
            <button
              type="button"
              onClick={() => toast.info("PIN recovery is currently unavailable. Please contact support.")}
              className="text-muted-foreground"
            >
              Forgot PIN
            </button>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Your PIN is stored securely and never shared. Never share your PIN with anyone.
        </p>
      </div>
    </div>
  );
}
