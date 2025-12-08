"use client";

import React from "react";
import { MonthlyBudget } from "../../types/calendar";

type Props = {
  budget: MonthlyBudget | null;
  monthlyTotal: number;
  remainingBudget: number | null;
  budgetUsagePercent: number | null;
  /** Home画面で計算した「今月の貯金見込み」 */
  savingEstimate?: number | null;
  /** ダークモードかどうか（CalendarView から渡す） */
  isDark?: boolean;
};

const formatYen = (v: number) => `¥${Math.round(v).toLocaleString()}`;

export default function BudgetHighlightCard({
  budget,
  monthlyTotal,
  remainingBudget,
  budgetUsagePercent,
  savingEstimate,
  isDark = false,
}: Props) {
  const cardBase = isDark
    ? "bg-slate-900 border-slate-700 text-slate-50"
    : "bg-white border-slate-100 text-slate-900";

  // 予算がまだのとき
  if (!budget || typeof budget.totalBudget !== "number") {
    return (
      <section
        className={`rounded-2xl shadow-sm px-4 py-4 lg:px-6 lg:py-5 ${cardBase}`}
      >
        <p className="text-sm font-semibold">
          今月の予算がまだ設定されていません
        </p>
        <p
          className={`mt-1 text-xs ${
            isDark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          ホーム画面で「支出予算（今月の予算）」を設定して
          「この予算でスタート」を押すと、ここに今月の貯金見込みや予算の残りが表示されます。
        </p>
      </section>
    );
  }

  const totalBudget = budget.totalBudget;

  const remaining =
    typeof remainingBudget === "number"
      ? remainingBudget
      : totalBudget - monthlyTotal;

  const usagePercent =
    typeof budgetUsagePercent === "number"
      ? budgetUsagePercent
      : totalBudget > 0
      ? Math.min(100, Math.max(0, (monthlyTotal / totalBudget) * 100))
      : 0;

  const usagePercentText =
    totalBudget > 0 ? `${usagePercent.toFixed(1)}%` : "—";

  const displaySaving =
    typeof savingEstimate === "number" ? savingEstimate : null;

  return (
    <section
      className={`rounded-2xl shadow-sm px-4 py-4 lg:px-6 lg:py-5 space-y-3 ${cardBase}`}
    >
      {/* 上：今月の貯金見込み（前の雰囲気に寄せたシンプル表示） */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p
            className={`text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            今月の貯金見込み
          </p>
          <p className="mt-1 text-xl lg:text-2xl font-semibold">
            {displaySaving === null
              ? "—"
              : displaySaving >= 0
              ? `${formatYen(displaySaving)} 貯金できそうです`
              : `${formatYen(Math.abs(displaySaving))} の赤字になりそうです`}
          </p>
        </div>
        {displaySaving !== null && (
          <span
            className={`text-[10px] ${
              isDark ? "text-slate-300" : "text-slate-400"
            }`}
          >
            ホーム画面で設定した収入と予算から計算
          </span>
        )}
      </div>

      {/* 中：あといくら使えるか ＋ 数値サマリー */}
      <div
        className={`mt-2 pt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2 border-t ${
          isDark ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="space-y-1">
          <p
            className={`text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            今月あと使える金額
          </p>
          <p
            className={`text-xl lg:text-2xl font-bold tracking-tight ${
              remaining >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {formatYen(remaining)}
          </p>
          <p
            className={`text-[11px] ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {remaining >= 0
              ? "予算内におさまっています"
              : "予算をオーバーしています"}
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-1 text-[11px] text-slate-500">
          <p>
            今月の予算:{" "}
            <span className="font-semibold text-slate-700">
              {formatYen(totalBudget)}
            </span>
          </p>
          <p>
            ここまでの支出:{" "}
            <span className="font-semibold text-slate-700">
              {formatYen(monthlyTotal)}
            </span>
          </p>
          <p>
            消化率:{" "}
            <span className="font-semibold text-slate-700">
              {usagePercentText}
            </span>
          </p>
        </div>
      </div>

      {/* 下：進捗バー（色は前のまま、背景だけダーク対応） */}
      <div className="pt-1">
        <div className="flex justify-between items-center mb-1">
          <span
            className={`text-[10px] ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            予算の消化状況
          </span>
          <span
            className={`text-[10px] ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {formatYen(monthlyTotal)} / {formatYen(totalBudget)}
          </span>
        </div>
        <div
          className={`w-full h-2 rounded-full overflow-hidden ${
            isDark ? "bg-slate-800" : "bg-slate-100"
          }`}
        >
          <div
            className={`
              h-2 rounded-full
              ${remaining >= 0 ? "bg-emerald-400" : "bg-red-400"}
            `}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
