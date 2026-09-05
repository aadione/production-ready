// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel sets VERCEL=1 (and VERCEL_ENV) during builds. There we must build a
// server-capable TanStack Start app (Nitro's `vercel` preset → .vercel/output with a
// serverless function), otherwise the deploy would ship only static files and every
// createServerFn() RPC (including phone + PIN login) would 404 at runtime.
// Inside Lovable the sandbox forces its own preset and this value is ignored, so the
// preview/publish flow keeps working unchanged.
const explicitPreset = process.env["NITRO_PRESET"] || process.env["SERVER_PRESET"];
const isVercel = Boolean(process.env["VERCEL"] || process.env["VERCEL_ENV"]);
const preset = explicitPreset || (isVercel ? "vercel" : undefined);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...(preset ? { nitro: { preset } } : {}),
});

