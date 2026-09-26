// types/calendar.ts

export type Mode = "expense" | "income";

export type DetailRecord = {
  id?: string;
  mode: Mode;
  amount: number;
  category: string;
  payFrom: string;
  shopName?: string;
  memo: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO文字列など
  updatedAt?: string; // 編集時刻（競合解決に利用）
  deletedAt?: string; // 削除時刻（同期用 tombstone）
};

export type MonthlyBudget = {
  year: number;
  month: number;
  totalBudget: number;
  items: { label: string; amount: number }[];
};
