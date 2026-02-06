"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ExpenseMedian } from "../../data/prefectureData";
import { AgeGroup, ageGroupMedians } from "../../data/ageGroupData";
import { buildBudgetKey, EXPENSE_CATEGORIES } from "../../lib/const";
import { getNationalMedianForAgeGroup } from "../../lib/budgetBaseProvider";
import {
  buildExpenseInputs,
  FixedExpenseKey,
  buildUserAverageExpenseMedian,
  loadFixedExpenses,
  saveFixedExpense,
  isHomeCycleConfirmed,
  saveHomeCycleConfirmed,
  OPEN_WIZARD_STEP_KEY,
} from "../../lib/homeStorage";
import {
  HomeWizardDraft,
  HOME_WIZARD_SCHEMA_VERSION,
  clearHomeWizardDraft,
  isHomeWizardDraftOld,
  loadHomeWizardDraft,
  saveHomeWizardDraft,
} from "../../lib/homeWizardDraft";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  getAutoUpdateCategories,
  saveAppSettings,
  loadExpenseCategories,
} from "../../lib/settingsStorage";
import { useResolvedTheme } from "../../lib/useResolvedTheme";
import { useCloudAutoSaveOnLeave } from "../../lib/useCloudAutoSaveOnLeave";
import { useSupabaseAuth } from "../../lib/useSupabaseAuth";
import { CustomExpenseItem } from "../../types/budget";
import { HomePageView } from "./HomePageView";
import type { IncomeMember } from "./IncomeSettingsCard";
import RemainingBudgetCard from "./RemainingBudgetCard";

type HomeMode = "setup" | "dashboard";

type Variant = "data" | "setup";

const USER_AVERAGE_MONTHS = 3;
const USER_AVERAGE_LOOKBACK_MONTHS = 12;

const DEFAULT_BUDGET_LABEL_MAP: Record<string, keyof ExpenseMedian> = {
  食費: "food",
  "水道・光熱費": "utilities",
  日用品: "dailyGoods",
  "家賃・住居": "rent",
  交通費: "transport",
  サブスク: "subscription",
  "娯楽費（趣味娯楽）": "entertainment",
  娯楽費: "entertainment",
  "医療・保険": "medicalInsurance",
};

type Props = {
  variant: Variant;
  pageTitle: string;
  pageDescription: string;
  setupExtraContent?: React.ReactNode;
  extraSection?: React.ReactNode;
  onConfirmSetup?: () => void;
};

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  const tail = local.length >= 3 ? local.slice(-1) : "";
  return `${head}${"*".repeat(
    Math.max(1, local.length - (head.length + tail.length))
  )}${tail}@${domain}`;
}

export default function HomePageContainer({
  variant,
  pageTitle,
  pageDescription,
  setupExtraContent,
  extraSection,
  onConfirmSetup,
}: Props) {
  useCloudAutoSaveOnLeave();
  const { user } = useSupabaseAuth();

  // アプリ全体設定（テーマ・オート更新カテゴリ・貯金サポート設定など）
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // データページのモード：初期はセットアップモード
  const [homeMode, setHomeMode] = useState<HomeMode>("setup");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardEntryMode, setWizardEntryMode] = useState<
    "full" | "income" | "budget"
  >("full");
  const [pendingDraft, setPendingDraft] = useState<HomeWizardDraft | null>(
    null
  );
  const [pendingDraftStep, setPendingDraftStep] = useState<number | null>(null);
  const [showOldDraftPrompt, setShowOldDraftPrompt] = useState(false);

  // 年代（全国×年代別のデフォルト予算に使う）
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("all");

  // デフォルト8項目ぶんの支出予算（年代別データ＋固定費上書き）
  const [expenseInputs, setExpenseInputs] = useState<
    Record<keyof ExpenseMedian, string>
  >(() => buildExpenseInputs());
  const [budgetBaseMedian, setBudgetBaseMedian] = useState<ExpenseMedian>(
    ageGroupMedians.all
  );
  const [userAverageMonthsUsed, setUserAverageMonthsUsed] = useState<
    number | null
  >(null);

  // カスタム支出項目
  const [customExpenseItems, setCustomExpenseItems] = useState<
    CustomExpenseItem[]
  >([]);
  const [lastAddedCustomItemId, setLastAddedCustomItemId] = useState<
    string | null
  >(null);
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<
    string[]
  >([...EXPENSE_CATEGORIES]);
  const [copiedCustomFromPrev, setCopiedCustomFromPrev] = useState(false);
  const [copiedDefaultsFromPrev, setCopiedDefaultsFromPrev] = useState(false);

  // 収入：人数＋メンバーごとの収入
  const [memberCount, setMemberCount] = useState<number>(1);
  const [incomeMembers, setIncomeMembers] = useState<IncomeMember[]>([
    { name: "本人", value: "" },
  ]);

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

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.email ? maskEmail(user.email) : "");

  // 保存しておいた計画状態をフォームに復元する
  const restorePlanningFromStorage = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const key = buildBudgetKey(year, month);

    const raw = window.localStorage.getItem(key);
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw) as {
        planningState?: PlanningState;
      };

      if (!parsed.planningState) return false;
      const p = parsed.planningState;

      // 年代
      if (p.ageGroup) {
        setAgeGroup(p.ageGroup);
      }

      // メンバーと収入
      if (Array.isArray(p.incomeMembers) && p.incomeMembers.length > 0) {
        setIncomeMembers(
          p.incomeMembers.map((m, index) => ({
            name: index === 0 && displayName ? displayName : m.name ?? "",
            value: m.value ?? "",
          }))
        );
        if (typeof p.memberCount === "number" && p.memberCount > 0) {
          const safeCount = Math.min(10, Math.max(1, p.memberCount));
          setMemberCount(safeCount);
        } else {
          const safeCount = Math.min(10, Math.max(1, p.incomeMembers.length));
          setMemberCount(safeCount);
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
            copyFromPrevious: item.copyFromPrevious ?? false,
          }))
        );
      }
      setCopiedDefaultsFromPrev(true);
      setCopiedCustomFromPrev(true);
      return true;
    } catch (e) {
      console.error("計画の復元に失敗しました", e);
      return false;
    }
  }, [displayName]);

  const applyPlanningFromConfirmedItems = useCallback(
    (items: ConfirmedBudgetItem[] | null | undefined): boolean => {
    if (!items || items.length === 0) return false;

    const nextDefaults: Partial<Record<keyof ExpenseMedian, string>> = {};
    const nextCustom: CustomExpenseItem[] = [];

    items.forEach((item, index) => {
      const key = DEFAULT_BUDGET_LABEL_MAP[item.label];
      if (key) {
        nextDefaults[key] = String(item.amount ?? 0);
        return;
      }
      nextCustom.push({
        id: `restored-custom-${index}`,
        label: item.label || "カスタム項目",
        value: String(item.amount ?? 0),
        copyFromPrevious: false,
      });
    });

    if (Object.keys(nextDefaults).length > 0) {
      setExpenseInputs((prev) => ({ ...prev, ...nextDefaults }));
    }
    if (nextCustom.length > 0) {
      setCustomExpenseItems(nextCustom);
    }
    setCopiedDefaultsFromPrev(true);
    setCopiedCustomFromPrev(true);
    return true;
    },
    []
  );

  const clampWizardStep = useCallback(
    (value: number) => Math.min(4, Math.max(1, value)),
    []
  );

  const applyWizardDraft = useCallback(
    (draft: HomeWizardDraft, preferredStep?: number) => {
      setHomeMode("setup");
      setWizardStep(clampWizardStep(preferredStep ?? draft.step ?? 1));
      if (draft.ageGroup) {
        setAgeGroup(draft.ageGroup);
      }
      if (typeof draft.memberCount === "number" && draft.memberCount > 0) {
        const safeCount = Math.min(10, Math.max(1, draft.memberCount));
        setMemberCount(safeCount);
      }
      if (
        Array.isArray(draft.incomeMembers) &&
        draft.incomeMembers.length > 0
      ) {
        setIncomeMembers(
          draft.incomeMembers.map((m, index) => ({
            name: index === 0 && displayName ? displayName : m.name ?? "",
            value: m.value ?? "",
          }))
        );
      }
      if (draft.expenseInputs) {
        setExpenseInputs((prev) => ({
          ...prev,
          ...draft.expenseInputs,
        }));
      }
      if (Array.isArray(draft.customExpenseItems)) {
        setCustomExpenseItems(
          draft.customExpenseItems.map((item, index) => ({
            id: item.id ?? `draft-${index}`,
            label: item.label ?? "",
            value: item.value ?? "",
            copyFromPrevious: item.copyFromPrevious ?? false,
          }))
        );
      }
      setCopiedDefaultsFromPrev(true);
      setCopiedCustomFromPrev(true);
      setShowOldDraftPrompt(false);
      setPendingDraft(null);
      setPendingDraftStep(null);
    },
    [clampWizardStep, displayName]
  );

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

    if (variant === "data" && isHomeCycleConfirmed(year, month)) {
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
          console.error("確定予算の読み込みに失敗しました", e);
        }
      }
    } else {
      setHomeMode("setup");
      setConfirmedBudget(null);
    }
  }, [variant, restorePlanningFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    if (isHomeCycleConfirmed(year, month)) return;

    const draft = loadHomeWizardDraft();
    if (!draft) return;
    if (isHomeWizardDraftOld(draft.updatedAt)) {
      setPendingDraft(draft);
      setShowOldDraftPrompt(true);
      return;
    }
    setWizardEntryMode("full");
    applyWizardDraft(draft);
  }, [applyWizardDraft]);

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

  const { themeClass } = useResolvedTheme(settings.theme);
  const isDark = themeClass.includes("theme-dark");
  const isData = variant === "data";

  // 年代や予算基準が変わったら、支出予算の基準値を反映
  // ＋ 家賃・サブスクは固定費ストアで上書き
  useEffect(() => {
    let cancelled = false;

    const applyBudgetBase = async () => {
    const national = await getNationalMedianForAgeGroup(ageGroup);
    const nationalMedian = national.median ?? ageGroupMedians[ageGroup];

      let baseMedian = nationalMedian;
      let monthsUsed: number | null = null;

      if (settings.budgetBase === "userAverage") {
        const result = buildUserAverageExpenseMedian(
          new Date(),
          USER_AVERAGE_MONTHS,
          USER_AVERAGE_LOOKBACK_MONTHS
        );
        if (result) {
          baseMedian = result.median;
          monthsUsed = result.monthsUsed;
        }
      }

      if (cancelled) return;

      setBudgetBaseMedian(baseMedian);
      setUserAverageMonthsUsed(monthsUsed);
    };

    void applyBudgetBase();
    return () => {
      cancelled = true;
    };
  }, [ageGroup, settings.budgetBase, settings.autoUpdateCategories]);

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
        copyFromPrevious: false,
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

  const handleToggleCustomItemCopyFromPrevious = (id: string) => {
    setCustomExpenseItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, copyFromPrevious: !(item.copyFromPrevious ?? false) }
          : item
      )
    );
  };

  // カスタム支出項目：削除
  const handleRemoveCustomExpenseItem = (id: string) => {
    setCustomExpenseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearLastAddedCustomItemId = () => {
    setLastAddedCustomItemId(null);
  };

  const handleAgeGroupChange = (next: AgeGroup) => {
    setAgeGroup(next);
  };

  // 予算基準に応じた平均値を取得
  const medianForAge = budgetBaseMedian;
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

  const handleWizardStartOver = () => {
    clearHomeWizardDraft();
    setPendingDraft(null);
    setPendingDraftStep(null);
    setShowOldDraftPrompt(false);
    setWizardEntryMode("full");
    setWizardStep(1);
    setAgeGroup("all");
    setMemberCount(1);
    setIncomeMembers([{ name: displayName || "本人", value: "" }]);
    setExpenseInputs(buildExpenseInputs());
    setCustomExpenseItems([]);
    setLastAddedCustomItemId(null);
    setCopiedCustomFromPrev(false);
    setCopiedDefaultsFromPrev(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (homeMode !== "setup") return;
    if (showOldDraftPrompt || pendingDraft) return;
    const draft: HomeWizardDraft = {
      schema_version: HOME_WIZARD_SCHEMA_VERSION,
      updatedAt: Date.now(),
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
      step: wizardStep,
      ageGroup,
      memberCount,
      incomeMembers,
      expenseInputs,
      customExpenseItems,
    };
    saveHomeWizardDraft(draft);
  }, [
    ageGroup,
    customExpenseItems,
    expenseInputs,
    homeMode,
    incomeMembers,
    memberCount,
    pendingDraft,
    showOldDraftPrompt,
    wizardStep,
  ]);

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

  const visibleIncomeMembers = incomeMembers.slice(0, Math.max(memberCount, 1));

  // 収入合計
  const totalIncome = visibleIncomeMembers.reduce((sum, m) => {
    const v = Number(m.value || "0");
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  const saving = totalIncome - totalExpense;

  // セットアップ時の計算結果
  const rawSaving = totalIncome - totalExpense;

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

  // 「この予算でスタート」押下 → 実際に保存して遷移
  const handleConfirmStart = () => {
    if (typeof window === "undefined") return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const key = buildBudgetKey(year, month);

    const trimmedMembers = incomeMembers.slice(0, Math.max(memberCount, 1));

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
          incomeMembers: trimmedMembers, // メンバー名＋金額
          expenseInputs, // 食費〜医療・保険の8項目ぶん
          customExpenseItems, // カスタム項目ぶん
        }, // ★ ここに「フォームの状態」も一緒に保存
      })
    );

    // このサイクルが「計画確定済み」であることを保存
    saveHomeCycleConfirmed(year, month, true);

    clearHomeWizardDraft();
    setConfirmedBudget({
      year,
      month,
      totalIncome,
      totalBudget: totalExpense,
      saving,
      items: detailItems,
    });
    if (variant === "data") {
      setHomeMode("dashboard");
    }
    if (variant === "setup") {
      onConfirmSetup?.();
    }
  };

  const resolveEntryMode = useCallback((step?: number) => {
    if (step === 2) return "income";
    if (step === 3) return "budget";
    return "full";
  }, []);

  const handleResumeOldDraft = () => {
    if (!pendingDraft) return;
    setWizardEntryMode(resolveEntryMode(pendingDraftStep ?? undefined));
    applyWizardDraft(pendingDraft, pendingDraftStep ?? undefined);
  };

  const handleDiscardOldDraft = () => {
    clearHomeWizardDraft();
    setShowOldDraftPrompt(false);
    setPendingDraft(null);
    const step = pendingDraftStep;
    setPendingDraftStep(null);
    if (typeof step === "number") {
      setWizardEntryMode(resolveEntryMode(step));
      const restored = restorePlanningFromStorage();
      if (!restored) {
        applyPlanningFromConfirmedItems(confirmedBudget?.items);
      }
      setHomeMode("setup");
      setWizardStep(step);
    } else if (homeMode === "setup") {
      setWizardEntryMode("full");
      setWizardStep(1);
    }
  };

  const openWizardAtStep = useCallback(
    (step: number) => {
      setWizardEntryMode(resolveEntryMode(step));
      if (homeMode === "dashboard") {
        clearHomeWizardDraft();
        const restored = restorePlanningFromStorage();
        if (!restored) {
          applyPlanningFromConfirmedItems(confirmedBudget?.items);
        }
        setHomeMode("setup");
        setWizardStep(step);
        return;
      }
      const draft = loadHomeWizardDraft();
      if (draft) {
        if (isHomeWizardDraftOld(draft.updatedAt)) {
          setPendingDraft(draft);
          setPendingDraftStep(step);
          setShowOldDraftPrompt(true);
          return;
        }
        applyWizardDraft(draft, step);
        return;
      }
      restorePlanningFromStorage();
      setHomeMode("setup");
      setWizardStep(step);
    },
    [
      applyPlanningFromConfirmedItems,
      applyWizardDraft,
      confirmedBudget?.items,
      homeMode,
      resolveEntryMode,
      restorePlanningFromStorage,
    ]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(OPEN_WIZARD_STEP_KEY);
    if (!raw) return;
    window.localStorage.removeItem(OPEN_WIZARD_STEP_KEY);
    const step = Number(raw);
    if (!Number.isFinite(step)) return;
    openWizardAtStep(step);
  }, [openWizardAtStep]);

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
  }, [copiedDefaultsFromPrev, homeMode, settings]);

  // カスタム項目を前月からコピー（前月コピーがオンの項目のみ）
  useEffect(() => {
    if (copiedCustomFromPrev) return;
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

      const mapped = prevItems
        .filter((item) => item.copyFromPrevious ?? false)
        .map((item, idx) => ({
          id: item.id ?? `copied-${idx}`,
          label: item.label ?? "",
          value: item.value ?? "",
          copyFromPrevious: item.copyFromPrevious ?? false,
        }));
      if (mapped.length === 0) return;
      setCustomExpenseItems(mapped);
      setCopiedCustomFromPrev(true);
    } catch {
      // noop
    }
  }, [
    copiedCustomFromPrev,
    customExpenseItems.length,
    homeMode,
  ]);

  return (
    <HomePageView
      themeClass={themeClass}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      showSavingHighlight={variant !== "setup"}
      savingHighlightExtra={
        isData ? (
          <>
            <RemainingBudgetCard isDark={isDark} />
            {extraSection}
          </>
        ) : null
      }
      showGuideAside={!isData}
      centerHeader
      budgetBase={settings.budgetBase}
      userAverageMonthsUsed={userAverageMonthsUsed}
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
      onToggleCustomItemCopyFromPrevious={handleToggleCustomItemCopyFromPrevious}
      onClearLastAddedCustomItemId={handleClearLastAddedCustomItemId}
      autoUpdateMap={autoUpdateMap}
      onToggleAutoUpdateCategory={toggleAutoUpdateCategory}
      onRequestIncomeEdit={() => openWizardAtStep(2)}
      onRequestBudgetEdit={() => openWizardAtStep(3)}
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
      customTemplates={expenseCategoryOptions}
      lastAddedCustomItemId={lastAddedCustomItemId}
      wizardEntryMode={wizardEntryMode}
      wizardStep={wizardStep}
      onWizardStepChange={setWizardStep}
      onWizardStartOver={handleWizardStartOver}
      onWizardConfirmStart={handleConfirmStart}
      showOldDraftPrompt={showOldDraftPrompt}
      onResumeDraft={handleResumeOldDraft}
      onDiscardDraft={handleDiscardOldDraft}
      setupExtraContent={setupExtraContent}
      extraSection={isData ? undefined : extraSection}
    />
  );
}
