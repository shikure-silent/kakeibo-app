"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { MonthlyBudget } from "../../types/calendar";
import {
  calcDayTotals,
  loadAmountsFromStorage,
  loadBudgetWithFallback,
  loadDetailsFromStorage,
} from "../../lib/calendarStorage";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  SETTINGS_EVENT,
} from "../../lib/settingsStorage";
import {
  getEffectivePaydayForMonth,
  getPayPeriodForMonth,
  listDatesInPeriod,
} from "../../lib/payPeriod";
import BudgetHighlightCard from "../calendar/BudgetHighlightCard";

type PeriodDailyInfo = {
  date: Date;
  spending: number;
  income: number;
};

type Props = {
  isDark?: boolean;
};

export default function RemainingBudgetCard({ isDark = false }: Props) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [now, setNow] = useState(() => new Date());
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [periodInfos, setPeriodInfos] = useState<PeriodDailyInfo[]>([]);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth, 0).getDate(),
    [currentYear, currentMonth]
  );

  useEffect(() => {
    const apply = () => setSettings(loadAppSettings());
    apply();
    if (typeof window === "undefined") return;
    window.addEventListener(SETTINGS_EVENT, apply);
    return () => window.removeEventListener(SETTINGS_EVENT, apply);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedAmounts = loadAmountsFromStorage(currentYear, currentMonth);
    const normalizedAmounts = Array.from(
      { length: daysInMonth },
      (_, i) => Number(storedAmounts[i] ?? 0)
    );
    setAmounts(normalizedAmounts);

    const loadedBudget = loadBudgetWithFallback(currentYear, currentMonth);
    setBudget(loadedBudget);
  }, [currentYear, currentMonth, daysInMonth]);

  const monthlyTotal = useMemo(
    () => amounts.reduce((sum, v) => sum + (v || 0), 0),
    [amounts]
  );

  const periodAnchor = useMemo(() => {
    const payday = settings.payday ?? 1;
    if (payday <= 1) {
      return { year: currentYear, month: currentMonth };
    }
    const todayDay = now.getDate();
    const effectivePaydayThisMonth = getEffectivePaydayForMonth(
      now.getFullYear(),
      now.getMonth() + 1,
      payday
    );
    if (todayDay < effectivePaydayThisMonth) {
      return { year: currentYear, month: currentMonth };
    }
    let nextMonth = now.getMonth() + 2;
    let nextYear = now.getFullYear();
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    return { year: nextYear, month: nextMonth };
  }, [currentYear, currentMonth, settings.payday, now]);

  useEffect(() => {
    const payday = settings.payday ?? 1;
    const period = getPayPeriodForMonth(
      periodAnchor.year,
      periodAnchor.month,
      payday
    );
    if (!period) {
      setPeriodInfos([]);
      return;
    }

    const dates = listDatesInPeriod(period);
    const infos: PeriodDailyInfo[] = [];
    for (const d of dates) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const details = loadDetailsFromStorage(y, m, day);
      const { spending, income } = calcDayTotals(details);
      infos.push({ date: d, spending, income });
    }
    setPeriodInfos(infos);
  }, [settings.payday, periodAnchor.year, periodAnchor.month]);

  const hasPeriod = periodInfos.length > 0;

  const periodTotal = useMemo(
    () => periodInfos.reduce((sum, info) => sum + (info.spending || 0), 0),
    [periodInfos]
  );

  const remainingBudget = useMemo(() => {
    if (!budget) return null;
    return budget.totalBudget - monthlyTotal;
  }, [budget, monthlyTotal]);

  const budgetUsagePercent = useMemo(() => {
    if (!budget || budget.totalBudget <= 0) return null;
    return Math.min(100, Math.max(0, (monthlyTotal / budget.totalBudget) * 100));
  }, [budget, monthlyTotal]);

  const periodRemainingBudget = useMemo(() => {
    if (!budget) return null;
    return budget.totalBudget - periodTotal;
  }, [budget, periodTotal]);

  const periodBudgetUsagePercent = useMemo(() => {
    if (!budget || budget.totalBudget <= 0) return null;
    return Math.min(100, Math.max(0, (periodTotal / budget.totalBudget) * 100));
  }, [budget, periodTotal]);

  return (
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
      isDark={isDark}
    />
  );
}
