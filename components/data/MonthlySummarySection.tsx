"use client";

import { useEffect, useMemo, useState } from "react";
import type { DetailRecord, MonthlyBudget } from "../../types/calendar";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  SETTINGS_EVENT,
} from "../../lib/settingsStorage";
import {
  calcDayTotals,
  loadAmountsFromStorage,
  loadBudgetWithFallback,
  loadDetailsFromStorage,
} from "../../lib/calendarStorage";
import { getPayPeriodForMonth, listDatesInPeriod } from "../../lib/payPeriod";
import { useResolvedTheme } from "../../lib/useResolvedTheme";
import MonthlySummaryCard from "../calendar/MonthlySummaryCard";

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

export default function MonthlySummarySection() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [now, setNow] = useState(() => new Date());
  const [amounts, setAmounts] = useState<number[]>([]);
  const [dailyDetails, setDailyDetails] = useState<DetailRecord[][]>([]);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [periodInfos, setPeriodInfos] = useState<PeriodDailyInfo[]>([]);
  const [periodLabel, setPeriodLabel] = useState<string>("");

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

    const allDetails: DetailRecord[][] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      allDetails.push(loadDetailsFromStorage(currentYear, currentMonth, d));
    }
    setDailyDetails(allDetails);

    const loadedBudget = loadBudgetWithFallback(currentYear, currentMonth);
    setBudget(loadedBudget);
  }, [currentYear, currentMonth, daysInMonth]);

  const monthlyTotal = useMemo(
    () => amounts.reduce((sum, v) => sum + (v || 0), 0),
    [amounts]
  );

  const maxAmount = useMemo(() => Math.max(0, ...amounts), [amounts]);

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
      currentYear === now.getFullYear() &&
      currentMonth === now.getMonth() + 1
    ) {
      endDay = now.getDate();
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
  }, [amounts, currentYear, currentMonth, daysInMonth, now]);

  const periodAnchor = useMemo(() => {
    const payday = settings.payday ?? 1;
    if (payday <= 1) {
      return { year: currentYear, month: currentMonth };
    }
    const todayDay = now.getDate();
    if (todayDay < payday) {
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
      setPeriodLabel("");
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

    const startLabel = `${
      period.start.getMonth() + 1
    }/${period.start.getDate()}`;
    const endLabel = `${period.end.getMonth() + 1}/${period.end.getDate()}`;
    setPeriodLabel(`${startLabel} 〜 ${endLabel}`);
  }, [
    settings.payday,
    periodAnchor.year,
    periodAnchor.month,
    dailyDetails,
  ]);

  const hasPeriod = periodInfos.length > 0;

  const periodTotal = useMemo(
    () => periodInfos.reduce((sum, info) => sum + (info.spending || 0), 0),
    [periodInfos]
  );

  const periodRemainingBudget = useMemo(() => {
    if (!budget) return null;
    return budget.totalBudget - periodTotal;
  }, [budget, periodTotal]);

  const periodDailyTarget = useMemo(() => {
    if (!budget || periodInfos.length === 0) return null;
    return budget.totalBudget / periodInfos.length;
  }, [budget, periodInfos.length]);

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

  const monthlyPayFromSummary = useMemo(() => {
    const totals = new Map<string, number>();
    dailyDetails.forEach((day) => {
      day.forEach((rec) => {
        if (rec.mode !== "expense") return;
        const label = rec.payFrom?.trim() ? rec.payFrom : "支出元なし";
        const next = (totals.get(label) || 0) + Number(rec.amount || 0);
        totals.set(label, next);
      });
    });
    return Array.from(totals.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [dailyDetails]);

  const { isDark } = useResolvedTheme(settings.theme);

  return (
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
      payFromSummary={monthlyPayFromSummary}
      isDark={isDark}
    />
  );
}
