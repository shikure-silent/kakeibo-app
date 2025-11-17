// types/calendar.ts

export type Mode = "expense" | "income";

export type DetailRecord = {
  mode: Mode;
  amount: number;
  category: string;
  payFrom: string;
  memo: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO文字列など
};

export type MonthlyBudget = {
  year: number;
  month: number;
  totalBudget: number;
  items: { label: string; amount: number }[];
};
