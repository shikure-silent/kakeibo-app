import { DetailRecord, MonthlyBudget } from "../types/calendar";
import { buildBudgetKey, buildDetailsKey, buildSpendingKey } from "./const";

// localStorage に日別支出合計を保存／読込
export const loadAmountsFromStorage = (
  year: number,
  month: number
): number[] => {
  if (typeof window === "undefined") return [];
  const key = buildSpendingKey(year, month);
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { amounts?: unknown };
    if (parsed && Array.isArray(parsed.amounts)) {
      return parsed.amounts.map((v) => Number(v) || 0);
    }
  } catch {
    // noop
  }
  return [];
};

export const saveAmountsToStorage = (
  year: number,
  month: number,
  amounts: number[]
) => {
  if (typeof window === "undefined") return;
  const key = buildSpendingKey(year, month);
  window.localStorage.setItem(key, JSON.stringify({ amounts }));
};

// localStorage に日別明細を保存／読込
export const loadDetailsFromStorage = (
  year: number,
  month: number,
  day: number
): DetailRecord[] => {
  if (typeof window === "undefined") return [];
  const key = buildDetailsKey(year, month, day);
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as DetailRecord[];
    }
  } catch {
    // noop
  }
  return [];
};

export const saveDetailsToStorage = (
  year: number,
  month: number,
  day: number,
  details: DetailRecord[]
) => {
  if (typeof window === "undefined") return;
  const key = buildDetailsKey(year, month, day);
  window.localStorage.setItem(key, JSON.stringify(details));
};

// localStorage に月次予算を保存／読込
// 既存：
export const loadBudgetFromStorage = (
  year: number,
  month: number
): MonthlyBudget | null => {
  if (typeof window === "undefined") return null;

  try {
    const key = buildBudgetKey(year, month);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MonthlyBudget;
    if (
      typeof parsed.totalBudget !== "number" ||
      !Array.isArray(parsed.items)
    ) {
      return null;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load budget from storage", e);
    return null;
  }
};

/**
 * その月に予算がなければ、近い月の予算をフォールバックして返す
 *
 * 探し方：
 *  1. まず指定された (year, month)
 *  2. それで見つからなければ、±1ヶ月, ±2ヶ月 ... と最大 maxOffsetヶ月ぶん探す
 *     先に見つかった方を採用
 */
export const loadBudgetWithFallback = (
  year: number,
  month: number,
  maxOffset = 12
): MonthlyBudget | null => {
  if (typeof window === "undefined") return null;

  // まずその月
  const direct = loadBudgetFromStorage(year, month);
  if (direct) return direct;

  const addMonth = (y: number, m: number, delta: number) => {
    const base = y * 12 + (m - 1) + delta;
    const newYear = Math.floor(base / 12);
    let newMonth = base % 12;
    if (newMonth < 0) {
      newMonth += 12;
    }
    return { year: newYear, month: newMonth + 1 };
  };

  // 近い月から順に（-1, +1, -2, +2, ...）
  for (let diff = 1; diff <= maxOffset; diff++) {
    const prev = addMonth(year, month, -diff);
    const prevBudget = loadBudgetFromStorage(prev.year, prev.month);
    if (prevBudget) return prevBudget;

    const next = addMonth(year, month, diff);
    const nextBudget = loadBudgetFromStorage(next.year, next.month);
    if (nextBudget) return nextBudget;
  }

  return null;
};

// 支出／収入を分けて集計
export const calcDayTotals = (details: DetailRecord[]) => {
  let spending = 0;
  let income = 0;

  for (const rec of details) {
    const amt = Number(rec.amount);
    if (!Number.isFinite(amt)) continue;

    const mode = rec.mode === "income" ? "income" : "expense";
    if (mode === "income") {
      income += amt;
    } else {
      spending += amt;
    }
  }

  return { spending, income };
};
