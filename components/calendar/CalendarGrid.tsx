"use client";

import React from "react";
import { WEEKDAY_LABELS } from "../../lib/const";
import { DetailRecord } from "../../types/calendar";

type Props = {
  calendarCells: (number | null)[];
  amounts: number[];
  incomeAmounts: number[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  today: Date;
  currentYear: number;
  currentMonth: number;
  dailyDetails: DetailRecord[][];
  /** ダークテーマかどうか（CalendarView から渡される） */
  isDark?: boolean;
};

export default function CalendarGrid({
  calendarCells,
  amounts,
  incomeAmounts,
  selectedDay,
  onSelectDay,
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

  return (
    <section
      className={`rounded-2xl shadow-sm border px-3 py-3 lg:px-4 lg:py-4 ${cardBaseClass}`}
    >
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((w) => (
          <div
            key={w}
            className={`text-center text-[10px] font-medium ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付セル */}
      <div className="grid grid-cols-7 gap-1.5 lg:gap-2">
        {calendarCells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={index}
                className="aspect-square rounded-xl bg-transparent"
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
            "relative flex flex-col items-start justify-between rounded-xl border px-1.5 py-1.5 lg:px-2 lg:py-2 text-left transition-colors min-h-[88px]";

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
              onClick={() => onSelectDay(day)}
              className={`${baseCellClass} ${
                isSelected ? selectedCellClass : normalCellClass
              }`}
            >
              {/* 上部：日付 + 今日ラベル */}
              <div className="flex items-center justify-between w-full mb-0.5">
                <span
                  className={`text-xs lg:text-sm font-semibold leading-none ${
                    isDark ? "text-slate-50" : "text-slate-800"
                  }`}
                >
                  {day}
                </span>
                {isToday && (
                  <span className="rounded-full bg-emerald-500 px-1.5 py-[1px] text-[9px] font-medium text-white whitespace-nowrap leading-none">
                    今日
                  </span>
                )}
              </div>

              {/* 中央：支出合計・収入 */}
              <div className="mt-1 space-y-0.5 w-full">
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

              {/* 下部：内訳プレビュー */}
              <div className="mt-1 w-full space-y-0.5">
                {visibleDetails.map((rec, i) => (
                  <p
                    key={i}
                    className={`text-[9px] truncate ${
                      isDark ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {rec.category || "未分類"} /{" "}
                    {rec.shopName || rec.memo || "詳細なし"}
                  </p>
                ))}
                {hasDetails && dayDetails.length > 2 && (
                  <p
                    className={`text-[9px] ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    ほか {dayDetails.length - 2} 件…
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
