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
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.amounts)) {
      return parsed.amounts.map((v: any) => Number(v) || 0);
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
export const loadBudgetFromStorage = (
  year: number,
  month: number
): MonthlyBudget | null => {
  if (typeof window === "undefined") return null;
  const key = buildBudgetKey(year, month);
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MonthlyBudget;
    if (typeof parsed.totalBudget === "number") {
      return parsed;
    }
  } catch {
    // noop
  }
  return null;
};

// 支出／収入を分けて集計
export const calcDayTotals = (details: DetailRecord[]) => {
  let spending = 0;
  let income = 0;

  for (const rec of details) {
    const amt = Number((rec as any).amount);
    if (!Number.isFinite(amt)) continue;

    const mode = (rec as any).mode === "income" ? "income" : "expense";
    if (mode === "income") {
      income += amt;
    } else {
      spending += amt;
    }
  }

  return { spending, income };
};
