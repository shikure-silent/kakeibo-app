// lib/cloudSync.ts
import {
  DELETED_RECORD_IDS_KEY,
  mergeDetailRecords,
  normalizeDetailRecords,
} from "./detailSync";

export type LocalDump = Record<string, string>;

const SETTINGS_KEYS = new Set([
  "kakeibo_app_settings_v1",
  "kakeibo_expense_categories_v1",
  "kakeibo_income_categories_v1",
  "kakeibo_payfrom_presets_v1",
]);
const LAST_CLOUD_SAVE_AT_KEY = "kakeibo_last_cloud_save_at";

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

function isDetailsKey(key: string) {
  return key.startsWith("details_");
}

function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseDeletedIdSet(raw?: string): Set<string> {
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(
      parsed.filter((v): v is string => typeof v === "string" && !!v)
    );
  } catch {
    return new Set<string>();
  }
}

function buildDeletedIdSet(local: LocalDump, remote: LocalDump) {
  const localSet = parseDeletedIdSet(local[DELETED_RECORD_IDS_KEY]);
  const remoteSet = parseDeletedIdSet(remote[DELETED_RECORD_IDS_KEY]);
  const merged = new Set<string>([...localSet, ...remoteSet]);
  return merged;
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
  dump: Record<string, unknown>,
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

// 端末/クラウド間の dump を明細IDベースでマージする。
// - 同じ明細ID: updatedAt が新しい側を採用
// - 削除: deleted id セットを優先して両側から除去
export function mergeKakeiboDumps(local: LocalDump, remote: LocalDump): LocalDump {
  const out: LocalDump = {};
  const keys = new Set<string>([...Object.keys(local), ...Object.keys(remote)]);
  const deletedIds = buildDeletedIdSet(local, remote);
  const localSaveAtRaw = Number(local[LAST_CLOUD_SAVE_AT_KEY] ?? 0);
  const remoteSaveAtRaw = Number(remote[LAST_CLOUD_SAVE_AT_KEY] ?? 0);
  const localSaveAt = Number.isFinite(localSaveAtRaw) ? localSaveAtRaw : 0;
  const remoteSaveAt = Number.isFinite(remoteSaveAtRaw) ? remoteSaveAtRaw : 0;
  const preferLocalForGeneric = localSaveAt >= remoteSaveAt;

  for (const key of keys) {
    const localValue = local[key];
    const remoteValue = remote[key];

    if (key === DELETED_RECORD_IDS_KEY) {
      out[key] = JSON.stringify(Array.from(deletedIds));
      continue;
    }

    if (isDetailsKey(key)) {
      const localList = normalizeDetailRecords(parseJsonArray(localValue ?? ""));
      const remoteList = normalizeDetailRecords(parseJsonArray(remoteValue ?? ""));
      const merged = mergeDetailRecords(localList, remoteList, deletedIds);
      out[key] = JSON.stringify(merged);
      continue;
    }

    // 明細以外は dump 更新時刻ベースで Last-Write-Wins。
    if (preferLocalForGeneric) {
      if (typeof localValue === "string") out[key] = localValue;
      else if (typeof remoteValue === "string") out[key] = remoteValue;
    } else {
      if (typeof remoteValue === "string") out[key] = remoteValue;
      else if (typeof localValue === "string") out[key] = localValue;
    }
  }

  return out;
}
