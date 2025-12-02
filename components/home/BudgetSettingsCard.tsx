"use client";

import React from "react";
import ExpenseInputsBlock from "../ExpenseInputsBlock";
import { ExpenseMedian } from "../../data/prefectureData";
import { CustomExpenseItem } from "../../types/budget";

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
  onStart: () => void;
  autoUpdateMap: Record<keyof ExpenseMedian, boolean>;
  onToggleAutoUpdateCategory: (key: keyof ExpenseMedian) => void;
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
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h2 className="text-sm lg:text-base font-semibold text-slate-800">
          支出予算　(今月の予算)
        </h2>
        <p className="text-[11px] text-slate-500 leading-snug lg:text-right">
          選択した年代（{ageGroupLabel}）の全国データをもとにした初期値ですが、自由に編集・項目追加できます。
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
      </div>
    </div>
  );
}
