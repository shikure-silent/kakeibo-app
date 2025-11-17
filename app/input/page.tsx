"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  buildDetailsKey,
  buildSpendingKey,
  WEEKDAY_LABELS,
} from "../../lib/const";
import { DetailRecord, Mode } from "../../types/calendar";
import InputFormCard from "../../components/input/InputFormCard";
import DayRecordsCard from "../../components/input/DayRecordsCard";

// 日付文字列を生成（YYYY-MM-DD）
const getTodayDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDateString = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map((v) => Number(v));
  return {
    year: y,
    month: m,
    day: d,
  };
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

// ある日付の明細を読み込む
const loadDetailsForDate = (dateStr: string): DetailRecord[] => {
  if (typeof window === "undefined") return [];
  const { year, month, day } = parseDateString(dateStr);
  const key = buildDetailsKey(year, month, day);
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as DetailRecord[];
    }
  } catch {
    return [];
  }
  return [];
};

// ある日付の明細を書き込む（＋その月の支出サマリーを更新）
const saveDetailsForDate = (dateStr: string, records: DetailRecord[]) => {
  if (typeof window === "undefined") return;
  const { year, month, day } = parseDateString(dateStr);
  const detailKey = buildDetailsKey(year, month, day);

  window.localStorage.setItem(detailKey, JSON.stringify(records));

  // 月全体の支出合計配列を再計算して保存
  const daysInMonth = getDaysInMonth(year, month);
  const amounts: number[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const k = buildDetailsKey(year, month, d);
    const raw = window.localStorage.getItem(k);
    let dayTotal = 0;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DetailRecord[];
        if (Array.isArray(parsed)) {
          // カレンダーの棒グラフは「支出（expense）」のみを合計
          dayTotal = parsed
            .filter((rec) => rec.mode === "expense")
            .reduce((sum, rec) => sum + rec.amount, 0);
        }
      } catch {
        // 何もしない（0のまま）
      }
    }
    amounts.push(dayTotal);
  }

  const spendingKey = buildSpendingKey(year, month);
  window.localStorage.setItem(spendingKey, JSON.stringify(amounts));
};

export default function InputPage() {
  const [isClient, setIsClient] = useState(false);

  // 入力フォームの状態
  const [mode, setMode] = useState<Mode>("expense");
  const [dateStr, setDateStr] = useState<string>(getTodayDateString());
  const [category, setCategory] = useState<string>("食費");
  const [payFrom, setPayFrom] = useState<string>("現金");
  const [memo, setMemo] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");

  // 選択日の明細
  const [dayRecords, setDayRecords] = useState<DetailRecord[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 日付変更時・初期表示時に、その日の明細を読み込む
  useEffect(() => {
    if (!isClient) return;
    const loaded = loadDetailsForDate(dateStr);
    setDayRecords(loaded);
  }, [isClient, dateStr]);

  const handleChangeDate = (next: string) => {
    setDateStr(next);
  };

  const handleChangeMode = (next: Mode) => {
    setMode(next);
  };

  const handleAddRecord = () => {
    if (!isClient) return;

    if (!dateStr) {
      alert("日付を選択してください。");
      return;
    }

    const trimmedAmount = amountInput.trim();
    if (!trimmedAmount) {
      alert("金額を入力してください。");
      return;
    }

    const numeric = Number(trimmedAmount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      alert("金額は0より大きい半角数字で入力してください。");
      return;
    }

    const now = new Date();
    const newRecord: DetailRecord = {
      mode,
      amount: numeric,
      category,
      payFrom,
      memo: memo.trim(),
      date: dateStr,
      createdAt: now.toISOString(),
    };

    setDayRecords((prev) => {
      const next = [...prev, newRecord];
      saveDetailsForDate(dateStr, next);
      return next;
    });

    // 入力欄は金額とメモだけリセット
    setAmountInput("");
    setMemo("");
  };

  const handleDeleteRecord = (index: number) => {
    if (!isClient) return;
    setDayRecords((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveDetailsForDate(dateStr, next);
      return next;
    });
  };

  const selectedDateLabel = useMemo(() => {
    if (!dateStr) return "";
    const { year, month, day } = parseDateString(dateStr);
    const d = new Date(year, month - 1, day);
    const w = WEEKDAY_LABELS[d.getDay()];
    return `${year}年${month}月${day}日（${w}）`;
  }, [dateStr]);

  return (
    <main>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー */}
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            入力
          </h1>
          <p className="text-xs lg:text-sm text-slate-500">
            毎日の支出や収入を記録する画面です。入力した内容はカレンダーページにも反映されます。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左：入力フォーム */}
          <section className="lg:col-span-2">
            <InputFormCard
              mode={mode}
              onChangeMode={handleChangeMode}
              dateStr={dateStr}
              onChangeDate={handleChangeDate}
              category={category}
              onChangeCategory={setCategory}
              payFrom={payFrom}
              onChangePayFrom={setPayFrom}
              memo={memo}
              onChangeMemo={setMemo}
              amount={amountInput}
              onChangeAmount={setAmountInput}
              onSubmit={handleAddRecord}
            />
          </section>

          {/* 右：選択した日の明細 */}
          <section>
            <DayRecordsCard
              dateLabel={selectedDateLabel}
              records={dayRecords}
              onDeleteRecord={handleDeleteRecord}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
