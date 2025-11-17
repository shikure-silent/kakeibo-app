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
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm lg:text-base font-semibold text-slate-800">
          収入の設定
        </h2>
        <p className="text-[11px] text-slate-400">
          世帯のメンバーごとの毎月の手取り収入を入力してください。
        </p>
      </div>

      <div className="space-y-3">
        {/* 年代選択 */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-600">
            世帯主の年代（全国×年代別の参考データを使用）
          </label>
          <div className="inline-flex items-center gap-2">
            <select
              value={ageGroup}
              onChange={(e) => onAgeGroupChange(e.target.value as AgeGroup)}
              className="
                border border-slate-200 rounded-full
                px-3 py-1.5 text-xs text-slate-700
                bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
            >
              {(Object.keys(ageGroupLabels) as AgeGroup[]).map((key) => (
                <option key={key} value={key}>
                  {ageGroupLabels[key]}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">
              選んだ年代に合わせて、支出予算の初期値が変わります。
            </span>
          </div>
        </div>

        {/* 人数選択 */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-600">
            収入を入力する人数
          </label>
          <div className="inline-flex items-center gap-2">
            <select
              value={memberCount}
              onChange={(e) =>
                onMemberCountChange(
                  Math.min(6, Math.max(1, Number(e.target.value) || 1))
                )
              }
              className="
                border border-slate-200 rounded-full
                px-3 py-1.5 text-xs text-slate-700
                bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}人
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">
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
                className="
                  rounded-2xl border border-slate-100 bg-slate-50
                  px-3 py-3 lg:px-4 lg:py-3
                  space-y-2
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      メンバー{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => onMemberNameChange(idx, e.target.value)}
                      placeholder={idx === 0 ? "本人" : `メンバー${idx + 1}`}
                      className="
                        border border-slate-200 rounded-full
                        px-3 py-1.5 text-xs text-slate-700
                        bg-white
                        focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                        min-w-[120px]
                      "
                    />
                  </div>
                  {share !== null && (
                    <p className="text-[11px] text-slate-500 sm:text-right">
                      収入の割合:{" "}
                      <span className="font-semibold text-emerald-700">
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
                />
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500">
          収入合計:{" "}
          <span className="font-semibold text-slate-900">
            ¥{totalIncome.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
}
