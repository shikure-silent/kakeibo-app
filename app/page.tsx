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
import { useCloudAutoSaveOnLeave } from "../lib/useCloudAutoSaveOnLeave";
import { useSupabaseAuth } from "../lib/useSupabaseAuth";

import SavingHighlightCard from "../components/home/SavingHighlightCard";
import IncomeSettingsCard, {
  IncomeMember,
} from "../components/home/IncomeSettingsCard";
import BudgetSettingsCard from "../components/home/BudgetSettingsCard";
import { CustomExpenseItem } from "../types/budget";
import { HomePageView } from "../components/home/HomePageView";

type HomeMode = "setup" | "dashboard";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  const tail = local.length >= 3 ? local.slice(-1) : "";
  return `${head}${"*".repeat(
    Math.max(1, local.length - (head.length + tail.length))
  )}${tail}@${domain}`;
}

export default function HomePage() {
  const router = useRouter();
  useCloudAutoSaveOnLeave();
  const { user } = useSupabaseAuth();

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
  const [lastAddedCustomItemId, setLastAddedCustomItemId] = useState<
    string | null
  >(null);
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<string[]>(
    [...EXPENSE_CATEGORIES]
  );
  const [copiedCustomFromPrev, setCopiedCustomFromPrev] = useState(false);
  const [copiedDefaultsFromPrev, setCopiedDefaultsFromPrev] = useState(false);

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
          p.incomeMembers.map((m, index) => ({
            name:
              index === 0 && displayName
                ? displayName
                : (m.name ?? ""),
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

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.email ? maskEmail(user.email) : "");

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

  useEffect(() => {
    if (!user || !displayName) return;
    setIncomeMembers((prev) => {
      if (!prev[0]) return prev;
      if (prev[0].name === displayName) return prev;
      const next = [...prev];
      next[0] = { ...next[0], name: displayName };
      return next;
    });
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
      if (
        !parsed.planningState ||
        !Array.isArray(parsed.planningState.incomeMembers) ||
        parsed.planningState.incomeMembers.length === 0
      ) {
        return;
      }
      const nextMembers = parsed.planningState.incomeMembers.map(
        (member, index) =>
          index === 0 ? { ...member, name: displayName } : member
      );
      window.localStorage.setItem(
        key,
        JSON.stringify({
          ...parsed,
          planningState: {
            ...parsed.planningState,
            incomeMembers: nextMembers,
          },
        })
      );
    } catch {
      // noop
    }
  }, [user, displayName]);

  const themeClass = getThemeClasses(settings.theme);

  const handleToggleCopyCustomFromPrevious = () => {
    setSettings((prev) => {
      const nextValue = !(prev.copyCustomExpenseFromPrevious ?? true);
      const nextSettings = {
        ...prev,
        copyCustomExpenseFromPrevious: nextValue,
      };
      saveAppSettings(nextSettings);
      return nextSettings;
    });
  };

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
    const id = `custom-${Date.now()}-${customExpenseItems.length + 1}`;
    setCustomExpenseItems((prev) => [
      ...prev,
      {
        id,
        label: "",
        value: "",
      },
    ]);
    setLastAddedCustomItemId(id);
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

  // デフォルト8項目を前月からコピー（自動更新オンの項目のみ）
  useEffect(() => {
    if (copiedDefaultsFromPrev) return;
    if (homeMode !== "setup") return;
    if (typeof window === "undefined") return;

    const autoMap = getAutoUpdateCategories(settings);

    // 前月のキーを取得
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth(); // 前月 (0-index)
    if (month === 0) {
      year -= 1;
      month = 12;
    }
    const key = buildBudgetKey(year, month);

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        planningState?: {
          expenseInputs?: Record<keyof ExpenseMedian, string>;
        };
      };
      const prevInputs = parsed.planningState?.expenseInputs;
      if (!prevInputs) return;

      setExpenseInputs((prev) => {
        const next = { ...prev };
        (Object.keys(prevInputs) as (keyof ExpenseMedian)[]).forEach((k) => {
          if (autoMap[k]) {
            const val = prevInputs[k];
            if (typeof val === "string") {
              next[k] = val;
            }
          }
        });
        return next;
      });
      setCopiedDefaultsFromPrev(true);
    } catch {
      // noop
    }
  }, [
    copiedDefaultsFromPrev,
    homeMode,
    settings,
  ]);

  // カスタム項目を前月からコピー（設定がオンかつ未コピーのとき）
  useEffect(() => {
    if (copiedCustomFromPrev) return;
    if (!(settings.copyCustomExpenseFromPrevious ?? true)) return;
    if (customExpenseItems.length > 0) return;
    if (homeMode !== "setup") return;
    if (typeof window === "undefined") return;

    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth(); // 前月 (0-index)
    if (month === 0) {
      year -= 1;
      month = 12;
    }
    const key = buildBudgetKey(year, month);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        planningState?: {
          customExpenseItems?: CustomExpenseItem[];
        };
      };
      const prevItems = parsed.planningState?.customExpenseItems;
      if (!Array.isArray(prevItems) || prevItems.length === 0) return;

      const mapped = prevItems.map((item, idx) => ({
        id: item.id ?? `copied-${idx}`,
        label: item.label ?? "",
        value: item.value ?? "",
      }));
      setCustomExpenseItems(mapped);
      setCopiedCustomFromPrev(true);
    } catch {
      // noop
    }
  }, [
    copiedCustomFromPrev,
    customExpenseItems.length,
    homeMode,
    settings.copyCustomExpenseFromPrevious,
  ]);

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
      copyCustomFromPrevious={settings.copyCustomExpenseFromPrevious ?? true}
      onToggleCopyCustomFromPrevious={handleToggleCopyCustomFromPrevious}
      lastAddedCustomItemId={lastAddedCustomItemId}
    />
  );
}
