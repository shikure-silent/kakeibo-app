"use client";

import React from "react";
import { WEEKDAY_LABELS } from "../../lib/const";
import { DetailRecord } from "../../types/calendar";

type Props = {
  calendarCells: (number | null)[];
  amounts: number[]; // 支出合計
  incomeAmounts: number[]; // 収入合計
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
            // 前月/翌月用の空マス
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
            "relative rounded-xl border text-left transition-colors overflow-hidden";
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
              {/* ▼ スマホ表示（〜639px）：日付 → 今日 → 金額/内訳なし */}
              <div className="flex h-full min-h-[60px] flex-col justify-between px-1.5 py-1.5 sm:hidden">
                {/* 上：日付＋「今日」バッジ（縦に並べて左上寄せ） */}
                <div className="flex flex-col items-start">
                  <span
                    className={`text-[11px] font-semibold leading-none ${
                      isDark ? "text-slate-50" : "text-slate-800"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="mt-0.5 rounded-full bg-emerald-500 px-1.5 py-[1px] text-[9px] font-medium text-white whitespace-nowrap leading-none">
                      今日
                    </span>
                  )}
                </div>

                {/* 下：合計金額 or 収入 or 内訳なし */}
                <div className="mt-0.5 w-full">
                  {spending > 0 ? (
                    <p
                      className={`text-[10px] font-semibold leading-tight truncate ${
                        isDark ? "text-slate-50" : "text-slate-800"
                      }`}
                    >
                      ¥{spending.toLocaleString()}
                    </p>
                  ) : income > 0 ? (
                    <p className="text-[9px] leading-tight text-emerald-500 truncate">
                      ＋¥{income.toLocaleString()}
                    </p>
                  ) : (
                    <p
                      className={`text-[9px] leading-tight ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      内訳なし
                    </p>
                  )}
                </div>
              </div>

              {/* ▼ PC / タブレット表示（sm以上）：従来のリッチ版 */}
              <div className="hidden h-full min-h-[80px] w-full flex-col sm:flex sm:items-start sm:justify-between sm:px-2 sm:py-2 lg:min-h-[96px]">
                {/* 上段：日付＋今日ラベル */}
                <div className="flex w-full items-center justify-between mb-0.5">
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

                {/* 中段：支出合計・収入 */}
                <div className="mt-1 w-full space-y-0.5">
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

                {/* 下段：カテゴリ＋金額（最大2件＋「ほか◯件」） */}
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
