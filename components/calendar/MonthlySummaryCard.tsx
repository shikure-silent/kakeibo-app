"use client";

import React from "react";
import { MonthlyBudget } from "../../types/calendar";

type WeeklySummary = {
  startDay: number;
  endDay: number;
  total: number;
  average: number;
};

type Props = {
  monthlyTotal: number;
  budget: MonthlyBudget | null;
  remainingBudget: number | null;
  daysInMonth: number;
  amounts: number[];
  maxAmount: number;
  dailyTarget: number | null;
  weeklySummary: WeeklySummary | null;
};

export default function MonthlySummaryCard({
  monthlyTotal,
  budget,
  remainingBudget,
  daysInMonth,
  amounts,
  maxAmount,
  dailyTarget,
  weeklySummary,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">今月のサマリー</h2>

      <div className="space-y-1.5">
        <p className="text-[11px] text-slate-500">今月の合計支出</p>
        <p className="text-xl font-bold text-slate-900">
          ¥{monthlyTotal.toLocaleString()}
        </p>

        {budget ? (
          <p
            className={`mt-1 text-[11px] ${
              remainingBudget !== null && remainingBudget < 0
                ? "text-red-600"
                : "text-emerald-700"
            }`}
          >
            予算との差額:{" "}
            {remainingBudget !== null && remainingBudget < 0
              ? `¥${Math.abs(remainingBudget).toLocaleString()} オーバー`
              : `残り ¥${
                  remainingBudget !== null
                    ? remainingBudget.toLocaleString()
                    : "0"
                }`}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-400">
            この月の予算がまだ設定されていません。ホーム画面で支出予算を入力し、
            「この予算でスタート」を押すとここに表示されます。
          </p>
        )}

        <p className="mt-1 text-[11px] text-slate-400">
          1日あたり平均{" "}
          {daysInMonth > 0
            ? `¥${Math.round(monthlyTotal / daysInMonth).toLocaleString()}`
            : "¥0"}{" "}
          です。
        </p>
      </div>

      {/* 日別の棒グラフ */}
      <div className="mt-3">
        <p className="text-[11px] text-slate-500 mb-1">
          日別の支出（棒グラフ）
        </p>
        <div className="h-32 flex items-end gap-[2px] bg-slate-50 rounded-xl px-2 py-2">
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const amt = amounts[index] || 0;
            const ratio = maxAmount > 0 ? amt / maxAmount : 0;
            const heightPercent = ratio === 0 ? 0 : Math.max(8, ratio * 100);

            const isOverTarget = dailyTarget !== null && amt > dailyTarget;

            const barColorClass =
              amt === 0
                ? "bg-slate-200"
                : isOverTarget
                ? "bg-red-400"
                : "bg-emerald-400";

            return (
              <div
                key={index}
                className="flex-1 flex flex-col justify-end items-center h-full"
              >
                <div
                  className={`w-full rounded-t-full ${barColorClass}`}
                  style={{
                    height: `${heightPercent}%`,
                  }}
                />
                <span className="mt-1 text-[9px] text-slate-400">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
        {dailyTarget !== null && (
          <p className="mt-1 text-[10px] text-slate-400">
            緑: 1日の目安以内 / 赤: 1日の目安超え（目安: 予算 ÷ 日数 ≒ ¥
            {Math.round(dailyTarget).toLocaleString()})
          </p>
        )}
      </div>

      {/* 直近1週間のサマリー */}
      {weeklySummary && (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 space-y-1">
          <p className="text-[11px] font-medium text-slate-700">
            直近1週間の支出サマリー
          </p>
          <p className="text-[11px] text-slate-600">
            {weeklySummary.startDay}〜{weeklySummary.endDay}日の合計:{" "}
            <span className="font-semibold">
              ¥{weeklySummary.total.toLocaleString()}
            </span>
          </p>
          <p className="text-[11px] text-slate-600">
            1日あたり平均: ¥{Math.round(weeklySummary.average).toLocaleString()}
          </p>
          {remainingBudget !== null && (
            <p className="text-[11px] text-slate-600">
              月の予算残額:{" "}
              <span
                className={
                  remainingBudget < 0
                    ? "text-red-600 font-semibold"
                    : "text-emerald-700 font-semibold"
                }
              >
                {remainingBudget < 0
                  ? `¥${Math.abs(remainingBudget).toLocaleString()} オーバー`
                  : `¥${remainingBudget.toLocaleString()}`}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
