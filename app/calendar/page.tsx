"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseItem } from "../../components/ExpenseInputsBlock";
import CalendarSpendingChart from "../../components/CalendarSpendingChart";

type BudgetData = {
  prefecture: string;
  totalIncome: number;
  totalExpense: number;
  expenseItems: ExpenseItem[];
  memberCount: number;
  memberIncomes: string[];
  createdAt: string;
};

type CalendarInfo = {
  year: number;
  month: number; // 1〜12
  daysInMonth: number;
};

const buildSpendingKey = (year: number, month: number) =>
  `kakeibo-spending-${year}-${String(month).padStart(2, "0")}`;

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const router = useRouter();

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [calendarInfo, setCalendarInfo] = useState<CalendarInfo | null>(null);
  const [dailyAmounts, setDailyAmounts] = useState<string[]>([]); // index = day - 1

  // 指定した年月のデータを読み込んで state をセット
  function setupMonth(year: number, month: number) {
    if (typeof window === "undefined") return;

    const daysInMonth = new Date(year, month, 0).getDate();
    let arr: string[] = Array(daysInMonth).fill("");

    const key = buildSpendingKey(year, month);
    const rawSpending = window.localStorage.getItem(key);
    if (rawSpending) {
      try {
        const parsed = JSON.parse(rawSpending) as { amounts: string[] };
        if (Array.isArray(parsed.amounts)) {
          arr = [...parsed.amounts];
          if (arr.length < daysInMonth) {
            arr.push(...Array(daysInMonth - arr.length).fill(""));
          } else if (arr.length > daysInMonth) {
            arr.length = daysInMonth;
          }
        }
      } catch {
        // 壊れてたら無視して初期値のまま
      }
    }

    setCalendarInfo({ year, month, daysInMonth });
    setDailyAmounts(arr);
  }

  // 初期ロード：予算を読み込み、予算作成月をベースに表示開始
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("kakeibo-budget");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as BudgetData;
      setBudget(parsed);

      const baseDate = new Date(parsed.createdAt || new Date().toISOString());
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth() + 1;

      setupMonth(year, month);
    } catch (e) {
      console.error("failed to parse kakeibo-budget", e);
    }
  }, []);

  // 日別支出の変更＋即時保存
  const handleDailyAmountChange = (index: number, value: string) => {
    setDailyAmounts((prev) => {
      const copy = [...prev];
      copy[index] = value;

      if (calendarInfo && typeof window !== "undefined") {
        const key = buildSpendingKey(calendarInfo.year, calendarInfo.month);
        window.localStorage.setItem(key, JSON.stringify({ amounts: copy }));
      }

      return copy;
    });
  };

  // 月の切り替え（前月 / 次月）
  const handleMonthChange = (delta: number) => {
    if (!calendarInfo) return;
    const baseIndex = calendarInfo.month - 1 + delta; // 0 ベース

    const newYear = calendarInfo.year + Math.floor(baseIndex / 12);
    const newMonthIndex = ((baseIndex % 12) + 12) % 12; // マイナス対策
    const newMonth = newMonthIndex + 1;

    setupMonth(newYear, newMonth);
  };

  const numericDaily = dailyAmounts.map((v) => Number(v) || 0);
  const totalSpent = numericDaily.reduce((sum, v) => sum + v, 0);

  const chartData = calendarInfo?.daysInMonth
    ? Array.from({ length: calendarInfo.daysInMonth }, (_, i) => ({
        day: i + 1,
        amount: numericDaily[i] || 0,
      }))
    : [];

  // カレンダーのマス目データ生成
  const calendarCells =
    calendarInfo != null
      ? (() => {
          const cells: { day: number | null; index: number | null }[] = [];
          const firstWeekday = new Date(
            calendarInfo.year,
            calendarInfo.month - 1,
            1
          ).getDay(); // 0 = 日曜

          // 月初めまで空マスを入れる
          for (let i = 0; i < firstWeekday; i++) {
            cells.push({ day: null, index: null });
          }

          // 日付ぶんのマス
          for (let day = 1; day <= calendarInfo.daysInMonth; day++) {
            cells.push({ day, index: day - 1 });
          }

          return cells;
        })()
      : [];

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* 上部ヘッダー：タイトル＋ホームへ戻る */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">カレンダーページ</h1>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          ホームに戻る
        </button>
      </div>

      {!budget || !calendarInfo ? (
        <p className="text-sm text-gray-600">
          まだ予算が設定されていません。
          トップページで支出予想額を入力して「この予算でスタート」を押してください。
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：予算サマリ＋カレンダー入力 */}
          <section className="lg:col-span-2 space-y-4">
            {/* 予算サマリ */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">
                {budget.prefecture} の予算サマリー
              </h2>
              <div className="text-sm space-y-1">
                <div>
                  表示中の月: {calendarInfo.year}年{calendarInfo.month}月
                </div>
                <div>世帯収入合計: {budget.totalIncome.toLocaleString()}円</div>
                <div>
                  支出予想額の合計: {budget.totalExpense.toLocaleString()}円
                </div>
                <div>
                  現在までの実績支出合計: {totalSpent.toLocaleString()}円
                </div>
                <div>
                  予算残り:{" "}
                  {(budget.totalExpense - totalSpent).toLocaleString()}円
                </div>
                <div className="text-xs text-gray-500">
                  予算を保存した日時:{" "}
                  {new Date(budget.createdAt).toLocaleString("ja-JP")}
                </div>
              </div>
            </div>

            {/* 日別支出カレンダー */}
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">日別の支出入力</h2>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => handleMonthChange(-1)}
                    className="px-2 py-1 border rounded hover:bg-gray-50"
                  >
                    ＜ 前の月
                  </button>
                  <span>
                    {calendarInfo.year}年{calendarInfo.month}月
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMonthChange(1)}
                    className="px-2 py-1 border rounded hover:bg-gray-50"
                  >
                    次の月 ＞
                  </button>
                </div>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-1 text-xs mb-1">
                {weekdayLabels.map((w) => (
                  <div
                    key={w}
                    className="text-center font-semibold text-gray-600"
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* カレンダー本体 */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {calendarCells.map((cell, idx) =>
                  cell.day == null ? (
                    <div
                      key={idx}
                      className="border border-transparent rounded p-2"
                    />
                  ) : (
                    <div
                      key={idx}
                      className="border rounded p-1 flex flex-col gap-1 min-h-[64px]"
                    >
                      <div className="text-[10px] text-gray-500 text-right">
                        {cell.day}日
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="border rounded px-1 py-0.5 text-right text-[11px]"
                        value={dailyAmounts[cell.index!] || ""}
                        onChange={(e) =>
                          handleDailyAmountChange(cell.index!, e.target.value)
                        }
                        placeholder="0"
                      />
                      <span className="text-[10px] text-gray-400 text-right">
                        円
                      </span>
                    </div>
                  )
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                ※入力内容はブラウザ内（localStorage）に自動保存されます。
              </p>
            </div>
          </section>

          {/* 右側：日別支出の縦グラフ */}
          <aside className="space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <CalendarSpendingChart data={chartData} />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
