import { ExpenseMedian } from "../data/prefectureData";
import { AgeGroup } from "../data/ageGroupData";
import { STORAGE_KEYS } from "./const";
import { loadDetailsFromStorage } from "./calendarStorage";

export type FixedExpenseKey = "rent" | "subscription";
export type FixedExpenseStore = Partial<Record<FixedExpenseKey, number>>;

export const fixedExpenseKeys: FixedExpenseKey[] = ["rent", "subscription"];

export const loadFixedExpenses = (): FixedExpenseStore => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEYS.FIXED_EXPENSES);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as FixedExpenseStore;
    return parsed || {};
  } catch {
    return {};
  }
};

export const saveFixedExpense = (key: FixedExpenseKey, value: number) => {
  if (typeof window === "undefined") return;
  const prev = loadFixedExpenses();
  const next: FixedExpenseStore = {
    ...prev,
    [key]: value,
  };
  window.localStorage.setItem(
    STORAGE_KEYS.FIXED_EXPENSES,
    JSON.stringify(next)
  );
};

// 年代別のデフォルト値（文字列）を作る
const EMPTY_EXPENSE_MEDIAN: ExpenseMedian = {
  food: 0,
  utilities: 0,
  dailyGoods: 0,
  rent: 0,
  transport: 0,
  subscription: 0,
  entertainment: 0,
  medicalInsurance: 0,
};

const CATEGORY_TO_EXPENSE_KEY: Record<string, keyof ExpenseMedian> = {
  食費: "food",
  水道・光熱費: "utilities",
  光熱費: "utilities",
  日用品: "dailyGoods",
  家賃・住居: "rent",
  家賃: "rent",
  交通費: "transport",
  サブスク: "subscription",
  通信費: "subscription",
  趣味・娯楽: "entertainment",
  娯楽費: "entertainment",
  "娯楽費（趣味娯楽）": "entertainment",
  医療・保険: "medicalInsurance",
  医療・美容: "medicalInsurance",
  保険料: "medicalInsurance",
};

const normalizeCategory = (category?: string | null) =>
  typeof category === "string" ? category.trim() : "";

const createEmptyMedian = (): ExpenseMedian => ({ ...EMPTY_EXPENSE_MEDIAN });

export const buildExpenseInputsFromMedian = (
  median: ExpenseMedian
): Record<keyof ExpenseMedian, string> => {
  const safe = median ?? EMPTY_EXPENSE_MEDIAN;
  return {
    food: String(Math.round(Number(safe.food) || 0)),
    utilities: String(Math.round(Number(safe.utilities) || 0)),
    dailyGoods: String(Math.round(Number(safe.dailyGoods) || 0)),
    rent: String(Math.round(Number(safe.rent) || 0)),
    transport: String(Math.round(Number(safe.transport) || 0)),
    subscription: String(Math.round(Number(safe.subscription) || 0)),
    entertainment: String(Math.round(Number(safe.entertainment) || 0)),
    medicalInsurance: String(Math.round(Number(safe.medicalInsurance) || 0)),
  };
};

// 年代別のデフォルト値（文字列）を作る
export const buildExpenseInputs = (
  _ageGroup: AgeGroup
): Record<keyof ExpenseMedian, string> => {
  return {
    food: "",
    utilities: "",
    dailyGoods: "",
    rent: "",
    transport: "",
    subscription: "",
    entertainment: "",
    medicalInsurance: "",
  };
};

export type UserAverageBudgetResult = {
  median: ExpenseMedian;
  monthsUsed: number;
};

export const buildUserAverageExpenseMedian = (
  referenceDate: Date = new Date(),
  monthsToAverage = 3,
  maxLookbackMonths = 12
): UserAverageBudgetResult | null => {
  if (typeof window === "undefined") return null;
  if (!Number.isFinite(monthsToAverage) || monthsToAverage <= 0) return null;

  const totals = createEmptyMedian();
  let monthsUsed = 0;

  const addMonth = (y: number, m: number, delta: number) => {
    const base = y * 12 + (m - 1) + delta;
    const newYear = Math.floor(base / 12);
    let newMonth = base % 12;
    if (newMonth < 0) newMonth += 12;
    return { year: newYear, month: newMonth + 1 };
  };

  for (let offset = 1; offset <= maxLookbackMonths; offset++) {
    if (monthsUsed >= monthsToAverage) break;
    const { year, month } = addMonth(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      -offset
    );
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthTotals = createEmptyMedian();
    let monthHasExpense = false;

    for (let day = 1; day <= daysInMonth; day++) {
      const details = loadDetailsFromStorage(year, month, day);
      if (details.length === 0) continue;
      for (const rec of details) {
        if (rec.mode === "income") continue;
        const amount = Number(rec.amount);
        if (!Number.isFinite(amount) || amount <= 0) continue;
        const normalized = normalizeCategory(rec.category);
        const key = CATEGORY_TO_EXPENSE_KEY[normalized];
        if (!key) continue;
        monthTotals[key] += amount;
        monthHasExpense = true;
      }
    }

    if (!monthHasExpense) continue;
    (Object.keys(totals) as (keyof ExpenseMedian)[]).forEach((key) => {
      totals[key] += monthTotals[key];
    });
    monthsUsed += 1;
  }

  if (monthsUsed === 0) return null;

  const median: ExpenseMedian = {
    food: Math.round(totals.food / monthsUsed),
    utilities: Math.round(totals.utilities / monthsUsed),
    dailyGoods: Math.round(totals.dailyGoods / monthsUsed),
    rent: Math.round(totals.rent / monthsUsed),
    transport: Math.round(totals.transport / monthsUsed),
    subscription: Math.round(totals.subscription / monthsUsed),
    entertainment: Math.round(totals.entertainment / monthsUsed),
    medicalInsurance: Math.round(totals.medicalInsurance / monthsUsed),
  };

  return { median, monthsUsed };
};

// 固定費の値があればデフォルトに上書き
export const mergeFixedExpenses = (
  inputs: Record<keyof ExpenseMedian, string>,
  fixed: FixedExpenseStore
): Record<keyof ExpenseMedian, string> => {
  const next = { ...inputs };
  fixedExpenseKeys.forEach((key) => {
    const v = fixed[key];
    if (typeof v === "number") {
      next[key] = String(v);
    }
  });
  return next;
};

// ▼ ホーム画面用：サイクルごとの「計画確定フラグ」

export type HomeCycleConfirmState = {
  year: number; // 「◯年◯月分」として扱う年
  month: number; // 同上
  confirmed: boolean;
};

const HOME_CYCLE_CONFIRM_PREFIX = "kakeibo_home_cycle_confirm";

/**
 * サイクル用のキーを生成
 * 例: kakeibo_home_cycle_confirm_2024-12
 */
const buildHomeCycleConfirmKey = (year: number, month: number) =>
  `${HOME_CYCLE_CONFIRM_PREFIX}_${year}-${String(month).padStart(2, "0")}`;

/**
 * このサイクルの計画が確定したことを保存
 */
export function saveHomeCycleConfirmed(
  year: number,
  month: number,
  confirmed: boolean = true
) {
  if (typeof window === "undefined") return;
  try {
    const key = buildHomeCycleConfirmKey(year, month);
    const state: HomeCycleConfirmState = { year, month, confirmed };
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // 失敗しても何もしない
  }
}

/**
 * このサイクルの計画が確定済みかどうかを取得
 */
export function isHomeCycleConfirmed(year: number, month: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = buildHomeCycleConfirmKey(year, month);
    const raw = window.localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as HomeCycleConfirmState;
    return !!parsed.confirmed;
  } catch {
    return false;
  }
}
