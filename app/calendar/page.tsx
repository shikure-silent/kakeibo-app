"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WEEKDAY_LABELS } from "../../lib/const";
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
} from "../../lib/settingsStorage";
import { useResolvedTheme } from "../../lib/useResolvedTheme";
import { getPayPeriodForMonth, listDatesInPeriod } from "../../lib/payPeriod";
import CalendarView from "../../components/calendar/CalendarView";
import { buildSavingSupportState } from "../../lib/savingSupport";
import { useCloudAutoSaveOnLeave } from "../../lib/useCloudAutoSaveOnLeave";
import { useSupportBell } from "../../components/support/SupportBellProvider";

type PeriodDailyInfo = {
  date: Date;
  spending: number;
  income: number;
};

export default function CalendarPage() {
  useCloudAutoSaveOnLeave();
  const { setCards } = useSupportBell();
  const [now, setNow] = useState(() => new Date());
  const today = now;
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const isViewingThisMonth =
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth() + 1;

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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [periodInfos, setPeriodInfos] = useState<PeriodDailyInfo[]>([]);
  const [periodLabel, setPeriodLabel] = useState<string>("");
  const [periodRange, setPeriodRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

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

  const selectedDateLabel = useMemo(() => {
    if (!selectedDay) return "";
    const d = new Date(currentYear, currentMonth - 1, selectedDay);
    const w = WEEKDAY_LABELS[d.getDay()];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${w}）`;
  }, [currentYear, currentMonth, selectedDay]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
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

  const selectDay = (day: number) => {
    const detailsForDay = dailyDetails[day - 1] ?? [];
    setSelectedDay(day);
    setSelectedDetails(detailsForDay);
    return detailsForDay;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    if (day < 1 || day > daysInMonth) return;
    selectDay(day);
    setIsOverviewModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDayLongPress = (day: number) => {
    if (day < 1 || day > daysInMonth) return;
    selectDay(day);
    setIsDetailModalOpen(true);
    setIsOverviewModalOpen(false);
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

  const periodAnchor = useMemo(() => {
    if (!isViewingThisMonth) {
      return { year: currentYear, month: currentMonth };
    }
    const payday = settings.payday ?? 1;
    if (payday <= 1) {
      return { year: currentYear, month: currentMonth };
    }
    const todayDay = today.getDate();
    if (todayDay < payday) {
      return { year: currentYear, month: currentMonth };
    }
    let nextMonth = today.getMonth() + 2;
    let nextYear = today.getFullYear();
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    return { year: nextYear, month: nextMonth };
  }, [
    isViewingThisMonth,
    currentYear,
    currentMonth,
    settings.payday,
    today,
  ]);

  // ▼ 給料日サイクル（payday ベース）の日別集計
  useEffect(() => {
    if (!isClient) return;

    const payday = settings.payday ?? 1;
    const period = getPayPeriodForMonth(
      periodAnchor.year,
      periodAnchor.month,
      payday
    );
    if (!period) {
      setPeriodInfos([]);
      setPeriodLabel("");
      setPeriodRange(null);
      return;
    }

    setPeriodRange({ start: period.start, end: period.end });

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
    periodAnchor.year,
    periodAnchor.month,
    dailyDetails, // 明細が変わったときも再計算したいので依存に入れておく
  ]);

  // サイクル全体の支出合計
  const hasPeriod = periodInfos.length > 0;

  const periodTotal = useMemo(
    () => periodInfos.reduce((sum, info) => sum + (info.spending || 0), 0),
    [periodInfos]
  );

  const supportCards = useMemo(() => {
    if (!isClient) return [];
    if (!isViewingThisMonth) return [];

    // 「今月（＝今日の月）」を見てる時だけ出す（好みで外してOK）
    const viewingThisMonth =
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth;
    if (!viewingThisMonth) return [];

    if (!periodRange || periodInfos.length === 0) return [];

    const totalIncomeInPeriod = periodInfos.reduce(
      (sum, info) => sum + (info.income || 0),
      0
    );

    // 最終入力日（支出 or 収入があれば入力あり扱い）
    const lastInputDate = (() => {
      const t = new Date(today);
      t.setHours(23, 59, 59, 999);
      for (let i = periodInfos.length - 1; i >= 0; i--) {
        const info = periodInfos[i];
        if (info.date.getTime() > t.getTime()) continue;
        if ((info.spending || 0) > 0 || (info.income || 0) > 0)
          return info.date;
      }
      return null;
    })();

    // 今週（直近7日）に1件でも入力あるか
    const hasRecordsThisWeek = (() => {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);

      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      return periodInfos.some((info) => {
        const ts = info.date.getTime();
        if (ts < start.getTime() || ts > end.getTime()) return false;
        return (info.spending || 0) > 0 || (info.income || 0) > 0;
      });
    })();

    const state = buildSavingSupportState({
      today,
      settings,
      periodLabel: periodLabel || "今月",
      periodStart: periodRange.start,
      periodEnd: periodRange.end,
      totalIncomeInPeriod,
      totalBudgetForPeriod: budget?.totalBudget ?? 0,
      totalSpendingInPeriod: periodTotal,
      lastInputDate,
      hasRecordsThisWeek,
    });

    return state.cards;
  }, [
    isClient,
    today,
    currentYear,
    currentMonth,
    settings,
    periodInfos,
    periodLabel,
    periodRange,
    budget?.totalBudget,
    periodTotal,
  ]);

  useEffect(() => {
    setCards(supportCards);
  }, [setCards, supportCards]);

  const { themeClass } = useResolvedTheme(settings.theme);

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
      hasPeriod={hasPeriod}
      periodLabel={periodLabel}
      periodStart={periodRange?.start ?? null}
      periodEnd={periodRange?.end ?? null}
      selectedDateLabel={selectedDateLabel}
      selectedDetails={selectedDetails}
      isOverviewModalOpen={isOverviewModalOpen}
      isDetailModalOpen={isDetailModalOpen}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onSelectDay={handleDayClick}
      onLongPressDay={handleDayLongPress}
      onCloseOverview={handleCloseOverviewModal}
      onOpenDetailFromOverview={handleOpenDetailFromOverview}
      onCloseDetail={handleCloseDetailModal}
      onChangeRecord={handleUpdateDetail}
      onDeleteRecord={handleDeleteDetail}
      onAddRecord={handleAddDetail}
    />
  );
}
