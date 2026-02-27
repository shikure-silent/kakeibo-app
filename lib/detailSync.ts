import type { DetailRecord } from "../types/calendar";

export const DELETED_RECORD_IDS_KEY = "kakeibo_deleted_record_ids_v1";

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h +=
      (h << 1) +
      (h << 4) +
      (h << 7) +
      (h << 8) +
      (h << 24);
  }
  return (h >>> 0).toString(36);
}

function legacyStableId(rec: Partial<DetailRecord>, fallbackDate = "") {
  const payload = [
    rec.mode === "income" ? "income" : "expense",
    String(Number(rec.amount ?? 0) || 0),
    typeof rec.category === "string" ? rec.category : "",
    typeof rec.payFrom === "string" ? rec.payFrom : "",
    typeof rec.shopName === "string" ? rec.shopName : "",
    typeof rec.memo === "string" ? rec.memo : "",
    typeof rec.date === "string" && rec.date ? rec.date : fallbackDate,
    typeof rec.createdAt === "string" ? rec.createdAt : "",
  ].join("|");
  return `legacy_${hashString(payload)}`;
}

export function normalizeDetailRecord(
  value: unknown,
  fallbackDate = ""
): DetailRecord | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Partial<DetailRecord>;

  const mode = rec.mode === "income" ? "income" : "expense";
  const amountRaw = Number(rec.amount ?? 0);
  const amount = Number.isFinite(amountRaw) ? amountRaw : 0;
  const createdAt = typeof rec.createdAt === "string" && rec.createdAt
    ? rec.createdAt
    : nowIso();
  const updatedAt = typeof rec.updatedAt === "string" && rec.updatedAt
    ? rec.updatedAt
    : createdAt;

  return {
    id:
      typeof rec.id === "string" && rec.id
        ? rec.id
        : legacyStableId(rec, fallbackDate),
    mode,
    amount,
    category: typeof rec.category === "string" ? rec.category : "",
    payFrom: typeof rec.payFrom === "string" ? rec.payFrom : "",
    shopName: typeof rec.shopName === "string" ? rec.shopName : undefined,
    memo: typeof rec.memo === "string" ? rec.memo : "",
    date: typeof rec.date === "string" ? rec.date : fallbackDate,
    createdAt,
    updatedAt,
    deletedAt: typeof rec.deletedAt === "string" ? rec.deletedAt : undefined,
  };
}

export function normalizeDetailRecords(
  value: unknown,
  fallbackDate = ""
): DetailRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeDetailRecord(item, fallbackDate))
    .filter((item): item is DetailRecord => item !== null);
}

export function createNewDetailRecord(
  base: Omit<DetailRecord, "id" | "createdAt" | "updatedAt" | "deletedAt">
): DetailRecord {
  const now = nowIso();
  return {
    ...base,
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: undefined,
  };
}

export function touchDetailRecord(record: DetailRecord): DetailRecord {
  return {
    ...record,
    updatedAt: nowIso(),
  };
}

function parseIsoTs(iso?: string) {
  if (!iso) return 0;
  const ts = Date.parse(iso);
  return Number.isFinite(ts) ? ts : 0;
}

function newerRecord(a: DetailRecord, b: DetailRecord) {
  const aTs = parseIsoTs(a.updatedAt || a.createdAt);
  const bTs = parseIsoTs(b.updatedAt || b.createdAt);
  return bTs >= aTs ? b : a;
}

export function loadDeletedRecordIds(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  const raw = window.localStorage.getItem(DELETED_RECORD_IDS_KEY);
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    const ids = parsed.filter((v): v is string => typeof v === "string" && !!v);
    return new Set(ids);
  } catch {
    return new Set<string>();
  }
}

export function saveDeletedRecordIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DELETED_RECORD_IDS_KEY,
    JSON.stringify(Array.from(ids))
  );
}

export function addDeletedRecordId(id?: string) {
  if (!id) return;
  const ids = loadDeletedRecordIds();
  ids.add(id);
  saveDeletedRecordIds(ids);
}

export function removeDeletedRecordId(id?: string) {
  if (!id) return;
  const ids = loadDeletedRecordIds();
  if (!ids.has(id)) return;
  ids.delete(id);
  saveDeletedRecordIds(ids);
}

export function mergeDetailRecords(
  local: DetailRecord[],
  remote: DetailRecord[],
  deletedIds: Set<string>
): DetailRecord[] {
  const map = new Map<string, DetailRecord>();

  const mergedInput = [...local, ...remote];
  for (const rec of mergedInput) {
    const normalized = normalizeDetailRecord(rec, rec.date || "");
    if (!normalized?.id) continue;
    if (deletedIds.has(normalized.id)) continue;
    const prev = map.get(normalized.id);
    if (!prev) {
      map.set(normalized.id, normalized);
      continue;
    }
    map.set(normalized.id, newerRecord(prev, normalized));
  }

  return Array.from(map.values())
    .filter((rec) => !rec.deletedAt)
    .sort((a, b) => {
      const aTs = parseIsoTs(a.createdAt);
      const bTs = parseIsoTs(b.createdAt);
      return aTs - bTs;
    });
}
