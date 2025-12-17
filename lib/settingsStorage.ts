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

// 設定の保存キー
const SETTINGS_KEY = "kakeibo_app_settings_v1";

// autoUpdateCategories のデフォルト（全カテゴリ true）
export const defaultAutoUpdateCategories: Record<ExpenseCategoryKey, boolean> =
  EXPENSE_CATEGORY_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as Record<ExpenseCategoryKey, boolean>
  );

export type AppSettings = {
  theme: ThemeOption;
  payday: number;
  budgetBase: BudgetBaseOption;
  autoUpdateCategories?: Partial<Record<ExpenseCategoryKey, boolean>>;

  // ★ 入力まわり
  defaultInputMode?: DefaultInputModeOption;
  quickExpenseCategories?: string[];
  quickIncomeCategories?: string[];

  // --- A. 入力＆振り返りリマインド ---
  enableInputGapReminder?: boolean;
  enableWeeklySummaryReminder?: boolean;
  enableMidPeriodCheckReminder?: boolean;
  enableCycleEndReviewReminder?: boolean;

  /** 予算何％を超えたら…（0.8=80%） */
  budgetAlertRate?: number;

  // ✅ 追加：リマインド詳細
  /** 「入力が空いた」判定のしきい値（日） */
  inputGapDays?: number; // 例：2

  /** 週1ふりかえり：曜日（0=日, 1=月 ... 6=土） */
  weeklySummaryWeekday?: number;

  /** 通知タイミング（アプリ内想定の時刻） */
  reminderTime?: string; // "21:00" など

  /** 中間チェック：サイクル開始から何日後に出すか */
  midPeriodOffsetDays?: number;

  /** サイクル終了前：何日前に出すか */
  cycleEndReviewDaysBefore?: number;

  /** Webでも試しにブラウザ通知を出す（タブが開いてる間だけ） */
  enableBrowserNotifications?: boolean;

  // --- C. 貯金目標・メンタルサポート ---
  targetSavingRate?: number;
  enableEncouragingMessages?: boolean;
};

// ★ 新しい項目もここでデフォルト値を定義
export const defaultSettings: AppSettings = {
  theme: "system",
  payday: 1,
  budgetBase: "nationalMedian",
  autoUpdateCategories: defaultAutoUpdateCategories,

  defaultInputMode: "expense",
  quickExpenseCategories: [],
  quickIncomeCategories: [],

  // 貯金サポート
  enableInputGapReminder: true,
  enableWeeklySummaryReminder: true,
  enableMidPeriodCheckReminder: true,
  enableCycleEndReviewReminder: true,
  budgetAlertRate: 0.8,

  // ✅ 追加デフォルト
  inputGapDays: 2,
  weeklySummaryWeekday: 0, // 日曜
  reminderTime: "21:00",
  midPeriodOffsetDays: 14,
  cycleEndReviewDaysBefore: 2,
  enableBrowserNotifications: false,

  targetSavingRate: 0.1,
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
