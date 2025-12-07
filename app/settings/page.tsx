"use client";

import { useEffect, useState } from "react";
import {
  AppSettings,
  BudgetBaseOption,
  ThemeOption,
  defaultSettings,
  loadAppSettings,
  saveAppSettings,
  loadExpenseCategories,
  saveExpenseCategories,
  loadIncomeCategories,
  saveIncomeCategories,
  loadPayFromPresets,
  savePayFromPresets,
  getThemeClasses,
  clearAllKakeiboData,
} from "../../lib/settingsStorage";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_FROM_OPTIONS,
} from "../../lib/const";

import { ThemeSettingsSection } from "../../components/settings/ThemeSettingsSection";
import { InputQuickSettingsSection } from "../../components/settings/InputQuickSettingsSection";
import { SavingSupportSection } from "../../components/settings/SavingSupportSection";
import { CategorySettingsSection } from "../../components/settings/CategorySettingsSection";
import { AggregationSettingsSection } from "../../components/settings/AggregationSettingsSection";
import { AccountLoginSection } from "../../components/settings/AccountLoginSection";
import { DataManagementSection } from "../../components/settings/DataManagementSection";
import { AppInfoSection } from "../../components/settings/AppInfoSection";

// バージョンは package.json から取るのが面倒なら、ここでベタ書きでもOK
const APP_VERSION = "0.3.0-beta";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [payFromPresets, setPayFromPresets] = useState<string[]>([]);

  // 初期読み込み
  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);

    setExpenseCategories(loadExpenseCategories([...EXPENSE_CATEGORIES]));
    setIncomeCategories(loadIncomeCategories([...INCOME_CATEGORIES]));
    setPayFromPresets(loadPayFromPresets([...PAY_FROM_OPTIONS]));
  }, []);

  const handleChangeSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveAppSettings(next);
  };

  const handleResetKakeiboData = () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm(
      "ブラウザに保存されている家計簿データ（予算・日別の明細・固定費など）をすべて削除します。\n※ テーマやカテゴリなどの設定は残ります。\n\n本当に削除してよろしいですか？"
    );
    if (!ok) return;

    clearAllKakeiboData({ includeSettings: false });

    window.alert("家計簿データを削除しました。");
    window.location.reload();
  };

  const handleResetExpenseCategoriesToDefault = () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm(
      "支出カテゴリを最初の状態（デフォルト）に戻します。\n\n編集した名前や並び順はすべてリセットされます。\n本当に戻してよろしいですか？"
    );
    if (!ok) return;

    const next = [...EXPENSE_CATEGORIES];
    setExpenseCategories(next);
    saveExpenseCategories(next);

    window.alert("支出カテゴリをデフォルトに戻しました。");
  };

  const handleResetIncomeCategoriesToDefault = () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm(
      "収入カテゴリを最初の状態（デフォルト）に戻します。\n\n編集した名前や並び順はすべてリセットされます。\n本当に戻してよろしいですか？"
    );
    if (!ok) return;

    const next = [...INCOME_CATEGORIES];
    setIncomeCategories(next);
    saveIncomeCategories(next);

    window.alert("収入カテゴリをデフォルトに戻しました。");
  };

  const handleResetPayFromPresetsToDefault = () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm(
      "支出元・入金元の候補を最初の状態（デフォルト）に戻します。\n\n編集した名前や並び順はすべてリセットされます。\n本当に戻してよろしいですか？"
    );
    if (!ok) return;

    const next = [...PAY_FROM_OPTIONS];
    setPayFromPresets(next);
    savePayFromPresets(next);

    window.alert("支出元・入金元の候補をデフォルトに戻しました。");
  };

  const reorderList = (list: string[], from: number, to: number) => {
    if (from === to) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const handleReorder = (
    list: string[],
    setList: (v: string[]) => void,
    from: number,
    to: number,
    kind: "expense" | "income" | "payfrom"
  ) => {
    const reordered = reorderList(list, from, to);
    setList(reordered);

    if (kind === "expense") saveExpenseCategories(reordered);
    if (kind === "income") saveIncomeCategories(reordered);
    if (kind === "payfrom") savePayFromPresets(reordered);
  };

  const handleEditItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string,
    kind: "expense" | "income" | "payfrom"
  ) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);

    if (kind === "expense") saveExpenseCategories(newList);
    if (kind === "income") saveIncomeCategories(newList);
    if (kind === "payfrom") savePayFromPresets(newList);
  };

  const handleAddItem = (
    list: string[],
    setList: (v: string[]) => void,
    kind: "expense" | "income" | "payfrom"
  ) => {
    const newList = [...list, ""];
    setList(newList);

    if (kind === "expense") saveExpenseCategories(newList);
    if (kind === "income") saveIncomeCategories(newList);
    if (kind === "payfrom") savePayFromPresets(newList);
  };

  const handleRemoveItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    kind: "expense" | "income" | "payfrom"
  ) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("この項目を削除しますか？");
      if (!ok) return;
    }

    const newList = list.filter((_, i) => i !== index);
    setList(newList);

    if (kind === "expense") saveExpenseCategories(newList);
    if (kind === "income") saveIncomeCategories(newList);
    if (kind === "payfrom") savePayFromPresets(newList);
  };

  const themeClass = getThemeClasses(settings.theme);

  return (
    <main
      className={`min-h-screen max-w-5xl mx-auto px-4 py-6 lg:py-8 space-y-6 ${themeClass}`}
    >
      <header className="space-y-2">
        <h1 className="text-lg lg:text-xl font-semibold text-slate-900">
          設定
        </h1>
        <p className="text-[12px] text-slate-500 leading-snug">
          アプリの表示やカテゴリ、集計方法などをカスタマイズできます。
        </p>
      </header>

      <div className="space-y-6">
        <ThemeSettingsSection
          theme={settings.theme}
          onChangeTheme={(theme: ThemeOption) =>
            handleChangeSetting("theme", theme)
          }
        />

        <InputQuickSettingsSection
          defaultInputMode={settings.defaultInputMode}
          quickExpenseCategories={settings.quickExpenseCategories}
          quickIncomeCategories={settings.quickIncomeCategories}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          onChangeDefaultMode={(mode) =>
            handleChangeSetting("defaultInputMode", mode)
          }
          onToggleQuickCategory={(kind, name) =>
            handleToggleQuickCategory(kind, name)
          }
        />

        <SavingSupportSection
          settings={settings}
          onChangeSetting={handleChangeSetting}
        />

        <CategorySettingsSection
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          payFromPresets={payFromPresets}
          onEditExpenseCategory={(idx, val) =>
            handleEditItem(
              expenseCategories,
              setExpenseCategories,
              idx,
              val,
              "expense"
            )
          }
          onAddExpenseCategory={() =>
            handleAddItem(expenseCategories, setExpenseCategories, "expense")
          }
          onRemoveExpenseCategory={(idx) =>
            handleRemoveItem(
              expenseCategories,
              setExpenseCategories,
              idx,
              "expense"
            )
          }
          onReorderExpenseCategory={(from, to) =>
            handleReorder(
              expenseCategories,
              setExpenseCategories,
              from,
              to,
              "expense"
            )
          }
          onEditIncomeCategory={(idx, val) =>
            handleEditItem(
              incomeCategories,
              setIncomeCategories,
              idx,
              val,
              "income"
            )
          }
          onAddIncomeCategory={() =>
            handleAddItem(incomeCategories, setIncomeCategories, "income")
          }
          onRemoveIncomeCategory={(idx) =>
            handleRemoveItem(
              incomeCategories,
              setIncomeCategories,
              idx,
              "income"
            )
          }
          onReorderIncomeCategory={(from, to) =>
            handleReorder(
              incomeCategories,
              setIncomeCategories,
              from,
              to,
              "income"
            )
          }
          onEditPayFrom={(idx, val) =>
            handleEditItem(
              payFromPresets,
              setPayFromPresets,
              idx,
              val,
              "payfrom"
            )
          }
          onAddPayFrom={() =>
            handleAddItem(payFromPresets, setPayFromPresets, "payfrom")
          }
          onRemovePayFrom={(idx) =>
            handleRemoveItem(payFromPresets, setPayFromPresets, idx, "payfrom")
          }
          onReorderPayFrom={(from, to) =>
            handleReorder(
              payFromPresets,
              setPayFromPresets,
              from,
              to,
              "payfrom"
            )
          }
          onResetExpenseCategories={handleResetExpenseCategoriesToDefault}
          onResetIncomeCategories={handleResetIncomeCategoriesToDefault}
          onResetPayFromPresets={handleResetPayFromPresetsToDefault}
        />

        <AggregationSettingsSection
          payday={settings.payday}
          budgetBase={settings.budgetBase}
          onChangePayday={(day) => handleChangeSetting("payday", day)}
          onChangeBudgetBase={(base: BudgetBaseOption) =>
            handleChangeSetting("budgetBase", base)
          }
        />

        <AccountLoginSection />

        <DataManagementSection onResetKakeiboData={handleResetKakeiboData} />

        <AppInfoSection version={APP_VERSION} />
      </div>
    </main>
  );

  function handleToggleQuickCategory(kind: "expense" | "income", name: string) {
    const key =
      kind === "expense" ? "quickExpenseCategories" : "quickIncomeCategories";

    const current = (settings[key] ?? []) as string[];
    const next = current.includes(name)
      ? current.filter((v) => v !== name)
      : [...current, name];

    const nextSettings: AppSettings = {
      ...settings,
      [key]: next,
    };
    setSettings(nextSettings);
    saveAppSettings(nextSettings);
  }
}
