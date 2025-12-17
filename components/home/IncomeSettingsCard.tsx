"use client";

import React from "react";
import NumberInput from "../NumberInput";
import { AgeGroup, ageGroupLabels } from "../../data/ageGroupData";

export type IncomeMember = {
  name: string;
  value: string;
};

type Props = {
  ageGroup: AgeGroup;
  onAgeGroupChange: (age: AgeGroup) => void;
  memberCount: number;
  onMemberCountChange: (count: number) => void;
  incomeMembers: IncomeMember[];
  onMemberNameChange: (index: number, name: string) => void;
  onMemberValueChange: (index: number, value: string) => void;
  totalIncome: number;

  // 追加済みのやつ
  mode: "setup" | "dashboard";
  onRequestEdit?: () => void;
  isDark?: boolean;
};

export default function IncomeSettingsCard({
  ageGroup,
  onAgeGroupChange,
  memberCount,
  onMemberCountChange,
  incomeMembers,
  onMemberNameChange,
  onMemberValueChange,
  totalIncome,
  mode,
  onRequestEdit,
  isDark = false,
}: Props) {
  // --------------------
  // ダッシュボードモード
  // --------------------
  if (mode === "dashboard") {
    return (
      <div
        className={`rounded-2xl shadow-sm border px-4 py-4 lg:px-6 lg:py-5 space-y-4 ${
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-100"
            : "bg-white border-slate-100 text-slate-900"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <h2
            className={`text-sm lg:text-base font-semibold ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            収入の設定（今サイクルの計画）
          </h2>
          <p
            className={`text-[11px] lg:text-right ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            このサイクルの貯金見込みは、ここで設定した収入合計と支出予算をもとに計算しています。
          </p>
        </div>

        <div className="space-y-3">
          <div
            className={`space-y-1 text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <p>
              世帯主の年代:{" "}
              <span className="font-semibold">{ageGroupLabels[ageGroup]}</span>
            </p>
            <p>
              収入を入力している人数:{" "}
              <span className="font-semibold">{memberCount}人</span>
            </p>
          </div>

          <div className="space-y-1">
            <p
              className={`text-[11px] font-medium ${
                isDark ? "text-slate-200" : "text-slate-600"
              }`}
            >
              世帯の収入合計（手取り／月）
            </p>
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              ¥{totalIncome.toLocaleString()}
            </p>
          </div>

          <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            メンバーごとの金額や名前の編集は、「収入設定を見直す」ボタンから行えます。
          </p>
        </div>

        <div className="flex justify-end">
          {onRequestEdit && (
            <button
              type="button"
              onClick={onRequestEdit}
              className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                isDark
                  ? "border-slate-500 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              収入設定を見直す
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------
  // セットアップモード（従来どおりのフォーム）
  // --------------------
  return (
    <div
      className={`rounded-2xl shadow-sm border px-4 py-4 lg:px-6 lg:py-5 space-y-4 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h2
          className={`text-sm lg:text-base font-semibold ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          収入の設定
        </h2>
        <p
          className={`text-[11px] lg:text-right ${
            isDark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          世帯のメンバーごとの毎月の手取り収入を入力してください。
        </p>
      </div>

      <div className="space-y-3">
        {/* 年代選択 */}
        <div className="space-y-1.5">
          <label
            className={`block text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            世帯主の年代（全国×年代別の参考データを使用）
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <select
              value={ageGroup}
              onChange={(e) => onAgeGroupChange(e.target.value as AgeGroup)}
              className="
                border rounded-full w-full sm:w-auto
                px-3 py-1.5 text-xs
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
              style={{
                backgroundColor: isDark ? "#0f172a" : "white",
                color: isDark ? "#e2e8f0" : "#334155",
                borderColor: isDark ? "#475569" : "#e2e8f0",
              }}
            >
              {(Object.keys(ageGroupLabels) as AgeGroup[]).map((key) => (
                <option key={key} value={key}>
                  {ageGroupLabels[key]}
                </option>
              ))}
            </select>
            <span
              className={`text-[11px] leading-snug ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              選んだ年代に合わせて、支出予算の初期値が変わります。
            </span>
          </div>
        </div>

        {/* 人数選択 */}
        <div className="space-y-1.5">
          <label
            className={`block text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            収入を入力する人数
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <select
              value={memberCount}
              onChange={(e) =>
                onMemberCountChange(
                  Math.min(6, Math.max(1, Number(e.target.value) || 1))
                )
              }
              className="
                border rounded-full w-full sm:w-auto
                px-3 py-1.5 text-xs
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
              style={{
                backgroundColor: isDark ? "#0f172a" : "white",
                color: isDark ? "#e2e8f0" : "#334155",
                borderColor: isDark ? "#475569" : "#e2e8f0",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}人
                </option>
              ))}
            </select>
            <span
              className={`text-[11px] leading-snug ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              夫婦＋子どもなど、収入がある人の人数を選んでください。
            </span>
          </div>
        </div>

        {/* メンバーごとの入力 */}
        <div className="space-y-2">
          {incomeMembers.map((member, idx) => {
            const amount = Number(member.value || "0") || 0;
            const share = totalIncome > 0 ? (amount / totalIncome) * 100 : null;

            return (
              <div
                key={idx}
                className="rounded-2xl border px-3 py-3 lg:px-4 lg:py-3 space-y-2"
                style={{
                  borderColor: isDark ? "#475569" : "#e2e8f0",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  color: isDark ? "#e2e8f0" : "#0f172a",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      メンバー{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => onMemberNameChange(idx, e.target.value)}
                      placeholder={idx === 0 ? "本人" : `メンバー${idx + 1}`}
                      className="
                        border rounded-full
                        px-3 py-1.5 text-xs
                        focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                        min-w-[120px]
                      "
                      style={{
                        backgroundColor: isDark ? "#0f172a" : "white",
                        color: isDark ? "#e2e8f0" : "#334155",
                        borderColor: isDark ? "#475569" : "#e2e8f0",
                      }}
                    />
                  </div>
                  {share !== null && (
                    <p
                      className={`text-[11px] sm:text-right ${
                        isDark ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      収入の割合:{" "}
                      <span
                        className={`font-semibold ${
                          isDark ? "text-emerald-200" : "text-emerald-700"
                        }`}
                      >
                        {share.toFixed(1)}%
                      </span>
                    </p>
                  )}
                </div>

                <NumberInput
                  label="収入（手取り／月・半角数字）"
                  value={member.value}
                  onChange={(v) => onMemberValueChange(idx, v)}
                  placeholder="例: 200000"
                  isDark={isDark}
                />
              </div>
            );
          })}
        </div>

        <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          収入合計:{" "}
          <span
            className={`font-semibold ${
              isDark ? "text-slate-50" : "text-slate-900"
            }`}
          >
            ¥{totalIncome.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
}
