"use client";

import React from "react";
import ExpenseInputsBlock from "../ExpenseInputsBlock";
import { ExpenseMedian } from "../../data/prefectureData";
import { CustomExpenseItem } from "../../types/budget";

// カテゴリキー → 表示ラベル
const EXPENSE_LABEL_MAP: Record<keyof ExpenseMedian, string> = {
  food: "食費",
  utilities: "水道・光熱費",
  dailyGoods: "日用品",
  rent: "家賃・住居",
  transport: "交通費",
  subscription: "サブスク",
  entertainment: "娯楽費",
  medicalInsurance: "医療・保険",
};
type ConfirmedItem = {
  label: string;
  amount: number;
};

type Props = {
  ageGroupLabel: string;
  median: ExpenseMedian;
  inputs: Record<keyof ExpenseMedian, string>;
  onChange: (key: keyof ExpenseMedian, value: string) => void;
  totalExpense: number;
  customItems: CustomExpenseItem[];
  onAddCustomItem: () => void;
  onChangeCustomItemLabel: (id: string, label: string) => void;
  onChangeCustomItemAmount: (id: string, amount: string) => void;
  onRemoveCustomItem: (id: string) => void;
  onStart?: () => void;
  autoUpdateMap: Record<keyof ExpenseMedian, boolean>;
  onToggleAutoUpdateCategory: (key: keyof ExpenseMedian) => void;

  // ホーム側から渡しているやつ
  mode: "setup" | "dashboard";
  onRequestEdit?: () => void;
  confirmedItems?: { label: string; amount: number }[] | null;
};

export default function BudgetSettingsCard({
  ageGroupLabel,
  median,
  inputs,
  onChange,
  totalExpense,
  customItems,
  onAddCustomItem,
  onChangeCustomItemLabel,
  onChangeCustomItemAmount,
  onRemoveCustomItem,
  onStart,
  autoUpdateMap,
  onToggleAutoUpdateCategory,
  mode,
  onRequestEdit,
  confirmedItems,
}: Props) {
  // --------------------
  // ダッシュボードモード
  // --------------------
  if (mode === "dashboard") {
    let topItems: ConfirmedItem[] = [];

    if (confirmedItems && confirmedItems.length > 0) {
      // ① 保存済み明細から上位3つ
      topItems = confirmedItems
        .filter((item) => item.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
    } else {
      // ② 念のためのフォールバック：inputs から上位3つ（ラベルは日本語に変換）
      const keys = Object.keys(inputs) as (keyof ExpenseMedian)[];
      topItems = keys
        .map((key) => ({
          label: EXPENSE_LABEL_MAP[key] ?? String(key),
          amount: Number(inputs[key] || "0") || 0,
        }))
        .filter((item) => item.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <h2 className="text-sm lg:text-base font-semibold text-slate-800">
            支出予算（今サイクルの計画）
          </h2>
          <p className="text-[11px] text-slate-500 leading-snug lg:text-right">
            選択した年代（{ageGroupLabel}
            ）の全国データをベースに、現在の支出予算を設定しています。
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium text-slate-600">
            支出予算の合計
          </p>
          <p className="text-sm font-semibold text-slate-800">
            合計:{" "}
            <span className="text-emerald-700">
              ¥{totalExpense.toLocaleString()}
            </span>
          </p>
          {topItems.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[11px] text-slate-500">
                主なカテゴリ（上位3つ）
              </p>
              <div className="space-y-1.5">
                {topItems.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-[11px]"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-900">
                      ¥{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 pt-1">
          <p className="text-[11px] text-slate-500">
            詳細な内訳や金額を変えたい場合は、「予算を見直す」から編集できます。
          </p>
          {onRequestEdit && (
            <button
              type="button"
              onClick={onRequestEdit}
              className="
                inline-flex items-center justify-center gap-2
                rounded-full
                border border-slate-300
                text-[11px] font-medium text-slate-700
                px-3 py-1.5
                hover:bg-slate-50
              "
            >
              <span>予算を見直す</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------
  // セットアップモード（従来のフォーム）
  // --------------------
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h2 className="text-sm lg:text-base font-semibold text-slate-800">
          支出予算　(今月の予算)
        </h2>
        <p className="text-[11px] text-slate-500 leading-snug lg:text-right">
          選択した年代（{ageGroupLabel}
          ）の全国データをもとにした初期値ですが、自由に編集・項目追加できます。
        </p>
      </div>

      <ExpenseInputsBlock
        median={median}
        inputs={inputs}
        onChange={onChange}
        customItems={customItems}
        onAddCustomItem={onAddCustomItem}
        onChangeCustomItemLabel={onChangeCustomItemLabel}
        onChangeCustomItemAmount={onChangeCustomItemAmount}
        onRemoveCustomItem={onRemoveCustomItem}
        autoUpdateMap={autoUpdateMap}
        onToggleAutoUpdateCategory={onToggleAutoUpdateCategory}
      />

      <div className="mt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">
          支出予算の合計:{" "}
          <span className="text-emerald-700">
            ¥{totalExpense.toLocaleString()}
          </span>
        </p>
        {onStart && (
          <button
            type="button"
            onClick={onStart}
            className="
              inline-flex items-center justify-center gap-2
              rounded-full
              bg-emerald-600 text-white
              text-xs lg:text-sm font-semibold
              px-4 py-2
              hover:bg-emerald-700
              shadow-sm
            "
          >
            <span>この予算でスタート</span>
          </button>
        )}
      </div>
    </div>
  );
}
