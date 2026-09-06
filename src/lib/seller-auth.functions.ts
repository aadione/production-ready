import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Seller accounts reuse the customer phone + PIN scheme, but live in their own
 * synthetic-email namespace so the same phone number can be both a shopper and
 * a shop owner. PINs are never stored in plain text: the account password is an
 * HMAC of phone+PIN+server pepper, and a bcrypt hash is stored via a
 * server-only database function.
 */

const SELLER_EMAIL_DOMAIN = "seller.jamshedpurwala.app";
const PHONE_OK = /^\+91[6-9]\d{9}$/;
const PIN_OK = /^\d{4,6}$/;
const POSTAL_OK = /^\d{6}$/;

function normalize(input: string) {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return `+${digits}`;
}

function fail(message: string, cause?: unknown): never {
  if (cause !== undefined) console.error("[seller-auth]", message, cause);
  throw new Error(message);
}

function assertServerConfigured() {
  const service =
    process.env["APP_SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const pepper = process.env["AUTH_PIN_SECRET"];
  const missing: string[] = [];
  if (!process.env["SUPABASE_URL"]) missing.push("SUPABASE_URL");
  if (!process.env["SUPABASE_PUBLISHABLE_KEY"]) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (!pepper || pepper.length < 16) missing.push("AUTH_PIN_SECRET");
  if (!service || !/^(sb_secret_|eyJ)/.test(service)) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    console.error(`[seller-auth] Missing server environment variable(s): ${missing.join(", ")}`);
    fail("Seller accounts are temporarily unavailable. Please try again shortly.");
  }
}

async function derivePassword(e164: string, pin: string) {
  const pepper = process.env["AUTH_PIN_SECRET"];
  if (!pepper) fail("Seller accounts are temporarily unavailable. Please try again shortly.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`seller:${e164}:${pin}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sellerEmail(e164: string) {
  return `${e164.replace(/\D/g, "")}@${SELLER_EMAIL_DOMAIN}`;
}

type SessionOut = { ok: true; access_token: string; refresh_token: string };

function signInClient(url: string, key: string) {
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function mintSession(e164: string, pin: string, notFoundMessage: string): Promise<SessionOut> {
  const url = process.env["SUPABASE_URL"];
  const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !publishable) fail("Something went wrong. Please try again.");
  const password = await derivePassword(e164, pin);
  const { data, error } = await signInClient(url, publishable).auth.signInWithPassword({
    email: sellerEmail(e164),
    password,
  });
  if (error || !data.session) fail(notFoundMessage);
  return {
    ok: true,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}

type LoginInput = { phone: string; pin: string };
type RegisterInput = {
  ownerName: string;
  phone: string;
  pin: string;
  shopName: string;
  shopAddress: string;
  postalPin: string;
};

export const sellerLogin = createServerFn({ method: "POST" })
  .inputValidator((data: LoginInput) => data)
  .handler(async ({ data }): Promise<SessionOut> => {
    assertServerConfigured();
    const e164 = normalize(data.phone);
    const pin = String(data.pin ?? "").trim();
    if (!PHONE_OK.test(e164)) fail("Please enter a valid 10-digit mobile number.");
    if (!PIN_OK.test(pin)) fail("PIN must be 4–6 digits.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: seller, error } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("phone", e164)
      .maybeSingle();
    if (error) fail("Something went wrong. Please try again.", error);
    if (!seller) fail("Seller account not found. Please register your shop.");

    return mintSession(e164, pin, "Incorrect phone number or PIN.");
  });

export const sellerRegister = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterInput) => data)
  .handler(async ({ data }): Promise<SessionOut> => {
    assertServerConfigured();
    const e164 = normalize(data.phone);
    const pin = String(data.pin ?? "").trim();
    const ownerName = String(data.ownerName ?? "").trim().slice(0, 80);
    const shopName = String(data.shopName ?? "").trim().slice(0, 80);
    const shopAddress = String(data.shopAddress ?? "").trim().slice(0, 300);
    const postalPin = String(data.postalPin ?? "").replace(/\D/g, "");

    if (ownerName.length < 2) fail("Please enter the owner's full name.");
    if (!PHONE_OK.test(e164)) fail("Please enter a valid 10-digit mobile number.");
    if (shopName.length < 2) fail("Please enter your shop name.");
    if (shopAddress.length < 6) fail("Please enter your shop address.");
    if (!POSTAL_OK.test(postalPin)) fail("Postal PIN must be 6 digits.");
    if (!PIN_OK.test(pin)) fail("PIN must be 4–6 digits.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("phone", e164)
      .maybeSingle();
    if (lookupError) fail("Something went wrong. Please try again.", lookupError);
    if (existing) fail("This phone number already has a seller account. Please login instead.");

    const password = await derivePassword(e164, pin);
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: sellerEmail(e164),
      password,
      email_confirm: true,
      user_metadata: { full_name: ownerName, phone: e164, role: "seller" },
    });
    if (createError || !created.user) {
      const msg = (createError?.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        fail("This phone number already has a seller account. Please login instead.");
      }
      fail("Something went wrong. Please try again.", createError);
    }

    const userId = created.user.id;
    const { error: insertError } = await supabaseAdmin.from("sellers").insert({
      id: userId,
      owner_name: ownerName,
      phone: e164,
      shop_name: shopName,
      shop_address: shopAddress,
      postal_pin: postalPin,
    });
    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      const msg = insertError.message.toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique")) {
        fail("This phone number already has a seller account. Please login instead.");
      }
      fail("Something went wrong. Please try again.", insertError);
    }

    await supabaseAdmin.rpc("set_seller_pin", { p_user: userId, p_pin: pin });

    return mintSession(e164, pin, "Something went wrong. Please try again.");
  });
