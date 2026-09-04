import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { loginWithPhonePin, signupWithPhonePin } from "@/lib/pin-auth.functions";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  loginWithPhonePin: (phone: string, pin: string) => Promise<void>;
  signupWithPhonePin: (fullName: string, phone: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

/** Normalises an Indian mobile number to E.164 (+91XXXXXXXXXX). */
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (input.trim().startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

export function isValidPhone(input: string) {
  return /^\+91[6-9]\d{9}$/.test(normalizePhone(input));
}

export function isValidPin(pin: string) {
  return /^\d{4,6}$/.test(pin.trim());
}

/** Turns auth errors into short, friendly sentences — never exposes backend details. */
export function friendlyAuthError(message: string) {
  const known = [
    "Please enter a valid 10-digit mobile number.",
    "PIN must be 4–6 digits.",
    "PINs do not match.",
    "Incorrect phone number or PIN.",
    "Account not found. Please create an account.",
    "This phone number is already registered. Please login instead.",
    "Please enter your full name.",
  ];
  if (known.includes(message)) return message;
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const applySession = async (tokens: { access_token: string; refresh_token: string }) => {
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    if (error || !data.session) throw new Error("Something went wrong. Please try again.");
    setSession(data.session);
  };

  const value: AuthCtx = {
    user: session?.user ?? null,
    session,
    loading,
    loginWithPhonePin: async (phone, pin) => {
      if (!isValidPhone(phone)) throw new Error("Please enter a valid 10-digit mobile number.");
      if (!isValidPin(pin)) throw new Error("PIN must be 4–6 digits.");
      try {
        const res = await loginWithPhonePin({ data: { phone: normalizePhone(phone), pin: pin.trim() } });
        await applySession(res);
      } catch (err) {
        throw new Error(friendlyAuthError(err instanceof Error ? err.message : ""));
      }
    },
    signupWithPhonePin: async (fullName, phone, pin) => {
      if (fullName.trim().length < 2) throw new Error("Please enter your full name.");
      if (!isValidPhone(phone)) throw new Error("Please enter a valid 10-digit mobile number.");
      if (!isValidPin(pin)) throw new Error("PIN must be 4–6 digits.");
      try {
        const res = await signupWithPhonePin({
          data: { phone: normalizePhone(phone), pin: pin.trim(), fullName: fullName.trim() },
        });
        await applySession(res);
      } catch (err) {
        throw new Error(friendlyAuthError(err instanceof Error ? err.message : ""));
      }
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
