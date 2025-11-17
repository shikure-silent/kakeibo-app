// types/budget.ts

export type CustomExpenseItem = {
  id: string;
  label: string;
  value: string; // 入力欄は string で保持して、計算時だけ number に変換する
};
