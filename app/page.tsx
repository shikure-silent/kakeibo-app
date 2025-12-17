"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseMedian } from "../data/prefectureData";
import {
  AgeGroup,
  ageGroupLabels,
  ageGroupMedians,
} from "../data/ageGroupData";
import { buildBudgetKey, EXPENSE_CATEGORIES } from "../lib/const";
import {
  buildExpenseInputs,
  FixedExpenseKey,
  loadFixedExpenses,
  saveFixedExpense,
  isHomeCycleConfirmed,
  saveHomeCycleConfirmed,
} from "../lib/homeStorage";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  getThemeClasses,
  getAutoUpdateCategories,
  saveAppSettings,
  loadExpenseCategories,
} from "../lib/settingsStorage";

import SavingHighlightCard from "../components/home/SavingHighlightCard";
import IncomeSettingsCard, {
  IncomeMember,
} from "../components/home/IncomeSettingsCard";
import BudgetSettingsCard from "../components/home/BudgetSettingsCard";
import { CustomExpenseItem } from "../types/budget";
import { HomePageView } from "../components/home/HomePageView";

type HomeMode = "setup" | "dashboard";

export default function HomePage() {
  const router = useRouter();

  // アプリ全体設定（テーマ・オート更新カテゴリ・貯金サポート設定など）
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // ホーム画面のモード：初期はセットアップモード
  const [homeMode, setHomeMode] = useState<HomeMode>("setup");

  // 年代（全国×年代別のデフォルト予算に使う）
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("all");

  // デフォルト8項目ぶんの支出予算（年代別データ＋固定費上書き）
  const [expenseInputs, setExpenseInputs] = useState<
    Record<keyof ExpenseMedian, string>
  >(() => buildExpenseInputs("all"));

  // カスタム支出項目
  const [customExpenseItems, setCustomExpenseItems] = useState<
    CustomExpenseItem[]
  >([]);
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<string[]>(
    [...EXPENSE_CATEGORIES]
  );

  // 収入：人数＋メンバーごとの収入
  const [memberCount, setMemberCount] = useState<number>(1);
  const [incomeMembers, setIncomeMembers] = useState<IncomeMember[]>([
    { name: "本人", value: "" },
  ]);

  // 「この予算でスタート」前の確認モーダル
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  type ConfirmedBudgetItem = {
    label: string;
    amount: number;
  };

  type ConfirmedBudget = {
    year: number;
    month: number;
    totalIncome: number;
    totalBudget: number;
    saving: number;
    items: ConfirmedBudgetItem[];
  };

  type PlanningState = {
    ageGroup: AgeGroup;
    memberCount: number;
    incomeMembers: IncomeMember[];
    expenseInputs: Record<keyof ExpenseMedian, string>;
    customExpenseItems: CustomExpenseItem[];
  };

  // 保存しておいた計画状態をフォームに復元する
  const restorePlanningFromStorage = () => {
    if (typeof window === "undefined") return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const key = buildBudgetKey(year, month);

    const raw = window.localStorage.getItem(key);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        planningState?: PlanningState;
      };

      if (!parsed.planningState) return;
      const p = parsed.planningState;

      // 年代
      if (p.ageGroup) {
        setAgeGroup(p.ageGroup);
      }

      // メンバーと収入
      if (Array.isArray(p.incomeMembers) && p.incomeMembers.length > 0) {
        setIncomeMembers(
          p.incomeMembers.map((m) => ({
            name: m.name ?? "",
            value: m.value ?? "",
          }))
        );
        if (typeof p.memberCount === "number" && p.memberCount > 0) {
          setMemberCount(p.memberCount);
        } else {
          setMemberCount(p.incomeMembers.length);
        }
      }

      // 支出予算（8項目）
      if (p.expenseInputs) {
        setExpenseInputs((prev) => ({
          ...prev,
          ...p.expenseInputs,
        }));
      }

      // カスタム項目
      if (Array.isArray(p.customExpenseItems)) {
        setCustomExpenseItems(
          p.customExpenseItems.map((item, index) => ({
            id: item.id ?? `restored-${index}`,
            label: item.label ?? "",
            value: item.value ?? "",
          }))
        );
      }
    } catch (e) {
      console.error("ホームの計画復元に失敗しました", e);
    }
  };

  const [confirmedBudget, setConfirmedBudget] =
    useState<ConfirmedBudget | null>(null);

  // 初回マウント時に設定と「今サイクルが確定済みか」を読み込み
  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);
    setExpenseCategoryOptions(loadExpenseCategories([...EXPENSE_CATEGORIES]));

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (isHomeCycleConfirmed(year, month)) {
      setHomeMode("dashboard");
      restorePlanningFromStorage();

      if (typeof window !== "undefined") {
        try {
          const key = buildBudgetKey(year, month);
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as {
              year?: number;
              month?: number;
              totalIncome?: number;
              totalBudget?: number;
              saving?: number;
              items?: { label: string; amount: number }[];
            };

            const totalIncome =
              typeof parsed.totalIncome === "number" ? parsed.totalIncome : 0;
            const totalBudget =
              typeof parsed.totalBudget === "number" ? parsed.totalBudget : 0;

            setConfirmedBudget({
              year: parsed.year ?? year,
              month: parsed.month ?? month,
              totalIncome,
              totalBudget,
              saving:
                typeof parsed.saving === "number"
                  ? parsed.saving
                  : totalIncome - totalBudget,
              items: Array.isArray(parsed.items)
                ? parsed.items.map((item) => ({
                    label: item.label,
                    amount: typeof item.amount === "number" ? item.amount : 0,
                  }))
                : [],
            });
          }
        } catch (e) {
          console.error("ホームの確定予算読み込みに失敗しました", e);
        }
      }
    } else {
      setHomeMode("setup");
      setConfirmedBudget(null);
    }
  }, []);

  const themeClass = getThemeClasses(settings.theme);

  // 年代が変わったら、その年代の全国値をベースに支出予算をリセット
  // ＋ 家賃・サブスクは固定費ストアで上書き
  useEffect(() => {
    const baseInputs = buildExpenseInputs(ageGroup);
    const autoMap = getAutoUpdateCategories(settings);
    const fixed = loadFixedExpenses();

    setExpenseInputs((prev) => {
      const next = { ...prev };

      (Object.keys(baseInputs) as (keyof ExpenseMedian)[]).forEach((key) => {
        if (autoMap[key]) {
          next[key] = baseInputs[key];
        }
      });

      if (autoMap.rent && typeof fixed.rent === "number") {
        next.rent = String(fixed.rent);
      }
      if (autoMap.subscription && typeof fixed.subscription === "number") {
        next.subscription = String(fixed.subscription);
      }

      return next;
    });
    // カスタム項目は「自分で決める部分」なのでそのまま維持
  }, [ageGroup]);

  // 初回マウント時に固定費を反映（SSRとの不一致を避けるため）
  useEffect(() => {
    const fixed = loadFixedExpenses();
    if (Object.keys(fixed).length === 0) return;
    const autoMap = getAutoUpdateCategories(settings);

    setExpenseInputs((prev) => {
      const next = { ...prev };
      if (autoMap.rent && typeof fixed.rent === "number") {
        next.rent = String(fixed.rent);
      }
      if (autoMap.subscription && typeof fixed.subscription === "number") {
        next.subscription = String(fixed.subscription);
      }
      return next;
    });
  }, [settings]);

  // 人数変更 → メンバー配列を増減
  useEffect(() => {
    setIncomeMembers((prev) => {
      if (memberCount > prev.length) {
        const newMembers = [...prev];
        for (let i = prev.length; i < memberCount; i++) {
          newMembers.push({
            name: `メンバー${i + 1}`,
            value: "",
          });
        }
        return newMembers;
      }
      if (memberCount < prev.length) {
        return prev.slice(0, memberCount);
      }
      return prev;
    });
  }, [memberCount]);

  // デフォルト8項目の入力変更（家賃・サブスクは固定費保存）
  const handleExpenseChange = (k: keyof ExpenseMedian, v: string) => {
    setExpenseInputs((prev) => ({ ...prev, [k]: v }));

    if (k === "rent" || k === "subscription") {
      const num = Number(v || "0");
      const safe = Number.isNaN(num) ? 0 : num;
      saveFixedExpense(k as FixedExpenseKey, safe);
    }
  };

  // カスタム支出項目：追加
  const handleAddCustomExpenseItem = () => {
    setCustomExpenseItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}-${prev.length + 1}`,
        label: "",
        value: "",
      },
    ]);
  };

  // カスタム支出項目：ラベル変更
  const handleCustomExpenseLabelChange = (id: string, label: string) => {
    setCustomExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  // カスタム支出項目：金額変更
  const handleCustomExpenseValueChange = (id: string, value: string) => {
    setCustomExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  // カスタム支出項目：削除
  const handleRemoveCustomExpenseItem = (id: string) => {
    setCustomExpenseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAgeGroupChange = (next: AgeGroup) => {
    setAgeGroup(next);
  };

  // 年代に応じた中央値を取得
  const medianForAge = ageGroupMedians[ageGroup];
  const autoUpdateMap = getAutoUpdateCategories(settings);

  const handleMemberCountChange = (count: number) => {
    setMemberCount(count);
  };

  const handleMemberNameChange = (index: number, name: string) => {
    setIncomeMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name };
      return next;
    });
  };

  const handleMemberValueChange = (index: number, value: string) => {
    setIncomeMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };

  const toggleAutoUpdateCategory = (key: keyof ExpenseMedian) => {
    setSettings((prev) => {
      const current = getAutoUpdateCategories(prev);
      const nextAuto = { ...current, [key]: !current[key] };
      const nextSettings = { ...prev, autoUpdateCategories: nextAuto };
      saveAppSettings(nextSettings);
      return nextSettings;
    });
  };

  // デフォルト8項目の数値
  const expenseNumbers: ExpenseMedian = {
    food: Number(expenseInputs.food) || 0,
    utilities: Number(expenseInputs.utilities) || 0,
    dailyGoods: Number(expenseInputs.dailyGoods) || 0,
    rent: Number(expenseInputs.rent) || 0,
    transport: Number(expenseInputs.transport) || 0,
    subscription: Number(expenseInputs.subscription) || 0,
    entertainment: Number(expenseInputs.entertainment) || 0,
    medicalInsurance: Number(expenseInputs.medicalInsurance) || 0,
  };

  // カスタム項目ぶんの支出合計
  const customExpensesTotal = customExpenseItems.reduce((sum, item) => {
    const n = Number(item.value || "0");
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  // 支出予算トータル = デフォルト8項目 + カスタム項目
  const totalExpense =
    Object.values(expenseNumbers).reduce((sum, v) => sum + v, 0) +
    customExpensesTotal;

  // 収入合計
  const totalIncome = incomeMembers.reduce((sum, m) => {
    const v = Number(m.value || "0");
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  const saving = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? (saving / totalIncome) * 100 : null;

  // セットアップ時の計算結果
  const rawSaving = totalIncome - totalExpense;
  const rawSavingRate =
    totalIncome > 0 ? (rawSaving / totalIncome) * 100 : null;

  // ダッシュボード表示用の値（確定済みデータがあればそっちを優先）
  const displayTotalIncome =
    homeMode === "dashboard" && confirmedBudget
      ? confirmedBudget.totalIncome
      : totalIncome;

  const displayTotalExpense =
    homeMode === "dashboard" && confirmedBudget
      ? confirmedBudget.totalBudget
      : totalExpense;

  const displaySaving =
    homeMode === "dashboard" && confirmedBudget
      ? confirmedBudget.saving
      : rawSaving;

  const displaySavingRate =
    displayTotalIncome > 0 ? (displaySaving / displayTotalIncome) * 100 : null;

  // 設定から貯金目標（0.1 = 10%）とメンタルサポート設定を取得
  const targetSavingRatePercent =
    settings.targetSavingRate != null ? settings.targetSavingRate * 100 : null;

  const enableEncouragingMessages = settings.enableEncouragingMessages ?? true;

  // 「この予算でスタート」クリック時 → まず確認モーダルを開く
  const handleOpenConfirmModal = () => {
    setIsConfirmOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmOpen(false);
  };

  // モーダルで「カレンダーへ進む」押下 → 実際に保存して遷移
  const handleConfirmStart = () => {
    if (typeof window === "undefined") return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const key = buildBudgetKey(year, month);

    const detailItems = [
      { label: "食費", amount: expenseNumbers.food },
      { label: "水道・光熱費", amount: expenseNumbers.utilities },
      { label: "日用品", amount: expenseNumbers.dailyGoods },
      { label: "家賃・住居", amount: expenseNumbers.rent },
      { label: "交通費", amount: expenseNumbers.transport },
      { label: "サブスク", amount: expenseNumbers.subscription },
      {
        label: "娯楽費（趣味娯楽）",
        amount: expenseNumbers.entertainment,
      },
      {
        label: "医療・保険",
        amount: expenseNumbers.medicalInsurance,
      },
      ...customExpenseItems.map((item) => ({
        label: item.label || "カスタム項目",
        amount: Number(item.value || "0") || 0,
      })),
    ];

    window.localStorage.setItem(
      key,
      JSON.stringify({
        year,
        month,
        totalBudget: totalExpense,
        items: detailItems,
        totalIncome,
        saving,
        planningState: {
          ageGroup,
          memberCount,
          incomeMembers, // メンバー名＋金額
          expenseInputs, // 食費〜医療・保険の8項目ぶん
          customExpenseItems, // カスタム項目ぶん
        }, // ★ ここに「フォームの状態」も一緒に保存
      })
    );

    // このサイクルが「計画確定済み」であることを保存
    saveHomeCycleConfirmed(year, month, true);

    setIsConfirmOpen(false);
    router.push("/calendar");
  };

  const handleEditPlan = () => {
    // まず現在サイクルの計画をフォームに復元
    restorePlanningFromStorage();
    // その上でセットアップモードに戻す
    setHomeMode("setup");
  };

  return (
    <HomePageView
      themeClass={themeClass}
      homeMode={homeMode}
      ageGroup={ageGroup}
      medianForAge={medianForAge}
      expenseInputs={expenseInputs}
      onExpenseChange={handleExpenseChange}
      customExpenseItems={customExpenseItems}
      onAddCustomExpenseItem={handleAddCustomExpenseItem}
      onChangeCustomExpenseLabel={handleCustomExpenseLabelChange}
      onChangeCustomExpenseAmount={handleCustomExpenseValueChange}
      onRemoveCustomExpenseItem={handleRemoveCustomExpenseItem}
      autoUpdateMap={autoUpdateMap}
      onToggleAutoUpdateCategory={toggleAutoUpdateCategory}
      onRequestEditPlan={handleEditPlan}
      onStart={handleOpenConfirmModal}
      totalExpense={totalExpense}
      displayTotalExpense={displayTotalExpense}
      displayTotalIncome={displayTotalIncome}
      displaySaving={displaySaving}
      displaySavingRate={displaySavingRate}
      incomeMembers={incomeMembers}
      memberCount={memberCount}
      onMemberCountChange={handleMemberCountChange}
      onMemberNameChange={handleMemberNameChange}
      onMemberValueChange={handleMemberValueChange}
      onAgeGroupChange={handleAgeGroupChange}
      confirmedItems={confirmedBudget?.items ?? null}
      isConfirmOpen={isConfirmOpen}
      onCloseConfirmModal={handleCloseConfirmModal}
      onConfirmStart={handleConfirmStart}
      saving={saving}
      savingRate={savingRate}
      customTemplates={expenseCategoryOptions}
    />
  );
}
