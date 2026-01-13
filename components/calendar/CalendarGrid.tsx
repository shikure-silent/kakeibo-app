"use client";

import React, { useRef } from "react";
import { WEEKDAY_LABELS } from "../../lib/const";
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
  isDark = false,
}: Props) {
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const cardBaseClass = isDark
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-slate-100";

  // スマホ用：金額を少し短くする（万表記）
  const formatMobileAmount = (value: number) => {
    if (value >= 10000) {
      const man = value / 10000;
      const formatted = man >= 10 ? man.toFixed(0) : man.toFixed(1);
      return `${formatted}万`;
    }
    return value.toLocaleString();
  };

  const longPressTriggered = useRef<Record<number, boolean>>({});
  const longPressStartAt = useRef<Record<number, number>>({});
  const LONG_PRESS_MS = 450;

  const startLongPress = (day: number) => {
    longPressTriggered.current[day] = false;
    longPressStartAt.current[day] = Date.now();
  };

  const finishLongPress = (day: number) => {
    const startedAt = longPressStartAt.current[day];
    longPressStartAt.current[day] = 0;
    if (!startedAt) return;
    const elapsed = Date.now() - startedAt;
    if (elapsed >= LONG_PRESS_MS && onLongPressDay) {
      longPressTriggered.current[day] = true;
      onLongPressDay(day);
    }
  };

  const cancelLongPress = (day: number) => {
    longPressStartAt.current[day] = 0;
  };

  const handleClick = (day: number) => {
    if (longPressTriggered.current[day]) {
      longPressTriggered.current[day] = false;
      return;
    }
    onSelectDay(day);
  };

  return (
    <section
      className={`rounded-2xl shadow-sm border px-2.5 py-2.5 sm:px-3 sm:py-3 lg:px-4 lg:py-4 ${cardBaseClass}`}
    >
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1.5 sm:mb-2">
        {WEEKDAY_LABELS.map((w) => (
          <div
            key={w}
            className={`text-center text-[10px] sm:text-[11px] font-medium ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付セル */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2">
        {calendarCells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={index}
                className="rounded-xl bg-transparent min-h-[52px] sm:min-h-[64px]"
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
          const visibleDetails = hasDetails ? dayDetails.slice(0, 2) : [];

          const baseCellClass =
            "relative rounded-xl border text-left transition-colors overflow-hidden select-none";
          const normalCellClass = isDark
            ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100";
          const selectedCellClass = isDark
            ? "border-emerald-400 bg-emerald-900/40"
            : "border-emerald-500 bg-emerald-50";

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(day)}
              onTouchStart={() => startLongPress(day)}
              onTouchEnd={() => finishLongPress(day)}
              onTouchMove={() => cancelLongPress(day)}
              onTouchCancel={() => cancelLongPress(day)}
              onMouseDown={() => startLongPress(day)}
              onMouseUp={() => finishLongPress(day)}
              onMouseLeave={() => cancelLongPress(day)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
              className={`${baseCellClass} ${
                isSelected ? selectedCellClass : normalCellClass
              }`}
            >
              {/* ▼ スマホ表示（〜639px） */}
              <div className="flex h-full min-h-[64px] flex-col px-1.5 py-1.5 sm:hidden">
                {/* 1行目：日付 + 今日バッジ（縦並び・中央寄せ） */}
                <div className="flex flex-col items-center">
                  <span
                    className={`text-[11px] font-semibold leading-none ${
                      isDark ? "text-slate-50" : "text-slate-800"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="mt-0.5 inline-flex min-w-[22px] justify-center items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-[1px] text-[8px] font-semibold text-emerald-600 leading-none whitespace-nowrap">
                      今日
                    </span>
                  )}
                </div>

                {/* 2行目：金額（PCと同じく金額が先） */}
                <div className="mt-0.5 w-full">
                  {spending > 0 ? (
                    <p
                      className={`text-[9px] font-semibold leading-tight ${
                        isDark ? "text-slate-50" : "text-slate-800"
                      }`}
                    >
                      ¥{formatMobileAmount(spending)}
                    </p>
                  ) : income > 0 ? (
                    <p className="text-[8px] leading-tight text-emerald-500">
                      ＋¥{formatMobileAmount(income)}
                    </p>
                  ) : null}
                </div>

                {/* 3行目：カテゴリ（or 内訳なし） */}
                <div className="mt-0.5 w-full">
                  {hasDetails ? (
                    <p
                      className={`text-[8px] leading-tight truncate ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      {dayDetails[0]?.category || "未分類"}
                      {dayDetails.length > 1 &&
                        ` ほか${dayDetails.length - 1}件`}
                    </p>
                  ) : (
                    <p
                      className={`text-[8px] leading-tight ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      内訳なし
                    </p>
                  )}
                </div>
              </div>

              {/* ▼ PC / タブレット表示（従来どおり） */}
              <div className="hidden h-full min-h-[80px] w-full sm:flex sm:flex-col sm:items-start sm:px-2 sm:py-2 lg:min-h-[96px]">
                {/* 上：日付＋今日 */}
                <div className="flex w-full items-center justify-between mb-1">
                  <span
                    className={`text-xs lg:text-sm font-semibold leading-none ${
                      isDark ? "text-slate-50" : "text-slate-800"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-[1px] text-[9px] font-semibold text-emerald-600 leading-none">
                      今日
                    </span>
                  )}
                </div>

                {/* 中：合計金額 */}
                <div className="w-full space-y-0.5">
                  {spending > 0 ? (
                    <p
                      className={`text-xs font-semibold ${
                        isDark ? "text-slate-50" : "text-slate-800"
                      }`}
                    >
                      ¥{spending.toLocaleString()}
                    </p>
                  ) : (
                    <p
                      className={`text-[10px] ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      支出なし
                    </p>
                  )}

                  {income > 0 && (
                    <p className="text-[10px] text-emerald-500">
                      ＋¥{income.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* 下：内訳リスト */}
                <div className="mt-1 w-full space-y-0.5">
                  {hasDetails ? (
                    <>
                      {visibleDetails.map((rec, i) => (
                        <p
                          key={i}
                          className={`text-[9px] truncate ${
                            isDark ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {rec.category || "未分類"}：¥
                          {Number(rec.amount || 0).toLocaleString()}
                        </p>
                      ))}
                      {dayDetails.length > visibleDetails.length && (
                        <p
                          className={`text-[9px] ${
                            isDark ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          ほか {dayDetails.length - visibleDetails.length} 件…
                        </p>
                      )}
                    </>
                  ) : (
                    <span
                      className={`text-[9px] ${
                        isDark ? "text-slate-400" : "text-slate-300"
                      }`}
                    >
                      内訳なし
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
