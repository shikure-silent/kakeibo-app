"use client";

import React from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import BudgetHighlightCard from "./BudgetHighlightCard";
import MonthlySummaryCard from "./MonthlySummaryCard";
import { DetailRecord, MonthlyBudget } from "../../types/calendar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { DetailOverviewModal } from "./DetailOverviewModal";
import { DetailEditModal } from "./DetailEditModal";

type Props = {
  themeClass: string;
  calendarCells: (number | null)[];
  amounts: number[];
  incomeAmounts: number[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
  today: Date;
  currentYear: number;
  currentMonth: number;
  budget: MonthlyBudget | null;
  monthlyTotal: number;
  maxAmount: number;
  remainingBudget: number | null;
  budgetUsagePercent: number | null;
  daysInMonth: number;
  dailyTarget: number | null;
  weeklySummary: {
    startDay: number;
    endDay: number;
    total: number;
    average: number;
  } | null;
  dailyDetails: DetailRecord[][];
  periodLabel?: string;
  hasPeriod: boolean;
  periodTotal: number;
  periodRemainingBudget: number | null;
  periodBudgetUsagePercent: number | null;
  periodDailyTarget: number | null;
  periodWeeklySummary: {
    startDay: number;
    endDay: number;
    total: number;
    average: number;
  } | null;
  savingEstimate: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDayFromChart: (day: number) => void;
  isOverviewModalOpen: boolean;
  isDetailModalOpen: boolean;
  isChartModalOpen: boolean;
  chartModalDay: number | null;
  chartDetailsForModal: DetailRecord[];
  chartData: { day: number; amount: number }[];
  onCloseOverview: () => void;
  onOpenDetailFromOverview: () => void;
  onCloseDetail: () => void;
  onChangeRecord: (index: number, record: DetailRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void;
  onCloseChart: () => void;
  onChartBarClick: (data: any, index: number) => void;
};

export default function CalendarView(props: Props) {
  const {
    themeClass,
    // 表示系
    periodLabel,
    hasPeriod,
    selectedDay,
    selectedDateLabel,
    isOverviewModalOpen,
    isDetailModalOpen,
    isChartModalOpen,
    chartModalDay,
    chartDetailsForModal,
    chartData,
    // データ
    calendarCells,
    amounts,
    incomeAmounts,
    onSelectDay,
    today,
    currentYear,
    currentMonth,
    budget,
    monthlyTotal,
    maxAmount,
    remainingBudget,
    budgetUsagePercent,
    daysInMonth,
    dailyTarget,
    weeklySummary,
    dailyDetails,
    periodTotal,
    periodRemainingBudget,
    periodBudgetUsagePercent,
    periodDailyTarget,
    periodWeeklySummary,
    savingEstimate,
    selectedDetails,
    // ハンドラ
    onSelectDayFromChart,
    onCloseOverview,
    onOpenDetailFromOverview,
    onCloseDetail,
    onChangeRecord,
    onDeleteRecord,
    onAddRecord,
    onPrevMonth,
    onNextMonth,
    onCloseChart,
    onChartBarClick,
  } = props;

  const isDark = themeClass.includes("theme-dark");

  const monthLabel = `${currentYear}年${currentMonth}月`;

  const axisTickColor = isDark ? "#cbd5f5" : "#64748b";
  const axisLineColor = isDark ? "#475569" : "#cbd5f5";

  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-4">
        {/* ヘッダー */}
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          isDark={isDark}
        />

        {/* 集計期間ラベル（給料日サイクルがある場合） */}
        {periodLabel && (
          <p
            className={`mt-1 text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            集計期間：{periodLabel}
          </p>
        )}

        {/* レイアウト：左カレンダー／右サマリー */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左：カレンダー */}
          <div className="lg:col-span-2 space-y-3">
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
              isDark={isDark}
            />
          </div>

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
              isDark={isDark}
            />

            <MonthlySummaryCard
              monthlyTotal={hasPeriod ? periodTotal : monthlyTotal}
              budget={budget}
              maxAmount={maxAmount}
              remainingBudget={
                hasPeriod && periodRemainingBudget !== null
                  ? periodRemainingBudget
                  : remainingBudget
              }
              daysInMonth={daysInMonth}
              amounts={amounts}
              dailyTarget={hasPeriod ? periodDailyTarget : dailyTarget}
              weeklySummary={hasPeriod ? periodWeeklySummary : weeklySummary}
              periodLabel={hasPeriod ? periodLabel : undefined}
              onSelectDayFromChart={onSelectDayFromChart}
              isDark={isDark}
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
          <div
            className={`relative w-full max-w-3xl rounded-2xl shadow-lg border px-3 py-3 sm:px-4 sm:py-4 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-50"
                : "bg-white border-slate-100 text-slate-900"
            }`}
          >
            <button
              type="button"
              onClick={onCloseChart}
              className={`absolute top-2 right-3 text-xl leading-none ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="mb-3">
              <h2 className="text-sm font-semibold">
                今月の支出（棒グラフの拡大表示）
              </h2>
              {chartModalDay && (
                <p
                  className={`text-[11px] mt-1 ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {currentYear}年{currentMonth}月{chartModalDay}日の支出：
                  <span className="font-semibold">
                    ¥{(amounts[chartModalDay - 1] || 0).toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            {/* 選択中の日の内訳一覧 */}
            {chartModalDay && (
              <div
                className={`mt-4 pt-3 space-y-2 border-t ${
                  isDark ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <p
                  className={`text-[11px] ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {currentYear}年{currentMonth}月{chartModalDay}日の内訳
                </p>

                {chartDetailsForModal.length === 0 ? (
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    この日の内訳はまだ登録されていません。
                  </p>
                ) : (
                  <div className="max-h-40 overflow-auto space-y-1">
                    {chartDetailsForModal.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] ${
                          isDark ? "bg-slate-800" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate font-medium ${
                              isDark ? "text-slate-50" : "text-slate-800"
                            }`}
                          >
                            {rec.category || "未分類"}
                          </p>
                          <p
                            className={`text-[10px] ${
                              isDark ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {rec.payFrom || "支出元なし"}
                          </p>
                          {rec.shopName && (
                            <p
                              className={`text-[10px] ${
                                isDark ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              店舗: {rec.shopName}
                            </p>
                          )}
                        </div>
                        <div
                          className={`ml-2 text-right font-semibold ${
                            isDark ? "text-slate-50" : "text-slate-900"
                          }`}
                        >
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
                    tick={{ fontSize: 10, fill: axisTickColor }}
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => {
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
                    onClick={({ payload }) => onSelectDayFromChart(payload.day)}
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
