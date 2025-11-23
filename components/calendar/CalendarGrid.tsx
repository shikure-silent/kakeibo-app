"use client";

import React from "react";
import { WEEKDAY_LABELS } from "../../lib/const";
import { DetailRecord } from "../../types/calendar";

type Props = {
  calendarCells: (number | null)[];
  amounts: number[]; // 支出合計
  incomeAmounts: number[]; // 収入合計（新規）
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  today: Date;
  currentYear: number;
  currentMonth: number;
  dailyDetails: DetailRecord[][];
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
}: Props) {
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 lg:p-4">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-medium text-slate-400"
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付セル */}
      <div className="grid grid-cols-7 gap-1.5 lg:gap-2">
        {calendarCells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={idx}
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

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`relative flex flex-col items-start justify-between rounded-xl border px-1.5 py-1.5 lg:px-2 lg:py-2 text-left transition-colors ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              {/* 上部：日付＋今日ラベル */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-800">
                  {day}
                </span>
                {isToday && (
                  <span className="rounded-full bg-emerald-500 px-1.5 py-[1px] text-[9px] font-medium text-white">
                    今日
                  </span>
                )}
              </div>

              {/* 中段：カテゴリの簡易表示（最大2件） */}
              <div className="mt-0.5 flex-1 w-full min-h-[26px] space-y-0.5">
                {hasDetails ? (
                  <div className="space-y-0.5">
                    {visibleDetails.map((rec, i) => (
                      <p
                        key={i}
                        className="text-[10px] text-slate-600 truncate"
                        title={rec.category || ""}
                      >
                        {rec.category || "未分類"}
                      </p>
                    ))}
                    {dayDetails.length > visibleDetails.length && (
                      <p className="text-[10px] text-slate-400">
                        +{dayDetails.length - visibleDetails.length}件
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300">内訳なし</span>
                )}
              </div>

              {/* 下部：支出合計 ＋ 収入 */}
              <div className="mt-0.5 w-full text-right leading-tight">
                {spending > 0 || income > 0 ? (
                  <>
                    {spending > 0 && (
                      <span className="block text-[10px] text-slate-700">
                        ¥{spending.toLocaleString()}
                      </span>
                    )}
                    {income > 0 && (
                      <span className="block text-[10px] text-emerald-600">
                        +¥{income.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-slate-300">なし</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
