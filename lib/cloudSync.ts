// lib/cloudSync.ts
export type LocalDump = Record<string, string>;

const SETTINGS_KEYS = new Set([
  "kakeibo_app_settings_v1",
  "kakeibo_expense_categories_v1",
  "kakeibo_income_categories_v1",
  "kakeibo_payfrom_presets_v1",
]);

function isKakeiboKey(key: string) {
  return (
    key.startsWith("kakeibo_") ||
    key.startsWith("kakeibo-") ||
    key.startsWith("budget_") ||
    key.startsWith("spending_") ||
    key.startsWith("details_")
  );
}

function shouldSyncKey(key: string, includeSettings: boolean) {
  if (!isKakeiboKey(key)) return false;
  if (includeSettings) return true;
  return !SETTINGS_KEYS.has(key);
}

export function exportKakeiboDump(options?: {
  includeSettings?: boolean;
}): LocalDump {
  if (typeof window === "undefined") return {};
  const includeSettings = options?.includeSettings ?? true;

  const dump: LocalDump = {};
  const ls = window.localStorage;

  for (let i = 0; i < ls.length; i++) {
    const key = ls.key(i);
    if (!key) continue;
    if (!shouldSyncKey(key, includeSettings)) continue;

    const value = ls.getItem(key);
    if (value == null) continue;
    dump[key] = value;
  }
  return dump;
}

export function clearKakeiboKeys(options?: { includeSettings?: boolean }) {
  if (typeof window === "undefined") return;
  const includeSettings = options?.includeSettings ?? true;

  const ls = window.localStorage;
  const keysToRemove: string[] = [];

  for (let i = 0; i < ls.length; i++) {
    const key = ls.key(i);
    if (!key) continue;
    if (shouldSyncKey(key, includeSettings)) keysToRemove.push(key);
  }

  keysToRemove.forEach((k) => ls.removeItem(k));
}

export function importKakeiboDump(
  dump: Record<string, any>,
  options?: { includeSettings?: boolean; clearBefore?: boolean }
) {
  if (typeof window === "undefined") return;

  const includeSettings = options?.includeSettings ?? true;
  const clearBefore = options?.clearBefore ?? true;

  if (clearBefore) clearKakeiboKeys({ includeSettings });

  for (const [k, v] of Object.entries(dump)) {
    if (!shouldSyncKey(k, includeSettings)) continue;
    window.localStorage.setItem(
      k,
      typeof v === "string" ? v : JSON.stringify(v)
    );
  }
}
