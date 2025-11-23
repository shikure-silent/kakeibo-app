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
};

const formatYen = (v: number) => `¥${Math.round(v).toLocaleString()}`;

export default function BudgetHighlightCard({
  budget,
  monthlyTotal,
  remainingBudget,
  budgetUsagePercent,
  savingEstimate,
}: Props) {
  // 予算がまだ設定されていない場合
  if (!budget || typeof budget.totalBudget !== "number") {
    return (
      <section
        className="
          bg-white rounded-2xl shadow-sm border border-slate-100
          px-4 py-4 lg:px-6 lg:py-5
        "
      >
        <p className="text-sm font-semibold text-slate-800">
          今月の予算がまだ設定されていません
        </p>
        <p className="mt-1 text-xs text-slate-500">
          ホーム画面で「支出予算（今月の予算）」を設定して「この予算でスタート」を押すと、
          ここに今月の貯金見込みや予算の残りが表示されます。
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
  const usagePercentText = totalBudget > 0 ? `${usagePercent.toFixed(1)}%` : "—";

  const safeSaving = typeof savingEstimate === "number" ? savingEstimate : null;

  const savingColor =
    safeSaving === null
      ? "text-slate-500"
      : safeSaving >= 0
      ? "text-emerald-600"
      : "text-red-500";

  const remainingColor = remaining >= 0 ? "text-emerald-700" : "text-red-500";

  return (
    <section
      className="
        bg-white rounded-2xl shadow-sm border border-slate-100
        px-4 py-4 lg:px-6 lg:py-5
        space-y-3
      "
    >
      {/* 上：今月の貯金見込み */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-slate-500">
            今月の貯金見込み
          </p>
          <p className={`mt-1 text-lg lg:text-xl font-semibold ${savingColor}`}>
            {safeSaving === null
              ? "—"
              : safeSaving >= 0
              ? `${formatYen(safeSaving)} 貯金できそうです`
              : `${formatYen(Math.abs(safeSaving))} の赤字になりそうです`}
          </p>
        </div>
        {safeSaving !== null && (
          <span
            className={`
              text-[10px] px-2 py-[2px] rounded-full
              ${
                safeSaving >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-500"
              }
            `}
          >
            ホームで設定した見込み
          </span>
        )}
      </div>

      {/* 中：あと◯◯円を主役にする */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2 border-t border-slate-100 mt-2 pt-3">
        <div className="space-y-1">
          <p className="text-[11px] text-slate-500">今月あと使える金額</p>
          <p
            className={`
              text-xl lg:text-2xl font-bold tracking-tight
              ${remainingColor}
            `}
          >
            {formatYen(remaining)}
          </p>
          <p className="text-[11px] text-slate-400">
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
            <span className="font-semibold text-slate-700">{usagePercentText}</span>
          </p>
        </div>
      </div>

      {/* 下：シンプルな進捗バー */}
      <div className="pt-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-slate-500">予算の消化状況</span>
          <span className="text-[10px] text-slate-400">
            {formatYen(monthlyTotal)} / {formatYen(totalBudget)}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
