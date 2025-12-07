// lib/savingSupport.ts
import { AppSettings } from "./settingsStorage";

export type SavingSupportCardKind =
  | "inputGap" // 数日入力が空いている
  | "weeklySummary" // 今週のふりかえり
  | "midPeriod" // サイクル中間のペース確認
  | "cycleEndReview" // サイクル終盤のふりかえり提案
  | "budgetAlert" // 予算◯%超え
  | "targetProgress" // 貯金目標の達成度
  | "encouragement"; // メンタルサポート一言

export type SavingSupportCard = {
  id: string; // "midPeriod-2024-12" みたいなユニークID
  kind: SavingSupportCardKind;
  title: string;
  message: string;
  // 必要に応じて追加情報（現在値・目標など）
  // 例：
  savingRate?: number; // 実際の貯金率
  targetSavingRate?: number; // 目標貯金率
  budgetUsageRate?: number; // 予算使用率
};

export type SavingSupportContext = {
  today: Date;

  // 設定
  settings: AppSettings;

  // 現在の給料日サイクル情報
  periodLabel: string; // "2024年12月分" みたいなテキスト
  periodStart: Date;
  periodEnd: Date;

  // このサイクルの集計値
  totalIncomeInPeriod: number; // 世帯収入合計＋臨時収入（このサイクル）
  totalBudgetForPeriod: number; // このサイクルの予算総額
  totalSpendingInPeriod: number; // このサイクルの実支出

  // 入力状況
  lastInputDate: Date | null; // 最後に何か記録した日
  hasRecordsThisWeek: boolean; // 今週1件でも入力があるか（週次サマリー用）
};
export type SavingSupportState = {
  cards: SavingSupportCard[];
};

export function buildSavingSupportState(
  context: SavingSupportContext
): SavingSupportState {
  const cards: SavingSupportCard[] = [];

  const {
    today,
    settings,
    periodStart,
    periodEnd,
    periodLabel,
    totalIncomeInPeriod,
    totalBudgetForPeriod,
    totalSpendingInPeriod,
    lastInputDate,
    hasRecordsThisWeek,
  } = context;

  const {
    enableInputGapReminder = true,
    enableWeeklySummaryReminder = true,
    enableMidPeriodCheckReminder = true,
    enableCycleEndReviewReminder = true,
    budgetAlertRate = 0.8,
    targetSavingRate,
    enableEncouragingMessages = true,
  } = settings;

  const saving = totalIncomeInPeriod - totalSpendingInPeriod;
  const savingRate =
    totalIncomeInPeriod > 0 ? saving / totalIncomeInPeriod : undefined;
  const budgetUsageRate =
    totalBudgetForPeriod > 0
      ? totalSpendingInPeriod / totalBudgetForPeriod
      : undefined;

  // 1️⃣ 入力ギャップカード
  if (enableInputGapReminder && lastInputDate) {
    const diffDays = diffInDays(today, lastInputDate);
    if (diffDays >= 3 && diffDays <= 14) {
      cards.push(buildInputGapCard(diffDays));
    }
  }

  // 2️⃣ 週次サマリーカード
  if (enableWeeklySummaryReminder && hasRecordsThisWeek) {
    if (isWeeklySummaryTiming(today)) {
      cards.push(buildWeeklySummaryCard(periodLabel));
    }
  }

  // 3️⃣ サイクル中間カード
  if (enableMidPeriodCheckReminder) {
    if (isAroundMidPeriod(today, periodStart, periodEnd)) {
      cards.push(
        buildMidPeriodCard({
          periodLabel,
          saving,
          savingRate,
          budgetUsageRate,
        })
      );
    }
  }

  // 4️⃣ サイクル終盤ふりかえりカード
  if (enableCycleEndReviewReminder) {
    if (isNearPeriodEnd(today, periodEnd)) {
      cards.push(buildCycleEndReviewCard(periodLabel));
    }
  }

  // 5️⃣ 予算◯%到達カード
  if (budgetUsageRate !== undefined && budgetUsageRate >= budgetAlertRate) {
    cards.push(
      buildBudgetAlertCard({
        budgetUsageRate,
        budgetAlertRate,
        periodLabel,
      })
    );
  }

  // 6️⃣ 貯金目標カード
  if (targetSavingRate !== undefined && savingRate !== undefined) {
    cards.push(
      buildTargetProgressCard({
        savingRate,
        targetSavingRate,
        periodLabel,
      })
    );
  }

  // 7️⃣ メンタルサポートカード（状況に応じて一言だけ）
  if (enableEncouragingMessages && savingRate !== undefined) {
    const encouragement = buildEncouragementCard({
      savingRate,
      targetSavingRate,
    });
    if (encouragement) {
      cards.push(encouragement);
    }
  }

  return { cards };
}

// ===== ヘルパー関数群 =====
function diffInDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = a.getTime() - b.getTime();
  return Math.floor(diff / msPerDay);
}

// 週次サマリーは日曜日（0）に表示する想定
function isWeeklySummaryTiming(today: Date): boolean {
  return today.getDay() === 0;
}

// サイクル中間（開始〜終了の真ん中±1日）を検出
function isAroundMidPeriod(today: Date, start: Date, end: Date): boolean {
  const mid = (start.getTime() + end.getTime()) / 2;
  const diffDays = Math.abs(today.getTime() - mid) / (1000 * 60 * 60 * 24);
  return diffDays <= 1;
}

// サイクル終了前3日以内
function isNearPeriodEnd(today: Date, periodEnd: Date): boolean {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = periodEnd.getTime() - today.getTime();
  const daysLeft = diff / msPerDay;
  return daysLeft >= 0 && daysLeft <= 3;
}

function buildInputGapCard(diffDays: number): SavingSupportCard {
  return {
    id: `inputGap-${diffDays}`,
    kind: "inputGap",
    title: "最近の記録が少ないようです",
    message: `${diffDays}日ほど入力が空いています。思い出せる分だけでも今日まとめて登録しておきましょう。`,
  };
}

function buildWeeklySummaryCard(periodLabel: string): SavingSupportCard {
  return {
    id: `weeklySummary-${periodLabel}`,
    kind: "weeklySummary",
    title: "今週のふりかえり",
    message: `${periodLabel}の週次サマリーをチェックして、支出の傾向を確認しましょう。`,
  };
}

function buildMidPeriodCard(params: {
  periodLabel: string;
  saving: number;
  savingRate?: number;
  budgetUsageRate?: number;
}): SavingSupportCard {
  const { periodLabel, saving, savingRate, budgetUsageRate } = params;
  const savingText =
    savingRate !== undefined
      ? `貯金率は約${Math.round(savingRate * 100)}%（¥${saving.toLocaleString()}）`
      : `貯金額は¥${saving.toLocaleString()}`;
  const budgetText =
    budgetUsageRate !== undefined
      ? `予算消化率は約${Math.round(budgetUsageRate * 100)}%です。`
      : "";

  return {
    id: `midPeriod-${periodLabel}`,
    kind: "midPeriod",
    title: "ちょうどサイクルの半分です",
    message: `${periodLabel}の中間地点です。${savingText}。${budgetText}後半もこのペースでいけるか確認してみましょう。`,
    savingRate,
    budgetUsageRate,
  };
}

function buildCycleEndReviewCard(periodLabel: string): SavingSupportCard {
  return {
    id: `cycleEnd-${periodLabel}`,
    kind: "cycleEndReview",
    title: "今サイクルのふりかえりをしませんか？",
    message: `${periodLabel}がそろそろ終わります。支出の振り返りと、次の予算の微調整をしてみましょう。`,
  };
}

function buildBudgetAlertCard(params: {
  budgetUsageRate: number;
  budgetAlertRate: number;
  periodLabel: string;
}): SavingSupportCard {
  const { budgetUsageRate, budgetAlertRate, periodLabel } = params;
  const usage = Math.round(budgetUsageRate * 100);
  const alert = Math.round(budgetAlertRate * 100);
  return {
    id: `budgetAlert-${periodLabel}`,
    kind: "budgetAlert",
    title: "予算の使いすぎに注意",
    message: `${periodLabel}の予算消化率は約${usage}%です（注意ライン ${alert}%）。後半は少しスローダウンしてみましょう。`,
    budgetUsageRate,
  };
}

function buildTargetProgressCard(params: {
  savingRate: number;
  targetSavingRate: number;
  periodLabel: string;
}): SavingSupportCard {
  const { savingRate, targetSavingRate, periodLabel } = params;
  const current = Math.round(savingRate * 100);
  const target = Math.round(targetSavingRate * 100);
  return {
    id: `target-${periodLabel}`,
    kind: "targetProgress",
    title: "貯金率の進捗",
    message: `${periodLabel}の貯金率は約${current}%です。目標は${target}%。あと少しで達成できそうです。`,
    savingRate,
    targetSavingRate,
  };
}

function buildEncouragementCard(params: {
  savingRate: number;
  targetSavingRate?: number;
}): SavingSupportCard | null {
  const { savingRate, targetSavingRate } = params;
  const rate = Math.round(savingRate * 100);
  const targetText =
    targetSavingRate !== undefined
      ? `目標の${Math.round(targetSavingRate * 100)}%まであと少し。`
      : "";
  return {
    id: `encourage-${Date.now()}`,
    kind: "encouragement",
    title: "いいペースです",
    message: `現在の貯金率は約${rate}%。${targetText}コツコツ続けていきましょう。`,
  };
}
