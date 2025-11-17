"use client";

import React from "react";

type Props = {
  totalIncome: number;
  totalExpense: number;
  saving: number;
  savingRate: number | null;
  ageGroupLabel: string;
};

export default function SavingHighlightCard({
  totalIncome,
  totalExpense,
  saving,
  savingRate,
  ageGroupLabel,
}: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 px-4 py-4 lg:px-6 lg:py-5 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-emerald-700">
            今月の貯金見込み
          </p>
          <p
            className={`text-2xl lg:text-3xl font-bold ${
              saving >= 0 ? "text-emerald-900" : "text-red-700"
            }`}
          >
            {totalIncome <= 0 && totalExpense <= 0
              ? "収入と支出を入力してください"
              : saving >= 0
              ? `¥${saving.toLocaleString()}`
              : `¥${Math.abs(saving).toLocaleString()} の赤字`}
          </p>
          {savingRate !== null && totalIncome > 0 && (
            <p className="text-[11px] text-slate-500 mt-1">
              貯蓄率:{" "}
              <span
                className={saving >= 0 ? "text-emerald-700" : "text-red-600"}
              >
                {savingRate.toFixed(1)}%
              </span>
            </p>
          )}
        </div>

        <div className="text-[11px] lg:text-xs text-slate-600 space-y-1">
          <p>
            収入合計:{" "}
            <span className="font-semibold text-slate-900">
              ¥{totalIncome.toLocaleString()}
            </span>
          </p>
          <p>
            支出予算合計:{" "}
            <span className="font-semibold text-slate-900">
              ¥{totalExpense.toLocaleString()}
            </span>
          </p>
          <p className="text-slate-500">
            年代: {ageGroupLabel} の全国データをもとに初期値を設定しています。
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        ※
        貯金見込みは、あなたが設定した支出予算と世帯の収入合計をもとに計算しています。
      </p>
    </section>
  );
}
