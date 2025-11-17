"use client";

import React from "react";
import { WEEKDAY_LABELS } from "../../lib/const";

type Props = {
  calendarCells: (number | null)[];
  amounts: number[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  today: Date;
  currentYear: number;
  currentMonth: number;
};

export default function CalendarGrid({
  calendarCells,
  amounts,
  selectedDay,
  onSelectDay,
  today,
  currentYear,
  currentMonth,
}: Props) {
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth &&
      today.getDate() === day
    );
  };

  return (
    <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">月間カレンダー</h2>
        <p className="text-[11px] text-slate-400">
          金額の合計は、その日の支出の合計です。
        </p>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-500 mt-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1.5 text-xs">
        {calendarCells.map((day, idx) => {
          if (!day) {
            return (
              <div key={idx} className="aspect-square rounded-xl text-[11px]" />
            );
          }

          const total = amounts[day - 1] || 0;
          const hasSpending = total > 0;
          const isSelected = selectedDay === day;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`
                aspect-square
                rounded-xl
                border
                px-1.5 py-1.5
                flex flex-col justify-between
                text-left
                transition
                ${
                  isSelected
                    ? "bg-emerald-100 border-emerald-400"
                    : hasSpending
                    ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`
                    text-[11px] font-medium
                    ${isToday(day) ? "text-emerald-700" : "text-slate-600"}
                  `}
                >
                  {day}
                </span>
                {isToday(day) && (
                  <span className="text-[10px] text-emerald-600 font-medium">
                    今日
                  </span>
                )}
              </div>
              <div className="text-[11px] text-right mt-1 leading-tight">
                {hasSpending ? (
                  <>
                    <span className="block text-slate-500">合計</span>
                    <span className="font-semibold text-slate-800">
                      ¥{total.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-300">なし</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
