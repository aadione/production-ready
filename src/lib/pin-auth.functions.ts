import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Normalises an Indian mobile number to E.164 (+91XXXXXXXXXX). */
function normalize(input: string) {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return `+${digits}`;
}

const PHONE_OK = /^\+91[6-9]\d{9}$/;
const PIN_OK = /^\d{4,6}$/;

type Input = { phone: string; pin: string; fullName?: string | undefined };
type SessionOut = {
  ok: true;
  access_token: string;
  refresh_token: string;
};

function fail(message: string, cause?: unknown): never {
  // The customer only ever sees `message`. The real cause is logged server-side
  // so misconfiguration (e.g. a missing service-role key) is diagnosable.
  if (cause !== undefined) console.error("[auth]", message, cause);
  throw new Error(message);
}

/**
 * Guards against the server running with placeholder secrets, which would
 * otherwise surface to customers as a generic "something went wrong".
 */
function assertServerConfigured() {
  const missing: string[] = [];
  const url = process.env["SUPABASE_URL"];
  const service = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const pepper = process.env["AUTH_PIN_SECRET"];
  if (!url) missing.push("SUPABASE_URL");
  if (!process.env["SUPABASE_PUBLISHABLE_KEY"]) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (!pepper || pepper.length < 16) missing.push("AUTH_PIN_SECRET");
  if (!service || !/^(sb_secret_|eyJ)/.test(service)) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    console.error(
      `[auth] Server is not configured for accounts. Set these server environment variable(s): ${missing.join(", ")}`,
    );
    fail("Accounts are temporarily unavailable. Please try again shortly.");
  }
}

/** Deterministic, high-entropy account password derived from phone + PIN + server pepper. */
async function derivePassword(e164: string, pin: string) {
  const pepper = process.env["AUTH_PIN_SECRET"];
  if (!pepper) fail("Accounts are temporarily unavailable. Please try again shortly.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${e164}:${pin}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function syntheticEmail(e164: string) {
  return `${e164.replace(/\D/g, "")}@phone.jamshedpurwala.app`;
}

function validate(data: Input) {
  const e164 = normalize(data.phone);
  if (!PHONE_OK.test(e164)) fail("Please enter a valid 10-digit mobile number.");
  const pin = String(data.pin ?? "").trim();
  if (!PIN_OK.test(pin)) fail("PIN must be 4–6 digits.");
  return { e164, pin };
}

function envOrFail() {
  const url = process.env["SUPABASE_URL"];
  const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !publishable) fail("Something went wrong. Please try again.");
  return { url, publishable };
}

/** Publishable-key client used only to mint a real session via password sign-in. */
function signInClient(url: string, key: string) {
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function mintSession(e164: string, pin: string, notFoundMessage: string): Promise<SessionOut> {
  const { url, publishable } = envOrFail();
  const password = await derivePassword(e164, pin);
  const client = signInClient(url, publishable);
  const { data, error } = await client.auth.signInWithPassword({
    email: syntheticEmail(e164),
    password,
  });
  if (error || !data.session) fail(notFoundMessage);
  return { ok: true, access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}

export const loginWithPhonePin = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => data)
  .handler(async ({ data }): Promise<SessionOut> => {
    assertServerConfigured();
    const { e164, pin } = validate(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", e164)
      .maybeSingle();
    if (error) fail("Something went wrong. Please try again.", error);
    if (!profile) fail("Account not found. Please create an account.");

    return mintSession(e164, pin, "Incorrect phone number or PIN.");
  });

export const signupWithPhonePin = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => data)
  .handler(async ({ data }): Promise<SessionOut> => {
    assertServerConfigured();
    const { e164, pin } = validate(data);
    const fullName = String(data.fullName ?? "").trim().slice(0, 80);
    if (fullName.length < 2) fail("Please enter your full name.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", e164)
      .maybeSingle();
    if (lookupError) fail("Something went wrong. Please try again.", lookupError);
    if (existing) fail("This phone number is already registered. Please login instead.");

    const password = await derivePassword(e164, pin);
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail(e164),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone: e164 },
    });

    if (createError || !created.user) {
      const msg = (createError?.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        fail("This phone number is already registered. Please login instead.");
      }
      fail("Something went wrong. Please try again.", createError);
    }

    const userId = created.user.id;
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, full_name: fullName, phone: e164 }, { onConflict: "id" });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      const msg = profileError.message.toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique")) {
        fail("This phone number is already registered. Please login instead.");
      }
      fail("Something went wrong. Please try again.");
    }

    // Store a bcrypt hash of the PIN server-side; the app never reads or compares it.
    await supabaseAdmin.rpc("set_user_pin", { p_user: userId, p_pin: pin });

    return mintSession(e164, pin, "Something went wrong. Please try again.");
  });
