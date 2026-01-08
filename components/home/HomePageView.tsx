"use client";

import React from "react";
import { AgeGroup, ageGroupLabels } from "../../data/ageGroupData";
import { ExpenseMedian } from "../../data/prefectureData";
import { CustomExpenseItem } from "../../types/budget";
import SavingHighlightCard from "./SavingHighlightCard";
import IncomeSettingsCard, { IncomeMember } from "./IncomeSettingsCard";
import BudgetSettingsCard from "./BudgetSettingsCard";
import HomeSetupWizard from "./HomeSetupWizard";

type HomeMode = "setup" | "dashboard";

type Props = {
  themeClass: string;
  pageTitle: string;
  pageDescription: string;
  showSavingHighlight?: boolean;
  centerHeader?: boolean;
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
  onRequestIncomeEdit: () => void;
  onRequestBudgetEdit: () => void;
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
  customTemplates: string[];
  copyCustomFromPrevious?: boolean;
  onToggleCopyCustomFromPrevious?: () => void;
  lastAddedCustomItemId?: string | null;
  wizardEntryMode: "full" | "income" | "budget";
  wizardStep: number;
  onWizardStepChange: (step: number) => void;
  onWizardStartOver: () => void;
  onWizardConfirmStart: () => void;
  showOldDraftPrompt: boolean;
  onResumeDraft: () => void;
  onDiscardDraft: () => void;
  setupExtraContent?: React.ReactNode;
  extraSection?: React.ReactNode;
};

export function HomePageView({
  themeClass,
  pageTitle,
  pageDescription,
  showSavingHighlight = true,
  centerHeader = false,
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
  onRequestIncomeEdit,
  onRequestBudgetEdit,
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
  customTemplates,
  copyCustomFromPrevious = true,
  onToggleCopyCustomFromPrevious,
  lastAddedCustomItemId,
  wizardEntryMode,
  wizardStep,
  onWizardStepChange,
  onWizardStartOver,
  onWizardConfirmStart,
  showOldDraftPrompt,
  onResumeDraft,
  onDiscardDraft,
  setupExtraContent,
  extraSection,
}: Props) {
  const isDark = themeClass.includes("theme-dark");

  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー */}
        <header
          className={`space-y-2 ${centerHeader ? "text-center" : ""}`}
        >
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            {pageTitle}
          </h1>
          <p
            className={`text-xs lg:text-sm ${
              isDark ? "text-slate-300" : "text-slate-500"
            } ${centerHeader ? "mx-auto max-w-xl" : ""}`}
          >
            {pageDescription}
          </p>
        </header>

        {showSavingHighlight && (
          <SavingHighlightCard
            totalIncome={displayTotalIncome}
            totalExpense={displayTotalExpense}
            saving={displaySaving}
            savingRate={displaySavingRate}
            ageGroupLabel={ageGroupLabels[ageGroup]}
            isDark={isDark}
          />
        )}

        {homeMode === "setup" ? (
          <div className="space-y-4">
            {setupExtraContent}
            <HomeSetupWizard
              entryMode={wizardEntryMode}
              step={wizardStep}
              onStepChange={onWizardStepChange}
              onStartOver={onWizardStartOver}
              onConfirmStart={onWizardConfirmStart}
              ageGroup={ageGroup}
              onAgeGroupChange={onAgeGroupChange}
              memberCount={memberCount}
              onMemberCountChange={onMemberCountChange}
              incomeMembers={incomeMembers}
              onMemberNameChange={onMemberNameChange}
              onMemberValueChange={onMemberValueChange}
              expenseInputs={expenseInputs}
              onExpenseChange={onExpenseChange}
              medianForAge={medianForAge}
              customExpenseItems={customExpenseItems}
              onAddCustomExpenseItem={onAddCustomExpenseItem}
              onChangeCustomExpenseLabel={onChangeCustomExpenseLabel}
              onChangeCustomExpenseAmount={onChangeCustomExpenseAmount}
              onRemoveCustomExpenseItem={onRemoveCustomExpenseItem}
              autoUpdateMap={autoUpdateMap}
              onToggleAutoUpdateCategory={onToggleAutoUpdateCategory}
              totalIncome={displayTotalIncome}
              totalExpense={displayTotalExpense}
              saving={displaySaving}
              savingRate={displaySavingRate}
              customTemplates={customTemplates}
              copyCustomFromPrevious={copyCustomFromPrevious}
              onToggleCopyCustomFromPrevious={onToggleCopyCustomFromPrevious}
              lastAddedCustomItemId={lastAddedCustomItemId}
              isDark={isDark}
            />
          </div>
        ) : (
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
                onRequestEdit={onRequestIncomeEdit}
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
                autoUpdateMap={autoUpdateMap}
                onToggleAutoUpdateCategory={onToggleAutoUpdateCategory}
                mode={homeMode}
                onRequestEdit={onRequestBudgetEdit}
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
        )}

        {extraSection && <div className="pt-4">{extraSection}</div>}
      </div>

      {showOldDraftPrompt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-md w-full rounded-2xl shadow-lg p-5 space-y-4 bg-white text-slate-900">
            <h2 className="text-sm lg:text-base font-semibold">
              途中入力が残っています
            </h2>
            <p className="text-sm text-slate-700">
              途中入力が残っています。続きから再開しますか？
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
              <button
                type="button"
                onClick={onDiscardDraft}
                className="rounded-full border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                破棄して確定から
              </button>
              <button
                type="button"
                onClick={onResumeDraft}
                className="rounded-full bg-emerald-500 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-600"
              >
                続きから
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
