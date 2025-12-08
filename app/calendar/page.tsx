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
import { DetailRecord, MonthlyBudget } from "../../types/calendar";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  getThemeClasses,
} from "../../lib/settingsStorage";
import { getPayPeriodForMonth, listDatesInPeriod } from "../../lib/payPeriod";
import CalendarView from "../../components/calendar/CalendarView";

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
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
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
    const detailsForDay = dailyDetails[day - 1] ?? [];
    setSelectedDay(day);
    setSelectedDetails(detailsForDay);

    if (detailsForDay.length > 0) {
      setIsOverviewModalOpen(true);
      setIsDetailModalOpen(false);
    } else {
      setIsDetailModalOpen(true);
      setIsOverviewModalOpen(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleCloseOverviewModal = () => {
    setIsOverviewModalOpen(false);
  };

  const handleOpenDetailFromOverview = () => {
    setIsOverviewModalOpen(false);
    setIsDetailModalOpen(true);
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
    <CalendarView
      themeClass={themeClass}
      calendarCells={calendarCells}
      amounts={amounts}
      incomeAmounts={incomeAmounts}
      selectedDay={selectedDay}
      today={today}
      currentYear={currentYear}
      currentMonth={currentMonth}
      dailyDetails={dailyDetails}
      budget={budget}
      hasPeriod={hasPeriod}
      periodLabel={periodLabel}
      periodTotal={periodTotal}
      monthlyTotal={monthlyTotal}
      remainingBudget={remainingBudget}
      periodRemainingBudget={periodRemainingBudget}
      budgetUsagePercent={budgetUsagePercent}
      periodBudgetUsagePercent={periodBudgetUsagePercent}
      savingEstimate={savingEstimate}
      daysInMonth={daysInMonth}
      maxAmount={maxAmount}
      dailyTarget={dailyTarget}
      periodDailyTarget={periodDailyTarget}
      weeklySummary={weeklySummary}
      periodWeeklySummary={periodWeeklySummary}
      onSelectDayFromChart={handleSelectDayFromChart}
      selectedDateLabel={selectedDateLabel}
      selectedDetails={selectedDetails}
      isOverviewModalOpen={isOverviewModalOpen}
      isDetailModalOpen={isDetailModalOpen}
      isChartModalOpen={isChartModalOpen}
      chartModalDay={chartModalDay}
      chartDetailsForModal={chartDetailsForModal}
      chartData={chartData}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onSelectDay={handleDayClick}
      onCloseOverview={handleCloseOverviewModal}
      onOpenDetailFromOverview={handleOpenDetailFromOverview}
      onCloseDetail={handleCloseDetailModal}
      onChangeRecord={handleUpdateDetail}
      onDeleteRecord={handleDeleteDetail}
      onAddRecord={handleAddDetail}
      onCloseChart={handleCloseChartModal}
      onChartBarClick={handleChartBarClickInModal}
    />
  );
}
