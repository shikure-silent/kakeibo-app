"use client";

import React from "react";
import { AgeGroup, ageGroupLabels } from "../../data/ageGroupData";
import { ExpenseMedian } from "../../data/prefectureData";
import { CustomExpenseItem } from "../../types/budget";
import SavingHighlightCard from "./SavingHighlightCard";
import IncomeSettingsCard, { IncomeMember } from "./IncomeSettingsCard";
import BudgetSettingsCard from "./BudgetSettingsCard";

type HomeMode = "setup" | "dashboard";

type Props = {
  themeClass: string;
  homeMode: HomeMode;
  ageGroup: AgeGroup;
  medianForAge: ExpenseMedian;
  expenseInputs: Record<keyof ExpenseMedian, string>;
  onExpenseChange: (k: keyof ExpenseMedian, v: string) => void;
  customExpenseItems: CustomExpenseItem[];
  onAddCustomExpenseItem: () => void;
  onChangeCustomExpenseLabel: (id: string, label: string) => void;
  onChangeCustomExpenseAmount: (id: string, value: string) => void;
  onRemoveCustomExpenseItem: (id: string) => void;
  autoUpdateMap: Record<keyof ExpenseMedian, boolean>;
  onToggleAutoUpdateCategory: (key: keyof ExpenseMedian) => void;
  onRequestEditPlan: () => void;
  onStart?: () => void;
  totalExpense: number;
  displayTotalExpense: number;
  displayTotalIncome: number;
  displaySaving: number;
  displaySavingRate: number | null;
  incomeMembers: IncomeMember[];
  memberCount: number;
  onMemberCountChange: (count: number) => void;
  onMemberNameChange: (index: number, name: string) => void;
  onMemberValueChange: (index: number, value: string) => void;
  onAgeGroupChange: (age: AgeGroup) => void;
  confirmedItems: { label: string; amount: number }[] | null;
  isConfirmOpen: boolean;
  onCloseConfirmModal: () => void;
  onConfirmStart: () => void;
  saving: number;
  savingRate: number | null;
  customTemplates: string[];
  copyCustomFromPrevious?: boolean;
  onToggleCopyCustomFromPrevious?: () => void;
  lastAddedCustomItemId?: string | null;
};

export function HomePageView({
  themeClass,
  homeMode,
  ageGroup,
  medianForAge,
  expenseInputs,
  onExpenseChange,
  customExpenseItems,
  onAddCustomExpenseItem,
  onChangeCustomExpenseLabel,
  onChangeCustomExpenseAmount,
  onRemoveCustomExpenseItem,
  autoUpdateMap,
  onToggleAutoUpdateCategory,
  onRequestEditPlan,
  onStart,
  totalExpense,
  displayTotalExpense,
  displayTotalIncome,
  displaySaving,
  displaySavingRate,
  incomeMembers,
  memberCount,
  onMemberCountChange,
  onMemberNameChange,
  onMemberValueChange,
  onAgeGroupChange,
  confirmedItems,
  isConfirmOpen,
  onCloseConfirmModal,
  onConfirmStart,
  saving,
  savingRate,
  customTemplates,
  copyCustomFromPrevious = true,
  onToggleCopyCustomFromPrevious,
  lastAddedCustomItemId,
}: Props) {
  const isDark = themeClass.includes("theme-dark");

  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー */}
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            ホーム
          </h1>
          <p
            className={`text-xs lg:text-sm ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            今月の収入と支出予算を設定して、貯金の見込みを確認できます。
            カレンダーや入力タブと連動して、日々のお金の動きも管理できます。
          </p>
        </header>

        {/* 🌟 今月の貯金見込みカード */}
        <SavingHighlightCard
          totalIncome={displayTotalIncome}
          totalExpense={displayTotalExpense}
          saving={displaySaving}
          savingRate={displaySavingRate}
          ageGroupLabel={ageGroupLabels[ageGroup]}
          isDark={isDark}
        />

        {/* 左：カード群／右：説明 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <section className="lg:col-span-2 space-y-4">
            {/* 🧾 収入の設定カード */}
            <IncomeSettingsCard
              ageGroup={ageGroup}
              onAgeGroupChange={onAgeGroupChange}
              memberCount={memberCount}
              onMemberCountChange={onMemberCountChange}
              incomeMembers={incomeMembers}
              onMemberNameChange={onMemberNameChange}
              onMemberValueChange={onMemberValueChange}
              mode={homeMode}
              onRequestEdit={onRequestEditPlan}
              totalIncome={displayTotalIncome}
              isDark={isDark}
            />

            {/* 💸 支出予算カード */}
            <BudgetSettingsCard
              ageGroupLabel={ageGroupLabels[ageGroup]}
              median={medianForAge}
              inputs={expenseInputs}
              onChange={onExpenseChange}
              customItems={customExpenseItems}
              onAddCustomItem={onAddCustomExpenseItem}
              onChangeCustomItemLabel={onChangeCustomExpenseLabel}
              onChangeCustomItemAmount={onChangeCustomExpenseAmount}
              onRemoveCustomItem={onRemoveCustomExpenseItem}
              onStart={onStart}
              autoUpdateMap={autoUpdateMap}
              onToggleAutoUpdateCategory={onToggleAutoUpdateCategory}
              mode={homeMode}
              onRequestEdit={onRequestEditPlan}
              totalExpense={displayTotalExpense}
              confirmedItems={confirmedItems}
              customTemplates={customTemplates}
              isDark={isDark}
              copyCustomFromPrevious={copyCustomFromPrevious}
              onToggleCopyCustomFromPrevious={onToggleCopyCustomFromPrevious}
              lastAddedCustomItemId={lastAddedCustomItemId}
            />
          </section>

          {/* 右：使い方・説明 */}
          <aside className="space-y-4">
            <div
              className={`rounded-2xl shadow-sm border px-4 py-4 text-xs lg:text-sm space-y-2 ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-200"
                  : "bg-white border-slate-100 text-slate-700"
              }`}
            >
              <p className="font-medium">この画面でできること</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  世帯主の年代を選ぶと、その年代の全国データから8項目の支出予算の初期値が設定されます。
                </li>
                <li>
                  世帯のメンバーごとの収入と支出予算を設定すると、「今月の貯金見込み」が自動計算されます。
                </li>
                <li>
                  家賃・サブスクなどの固定費は、一度入力すると毎月自動で反映されます。
                </li>
                <li>
                  娯楽費や医療・保険も年代別の目安を出しつつ、自分に合わせて調整できます。
                </li>
                <li>
                  その他の項目は「カスタム項目」として追加・削除できます。
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ⭐ スタート前の確認モーダル */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-lg p-5 space-y-4">
            {/* ✖︎ ボタン */}
            <button
              type="button"
              onClick={onCloseConfirmModal}
              aria-label="閉じる"
              className="
                absolute top-2.5 right-2.5
                text-slate-400 hover:text-slate-600
                text-lg leading-none
              "
            >
              ×
            </button>

            <h2 className="text-sm lg:text-base font-semibold text-slate-900">
              この予算でスタートしますか？
            </h2>
            <p className="text-sm text-slate-700">
              今の設定だと、
              <span className="font-semibold">
                {" "}
                今月の貯金見込みは{" "}
                <span
                  className={saving >= 0 ? "text-emerald-600" : "text-red-500"}
                >
                  ¥{Math.abs(saving).toLocaleString()}
                </span>
              </span>
              {saving >= 0
                ? " です。一緒に貯金をがんばりましょう！"
                : " の赤字になりそうです。予算を見直してからスタートしてもOKです。"}
            </p>
            {savingRate !== null && (
              <p className="text-xs text-slate-500">
                貯金率の目安:{" "}
                <span
                  className={
                    saving >= 0
                      ? "text-emerald-600 font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {savingRate.toFixed(1)}%
                </span>
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCloseConfirmModal}
                className="
                  px-3 py-1.5 rounded-full
                  text-[11px] font-medium
                  text-slate-600 bg-slate-100
                  hover:bg-slate-200
                "
              >
                あとで変更する
              </button>
              <button
                type="button"
                onClick={onConfirmStart}
                className="
                  px-4 py-1.5 rounded-full
                  text-[11px] font-semibold
                  bg-emerald-600 text-white
                  hover:bg-emerald-700
                "
              >
                カレンダーへ進む
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
