"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { MonthlyBudget } from "../../types/calendar";

type WeeklySummary = {
  startDay: number;
  endDay: number;
  total: number;
  average: number;
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
  onSelectDayFromChart?: (day: number) => void;
};

const formatYen = (value: number | null | undefined) =>
  `¥${Number(value ?? 0).toLocaleString()}`;

export default function MonthlySummaryCard({
  monthlyTotal,
  budget,
  remainingBudget,
  daysInMonth,
  amounts,
  dailyTarget,
  weeklySummary,
  periodLabel,
  onSelectDayFromChart,
}: Props) {
  const data = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        amount: amounts[i] || 0,
      })),
    [amounts, daysInMonth]
  );

  const handleBarClick = (entry: any) => {
    if (!onSelectDayFromChart) return;
    const day = entry?.payload?.day;
    if (typeof day === "number") {
      onSelectDayFromChart(day);
    }
  };

  const dailyTargetBadge =
    dailyTarget != null
      ? `💡 約${Math.round(dailyTarget).toLocaleString()}円 / 日`
      : null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            今月のサマリー
          </h2>
          {periodLabel ? (
            <p className="text-[11px] text-slate-500 mt-0.5">
              集計期間：{periodLabel}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-0.5">
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
          <p className="text-slate-500">今月の支出合計</p>
          <p className="text-base font-semibold text-slate-900">
            {formatYen(monthlyTotal)}
          </p>
          {weeklySummary && (
            <p className="text-[11px] text-slate-500 mt-1">
              直近7日間：{formatYen(weeklySummary.total)}（
              {formatYen(Math.round(weeklySummary.average))}/日）
            </p>
          )}
        </div>

        <div className="space-y-0.5 text-right">
          <p className="text-slate-500">残り予算</p>
          <p
            className={`text-base font-semibold ${
              remainingBudget != null && remainingBudget < 0
                ? "text-red-500"
                : "text-emerald-600"
            }`}
          >
            {remainingBudget != null ? formatYen(remainingBudget) : "未設定"}
          </p>
          {budget && (
            <p className="text-[11px] text-slate-500 mt-1">
              予算：{formatYen(budget.totalBudget)}
            </p>
          )}
        </div>
      </div>

      {/* 棒グラフ */}
      <div className="mt-2">
        {daysInMonth === 0 ? (
          <p className="text-[12px] text-slate-400">
            今月のカレンダー情報が見つかりません。
          </p>
        ) : monthlyTotal === 0 ? (
          <p className="text-[12px] text-slate-400">
            まだ今月の支出は登録されていません。カレンダーか入力タブから支出を追加してみましょう。
          </p>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    const v = Number(value || 0);
                    // [表示したい値, 表示したいラベル] を返す
                    return [`¥${v.toLocaleString()}`, "支出合計"];
                  }}
                  labelFormatter={(label: any) => `${label}日`}
                />
                {dailyTarget && (
                  <ReferenceLine
                    y={dailyTarget}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                  />
                )}
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                  fill="#22c55e"
                  cursor={onSelectDayFromChart ? "pointer" : "default"}
                  onClick={handleBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
