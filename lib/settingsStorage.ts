// lib/settingsStorage.ts

// ▼ 型定義
export type ThemeOption = "system" | "light" | "dark";
export type BudgetBaseOption = "nationalMedian" | "userAverage";
export const EXPENSE_CATEGORY_KEYS = [
  "food",
  "utilities",
  "dailyGoods",
  "rent",
  "transport",
  "subscription",
  "entertainment",
  "medicalInsurance",
] as const;
export type ExpenseCategoryKey = (typeof EXPENSE_CATEGORY_KEYS)[number];

// 追加：入力タブのデフォルトモード
export type DefaultInputModeOption = "expense" | "income";

export type AppSettings = {
  theme: ThemeOption;
  payday: number; // 集計開始日（給料日）
  budgetBase: BudgetBaseOption;
  autoUpdateCategories?: Partial<Record<ExpenseCategoryKey, boolean>>;

  // ★ 入力まわり
  defaultInputMode?: DefaultInputModeOption; // 入力タブ初期モード
  quickExpenseCategories?: string[]; // 支出のクイックカテゴリ
  quickIncomeCategories?: string[]; // 収入のクイックカテゴリ

  // --- A. 入力＆振り返りリマインド ---

  /** 数日入力が空いたときにホーム画面で声かけするか */
  enableInputGapReminder?: boolean;

  /** 週に1回くらい「今週のふりかえりカード」を出すか */
  enableWeeklySummaryReminder?: boolean;

  /** 給料日サイクルの中間で「ペース確認カード」を出すか */
  enableMidPeriodCheckReminder?: boolean;

  /** サイクル終了前に「ふりかえりしようカード」を出すか */
  enableCycleEndReviewReminder?: boolean;

  /** 予算何％を超えたら「ちょっとペース早め」カードを出すか（0.7 = 70% など） */
  budgetAlertRate?: number;

  // --- C. 貯金目標・メンタルサポート ---

  /** サイクルごとに目指したい貯金率（0.1 = 10%, 0.2 = 20% など） */
  targetSavingRate?: number;

  /** ポジティブな一言メッセージカードを出すかどうか */
  enableEncouragingMessages?: boolean;
};

// ▼ アプリ全体の基本設定（フォント・テーマ・給料日など）

const SETTINGS_KEY = "kakeibo_app_settings_v1";

export const defaultAutoUpdateCategories: Record<ExpenseCategoryKey, boolean> =
  EXPENSE_CATEGORY_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as Record<ExpenseCategoryKey, boolean>
  );

// ★ 新しい項目もここでデフォルト値を定義
export const defaultSettings: AppSettings = {
  theme: "system",
  payday: 1,
  budgetBase: "nationalMedian",
  autoUpdateCategories: defaultAutoUpdateCategories,

  // 入力タブ
  defaultInputMode: "expense",
  quickExpenseCategories: [],
  quickIncomeCategories: [],

  // 貯金サポート
  enableInputGapReminder: true,
  enableWeeklySummaryReminder: true,
  enableMidPeriodCheckReminder: true,
  enableCycleEndReviewReminder: true,
  budgetAlertRate: 0.8, // 80%

  targetSavingRate: 0.1, // 手取りの10%を目安（あとで変えてOK）
  enableEncouragingMessages: true,
};

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const parsedAuto =
      parsed.autoUpdateCategories &&
      typeof parsed.autoUpdateCategories === "object"
        ? parsed.autoUpdateCategories
        : {};

    return {
      ...defaultSettings,
      ...parsed,
      autoUpdateCategories: {
        ...defaultAutoUpdateCategories,
        ...parsedAuto,
      },
    };
  } catch {
    return defaultSettings;
  }
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // 保存失敗時は何もしない
  }
}

export function getThemeClasses(theme: ThemeOption): string {
  switch (theme) {
    case "dark":
      // クラス名で判定できるよう theme-dark を付与
      return "theme-dark bg-slate-900 text-slate-50";
    case "light":
      return "theme-light bg-slate-50 text-slate-900";
    case "system":
    default:
      // ひとまず system = light として扱う
      return "theme-light bg-slate-50 text-slate-900";
  }
}

export function getAutoUpdateCategories(
  settings: AppSettings
): Record<ExpenseCategoryKey, boolean> {
  return {
    ...defaultAutoUpdateCategories,
    ...(settings.autoUpdateCategories ?? {}),
  };
}

// ▼ カテゴリ・支出元プリセットの保存用（string[]）

const EXPENSE_CATEGORIES_KEY = "kakeibo_expense_categories_v1";
const INCOME_CATEGORIES_KEY = "kakeibo_income_categories_v1";
const PAY_FROM_PRESETS_KEY = "kakeibo_payfrom_presets_v1";

// 共通：string[] を保存
function saveStringList(key: string, list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // noop
  }
}

// 共通：string[] を読み込み（なければ defaults を返す）
function loadStringList(key: string, defaults: string[]): string[] {
  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;

    // 一応全部 string にそろえて返す
    return parsed.map((x) => String(x));
  } catch {
    return defaults;
  }
}

// 支出カテゴリ
export function loadExpenseCategories(defaults: string[]): string[] {
  return loadStringList(EXPENSE_CATEGORIES_KEY, defaults);
}

export function saveExpenseCategories(list: string[]) {
  saveStringList(EXPENSE_CATEGORIES_KEY, list);
}

// 収入カテゴリ
export function loadIncomeCategories(defaults: string[]): string[] {
  return loadStringList(INCOME_CATEGORIES_KEY, defaults);
}

export function saveIncomeCategories(list: string[]) {
  saveStringList(INCOME_CATEGORIES_KEY, list);
}

// 支出元・入金元プリセット
export function loadPayFromPresets(defaults: string[]): string[] {
  return loadStringList(PAY_FROM_PRESETS_KEY, defaults);
}

export function savePayFromPresets(list: string[]) {
  saveStringList(PAY_FROM_PRESETS_KEY, list);
}

export function clearAllKakeiboData(options?: { includeSettings?: boolean }) {
  if (typeof window === "undefined") return;

  const includeSettings = options?.includeSettings ?? false;

  try {
    const ls = window.localStorage;
    const keysToRemove: string[] = [];

    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (!key) continue;

      const isKakeiboKey =
        key.startsWith("kakeibo_") ||
        key.startsWith("kakeibo-") ||
        key.startsWith("budget_") ||
        key.startsWith("spending_") ||
        key.startsWith("details_");

      if (!isKakeiboKey) continue;

      // ▼ 設定を残したい場合は settings 系のキーはスキップ
      if (
        !includeSettings &&
        (key === SETTINGS_KEY ||
          key === EXPENSE_CATEGORIES_KEY ||
          key === INCOME_CATEGORIES_KEY ||
          key === PAY_FROM_PRESETS_KEY)
      ) {
        continue;
      }

      keysToRemove.push(key);
    }

    keysToRemove.forEach((key) => ls.removeItem(key));
  } catch {
    // 失敗しても何もしない
  }
}
