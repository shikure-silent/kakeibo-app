// data/prefectureData.ts

// 年代別・地域別などで使う「支出カテゴリごとの目安値」
export type ExpenseMedian = {
  food: number; // 食費
  utilities: number; // 水道・光熱費
  dailyGoods: number; // 日用品
  rent: number; // 家賃・住居
  transport: number; // 交通費
  subscription: number; // サブスク
  entertainment: number; // 娯楽費（趣味娯楽）
  medicalInsurance: number; // 医療・保険
};

// 全体用のざっくりデフォルト値（年代未選択などのときの目安）
export const DEFAULT_EXPENSE_MEDIAN: ExpenseMedian = {
  food: 40000,
  utilities: 12000,
  dailyGoods: 8000,
  rent: 60000,
  transport: 10000,
  subscription: 5000,
  entertainment: 10000,
  medicalInsurance: 8000,
};

// いまは都道府県別の機能は使っていないので空にしておく
export const PREFECTURE_MEDIANS: Record<string, ExpenseMedian> = {};
