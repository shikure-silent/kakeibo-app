// lib/const.ts

// ====== localStorage のキーまわり ======

export const STORAGE_KEYS = {
  FIXED_EXPENSES: "kakeibo-fixed-expenses",
  BUDGET_PREFIX: "kakeibo-budget-",
  SPENDING_PREFIX: "kakeibo-spending-",
  DETAILS_PREFIX: "kakeibo-spending-details-",
} as const;

// 予算（その月のトータル予算）用キー
export const buildBudgetKey = (year: number, month: number) =>
  `${STORAGE_KEYS.BUDGET_PREFIX}${year}-${String(month).padStart(2, "0")}`;

// 日別の合計支出（カレンダー用）
export const buildSpendingKey = (year: number, month: number) =>
  `${STORAGE_KEYS.SPENDING_PREFIX}${year}-${String(month).padStart(2, "0")}`;

// 1日ごとの明細（入力タブで保存しているやつ）
export const buildDetailsKey = (year: number, month: number, day: number) =>
  `${STORAGE_KEYS.DETAILS_PREFIX}${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;

// ====== 共通で使うラベル・選択肢 ======

// 曜日ラベル（カレンダー、日付表示などで共通利用）
export const WEEKDAY_LABELS = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
] as const;

// 入力タブ：支出カテゴリ候補
export const EXPENSE_CATEGORIES = [
  "食費",
  "日用品",
  "家賃・住居",
  "水道・光熱費",
  "通信費",
  "交通費",
  "交際費",
  "医療・美容",
  "教育・子ども",
  "サブスク",
  "その他",
] as const;

// カスタム支出項目の候補（他の家計簿アプリにもありそうなやつ）
export const CUSTOM_EXPENSE_TEMPLATES = [
  "医療・美容",
  "教育・子ども",
  "交際費",
  "ペット関連",
  "車両関連（ガソリン・駐車場など）",
  "保険料",
  "その他固定費",
] as const;

// 入力タブ：収入カテゴリ候補
export const INCOME_CATEGORIES = [
  "給与・賞与",
  "副業",
  "お小遣い",
  "臨時収入",
  "その他収入",
] as const;

// 入力タブ：支出元 / 入金元
export const PAY_FROM_OPTIONS = [
  "現金",
  "クレジットカード",
  "電子マネー",
  "銀行口座",
  "その他",
] as const;

export const APP_NAME = "無理なく貯金ができる家計簿アプリ" as const;
