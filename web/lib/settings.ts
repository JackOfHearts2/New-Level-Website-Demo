import "server-only";
import { getStore } from "@netlify/blobs";
import { SITE_CONTENT_STORE } from "@/lib/site-content";

const SETTINGS_KEY = "settings";

export type AdminSettings = {
  notifyOnSubmission: boolean;
  notifyOnReport: boolean;
};

const DEFAULTS: AdminSettings = {
  notifyOnSubmission: true,
  notifyOnReport: true,
};

// Reuses the same Netlify Blobs store site-content.ts already uses — this
// is one small global config value, not per-row data that needs its own
// Postgres table + RLS.
function safeStore() {
  try {
    return getStore(SITE_CONTENT_STORE);
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<AdminSettings> {
  const store = safeStore();
  if (!store) return DEFAULTS;
  try {
    const stored = await store.get(SETTINGS_KEY, { type: "json" });
    if (stored) return { ...DEFAULTS, ...(stored as Partial<AdminSettings>) };
  } catch {
    // Blobs unreachable — fall back to defaults, same as site-content.ts
  }
  return DEFAULTS;
}

export async function saveSettings(settings: AdminSettings) {
  const store = safeStore();
  if (!store) throw new Error("Storage unavailable");
  await store.setJSON(SETTINGS_KEY, settings);
}
