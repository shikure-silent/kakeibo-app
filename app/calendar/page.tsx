"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  buildBudgetKey,
  buildDetailsKey,
  buildSpendingKey,
  WEEKDAY_LABELS,
} from "../../lib/const";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import BudgetHighlightCard from "../../components/calendar/BudgetHighlightCard";
import MonthlySummaryCard from "../../components/calendar/MonthlySummaryCard";
import SelectedDayDetailsCard from "../../components/calendar/SelectedDayDetailsCard";
import { DetailRecord, MonthlyBudget } from "../../types/calendar";

// 支出合計配列の読み込み（旧形式/新形式 両対応）
const loadAmountsFromStorage = (year: number, month: number): number[] => {
  if (typeof window === "undefined") return [];

  const daysInMonth = new Date(year, month, 0).getDate();
  const key = buildSpendingKey(year, month);
  const raw = window.localStorage.getItem(key);

  let amounts: number[] = Array(daysInMonth).fill(0);

  if (!raw) return amounts;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      amounts = parsed.map((v) => Number(v) || 0);
    } else if (Array.isArray((parsed as any).amounts)) {
      amounts = (parsed as any).amounts.map((v: string) => Number(v) || 0);
    }
  } catch {
    return amounts;
  }

  if (amounts.length < daysInMonth) {
    amounts.push(...Array(daysInMonth - amounts.length).fill(0));
  } else if (amounts.length > daysInMonth) {
    amounts.length = daysInMonth;
  }

  return amounts;
};

const loadDetailsFromStorage = (
  year: number,
  month: number,
  day: number
): DetailRecord[] => {
  if (typeof window === "undefined") return [];
  const key = buildDetailsKey(year, month, day);
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as DetailRecord[];
    }
  } catch {
    return [];
  }
  return [];
};

const loadBudgetFromStorage = (
  year: number,
  month: number
): MonthlyBudget | null => {
  if (typeof window === "undefined") return null;
  const key = buildBudgetKey(year, month);
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MonthlyBudget;
    if (typeof parsed.totalBudget === "number") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
};

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate()
  );
  const [selectedDetails, setSelectedDetails] = useState<DetailRecord[]>([]);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [isClient, setIsClient] = useState(false);

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

  // 1日あたりの目安（予算 / 日数）
  const dailyTarget = useMemo(() => {
    if (!budget || daysInMonth === 0) return null;
    return budget.totalBudget / daysInMonth;
  }, [budget, daysInMonth]);

  // 直近1週間のサマリー
  const weeklySummary = useMemo(() => {
    if (daysInMonth === 0) return null;

    let endDay = daysInMonth;
    if (
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth
    ) {
      endDay = today.getDate();
    }
    const startDay = Math.max(1, endDay - 6); // 直近7日分
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const loaded = loadAmountsFromStorage(currentYear, currentMonth);
    setAmounts(loaded);
    const loadedBudget = loadBudgetFromStorage(currentYear, currentMonth);
    setBudget(loadedBudget);
  }, [isClient, currentYear, currentMonth]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedDay && selectedDay >= 1 && selectedDay <= daysInMonth) {
      const details = loadDetailsFromStorage(
        currentYear,
        currentMonth,
        selectedDay
      );
      setSelectedDetails(details);
    } else {
      setSelectedDetails([]);
    }
  }, [isClient, currentYear, currentMonth, selectedDay, daysInMonth]);

  const handlePrevMonth = () => {
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
  };

  // カレンダーセルを生成
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

  return (
    <main>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー（タイトル＋月送り） */}
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左：カレンダー */}
          <CalendarGrid
            calendarCells={calendarCells}
            amounts={amounts}
            selectedDay={selectedDay}
            onSelectDay={handleDayClick}
            today={today}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />

          {/* 右：予算ハイライト＋サマリー＋選択日の内訳 */}
          <section className="space-y-4">
            <BudgetHighlightCard
              budget={budget}
              monthlyTotal={monthlyTotal}
              remainingBudget={remainingBudget}
              budgetUsagePercent={budgetUsagePercent}
            />

            <MonthlySummaryCard
              monthlyTotal={monthlyTotal}
              budget={budget}
              remainingBudget={remainingBudget}
              daysInMonth={daysInMonth}
              amounts={amounts}
              maxAmount={maxAmount}
              dailyTarget={dailyTarget}
              weeklySummary={weeklySummary}
            />

            <SelectedDayDetailsCard
              selectedDay={selectedDay}
              selectedDateLabel={selectedDateLabel}
              selectedDetails={selectedDetails}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
