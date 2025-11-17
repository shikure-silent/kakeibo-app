"use client";

import React from "react";
import { MonthlyBudget } from "../../types/calendar";

type Props = {
  budget: MonthlyBudget | null;
  monthlyTotal: number;
  remainingBudget: number | null;
  budgetUsagePercent: number | null;
};

export default function BudgetHighlightCard({
  budget,
  monthlyTotal,
  remainingBudget,
  budgetUsagePercent,
}: Props) {
  if (!budget) return null;

  return (
    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 px-4 py-4 lg:px-5 lg:py-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-emerald-700">今月の予算</p>
          <p className="text-2xl font-bold text-emerald-900">
            ¥{budget.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="text-right text-[11px] space-y-0.5">
          <p className="text-emerald-800">
            これまでの支出:{" "}
            <span className="font-semibold">
              ¥{monthlyTotal.toLocaleString()}
            </span>
          </p>
          {remainingBudget !== null && (
            <p
              className={
                remainingBudget < 0 ? "text-red-700" : "text-emerald-700"
              }
            >
              {remainingBudget < 0
                ? `¥${Math.abs(remainingBudget).toLocaleString()} オーバー`
                : `あと ¥${remainingBudget.toLocaleString()} 使えます`}
            </p>
          )}
        </div>
      </div>

      {/* 進捗バー */}
      {budgetUsagePercent !== null && (
        <div className="space-y-1">
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                remainingBudget !== null && remainingBudget < 0
                  ? "bg-red-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-800">
            予算消化率: {Math.round(budgetUsagePercent).toString()}%
          </p>
        </div>
      )}
    </div>
  );
}
