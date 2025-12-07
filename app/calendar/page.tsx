"use client";

import React, { useEffect, useMemo, useState } from "react";
import { buildBudgetKey, WEEKDAY_LABELS } from "../../lib/const";
import {
  calcDayTotals,
  loadAmountsFromStorage,
  loadBudgetWithFallback,
  loadDetailsFromStorage,
  saveAmountsToStorage,
  saveDetailsToStorage,
} from "../../lib/calendarStorage";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import BudgetHighlightCard from "../../components/calendar/BudgetHighlightCard";
import MonthlySummaryCard from "../../components/calendar/MonthlySummaryCard";
import SelectedDayDetailsCard from "../../components/calendar/SelectedDayDetailsCard";
import { DetailRecord, MonthlyBudget } from "../../types/calendar";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  getThemeClasses,
} from "../../lib/settingsStorage";
import { getPayPeriodForMonth, listDatesInPeriod } from "../../lib/payPeriod";

type MonthlyBudgetData = {
  year: number;
  month: number;
  totalBudget: number;
  items: { label: string; amount: number }[];
  totalIncome?: number;
  saving?: number;
};

type WeeklySummary = {
  startDay: number;
  endDay: number;
  total: number;
  average: number;
};
type PeriodDailyInfo = {
  date: Date;
  spending: number;
  income: number;
};

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  // 日別の支出合計（予算消化に使う）
  const [amounts, setAmounts] = useState<number[]>([]);
  // 日別の収入合計（カレンダーで +◯◯円 表示用）
  const [incomeAmounts, setIncomeAmounts] = useState<number[]>([]);
  // 日別の明細
  const [dailyDetails, setDailyDetails] = useState<DetailRecord[][]>([]);

  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate()
  );
  const [selectedDetails, setSelectedDetails] = useState<DetailRecord[]>([]);

  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [savingEstimate, setSavingEstimate] = useState<number | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartModalDay, setChartModalDay] = useState<number | null>(null);
  const [periodInfos, setPeriodInfos] = useState<PeriodDailyInfo[]>([]);
  const [periodLabel, setPeriodLabel] = useState<string>("");

  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth, 0).getDate(),
    [currentYear, currentMonth]
  );

  const firstDayOfWeek = useMemo(
    () => new Date(currentYear, currentMonth - 1, 1).getDay(),
    [currentYear, currentMonth]
  );

  const monthLabel = useMemo(
    () => `${currentYear}年${currentMonth}月`,
    [currentYear, currentMonth]
  );

  const calendarCells: (number | null)[] = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const monthlyTotal = useMemo(
    () => amounts.reduce((sum, v) => sum + (v || 0), 0),
    [amounts]
  );

  const maxAmount = useMemo(() => Math.max(0, ...amounts), [amounts]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDay) return "";
    const d = new Date(currentYear, currentMonth - 1, selectedDay);
    const w = WEEKDAY_LABELS[d.getDay()];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${w}）`;
  }, [currentYear, currentMonth, selectedDay]);

  const remainingBudget = useMemo(() => {
    if (!budget) return null;
    return budget.totalBudget - monthlyTotal;
  }, [budget, monthlyTotal]);

  const dailyTarget = useMemo(() => {
    if (!budget || daysInMonth === 0) return null;
    return budget.totalBudget / daysInMonth;
  }, [budget, daysInMonth]);

  const weeklySummary: WeeklySummary | null = useMemo(() => {
    if (daysInMonth === 0) return null;

    let endDay = daysInMonth;
    if (
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth
    ) {
      endDay = today.getDate();
    }
    const startDay = Math.max(1, endDay - 6);
    const slice = amounts.slice(startDay - 1, endDay);
    const total = slice.reduce((sum, v) => sum + (v || 0), 0);
    const daysCount = slice.length || 1;

    return {
      startDay,
      endDay,
      total,
      average: total / daysCount,
    };
  }, [amounts, currentYear, currentMonth, daysInMonth, today]);

  const budgetUsagePercent = useMemo(() => {
    if (!budget || budget.totalBudget <= 0) return null;
    return Math.min(
      100,
      Math.max(0, (monthlyTotal / budget.totalBudget) * 100)
    );
  }, [budget, monthlyTotal]);
  const chartDetailsForModal = useMemo(() => {
    if (!chartModalDay) return [];
    if (!dailyDetails || dailyDetails.length < chartModalDay) return [];
    return dailyDetails[chartModalDay - 1] || [];
  }, [chartModalDay, dailyDetails]);

  // グラフ拡大用のデータ
  const chartData = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        amount: amounts[i] || 0,
      })),
    [amounts, daysInMonth]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 月変更時：日別明細＆支出合計＆収入合計＆予算情報を読み込み
  useEffect(() => {
    if (!isClient) return;

    // 支出合計
    const storedAmounts = loadAmountsFromStorage(currentYear, currentMonth);
    const normalizedAmounts: number[] = Array.from(
      { length: daysInMonth },
      (_, i) => Number(storedAmounts[i] ?? 0)
    );
    setAmounts(normalizedAmounts);

    // 日別明細と収入合計
    const allDetails: DetailRecord[][] = [];
    const incomes: number[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const details = loadDetailsFromStorage(currentYear, currentMonth, d);
      allDetails.push(details);
      const { income } = calcDayTotals(details);
      incomes.push(income);
    }

    setDailyDetails(allDetails);
    setIncomeAmounts(incomes);

    // 予算情報（なければ近い月の予算をフォールバック）
    const loadedBudget = loadBudgetWithFallback(currentYear, currentMonth);
    setBudget(loadedBudget);

    // Home画面で保存した totalBudget / totalIncome / saving を反映
    if (typeof window !== "undefined") {
      const key = buildBudgetKey(currentYear, currentMonth);
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          const data = JSON.parse(raw) as MonthlyBudgetData;
          setTotalBudget(data.totalBudget ?? 0);
          if (typeof data.saving === "number") {
            setSavingEstimate(data.saving);
          } else if (
            typeof data.totalIncome === "number" &&
            typeof data.totalBudget === "number"
          ) {
            setSavingEstimate(data.totalIncome - data.totalBudget);
          } else {
            setSavingEstimate(null);
          }
        } catch {
          setTotalBudget(0);
          setSavingEstimate(null);
        }
      } else {
        setTotalBudget(0);
        setSavingEstimate(null);
      }
    }
  }, [isClient, currentYear, currentMonth, daysInMonth]);

  // 選択中の日付の明細を読み込み
  useEffect(() => {
    if (!isClient) return;
    if (!selectedDay || selectedDay < 1 || selectedDay > daysInMonth) {
      setSelectedDetails([]);
      return;
    }
    const details = loadDetailsFromStorage(
      currentYear,
      currentMonth,
      selectedDay
    );
    setSelectedDetails(details);
  }, [isClient, currentYear, currentMonth, selectedDay, daysInMonth]);

  const handlePrevMonth = () => {
    setIsDetailModalOpen(false);
    setIsChartModalOpen(false);
    setSelectedDay(null);
    setSelectedDetails([]);
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setIsDetailModalOpen(false);
    setIsChartModalOpen(false);
    setSelectedDay(null);
    setSelectedDetails([]);
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    if (day < 1 || day > daysInMonth) return;
    setSelectedDay(day);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleSelectDayFromChart = (day: number) => {
    setChartModalDay(day);
    setIsChartModalOpen(true);
  };

  const handleCloseChartModal = () => {
    setIsChartModalOpen(false);
  };

  // 拡大グラフ上で棒をクリックしたときに対象日を切り替える
  const handleChartBarClickInModal = (data: any, index: number) => {
    const day =
      data?.payload?.day ??
      data?.day ??
      (typeof index === "number" ? index + 1 : null);
    if (!day) return;
    if (day < 1 || day > daysInMonth) return;
    setChartModalDay(day);
  };

  // 明細更新時に支出／収入合計を再計算して保存
  const recalcDayTotalsAndSave = (day: number, details: DetailRecord[]) => {
    const { spending, income } = calcDayTotals(details);

    setAmounts((prev) => {
      const next = [...prev];
      if (next.length < daysInMonth) {
        next.length = daysInMonth;
        for (let i = 0; i < daysInMonth; i++) {
          if (typeof next[i] !== "number") next[i] = 0;
        }
      }
      next[day - 1] = spending;
      saveAmountsToStorage(currentYear, currentMonth, next);
      return next;
    });

    setIncomeAmounts((prev) => {
      const next = [...prev];
      if (next.length < daysInMonth) {
        next.length = daysInMonth;
        for (let i = 0; i < daysInMonth; i++) {
          if (typeof next[i] !== "number") next[i] = 0;
        }
      }
      next[day - 1] = income;
      return next;
    });

    setDailyDetails((prev) => {
      const next = [...prev];
      if (next.length < daysInMonth) {
        next.length = daysInMonth;
        for (let i = 0; i < daysInMonth; i++) {
          if (!Array.isArray(next[i])) next[i] = [];
        }
      }
      next[day - 1] = details;
      return next;
    });

    saveDetailsToStorage(currentYear, currentMonth, day, details);
  };

  const handleUpdateDetail = (index: number, updated: DetailRecord) => {
    if (selectedDay == null) return;
    setSelectedDetails((prev) => {
      const next = [...prev];
      next[index] = updated;
      recalcDayTotalsAndSave(selectedDay, next);
      return next;
    });
  };

  const handleDeleteDetail = (index: number) => {
    if (selectedDay == null) return;
    setSelectedDetails((prev) => {
      const next = prev.filter((_, i) => i !== index);
      recalcDayTotalsAndSave(selectedDay, next);
      return next;
    });
  };

  // 互換性のため残す（実際の追加は SelectedDayDetailsCard 側のモーダルでやっている想定）
  const handleAddDetail = () => {
    if (selectedDay == null) return;
    setSelectedDetails((prev) => {
      const now = new Date();
      const newRecord: DetailRecord = {
        mode: "expense",
        amount: 0,
        category: "",
        payFrom: "現金",
        memo: "",
        date: "",
        createdAt: now.toISOString(),
      } as DetailRecord;
      const next = [...prev, newRecord];
      recalcDayTotalsAndSave(selectedDay, next);
      return next;
    });
  };

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);
  }, []);

  // ▼ 給料日サイクル（payday ベース）の日別集計
  useEffect(() => {
    if (!isClient) return;

    const payday = settings.payday ?? 1;
    const period = getPayPeriodForMonth(currentYear, currentMonth, payday);
    if (!period) {
      setPeriodInfos([]);
      setPeriodLabel("");
      return;
    }
    const dates = listDatesInPeriod(period);

    const infos: PeriodDailyInfo[] = [];

    for (const d of dates) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();

      // 各日の明細を localStorage から読み込み
      const details = loadDetailsFromStorage(y, m, day);
      const { spending, income } = calcDayTotals(details);

      infos.push({
        date: d,
        spending,
        income,
      });
    }

    setPeriodInfos(infos);

    const startLabel = `${
      period.start.getMonth() + 1
    }/${period.start.getDate()}`;
    const endLabel = `${period.end.getMonth() + 1}/${period.end.getDate()}`;
    setPeriodLabel(`${startLabel} 〜 ${endLabel}`);
  }, [
    isClient,
    currentYear,
    currentMonth,
    settings.payday,
    dailyDetails, // 明細が変わったときも再計算したいので依存に入れておく
  ]);

  // サイクル全体の支出合計
  const hasPeriod = periodInfos.length > 0;

  const periodTotal = useMemo(
    () => periodInfos.reduce((sum, info) => sum + (info.spending || 0), 0),
    [periodInfos]
  );

  const periodRemainingBudget = useMemo(() => {
    if (!budget) return null;
    return budget.totalBudget - periodTotal;
  }, [budget, periodTotal]);

  const periodBudgetUsagePercent = useMemo(() => {
    if (!budget || budget.totalBudget <= 0) return null;
    return Math.min(100, Math.max(0, (periodTotal / budget.totalBudget) * 100));
  }, [budget, periodTotal]);

  // ▼ 給料日サイクルの日数・1日あたり目安・直近7日のサマリー
  const periodDaysCount = periodInfos.length;

  const periodDailyTarget = useMemo(() => {
    if (!budget || periodDaysCount === 0) return null;
    return budget.totalBudget / periodDaysCount;
  }, [budget, periodDaysCount]);

  const periodWeeklySummary: WeeklySummary | null = useMemo(() => {
    if (periodInfos.length === 0) return null;

    const last7 = periodInfos.slice(-7);
    const total = last7.reduce((sum, info) => sum + (info.spending || 0), 0);
    const daysCount = last7.length || 1;

    return {
      startDay: 1,
      endDay: daysCount,
      total,
      average: total / daysCount,
    };
  }, [periodInfos]);

  const themeClass = getThemeClasses(settings.theme);

  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー（タイトル＋月送り） */}
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
        {hasPeriod && (
          <p className="mt-1 text-[11px] text-slate-500">
            集計期間：<span className="font-semibold">{periodLabel}</span>
            <span className="ml-2">（{settings.payday}日締め）</span>
          </p>
        )}

        {/* 上段：左 カレンダー ＋ 右 サマリー */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左：カレンダー部分（レイアウトは従来と同じ想定） */}
          <section className="lg:col-span-2">
            <CalendarGrid
              calendarCells={calendarCells}
              amounts={amounts}
              incomeAmounts={incomeAmounts}
              selectedDay={selectedDay}
              onSelectDay={handleDayClick}
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
              // ▼ 給料日サイクルが計算できていればそちらを優先
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
              // 支出合計：給料日サイクルがあればそちらを優先
              monthlyTotal={hasPeriod ? periodTotal : monthlyTotal}
              budget={budget}
              // 残り予算もサイクル優先
              remainingBudget={
                hasPeriod && periodRemainingBudget !== null
                  ? periodRemainingBudget
                  : remainingBudget
              }
              // ミニ棒グラフ自体はまだ「カレンダーの月」ベースでOK
              daysInMonth={daysInMonth}
              amounts={amounts}
              maxAmount={maxAmount}
              // 1日あたりの目安：サイクル日数で割った値を優先
              dailyTarget={hasPeriod ? periodDailyTarget : dailyTarget}
              // 直近7日：サイクル内の直近7日を優先
              weeklySummary={hasPeriod ? periodWeeklySummary : weeklySummary}
              // ★ ここがポイント：サマリーカード用に periodLabel を渡す
              periodLabel={hasPeriod ? periodLabel : undefined}
              onSelectDayFromChart={handleSelectDayFromChart}
            />
          </section>
        </div>
      </div>

      {/* ▼ 選択日の内訳編集モーダル */}
      {isDetailModalOpen && selectedDay && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-3 py-6 pb-24 sm:px-4 sm:py-10 sm:pb-12 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={handleCloseDetailModal}
              className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
              aria-label="閉じる"
            >
              ×
            </button>

            <SelectedDayDetailsCard
              selectedDay={selectedDay}
              selectedDateLabel={selectedDateLabel}
              selectedDetails={selectedDetails}
              onChangeRecord={handleUpdateDetail}
              onDeleteRecord={handleDeleteDetail}
              onAddRecord={handleAddDetail}
              onCloseCalendar={handleCloseDetailModal}
            />
          </div>
        </div>
      )}

      {/* ▼ 棒グラフ拡大モーダル */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3 py-6 pb-24 sm:px-4 sm:py-8 sm:pb-12 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
            <button
              type="button"
              onClick={handleCloseChartModal}
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
                    onClick={handleChartBarClickInModal}
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
