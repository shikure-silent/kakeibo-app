// ▼ 型定義ti

export type ThemeOption = "system" | "light" | "dark";
export type BudgetBaseOption = "nationalMedian" | "userAverage";

export type AppSettings = {
  theme: ThemeOption;
  payday: number; // 集計開始日（給料日）
  budgetBase: BudgetBaseOption;
};

// ▼ アプリ全体の基本設定（フォント・テーマ・給料日など）

const SETTINGS_KEY = "kakeibo_app_settings_v1";

export const defaultSettings: AppSettings = {
  theme: "system",
  payday: 1,
  budgetBase: "nationalMedian",
};

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    return {
      ...defaultSettings,
      ...parsed,
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
