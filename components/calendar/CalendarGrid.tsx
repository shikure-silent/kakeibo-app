"use client";

import React, { useEffect, useRef, useState } from "react";
import { WEEKDAY_LABELS } from "../../lib/const";
import { loadHolidayMap, type HolidayMap } from "../../lib/holiday";
import { DetailRecord } from "../../types/calendar";

type Props = {
  calendarCells: (number | null)[];
  amounts: number[]; // 支出合計
  incomeAmounts: number[]; // 収入合計
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onLongPressDay?: (day: number) => void;
  today: Date;
  currentYear: number;
  currentMonth: number;
  dailyDetails: DetailRecord[][];
  periodStart?: Date | null;
  periodEnd?: Date | null;
  isDark?: boolean;
};

export default function CalendarGrid({
  calendarCells,
  amounts,
  incomeAmounts,
  selectedDay,
  onSelectDay,
  onLongPressDay,
  today,
  currentYear,
  currentMonth,
  dailyDetails,
  periodStart = null,
  periodEnd = null,
  isDark = false,
}: Props) {
  const [holidayMap, setHolidayMap] = useState<HolidayMap>({});
  const rowCount = Math.max(1, Math.ceil(calendarCells.length / 7));

  useEffect(() => {
    let active = true;
    loadHolidayMap()
      .then((map) => {
        if (active) setHolidayMap(map);
      })
      .catch(() => {
        if (active) setHolidayMap({});
      });
    return () => {
      active = false;
    };
  }, []);

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const iosSurfaceClass = isDark ? "bg-slate-900 text-slate-100" : "bg-white";
  const iosBorderClass = isDark ? "border-slate-700" : "border-slate-200";
  const iosMutedTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const iosSundayTextClass = isDark ? "text-rose-300" : "text-rose-500";
  const iosSaturdayTextClass = isDark ? "text-sky-300" : "text-sky-500";
  const iosSelectedClass = isDark ? "bg-emerald-900/30" : "bg-emerald-50";
  const iosDayTextClass = isDark ? "text-slate-100" : "text-slate-700";
  const iosPeriodStartDot = isDark ? "bg-emerald-400" : "bg-emerald-500";
  const iosPeriodEndDot = isDark ? "bg-amber-400" : "bg-amber-500";

  const longPressTimers = useRef<Record<number, number | null>>({});
  const longPressTriggered = useRef<Record<number, boolean>>({});
  const bodySelectionSnapshot = useRef<{
    userSelect: string;
    webkitUserSelect: string;
    webkitTouchCallout: string;
  } | null>(null);
  const LONG_PRESS_MS = 450;

  const disableBodySelection = () => {
    if (typeof document === "undefined") return;
    if (bodySelectionSnapshot.current) return;
    const body = document.body;
    const style = body.style as CSSStyleDeclaration & {
      webkitUserSelect?: string;
      webkitTouchCallout?: string;
    };
    bodySelectionSnapshot.current = {
      userSelect: style.userSelect,
      webkitUserSelect: style.webkitUserSelect ?? "",
      webkitTouchCallout: style.webkitTouchCallout ?? "",
    };
    style.userSelect = "none";
    style.webkitUserSelect = "none";
    style.webkitTouchCallout = "none";
  };

  const restoreBodySelection = () => {
    if (typeof document === "undefined") return;
    const snapshot = bodySelectionSnapshot.current;
    if (!snapshot) return;
    const body = document.body;
    const style = body.style as CSSStyleDeclaration & {
      webkitUserSelect?: string;
      webkitTouchCallout?: string;
    };
    style.userSelect = snapshot.userSelect;
    style.webkitUserSelect = snapshot.webkitUserSelect;
    style.webkitTouchCallout = snapshot.webkitTouchCallout;
    bodySelectionSnapshot.current = null;
  };

  const startLongPress = (day: number) => {
    if (!onLongPressDay) return;
    longPressTriggered.current[day] = false;
    disableBodySelection();
    const prev = longPressTimers.current[day];
    if (prev) window.clearTimeout(prev);
    longPressTimers.current[day] = window.setTimeout(() => {
      longPressTriggered.current[day] = true;
      onLongPressDay(day);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = (day: number) => {
    const timer = longPressTimers.current[day];
    if (timer) window.clearTimeout(timer);
    longPressTimers.current[day] = null;
    restoreBodySelection();
  };

  const handleClick = (day: number) => {
    if (longPressTriggered.current[day]) {
      longPressTriggered.current[day] = false;
      return;
    }
    onSelectDay(day);
  };

  const isSameDate = (date: Date | null, y: number, m: number, d: number) => {
    if (!date) return false;
    return (
      date.getFullYear() === y &&
      date.getMonth() + 1 === m &&
      date.getDate() === d
    );
  };

  return (
    <section
      className={`w-full h-full box-border rounded-none border-0 overflow-hidden ${iosSurfaceClass}`}
      style={{
        paddingRight: "env(safe-area-inset-right)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
      {/* 曜日ヘッダー */}
      <div className={`grid w-full grid-cols-7 border-b ${iosBorderClass}`}>
        {WEEKDAY_LABELS.map((w, idx) => {
          const labelClass =
            idx === 0
              ? iosSundayTextClass
              : idx === 6
              ? iosSaturdayTextClass
              : iosMutedTextClass;
          const dividerClass = idx === 6 ? "" : `border-r ${iosBorderClass}`;
          return (
            <div
              key={w}
              className={`box-border py-1 text-center text-[10px] font-medium ${labelClass} ${dividerClass}`}
            >
              {w}
            </div>
          );
        })}
      </div>

      {/* 日付セル */}
      <div
        className="grid w-full h-full grid-cols-7"
        style={{
          gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
        }}
      >
        {calendarCells.map((day, index) => {
          const isLastCol = index % 7 === 6;
          const isLastRow = index >= calendarCells.length - 7;
          const iosCellBorderClass = `${!isLastCol ? "border-r" : ""} ${
            !isLastRow ? "border-b" : ""
          } ${iosBorderClass}`;
          const iosCellPaddingClass = isLastCol ? "px-1.5" : "px-2";
          if (!day) {
            return (
            <div
              key={index}
              className={
                  `box-border h-full min-h-[120px] ${iosCellBorderClass}`
              }
            />
            );
          }

          const isToday =
            currentYear === todayYear &&
            currentMonth === todayMonth &&
            day === todayDate;
          const isSelected = selectedDay === day;

          const spending = amounts[day - 1] ?? 0;
          const income = incomeAmounts[day - 1] ?? 0;

          const dayDetails =
            dailyDetails && dailyDetails.length >= day
              ? dailyDetails[day - 1] || []
              : [];
          const hasDetails = dayDetails.length > 0;

          const dateKey = `${currentYear}-${String(currentMonth).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const holidayLabel = holidayMap[dateKey];
          const dayOfWeek = new Date(
            currentYear,
            currentMonth - 1,
            day
          ).getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;
          const isPeriodStart = isSameDate(
            periodStart,
            currentYear,
            currentMonth,
            day
          );
          const isPeriodEnd = isSameDate(
            periodEnd,
            currentYear,
            currentMonth,
            day
          );
          const dayNumberClass =
            holidayLabel || isSunday
              ? iosSundayTextClass
              : isSaturday
              ? iosSaturdayTextClass
              : iosDayTextClass;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(day)}
              onTouchStart={() => startLongPress(day)}
              onTouchEnd={() => cancelLongPress(day)}
              onTouchMove={() => cancelLongPress(day)}
              onTouchCancel={() => cancelLongPress(day)}
              onMouseDown={() => startLongPress(day)}
              onMouseUp={() => cancelLongPress(day)}
              onMouseLeave={() => cancelLongPress(day)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
              className={`box-border relative w-full h-full min-h-[120px] text-left align-top transition-colors select-none ${
                isSelected ? iosSelectedClass : ""
              } ${iosCellBorderClass}`}
            >
              <div className={`flex h-full flex-col ${iosCellPaddingClass} py-2`}>
                <div className="flex flex-wrap items-start gap-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className={`text-[12px] font-semibold leading-none ${dayNumberClass}`}
                    >
                      {day}
                    </span>
                    {isPeriodStart && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${iosPeriodStartDot}`}
                        aria-label="集計開始日"
                      />
                    )}
                    {isPeriodEnd && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${iosPeriodEndDot}`}
                        aria-label="集計終了日"
                      />
                    )}
                  </div>
                </div>

                {holidayLabel && (
                  <span
                    className={`mt-0.5 text-[10px] leading-tight truncate ${iosSundayTextClass}`}
                  >
                    {holidayLabel}
                  </span>
                )}

                {isToday && (
                  <span
                    className={`mt-0.5 inline-flex w-fit items-center rounded-full border px-1 py-[1px] text-[8px] font-semibold leading-none whitespace-nowrap ${
                      isDark
                        ? "border-emerald-700 text-emerald-300"
                        : "border-emerald-200 text-emerald-600"
                    }`}
                  >
                    今日
                  </span>
                )}

                <div className="mt-1 space-y-0.5 min-w-0">
                  {spending > 0 ? (
                    <p
                      className={`text-[13px] font-semibold truncate ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      ¥{spending.toLocaleString()}
                    </p>
                  ) : (
                    <p className={`text-[11px] truncate ${iosMutedTextClass}`}>
                      支出なし
                    </p>
                  )}

                  {income > 0 && (
                    <p
                      className={`text-[11px] truncate ${
                        isDark ? "text-sky-300" : "text-sky-500"
                      }`}
                    >
                      ＋¥{income.toLocaleString()}
                    </p>
                  )}
                </div>

                {hasDetails ? null : (
                  <span
                    className={`mt-1 text-[10px] ${
                      isDark ? "text-slate-400" : "text-slate-300"
                    }`}
                  >
                    内訳なし
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
