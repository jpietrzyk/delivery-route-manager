// Centralized API configuration for Orders service
// Values come from Vite env vars defined in .env

// Use a universal env source compatible with Jest and Vite builds.
// Vite will inject via `define` into `globalThis.__ENV__` (see vite.config.ts),
// and Jest/Node can fall back to `process.env`.
// Declare the replaced constant for Vite `define` to satisfy TypeScript.
declare const __ENV__: Record<string, string | undefined>;

// Use a universal env source compatible with Jest and Vite builds.
// In Vite, `__ENV__` is replaced at build-time; in tests/node, fallback to `process.env`.
const ENV: Record<string, string | undefined> =
  (typeof __ENV__ !== "undefined" ? __ENV__ : process.env) ?? {};

export const PFS_ORDERS_API_URL: string | undefined = ENV.VITE_PFS_API_ORDERS_URL;
export const PFS_API_KEY: string | undefined = ENV.VITE_PFS_API_KEY;

// Configuration to determine whether to use live API or mock
// Default to false - use mock API
export const USE_LIVE_API: boolean = ENV.VITE_USE_LIVE_API === 'true';

// Optional runtime guard (non-throwing) to help during local dev
export function ensureOrdersApiConfig(): void {
  if (!PFS_ORDERS_API_URL) {
   console.warn("VITE_PFS_API_ORDERS_URL is not set. Check your .env configuration.");
  }
  if (!PFS_API_KEY) {
   console.warn("VITE_PFS_API_KEY is not set. Check your .env configuration.");
  }
}
