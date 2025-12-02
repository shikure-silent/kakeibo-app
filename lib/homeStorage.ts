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
