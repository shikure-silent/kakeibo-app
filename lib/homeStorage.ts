import { ExpenseMedian } from "../data/prefectureData";
import { AgeGroup, ageGroupMedians } from "../data/ageGroupData";
import { STORAGE_KEYS } from "./const";

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
export const buildExpenseInputs = (
  ageGroup: AgeGroup
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
