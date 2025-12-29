"use client";

import React from "react";
import { AgeGroup, ageGroupLabels } from "../../data/ageGroupData";
import { ExpenseMedian } from "../../data/prefectureData";
import { CustomExpenseItem } from "../../types/budget";
import NumberInput from "../NumberInput";
import ExpenseInputsBlock from "../ExpenseInputsBlock";

type IncomeMember = {
  name: string;
  value: string;
};

type Props = {
  entryMode?: "full" | "income" | "budget";
  step: number;
  onStepChange: (step: number) => void;
  onStartOver: () => void;
  onConfirmStart: () => void;
  ageGroup: AgeGroup;
  onAgeGroupChange: (age: AgeGroup) => void;
  memberCount: number;
  onMemberCountChange: (count: number) => void;
  incomeMembers: IncomeMember[];
  onMemberNameChange: (index: number, name: string) => void;
  onMemberValueChange: (index: number, value: string) => void;
  expenseInputs: Record<keyof ExpenseMedian, string>;
  onExpenseChange: (key: keyof ExpenseMedian, value: string) => void;
  medianForAge: ExpenseMedian;
  customExpenseItems: CustomExpenseItem[];
  onAddCustomExpenseItem: () => void;
  onChangeCustomExpenseLabel: (id: string, label: string) => void;
  onChangeCustomExpenseAmount: (id: string, value: string) => void;
  onRemoveCustomExpenseItem: (id: string) => void;
  autoUpdateMap: Record<keyof ExpenseMedian, boolean>;
  onToggleAutoUpdateCategory: (key: keyof ExpenseMedian) => void;
  totalIncome: number;
  totalExpense: number;
  saving: number;
  savingRate: number | null;
  customTemplates?: string[];
  copyCustomFromPrevious?: boolean;
  onToggleCopyCustomFromPrevious?: () => void;
  lastAddedCustomItemId?: string | null;
  isDark?: boolean;
};

const MAX_STEP = 4;
const memberCountOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export default function HomeSetupWizard({
  entryMode = "full",
  step,
  onStepChange,
  onStartOver,
  onConfirmStart,
  ageGroup,
  onAgeGroupChange,
  memberCount,
  onMemberCountChange,
  incomeMembers,
  onMemberNameChange,
  onMemberValueChange,
  expenseInputs,
  onExpenseChange,
  medianForAge,
  customExpenseItems,
  onAddCustomExpenseItem,
  onChangeCustomExpenseLabel,
  onChangeCustomExpenseAmount,
  onRemoveCustomExpenseItem,
  autoUpdateMap,
  onToggleAutoUpdateCategory,
  totalIncome,
  totalExpense,
  saving,
  savingRate,
  customTemplates,
  copyCustomFromPrevious = true,
  onToggleCopyCustomFromPrevious,
  lastAddedCustomItemId,
  isDark = false,
}: Props) {
  const clampedStep = Math.min(Math.max(step, 1), MAX_STEP);
  const visibleMembers = incomeMembers.slice(0, Math.max(memberCount, 1));
  const isIncomeOnly = entryMode === "income";

  const handlePrev = () => {
    if (isIncomeOnly && clampedStep === 4) {
      onStepChange(2);
      return;
    }
    onStepChange(Math.max(1, clampedStep - 1));
  };

  const handleNext = () => {
    if (isIncomeOnly && clampedStep === 2) {
      onStepChange(4);
      return;
    }
    onStepChange(Math.min(MAX_STEP, clampedStep + 1));
  };

  const showSummary = clampedStep > 1;
  const warningAgeUnselected = ageGroup === "all";
  const warningIncomeZero = totalIncome === 0;
  const warningBudgetZero = totalExpense === 0;

  return (
    <section
      className={`rounded-3xl border shadow-sm px-4 py-5 lg:px-6 lg:py-6 space-y-5 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <p className={isDark ? "text-slate-200" : "text-slate-600"}>
            ステップ {clampedStep}/{MAX_STEP}
          </p>
          <button
            type="button"
            onClick={onStartOver}
            className={`text-[11px] underline ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            最初からやり直す
          </button>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-400"
            style={{ width: `${(clampedStep / MAX_STEP) * 100}%` }}
          />
        </div>
      </div>

      {showSummary && (
        <div
          className={`rounded-2xl border px-4 py-3 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
            isDark
              ? "border-slate-700 bg-slate-800 text-slate-200"
              : "border-slate-100 bg-slate-50 text-slate-600"
          }`}
        >
          <div className="space-y-1">
            <p>
              世帯主の年代:{" "}
              <span className="font-semibold">{ageGroupLabels[ageGroup]}</span>
            </p>
            <p>
              収入入力人数:{" "}
              <span className="font-semibold">{memberCount}人</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStepChange(1)}
            className={`text-[11px] font-medium underline ${
              isDark ? "text-emerald-200" : "text-emerald-700"
            }`}
          >
            人数/年代を変える
          </button>
        </div>
      )}

      {clampedStep === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm lg:text-base font-semibold">
              世帯の基本情報
            </h2>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              収入入力人数と年代を先に決めておくと、後の入力がスムーズになります。
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              className={`block text-[11px] font-medium ${
                isDark ? "text-slate-200" : "text-slate-600"
              }`}
            >
              世帯主の年代（任意）
            </label>
            <select
              value={ageGroup}
              onChange={(e) => onAgeGroupChange(e.target.value as AgeGroup)}
              className="
                border rounded-full w-full sm:w-auto
                px-3 py-2 text-xs
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
          </div>

          {warningAgeUnselected && (
            <p className="text-[11px] text-amber-600">
              年代を選ぶと予算の初期値がより自然になります（未選択でもOK）。
            </p>
          )}

          <div className="space-y-1.5">
            <label
              className={`block text-[11px] font-medium ${
                isDark ? "text-slate-200" : "text-slate-600"
              }`}
            >
              収入を入力する人数
            </label>
            <select
              value={memberCount}
              onChange={(e) =>
                onMemberCountChange(
                  Math.min(10, Math.max(1, Number(e.target.value) || 1))
                )
              }
              className="
                border rounded-full w-full sm:w-auto
                px-3 py-2 text-xs
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
              style={{
                backgroundColor: isDark ? "#0f172a" : "white",
                color: isDark ? "#e2e8f0" : "#334155",
                borderColor: isDark ? "#475569" : "#e2e8f0",
              }}
            >
              {memberCountOptions.map((n) => (
                <option key={n} value={n}>
                  {n}人
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {clampedStep === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm lg:text-base font-semibold">収入入力</h2>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              世帯のメンバーごとの毎月の手取り収入を入力してください。
            </p>
          </div>

          <div className="space-y-3">
            {visibleMembers.map((member, index) => (
              <div
                key={`member-${index}`}
                className={`rounded-2xl border px-4 py-3 space-y-2 ${
                  isDark
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => onMemberNameChange(index, e.target.value)}
                    placeholder={`メンバー${index + 1}`}
                    className="
                      flex-1 rounded-xl border px-3 py-2 text-xs
                      focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
                    "
                    style={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      color: isDark ? "#e2e8f0" : "#475569",
                      borderColor: isDark ? "#475569" : "#e2e8f0",
                    }}
                  />
                  <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    名前は任意
                  </span>
                </div>
                <NumberInput
                  label="月収（手取り）"
                  value={member.value}
                  onChange={(v) => onMemberValueChange(index, v)}
                  placeholder="例: 250000"
                  isDark={isDark}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className={isDark ? "text-slate-200" : "text-slate-600"}>
              世帯収入合計
            </p>
            <p className="font-semibold">
              ¥{totalIncome.toLocaleString()}
            </p>
          </div>

          {warningIncomeZero && (
            <p className="text-[11px] text-amber-600">
              収入が0円になっています。あとで修正できるので、このまま進めます。
            </p>
          )}
        </div>
      )}

      {clampedStep === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm lg:text-base font-semibold">
              支出予算の入力
            </h2>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              カテゴリ別の予算を入力してください。固定費は次月以降も反映されます。
            </p>
          </div>

          <ExpenseInputsBlock
            median={medianForAge}
            inputs={expenseInputs}
            onChange={onExpenseChange}
            customItems={customExpenseItems}
            onAddCustomItem={onAddCustomExpenseItem}
            onChangeCustomItemLabel={onChangeCustomExpenseLabel}
            onChangeCustomItemAmount={onChangeCustomExpenseAmount}
            onRemoveCustomItem={onRemoveCustomExpenseItem}
            autoUpdateMap={autoUpdateMap}
            onToggleAutoUpdateCategory={onToggleAutoUpdateCategory}
            customTemplates={customTemplates}
            isDark={isDark}
            copyCustomFromPrevious={copyCustomFromPrevious}
            onToggleCopyCustomFromPrevious={onToggleCopyCustomFromPrevious}
            lastAddedCustomItemId={lastAddedCustomItemId}
          />

          <div className="flex items-center justify-between text-sm">
            <p className={isDark ? "text-slate-200" : "text-slate-600"}>
              予算合計
            </p>
            <p className="font-semibold text-emerald-700">
              ¥{totalExpense.toLocaleString()}
            </p>
          </div>

          {warningBudgetZero && (
            <p className="text-[11px] text-amber-600">
              予算が0円になっています。あとで修正できるので、このまま進めます。
            </p>
          )}
        </div>
      )}

      {clampedStep === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm lg:text-base font-semibold">最終確認</h2>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              収入と予算のバランスを確認して、この予算でスタートします。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`rounded-2xl border px-4 py-3 ${
                isDark
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                収入合計
              </p>
              <p className="text-sm font-semibold">¥{totalIncome.toLocaleString()}</p>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 ${
                isDark
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                予算合計
              </p>
              <p className="text-sm font-semibold text-emerald-700">
                ¥{totalExpense.toLocaleString()}
              </p>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 ${
                isDark
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                貯金見込み
              </p>
              <p
                className={`text-sm font-semibold ${
                  saving >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                ¥{Math.abs(saving).toLocaleString()}
              </p>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 ${
                isDark
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                貯金率
              </p>
              <p className="text-sm font-semibold">
                {savingRate == null ? "--" : `${savingRate.toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={clampedStep === 1}
          className={`rounded-full px-4 py-2 text-xs font-semibold border ${
            clampedStep === 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-slate-50"
          } ${isDark ? "border-slate-600 text-slate-100" : "border-slate-200 text-slate-700"}`}
        >
          前へ
        </button>
        {clampedStep < MAX_STEP ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-semibold hover:bg-emerald-700"
          >
            次へ
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirmStart}
            className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-semibold hover:bg-emerald-700"
          >
            この予算でスタート
          </button>
        )}
      </div>
    </section>
  );
}
