"use client";

import React from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import BudgetHighlightCard from "./BudgetHighlightCard";
import MonthlySummaryCard from "./MonthlySummaryCard";
import { DetailOverviewModal } from "./DetailOverviewModal";
import { DetailEditModal } from "./DetailEditModal";
import { DetailRecord, MonthlyBudget } from "../../types/calendar";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type WeeklySummary = {
  startDay: number;
  endDay: number;
  total: number;
  average: number;
};

type ChartDatum = {
  day: number;
  amount: number;
};

type Props = {
  themeClass: string;
  monthLabel: string;
  payday: number | undefined;
  calendarCells: (number | null)[];
  amounts: number[];
  incomeAmounts: number[];
  selectedDay: number | null;
  today: Date;
  currentYear: number;
  currentMonth: number;
  dailyDetails: DetailRecord[][];
  budget: MonthlyBudget | null;
  hasPeriod: boolean;
  periodLabel: string;
  periodTotal: number;
  monthlyTotal: number;
  remainingBudget: number | null;
  periodRemainingBudget: number | null;
  budgetUsagePercent: number | null;
  periodBudgetUsagePercent: number | null;
  savingEstimate: number | null;
  daysInMonth: number;
  maxAmount: number;
  dailyTarget: number | null;
  periodDailyTarget: number | null;
  weeklySummary: WeeklySummary | null;
  periodWeeklySummary: WeeklySummary | null;
  onSelectDayFromChart: (day: number) => void;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  isOverviewModalOpen: boolean;
  isDetailModalOpen: boolean;
  isChartModalOpen: boolean;
  chartModalDay: number | null;
  chartDetailsForModal: DetailRecord[];
  chartData: ChartDatum[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number | null) => void;
  onCloseOverview: () => void;
  onOpenDetailFromOverview: () => void;
  onCloseDetail: () => void;
  onChangeRecord: (index: number, record: DetailRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void;
  onCloseChart: () => void;
  onChartBarClick: (data: any, index: number) => void;
};

export function CalendarView({
  themeClass,
  monthLabel,
  payday,
  calendarCells,
  amounts,
  incomeAmounts,
  selectedDay,
  today,
  currentYear,
  currentMonth,
  dailyDetails,
  budget,
  hasPeriod,
  periodLabel,
  periodTotal,
  monthlyTotal,
  remainingBudget,
  periodRemainingBudget,
  budgetUsagePercent,
  periodBudgetUsagePercent,
  savingEstimate,
  daysInMonth,
  maxAmount,
  dailyTarget,
  periodDailyTarget,
  weeklySummary,
  periodWeeklySummary,
  onSelectDayFromChart,
  selectedDateLabel,
  selectedDetails,
  isOverviewModalOpen,
  isDetailModalOpen,
  isChartModalOpen,
  chartModalDay,
  chartDetailsForModal,
  chartData,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  onCloseOverview,
  onOpenDetailFromOverview,
  onCloseDetail,
  onChangeRecord,
  onDeleteRecord,
  onAddRecord,
  onCloseChart,
  onChartBarClick,
}: Props) {
  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー（タイトル＋月送り） */}
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
        />
        {hasPeriod && (
          <p className="mt-1 text-[11px] text-slate-500">
            集計期間：<span className="font-semibold">{periodLabel}</span>
            <span className="ml-2">（{payday}日締め）</span>
          </p>
        )}

        {/* 上段：左 カレンダー ＋ 右 サマリー */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左：カレンダー部分 */}
          <section className="lg:col-span-2">
            <CalendarGrid
              calendarCells={calendarCells}
              amounts={amounts}
              incomeAmounts={incomeAmounts}
              selectedDay={selectedDay}
              onSelectDay={onSelectDay}
              today={today}
              currentYear={currentYear}
              currentMonth={currentMonth}
              dailyDetails={dailyDetails}
            />
          </section>

          {/* 右：予算ハイライト＋サマリー */}
          <section className="space-y-4">
            <BudgetHighlightCard
              budget={budget}
              monthlyTotal={hasPeriod ? periodTotal : monthlyTotal}
              remainingBudget={
                hasPeriod && periodRemainingBudget !== null
                  ? periodRemainingBudget
                  : remainingBudget
              }
              budgetUsagePercent={
                hasPeriod && periodBudgetUsagePercent !== null
                  ? periodBudgetUsagePercent
                  : budgetUsagePercent
              }
              savingEstimate={savingEstimate}
            />

            <MonthlySummaryCard
              monthlyTotal={hasPeriod ? periodTotal : monthlyTotal}
              budget={budget}
              remainingBudget={
                hasPeriod && periodRemainingBudget !== null
                  ? periodRemainingBudget
                  : remainingBudget
              }
              daysInMonth={daysInMonth}
              amounts={amounts}
              maxAmount={maxAmount}
              dailyTarget={hasPeriod ? periodDailyTarget : dailyTarget}
              weeklySummary={hasPeriod ? periodWeeklySummary : weeklySummary}
              periodLabel={hasPeriod ? periodLabel : undefined}
              onSelectDayFromChart={onSelectDayFromChart}
            />
          </section>
        </div>
      </div>

      <DetailOverviewModal
        open={isOverviewModalOpen}
        selectedDay={selectedDay}
        selectedDateLabel={selectedDateLabel}
        selectedDetails={selectedDetails}
        onClose={onCloseOverview}
        onEdit={onOpenDetailFromOverview}
      />

      <DetailEditModal
        open={isDetailModalOpen}
        selectedDay={selectedDay}
        selectedDateLabel={selectedDateLabel}
        selectedDetails={selectedDetails}
        onClose={onCloseDetail}
        onChangeRecord={onChangeRecord}
        onDeleteRecord={onDeleteRecord}
        onAddRecord={onAddRecord}
      />

      {/* 棒グラフ拡大モーダル */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3 py-6 pb-24 sm:px-4 sm:py-8 sm:pb-12 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
            <button
              type="button"
              onClick={onCloseChart}
              className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                今月の支出（棒グラフの拡大表示）
              </h2>
              {chartModalDay && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {currentYear}年{currentMonth}月{chartModalDay}日の支出：
                  <span className="font-semibold">
                    ¥{(amounts[chartModalDay - 1] || 0).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
            {/* 選択中の日の内訳一覧 */}
            {chartModalDay && (
              <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                <p className="text-[11px] text-slate-500">
                  {currentYear}年{currentMonth}月{chartModalDay}日の内訳
                </p>

                {chartDetailsForModal.length === 0 ? (
                  <p className="text-[11px] text-slate-400">
                    この日の内訳はまだ登録されていません。
                  </p>
                ) : (
                  <div className="max-h-40 overflow-auto space-y-1">
                    {chartDetailsForModal.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 text-[11px]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {rec.category || "未分類"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {rec.payFrom || "支出元なし"}
                          </p>
                          {rec.shopName && (
                            <p className="text-[10px] text-slate-500">
                              店舗: {rec.shopName}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 text-right font-semibold text-slate-900">
                          ¥{Number(rec.amount || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5f5" }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      const v = Number(value || 0);
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
                    cursor="pointer"
                    onClick={onChartBarClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
