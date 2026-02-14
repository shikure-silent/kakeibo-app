"use client";

import React, { useMemo, useState } from "react";
import { MonthlyBudget } from "../../types/calendar";

type WeeklySummary = {
  startDay: number;
  endDay: number;
  total: number;
  average: number;
};

type SummaryItem = {
  label: string;
  amount: number;
};

type Props = {
  monthlyTotal: number;
  budget: MonthlyBudget | null;
  remainingBudget: number | null;
  daysInMonth: number;
  amounts: number[];
  maxAmount: number;
  dailyTarget: number | null;
  weeklySummary: WeeklySummary | null;
  periodLabel?: string;
  expenseCategorySummary?: { label: string; amount: number }[];
  payFromSummary?: { label: string; amount: number }[];
  incomeFromSummary?: { label: string; amount: number }[];
  onSelectDayFromChart?: (day: number) => void;
  isDark?: boolean;
};

const formatYen = (value: number | null | undefined) =>
  `¥${Number(value ?? 0).toLocaleString()}`;

const TOP_ITEMS_COUNT = 5;

function BreakdownList({
  title,
  emptyText,
  items,
  expanded,
  onToggleExpanded,
  isDark,
  formatAmount = formatYen,
}: {
  title: string;
  emptyText: string;
  items: SummaryItem[];
  expanded: boolean;
  onToggleExpanded: () => void;
  isDark: boolean;
  formatAmount?: (value: number) => string;
}) {
  const hiddenCount = Math.max(0, items.length - TOP_ITEMS_COUNT);
  const visibleItems = expanded ? items : items.slice(0, TOP_ITEMS_COUNT);

  return (
    <div className="space-y-1.5">
      <p className={isDark ? "text-slate-300 text-[11px]" : "text-slate-500 text-[11px]"}>
        {title}
      </p>

      {items.length === 0 ? (
        <p className={isDark ? "text-slate-400 text-[11px]" : "text-slate-400 text-[11px]"}>
          {emptyText}
        </p>
      ) : (
        <>
          <div className="space-y-1 pr-1">
            {visibleItems.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className={`flex items-center justify-between text-[11px] ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className="font-semibold">{formatAmount(item.amount)}</span>
              </div>
            ))}
          </div>

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={onToggleExpanded}
              className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
            >
              {expanded ? "閉じる" : `もっと見る（他${hiddenCount}件）`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function MonthlySummaryCard({
  monthlyTotal,
  budget,
  remainingBudget,
  daysInMonth,
  amounts,
  maxAmount,
  dailyTarget,
  weeklySummary,
  periodLabel,
  expenseCategorySummary,
  payFromSummary,
  incomeFromSummary,
  onSelectDayFromChart,
  isDark = false,
}: Props) {
  const data = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        amount: amounts[i] || 0,
      })),
    [amounts, daysInMonth]
  );

  const chartMax = useMemo(
    () => Math.max(1, maxAmount, dailyTarget ?? 0),
    [maxAmount, dailyTarget]
  );

  const handleBarClick = (day: number) => {
    if (!onSelectDayFromChart) return;
    onSelectDayFromChart(day);
  };

  const dailyTargetBadge =
    dailyTarget != null
      ? `💡 約${Math.round(dailyTarget).toLocaleString()}円 / 日`
      : null;

  const cardBase = isDark
    ? "bg-slate-900 border-slate-700 text-slate-50"
    : "bg-white border-slate-100 text-slate-900";

  const [showAllExpenseCategory, setShowAllExpenseCategory] = useState(false);
  const [showAllPayFrom, setShowAllPayFrom] = useState(false);
  const [showAllIncomeFrom, setShowAllIncomeFrom] = useState(false);
  const hasBreakdownSection =
    expenseCategorySummary !== undefined ||
    payFromSummary !== undefined ||
    incomeFromSummary !== undefined;

  return (
    <section
      className={`rounded-2xl shadow-sm border p-4 space-y-3 ${cardBase}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">今月のサマリー</h2>
          {periodLabel ? (
            <p
              className={`text-[11px] mt-0.5 ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              集計期間：{periodLabel}
            </p>
          ) : (
            <p
              className={`text-[11px] mt-0.5 ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              支出の流れと予算の残りをざっくりチェックできます。
            </p>
          )}
        </div>
        {dailyTargetBadge && (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
            {dailyTargetBadge}
          </span>
        )}
      </div>

      {/* 数値サマリー */}
      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div className="space-y-0.5">
          <p className={isDark ? "text-slate-300" : "text-slate-500"}>
            今月の支出合計
          </p>
          <p className="text-base font-semibold">{formatYen(monthlyTotal)}</p>
          {weeklySummary && (
            <p
              className={`text-[11px] mt-1 ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              直近7日間：{formatYen(weeklySummary.total)}（
              {formatYen(Math.round(weeklySummary.average))}/日）
            </p>
          )}
        </div>

        <div className="space-y-0.5 text-right">
          <p className={isDark ? "text-slate-300" : "text-slate-500"}>
            予算の残り
          </p>
          <p
            className={`text-base font-semibold ${
              remainingBudget != null && remainingBudget < 0
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {remainingBudget != null ? formatYen(remainingBudget) : "—"}
          </p>
          {budget && (
            <p
              className={`text-[11px] ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              今月の予算: {formatYen(budget.totalBudget)}
            </p>
          )}
        </div>
      </div>

      {/* 棒グラフ（WebViewでも落ちにくいシンプル実装） */}
      <div className="space-y-1">
        <div
          className={`relative h-40 rounded-lg border px-1 pt-2 ${
            isDark ? "border-slate-700 bg-slate-800" : "border-slate-100 bg-slate-50"
          }`}
        >
          {dailyTarget != null && (
            <div
              className="pointer-events-none absolute left-1 right-1 border-t border-dashed border-amber-500/70"
              style={{
                bottom: `${Math.max(
                  0,
                  Math.min(100, (dailyTarget / chartMax) * 100)
                )}%`,
              }}
            />
          )}
          <div className="flex h-full items-end gap-[2px]">
            {data.map((item) => {
              const heightPercent = Math.max(
                2,
                Math.min(100, (item.amount / chartMax) * 100)
              );
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => handleBarClick(item.day)}
                  className={`flex-1 rounded-t-[3px] ${
                    isDark ? "bg-emerald-400/80" : "bg-emerald-500"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${item.day}日: ${formatYen(item.amount)}`}
                  aria-label={`${item.day}日の支出 ${formatYen(item.amount)}`}
                />
              );
            })}
          </div>
        </div>
        <div className={`flex items-center justify-between text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <span>1日</span>
          <span>{Math.ceil(daysInMonth / 2)}日</span>
          <span>{daysInMonth}日</span>
        </div>
      </div>

      {hasBreakdownSection && (
        <div
          className={`pt-3 border-t space-y-3 ${
            isDark ? "border-slate-700" : "border-slate-100"
          }`}
        >
          <h3 className="text-xs font-semibold">内訳</h3>

          {expenseCategorySummary && (
            <BreakdownList
              title="支出カテゴリ別の合計"
              emptyText="支出カテゴリの記録がありません。"
              items={expenseCategorySummary}
              expanded={showAllExpenseCategory}
              onToggleExpanded={() =>
                setShowAllExpenseCategory((prev) => !prev)
              }
              isDark={isDark}
            />
          )}

          {payFromSummary && (
            <BreakdownList
              title="支出元別の合計"
              emptyText="支出元の記録がありません。"
              items={payFromSummary}
              expanded={showAllPayFrom}
              onToggleExpanded={() => setShowAllPayFrom((prev) => !prev)}
              isDark={isDark}
            />
          )}

          {incomeFromSummary && (
            <BreakdownList
              title="入金元別の合計"
              emptyText="入金元の記録がありません。"
              items={incomeFromSummary}
              expanded={showAllIncomeFrom}
              onToggleExpanded={() => setShowAllIncomeFrom((prev) => !prev)}
              isDark={isDark}
              formatAmount={(value) => `+${Number(value ?? 0).toLocaleString()}円`}
            />
          )}
        </div>
      )}
    </section>
  );
}
