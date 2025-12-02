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

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [payFromPresets, setPayFromPresets] = useState<string[]>([]);

  const handleResetKakeiboData = () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm(
      "ブラウザに保存されている家計簿データ（予算・日別の明細・固定費など）をすべて削除します。\n※ テーマやカテゴリなどの設定は残ります。\n\n本当に削除してよろしいですか？"
    );
    if (!ok) return;

    clearAllKakeiboData({ includeSettings: false });

    // 画面上の一部の state もリセットしておく（必要最低限でOK）
    // 予算や明細は各ページで localStorage を読みに行くので、
    // ここでは特に何もしなくてもよいが、念のため再描画のためにリロードしてもよい
    window.alert("家計簿データを削除しました。");
    window.location.reload();
  };

  // 初期読み込み
  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);

    // 設定されたカテゴリがあればそれを、なければデフォルトを使う
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

  const handleReorder = (
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    direction: "up" | "down",
    kind: "expense" | "income" | "payfrom"
  ) => {
    const newList = [...list];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    const tmp = newList[targetIndex];
    newList[targetIndex] = newList[index];
    newList[index] = tmp;
    setList(newList);

    if (kind === "expense") saveExpenseCategories(newList);
    if (kind === "income") saveIncomeCategories(newList);
    if (kind === "payfrom") savePayFromPresets(newList);
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
    const newList = list.filter((_, i) => i !== index);
    setList(newList);

    if (kind === "expense") saveExpenseCategories(newList);
    if (kind === "income") saveIncomeCategories(newList);
    if (kind === "payfrom") savePayFromPresets(newList);
  };

  const themeClass = getThemeClasses(settings.theme);

  return (
    <main
      className={`max-w-5xl mx-auto px-4 py-6 lg:py-8 space-y-6 ${themeClass}`}
    >
      <header className="space-y-1">
        <h1 className="text-lg lg:text-xl font-semibold text-slate-900">
          設定
        </h1>
        <p className="text-[12px] text-slate-500">
          アプリの表示やカテゴリ、集計方法などをカスタマイズできます。
        </p>
      </header>

      <div className="space-y-6">
        {/* 1. 表示・テーマ設定 */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 lg:px-5 lg:py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">テーマ設定</h2>

          {/* テーマ */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-600">
              テーマカラー
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {(["system", "light", "dark"] as ThemeOption[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleChangeSetting("theme", theme)}
                  className={`px-3 py-1.5 rounded-full border ${
                    settings.theme === theme
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {theme === "system" && "端末の設定に合わせる"}
                  {theme === "light" && "ライト"}
                  {theme === "dark" && "ダーク"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              ※ テーマの切り替えは今後のアップデートで反映予定です。
            </p>
          </div>
        </section>

        {/* 2. カテゴリ・項目設定 */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 lg:px-5 lg:py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">
            カテゴリ・項目設定
          </h2>

          {/* 支出カテゴリ */}
          <EditableListSection
            title="支出カテゴリ"
            description="入力タブやカレンダー編集モーダルで使う支出カテゴリの名前と並び順を変更できます。"
            items={expenseCategories}
            onEdit={(idx, val) =>
              handleEditItem(
                expenseCategories,
                setExpenseCategories,
                idx,
                val,
                "expense"
              )
            }
            onAdd={() =>
              handleAddItem(expenseCategories, setExpenseCategories, "expense")
            }
            onRemove={(idx) =>
              handleRemoveItem(
                expenseCategories,
                setExpenseCategories,
                idx,
                "expense"
              )
            }
            onMoveUp={(idx) =>
              handleReorder(
                expenseCategories,
                setExpenseCategories,
                idx,
                "up",
                "expense"
              )
            }
            onMoveDown={(idx) =>
              handleReorder(
                expenseCategories,
                setExpenseCategories,
                idx,
                "down",
                "expense"
              )
            }
          />

          {/* 収入カテゴリ */}
          <EditableListSection
            title="収入カテゴリ"
            description="ボーナスや臨時収入など、自分に合った収入カテゴリに編集できます。入力タブやカレンダー編集モーダルに反映されます。"
            items={incomeCategories}
            onEdit={(idx, val) =>
              handleEditItem(
                incomeCategories,
                setIncomeCategories,
                idx,
                val,
                "income"
              )
            }
            onAdd={() =>
              handleAddItem(incomeCategories, setIncomeCategories, "income")
            }
            onRemove={(idx) =>
              handleRemoveItem(
                incomeCategories,
                setIncomeCategories,
                idx,
                "income"
              )
            }
            onMoveUp={(idx) =>
              handleReorder(
                incomeCategories,
                setIncomeCategories,
                idx,
                "up",
                "income"
              )
            }
            onMoveDown={(idx) =>
              handleReorder(
                incomeCategories,
                setIncomeCategories,
                idx,
                "down",
                "income"
              )
            }
          />

          {/* 支出元 / 入金元プリセット */}
          <EditableListSection
            title="支出元・入金元の候補"
            description="現金・クレジットカード・電子決済など、よく使う支出元や入金元の候補を編集できます。入力タブとカレンダー編集モーダルに反映されます。"
            items={payFromPresets}
            onEdit={(idx, val) =>
              handleEditItem(
                payFromPresets,
                setPayFromPresets,
                idx,
                val,
                "payfrom"
              )
            }
            onAdd={() =>
              handleAddItem(payFromPresets, setPayFromPresets, "payfrom")
            }
            onRemove={(idx) =>
              handleRemoveItem(
                payFromPresets,
                setPayFromPresets,
                idx,
                "payfrom"
              )
            }
            onMoveUp={(idx) =>
              handleReorder(
                payFromPresets,
                setPayFromPresets,
                idx,
                "up",
                "payfrom"
              )
            }
            onMoveDown={(idx) =>
              handleReorder(
                payFromPresets,
                setPayFromPresets,
                idx,
                "down",
                "payfrom"
              )
            }
          />

          <p className="text-[10px] text-slate-400">
            ※ ここで編集した内容は、入力タブのカテゴリ候補や支出元候補、
            カレンダーの内訳編集モーダルに反映されます。
          </p>
        </section>

        {/* 3. 集計・予算の設定 */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 lg:px-5 lg:py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">
            集計・予算の設定
          </h2>

          {/* 集計開始日 */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-600">
              集計開始日（給料日）
            </p>
            <div className="flex items-center gap-2 text-[12px]">
              <select
                value={settings.payday}
                onChange={(e) =>
                  handleChangeSetting("payday", Number(e.target.value) || 1)
                }
                className="border border-slate-300 rounded-full px-3 py-1.5 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  return (
                    <option key={day} value={day}>
                      {day}日
                    </option>
                  );
                })}
              </select>
              <span className="text-[11px] text-slate-500">
                例：25日に給料日の場合は「25日」を選択
              </span>
            </div>
          </div>

          {/* 予算の基準 */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-600">
              予算の基準（将来のオプション）
            </p>
            <div className="flex flex-col gap-1 text-[11px]">
              {(["nationalMedian", "userAverage"] as BudgetBaseOption[]).map(
                (opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="budgetBase"
                      value={opt}
                      checked={settings.budgetBase === opt}
                      onChange={() => handleChangeSetting("budgetBase", opt)}
                      className="h-3 w-3"
                    />
                    <span className="text-slate-700">
                      {opt === "nationalMedian" &&
                        "全国×年代別の支出中央値をベースにする（現在使用中）"}
                      {opt === "userAverage" &&
                        "自分の過去数ヶ月の平均支出をベースにする（今後追加予定）"}
                    </span>
                  </label>
                )
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              ※ 「自分の平均から計算する」は今後のバージョンで実装予定です。
            </p>
          </div>
        </section>
        {/* 4. データ管理 ★ここから追加 */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 lg:px-5 lg:py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">データ管理</h2>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-slate-700">
              家計簿データをリセット
            </p>
            <p className="text-[10px] text-slate-500">
              この端末のブラウザに保存されている予算・日別の支出／収入明細・固定費などの
              家計簿データをすべて削除します。テーマや給料日、カテゴリ・支出元プリセットの設定は残ります。
            </p>
            <button
              type="button"
              onClick={handleResetKakeiboData}
              className="mt-1 inline-flex items-center rounded-full border border-red-400 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
            >
              家計簿データをすべて削除する
            </button>
          </div>

          <p className="text-[10px] text-slate-400">
            ※ 誤って削除した場合、データを元に戻すことはできません。
          </p>
        </section>
      </div>
    </main>
  );
}

// 編集可能リスト（カテゴリ・支出元など共通）
function EditableListSection(props: {
  title: string;
  description: string;
  items: string[];
  onEdit: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const {
    title,
    description,
    items,
    onEdit,
    onAdd,
    onRemove,
    onMoveUp,
    onMoveDown,
  } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-slate-700">{title}</p>
          <p className="text-[10px] text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="text-[11px] rounded-full border border-emerald-400 px-3 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
        >
          ＋ 追加
        </button>
      </div>

      <div className="space-y-1 max-h-40 overflow-auto pr-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5"
          >
            <div className="flex flex-col flex-1">
              <input
                type="text"
                value={item}
                onChange={(e) => onEdit(index, e.target.value)}
                className="w-full bg-white rounded-lg border border-slate-300 px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="名前を入力"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onMoveUp(index)}
                className="text-[10px] text-slate-500 hover:text-slate-800"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(index)}
                className="text-[10px] text-slate-500 hover:text-slate-800"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-[11px] text-red-500 hover:text-red-600"
            >
              削除
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[11px] text-slate-400">
            まだ項目がありません。「＋ 追加」から登録できます。
          </p>
        )}
      </div>
    </div>
  );
}
