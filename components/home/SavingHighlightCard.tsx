"use client";

import React from "react";

type Props = {
  totalIncome: number;
  totalExpense: number;
  saving: number;
  savingRate: number | null;
  ageGroupLabel: string;
  /** 目標貯金率（%）。例: 10 = 10%、null のときは「目標なし」扱い */
  targetSavingRatePercent?: number | null;
  isDark?: boolean;

  /** メンタルサポート文言を表示するかどうか */
  enableEncouragingMessages?: boolean;
};

export default function SavingHighlightCard({
  totalIncome,
  totalExpense,
  saving,
  savingRate,
  ageGroupLabel,
  targetSavingRatePercent,
  enableEncouragingMessages = true,
  isDark = false,
}: Props) {
  const noInput = totalIncome <= 0 && totalExpense <= 0;

  const formatSavingText = () => {
    if (noInput) {
      return "収入と支出を入力してください";
    }

    if (saving >= 0) {
      return `¥${saving.toLocaleString()}`;
    }

    // マイナス時も「赤字」とは言わず、マイナス表記だけにする
    const abs = Math.abs(saving);
    return `¥-${abs.toLocaleString()}`;
    // もし「-10,000円」スタイルが好みなら:
    // return `-${abs.toLocaleString()}円`;
  };

  const savingTextColor = noInput
    ? isDark
      ? "text-slate-200"
      : "text-slate-900"
    : saving >= 0
    ? isDark
      ? "text-emerald-200"
      : "text-emerald-900"
    : isDark
    ? "text-slate-200"
    : "text-slate-900"; // マイナスでも赤くしない

  const savingRateColor =
    savingRate !== null && saving < 0
      ? isDark
        ? "text-slate-200"
        : "text-slate-900"
      : isDark
      ? "text-emerald-200"
      : "text-emerald-700";

  // メンタルサポート用の一言メッセージ
  let messageTitle = "";
  let messageBody = "";

  if (
    enableEncouragingMessages &&
    !noInput &&
    savingRate !== null &&
    totalIncome > 0
  ) {
    if (targetSavingRatePercent == null) {
      // 目標なしモード：単純にプラスかマイナスかでコメント
      if (saving > 0) {
        messageTitle = "いいペースで貯金できています";
        messageBody =
          "この調子で続ければ、少しずつ余裕が増えていきそうです。無理のない範囲で続けていきましょう。";
      } else if (saving === 0) {
        messageTitle = "今月はちょうどトントンのペース";
        messageBody =
          "プラスでもマイナスでもない落ち着いたペースです。来月以降、少しだけ貯金を増やす作戦を考えてみるのも良いかもしれません。";
      } else {
        messageTitle = "今月はちょっとがんばりすぎかも…";
        messageBody =
          "赤字気味ですが、こうして見える化できているだけでも一歩前進です。次のサイクルで調整していく前提で、まずは「振り返り」だけでも十分です。";
      }
    } else {
      // 目標ありモード：savingRate と targetSavingRatePercent を比較（どちらも % 単位）
      const diff = savingRate - targetSavingRatePercent;

      if (diff >= 2) {
        messageTitle = "目標よりもいいペースです";
        messageBody =
          "今サイクルは目標の貯金率をしっかり上回っています。自分を褒めてあげてOKなペースです 🎉";
      } else if (diff >= -2) {
        messageTitle = "目標にだいたい届きそうです";
        messageBody =
          "ほぼ目標どおりのペースです。無理のない範囲で、残り期間で少しだけ支出を意識してみると、より安心して目標達成できそうです。";
      } else {
        messageTitle = "今月はちょっとゆったりペース";
        messageBody =
          "目標よりは少しゆっくりですが、落ち込む必要はありません。家計の状況が見えているだけでも十分大きな一歩なので、次のサイクルで少しずつ整えていきましょう。";
      }
    }
  }

  return (
    <section
      className={`rounded-2xl shadow-sm border px-4 py-4 lg:px-6 lg:py-5 flex flex-col gap-3 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-emerald-100 text-slate-900"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p
            className={`text-[11px] font-medium ${
              isDark ? "text-emerald-200" : "text-emerald-700"
            }`}
          >
            今月の貯金見込み
          </p>
          <p className={`text-2xl lg:text-3xl font-bold ${savingTextColor}`}>
            {formatSavingText()}
          </p>
          {savingRate !== null && totalIncome > 0 && (
            <p
              className={`text-[11px] mt-1 ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              貯蓄率:{" "}
              <span className={savingRateColor}>{savingRate.toFixed(1)}%</span>
            </p>
          )}
        </div>

        <div
          className={`text-[11px] lg:text-xs space-y-1 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          <p>
            収入合計:{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              ¥{totalIncome.toLocaleString()}
            </span>
          </p>
          <p>
            支出予算合計:{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              ¥{totalExpense.toLocaleString()}
            </span>
          </p>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>
            年代: {ageGroupLabel} の全国データをもとに初期値を設定しています。
          </p>
        </div>
      </div>

      {/* メンタルサポート用の一言メッセージ */}
      {enableEncouragingMessages && messageTitle && (
        <div
          className={`mt-2 rounded-xl px-3 py-2 ${
            isDark ? "bg-emerald-900/40" : "bg-emerald-50"
          }`}
        >
          <p
            className={`text-[11px] font-semibold ${
              isDark ? "text-emerald-100" : "text-emerald-800"
            }`}
          >
            {messageTitle}
          </p>
          <p
            className={`mt-1 text-[11px] leading-snug ${
              isDark ? "text-emerald-100" : "text-emerald-800"
            }`}
          >
            {messageBody}
          </p>
        </div>
      )}

      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
        ※
        貯金見込みは、あなたが設定した支出予算と世帯の収入合計をもとに計算しています。
      </p>
    </section>
  );
}
