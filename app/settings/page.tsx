"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
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
} from "../../lib/settingsStorage";
import { useResolvedTheme } from "../../lib/useResolvedTheme";
import { useCloudAutoSaveOnLeave } from "../../lib/useCloudAutoSaveOnLeave";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_FROM_OPTIONS,
} from "../../lib/const";

import { ThemeSettingsSection } from "../../components/settings/ThemeSettingsSection";
import { SavingSupportSection } from "../../components/settings/SavingSupportSection";
import { CategorySettingsSection } from "../../components/settings/CategorySettingsSection";
import { AggregationSettingsSection } from "../../components/settings/AggregationSettingsSection";
import { AccountLoginSection } from "../../components/settings/AccountLoginSection";
import { DataManagementSection } from "../../components/settings/DataManagementSection";
import { AppInfoSection } from "../../components/settings/AppInfoSection";
import { CloudSyncSection } from "../../components/settings/CloudSyncSection";
import {
  createLocalBackup,
  parseLocalBackup,
  restoreLocalBackup,
} from "../../lib/localBackup";

// バージョンは package.json から取るのが面倒なら、ここでベタ書きでもOK
const APP_VERSION = "1.0.0";
const SHOW_DATA_MANAGEMENT = false;

export default function SettingsPage() {
  useCloudAutoSaveOnLeave();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [payFromPresets, setPayFromPresets] = useState<string[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

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
    value: AppSettings[K],
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveAppSettings(next);
      return next;
    });
  };

  const handleResetExpenseCategoriesToDefault = () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm(
      "支出カテゴリを最初の状態（デフォルト）に戻します。\n\n編集した名前や並び順はすべてリセットされます。\n本当に戻してよろしいですか？",
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
      "収入カテゴリを最初の状態（デフォルト）に戻します。\n\n編集した名前や並び順はすべてリセットされます。\n本当に戻してよろしいですか？",
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
      "支出元の候補を最初の状態（デフォルト）に戻します。\n\n編集した名前や並び順はすべてリセットされます。\n本当に戻してよろしいですか？",
    );
    if (!ok) return;

    const next = [...PAY_FROM_OPTIONS];
    setPayFromPresets(next);
    savePayFromPresets(next);

    window.alert("支出元の候補をデフォルトに戻しました。");
  };

  const handleCreateBackup = async () => {
    if (typeof window === "undefined") return;
    const backup = createLocalBackup({
      appVersion: APP_VERSION,
      includeSettings: true,
    });
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `kakeibo-backup-${timestamp}.json`;

    // iOS 実機 (Capacitor) では download 属性が効かないことがあるため、
    // 共有シート経由で「ファイルに保存」を促す。
    if (Capacitor.isNativePlatform()) {
      try {
        const file = new File([blob], filename, { type: "application/json" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "家計簿バックアップ",
            files: [file],
          });
          return;
        }
      } catch {
        // fallback to download path
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    window.alert("バックアップを作成しました。");
  };

  const handleImportBackup = async (file: File) => {
    if (typeof window === "undefined") return;
    try {
      const raw = await file.text();
      const parsed = parseLocalBackup(raw);
      if (!parsed.ok) {
        window.alert(parsed.error);
        return;
      }
      const ok = window.confirm(
        "バックアップを復元します。現在のデータは上書きされます。\n\n本当に復元してよろしいですか？",
      );
      if (!ok) return;
      restoreLocalBackup(parsed.backup, {
        includeSettings: true,
        clearBefore: true,
      });
      window.alert("バックアップを復元しました。");
      window.location.reload();
    } catch {
      window.alert("バックアップの読み込みに失敗しました。");
    }
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
    kind: "expense" | "income" | "payfrom",
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
    kind: "expense" | "income" | "payfrom",
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
    kind: "expense" | "income" | "payfrom",
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
    kind: "expense" | "income" | "payfrom",
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

  const { themeClass, isDark } = useResolvedTheme(settings.theme);
  const containerClass = themeClass;
  const sectionLinks = [
    { id: "account", label: "アカウント" },
    { id: "theme", label: "テーマ設定" },
    { id: "saving", label: "貯金サポート" },
    { id: "osnotify", label: "OS通知" },
    { id: "category", label: "カテゴリ・項目" },
    { id: "aggregation", label: "集計・予算" },
    ...(SHOW_DATA_MANAGEMENT ? [{ id: "data", label: "データ管理" }] : []),
    { id: "appinfo", label: "アプリ情報" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  // 設定ページに遷移したら必ず先頭から表示する
  useEffect(() => {
    if (typeof window === "undefined") return;
    // ブラウザのスクロール位置復元を無効化し、常に先頭から表示
    const { history } = window;
    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    // ハッシュが残っていたら削除（前回のセクション位置を引き継がない）
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "auto" });

    return () => {
      history.scrollRestoration = prevRestoration || "auto";
    };
  }, []);

  return (
    <main
      className={`min-h-screen max-w-5xl mx-auto px-4 pt-2 pb-6 lg:pt-3 lg:pb-8 space-y-6 ${containerClass}`}
    >
      <header className="space-y-2">
        <div className="relative flex min-h-[3rem] items-start justify-center gap-3">
          <h1
            className={`text-lg lg:text-xl font-semibold text-center ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            設定
          </h1>
          <div className="absolute right-0 -top-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm"
              style={{
                borderColor: isDark ? "#475569" : "#e2e8f0",
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
                color: isDark ? "#e2e8f0" : "#334155",
              }}
              aria-label="設定メニューを開く"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border shadow-lg z-10"
                style={{
                  borderColor: isDark ? "#475569" : "#e2e8f0",
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                }}
              >
                <ul
                  className={`divide-y text-sm ${
                    isDark ? "divide-slate-700" : "divide-slate-100"
                  }`}
                >
                  {sectionLinks.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block px-3 py-2 hover:bg-emerald-50"
                        style={{
                          color: isDark ? "#e2e8f0" : "#334155",
                        }}
                        onClick={() => setMenuOpen(false)}
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <section id="account">
          <AccountLoginSection />
        </section>

        <section id="theme">
          <ThemeSettingsSection
            theme={settings.theme}
            onChangeTheme={(theme: ThemeOption) =>
              handleChangeSetting("theme", theme)
            }
            isDark={isDark}
          />
        </section>

        <section id="saving">
          <SavingSupportSection
            settings={settings}
            onChangeSetting={handleChangeSetting}
            showHeader={true}
            isDark={isDark}
          />
        </section>

        <section id="category" className="space-y-2">
          <div
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-100 text-slate-900"
            }`}
          >
            <h2 className="text-sm font-semibold">カテゴリ・項目設定</h2>
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-lg ${
                isDark
                  ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              aria-label="カテゴリ・項目設定の開閉"
              aria-expanded={isCategoryOpen}
            >
              {isCategoryOpen ? "−" : "+"}
            </button>
          </div>
          {isCategoryOpen && (
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
                  "expense",
                )
              }
              onAddExpenseCategory={() =>
                handleAddItem(
                  expenseCategories,
                  setExpenseCategories,
                  "expense",
                )
              }
              onRemoveExpenseCategory={(idx) =>
                handleRemoveItem(
                  expenseCategories,
                  setExpenseCategories,
                  idx,
                  "expense",
                )
              }
              onReorderExpenseCategory={(from, to) =>
                handleReorder(
                  expenseCategories,
                  setExpenseCategories,
                  from,
                  to,
                  "expense",
                )
              }
              onEditIncomeCategory={(idx, val) =>
                handleEditItem(
                  incomeCategories,
                  setIncomeCategories,
                  idx,
                  val,
                  "income",
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
                  "income",
                )
              }
              onReorderIncomeCategory={(from, to) =>
                handleReorder(
                  incomeCategories,
                  setIncomeCategories,
                  from,
                  to,
                  "income",
                )
              }
              onEditPayFrom={(idx, val) =>
                handleEditItem(
                  payFromPresets,
                  setPayFromPresets,
                  idx,
                  val,
                  "payfrom",
                )
              }
              onAddPayFrom={() =>
                handleAddItem(payFromPresets, setPayFromPresets, "payfrom")
              }
              onRemovePayFrom={(idx) =>
                handleRemoveItem(
                  payFromPresets,
                  setPayFromPresets,
                  idx,
                  "payfrom",
                )
              }
              onReorderPayFrom={(from, to) =>
                handleReorder(
                  payFromPresets,
                  setPayFromPresets,
                  from,
                  to,
                  "payfrom",
                )
              }
              onResetExpenseCategories={handleResetExpenseCategoriesToDefault}
              onResetIncomeCategories={handleResetIncomeCategoriesToDefault}
              onResetPayFromPresets={handleResetPayFromPresetsToDefault}
              isDark={isDark}
              showHeader={false}
            />
          )}
        </section>

        <section id="aggregation">
          <AggregationSettingsSection
            payday={settings.payday}
            budgetBase={settings.budgetBase}
            onChangePayday={(day) => handleChangeSetting("payday", day)}
            onChangeBudgetBase={(base: BudgetBaseOption) =>
              handleChangeSetting("budgetBase", base)
            }
            isDark={isDark}
          />
        </section>

        {SHOW_DATA_MANAGEMENT && (
          <section id="data">
            <div className="space-y-4">
              <DataManagementSection
                onCreateBackup={handleCreateBackup}
                onImportBackup={handleImportBackup}
                isDark={isDark}
              />
              <CloudSyncSection />
            </div>
          </section>
        )}

        <section id="appinfo">
          <AppInfoSection version={APP_VERSION} isDark={isDark} />
        </section>
      </div>
    </main>
  );
}
