// lib/savingSupport.ts
import { AppSettings } from "./settingsStorage";

export type SavingSupportCardKind =
  | "inputGap"
  | "weeklySummary"
  | "midPeriod"
  | "cycleEndReview"
  | "budgetAlert"
  | "targetProgress"
  | "encouragement";

export type SavingSupportCard = {
  id: string; // 安定したユニークID（SSR/CSRでブレない）
  kind: SavingSupportCardKind;
  title: string;
  message: string;

  savingRate?: number;
  targetSavingRate?: number;
  budgetUsageRate?: number;
};

export type SavingSupportContext = {
  today: Date;

  settings: AppSettings;

  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;

  totalIncomeInPeriod: number;
  totalBudgetForPeriod: number;
  totalSpendingInPeriod: number;

  lastInputDate: Date | null;
  hasRecordsThisWeek: boolean;
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
    // A: トグル
    enableInputGapReminder = true,
    enableWeeklySummaryReminder = true,
    enableMidPeriodCheckReminder = true,
    enableCycleEndReviewReminder = true,

    // A: 詳細
    inputGapDays = 2,
    weeklySummaryWeekday = 0, // 0=日
    reminderTime = "21:00",
    midPeriodOffsetDays, // 未設定なら “真ん中”
    cycleEndReviewDaysBefore = 2,

    // 予算系
    budgetAlertRate = 0.8,

    // C: 目標・メンタル
    targetSavingRate,
    enableEncouragingMessages = true,
  } = settings;

  const dateKey = formatDateKey(today);

  const saving = totalIncomeInPeriod - totalSpendingInPeriod;
  const savingRate =
    totalIncomeInPeriod > 0 ? saving / totalIncomeInPeriod : undefined;

  const budgetUsageRate =
    totalBudgetForPeriod > 0
      ? totalSpendingInPeriod / totalBudgetForPeriod
      : undefined;

  // 「通知っぽいカード（A系）」は reminderTime 以降に表示
  const canShowTimedReminders = isAfterReminderTime(today, reminderTime);

  // 1) 入力ギャップ
  if (enableInputGapReminder && canShowTimedReminders && lastInputDate) {
    const diffDays = diffInDays(today, lastInputDate);
    // “未来日” や 0日 は無視
    if (diffDays >= Math.max(1, inputGapDays) && diffDays <= 60) {
      cards.push(
        buildInputGapCard({
          id: `inputGap-${dateKey}`,
          diffDays,
          inputGapDays,
        })
      );
    }
  }

  // 2) 週1ふりかえり
  if (
    enableWeeklySummaryReminder &&
    canShowTimedReminders &&
    (hasRecordsThisWeek || true) // ←「0件でも声かけしたい」なら true のままでOK
  ) {
    if (isWeeklySummaryTiming(today, weeklySummaryWeekday)) {
      cards.push(
        buildWeeklySummaryCard({
          id: `weeklySummary-${dateKey}`,
          periodLabel,
          weekday: weeklySummaryWeekday,
        })
      );
    }
  }

  // 3) 中間チェック
  if (enableMidPeriodCheckReminder && canShowTimedReminders) {
    if (isAroundMidPeriod(today, periodStart, periodEnd, midPeriodOffsetDays)) {
      cards.push(
        buildMidPeriodCard({
          id: `midPeriod-${periodLabel}-${dateKey}`,
          periodLabel,
          saving,
          savingRate,
          budgetUsageRate,
        })
      );
    }
  }

  // 4) 終盤ふりかえり
  if (enableCycleEndReviewReminder && canShowTimedReminders) {
    if (isNearPeriodEnd(today, periodEnd, cycleEndReviewDaysBefore)) {
      cards.push(
        buildCycleEndReviewCard({
          id: `cycleEndReview-${periodLabel}-${dateKey}`,
          periodLabel,
          daysBefore: cycleEndReviewDaysBefore,
        })
      );
    }
  }

  // 5) 予算アラート（これは時間に縛らず出してOK）
  if (
    budgetUsageRate !== undefined &&
    budgetUsageRate >= budgetAlertRate &&
    totalSpendingInPeriod > 0
  ) {
    cards.push(
      buildBudgetAlertCard({
        id: `budgetAlert-${periodLabel}-${Math.round(budgetAlertRate * 100)}`,
        budgetUsageRate,
        budgetAlertRate,
        periodLabel,
      })
    );
  }

  // 6) 目標進捗
  if (targetSavingRate !== undefined && savingRate !== undefined) {
    cards.push(
      buildTargetProgressCard({
        id: `targetProgress-${periodLabel}-${dateKey}`,
        savingRate,
        targetSavingRate,
        periodLabel,
      })
    );
  }

  // 7) メンタル一言（1枚だけ）
  if (enableEncouragingMessages && savingRate !== undefined) {
    const encouragement = buildEncouragementCard({
      id: `encouragement-${periodLabel}-${dateKey}`,
      savingRate,
      targetSavingRate,
      saving,
    });
    if (encouragement) cards.push(encouragement);
  }

  // 重要度順に軽く整列（好みで調整OK）
  const priority: Record<SavingSupportCardKind, number> = {
    budgetAlert: 1,
    inputGap: 2,
    cycleEndReview: 3,
    midPeriod: 4,
    weeklySummary: 5,
    targetProgress: 6,
    encouragement: 7,
  };

  cards.sort((a, b) => (priority[a.kind] ?? 99) - (priority[b.kind] ?? 99));

  // 出しすぎ防止（ホーム/カレンダーが窮屈なら 3〜4 くらいがおすすめ）
  return { cards: cards.slice(0, 4) };
}

/** ========== ブラウザ通知（実験） ========== */
/**
 * 使い方（client側のuseEffectなどで）：
 *   const state = buildSavingSupportState(ctx)
 *   maybeSendBrowserNotification(state, settings)
 */
export function maybeSendBrowserNotification(
  state: SavingSupportState,
  settings: AppSettings
) {
  if (!settings.enableBrowserNotifications) return;
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // “通知っぽさ”を出すなら reminderTime 以降だけ鳴らす
  const now = new Date();
  if (!isAfterReminderTime(now, settings.reminderTime ?? "21:00")) return;

  const notifiable = state.cards.find((c) =>
    ["inputGap", "weeklySummary", "midPeriod", "cycleEndReview"].includes(
      c.kind
    )
  );
  if (!notifiable) return;

  const dateKey = formatDateKey(now);
  const seenKey = `kakeibo_browser_notified_${notifiable.kind}_${dateKey}`;
  if (window.localStorage.getItem(seenKey)) return;

  new Notification(notifiable.title, { body: notifiable.message });

  try {
    window.localStorage.setItem(seenKey, "1");
  } catch {
    // noop
  }
}

export async function requestBrowserNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return await Notification.requestPermission();
}

/** ========== Helpers ========== */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffInDays(a: Date, b: Date): number {
  const da = startOfLocalDay(a).getTime();
  const db = startOfLocalDay(b).getTime();
  return Math.floor((da - db) / MS_PER_DAY);
}

function parseHHMM(hhmm: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
  if (h < 0 || h > 23) return null;
  if (mm < 0 || mm > 59) return null;
  return { h, m: mm };
}

function isAfterReminderTime(today: Date, reminderTime?: string): boolean {
  if (!reminderTime) return true;
  const parsed = parseHHMM(reminderTime);
  if (!parsed) return true;
  const nowMin = today.getHours() * 60 + today.getMinutes();
  const targetMin = parsed.h * 60 + parsed.m;
  return nowMin >= targetMin;
}

function isWeeklySummaryTiming(today: Date, weekday: number): boolean {
  const w = clampInt(weekday, 0, 6);
  return today.getDay() === w;
}

function clampInt(v: number, min: number, max: number): number {
  const n = Math.floor(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function addDays(d: Date, days: number): Date {
  const base = startOfLocalDay(d);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

/**
 * midPeriodOffsetDays があれば「開始からN日後（±1日）」、
 * なければ「真ん中（±1日）」で判定。
 */
function isAroundMidPeriod(
  today: Date,
  start: Date,
  end: Date,
  midPeriodOffsetDays?: number
): boolean {
  const windowDays = 1;

  // 期間が変なら安全側で false
  const startMs = startOfLocalDay(start).getTime();
  const endMs = startOfLocalDay(end).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return false;
  }

  let target: Date;
  if (
    typeof midPeriodOffsetDays === "number" &&
    Number.isFinite(midPeriodOffsetDays)
  ) {
    target = addDays(start, clampInt(midPeriodOffsetDays, 1, 31));
  } else {
    const mid = (startMs + endMs) / 2;
    target = startOfLocalDay(new Date(mid));
  }

  const diff = Math.abs(diffInDays(today, target));
  return diff <= windowDays;
}

function isNearPeriodEnd(
  today: Date,
  periodEnd: Date,
  daysBefore: number
): boolean {
  const n = clampInt(daysBefore, 0, 14);
  const daysLeft = diffInDays(periodEnd, today);
  return daysLeft >= 0 && daysLeft <= n;
}

function yen(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function weekdayJa(w: number): string {
  const list = ["日", "月", "火", "水", "木", "金", "土"];
  return list[clampInt(w, 0, 6)];
}

/** ========== Card Builders ========== */
function buildInputGapCard(params: {
  id: string;
  diffDays: number;
  inputGapDays: number;
}): SavingSupportCard {
  const { id, diffDays, inputGapDays } = params;
  const threshold = Math.max(1, inputGapDays);
  return {
    id,
    kind: "inputGap",
    title: "最近の記録が少ないかも",
    message:
      diffDays >= threshold
        ? `${diffDays}日ほど入力が空いています。思い出せる分だけでもOKなので、今日まとめて登録しておきましょう。`
        : "最近入力が少なめです。今日の分だけでもサクッと残しておきましょう。",
  };
}

function buildWeeklySummaryCard(params: {
  id: string;
  periodLabel: string;
  weekday: number;
}): SavingSupportCard {
  const { id, periodLabel, weekday } = params;
  return {
    id,
    kind: "weeklySummary",
    title: `週1ふりかえり（${weekdayJa(weekday)}）`,
    message: `${periodLabel}の最近の支出をざっくり見直して、ムダが出やすいカテゴリをチェックしてみましょう。`,
  };
}

function buildMidPeriodCard(params: {
  id: string;
  periodLabel: string;
  saving: number;
  savingRate?: number;
  budgetUsageRate?: number;
}): SavingSupportCard {
  const { id, periodLabel, saving, savingRate, budgetUsageRate } = params;

  const savingText =
    savingRate !== undefined
      ? `貯金率は約${pct(savingRate)}（${yen(saving)}）`
      : `貯金額は${yen(saving)}`;

  const budgetText =
    budgetUsageRate !== undefined
      ? `予算消化率は約${pct(budgetUsageRate)}。`
      : "";

  return {
    id,
    kind: "midPeriod",
    title: "折り返しチェック",
    message: `${periodLabel}の中間チェックです。${savingText}。${budgetText}後半もこのペースでいけそうか見てみましょう。`,
    savingRate,
    budgetUsageRate,
  };
}

function buildCycleEndReviewCard(params: {
  id: string;
  periodLabel: string;
  daysBefore: number;
}): SavingSupportCard {
  const { id, periodLabel, daysBefore } = params;
  const d = clampInt(daysBefore, 0, 14);
  return {
    id,
    kind: "cycleEndReview",
    title: "そろそろ今サイクル終盤です",
    message: `${periodLabel}の終了${
      d === 0 ? "当日" : `${d}日前`
    }付近です。支出の振り返りと、来月の予算の微調整をしておくとラクになります。`,
  };
}

function buildBudgetAlertCard(params: {
  id: string;
  budgetUsageRate: number;
  budgetAlertRate: number;
  periodLabel: string;
}): SavingSupportCard {
  const { id, budgetUsageRate, budgetAlertRate, periodLabel } = params;

  return {
    id,
    kind: "budgetAlert",
    title: "予算ペースがちょい早めかも",
    message: `${periodLabel}の予算消化率は約${pct(
      budgetUsageRate
    )}です（注意ライン ${pct(
      budgetAlertRate
    )}）。後半は「固定費以外を少しだけ意識」してみましょう。`,
    budgetUsageRate,
  };
}

function buildTargetProgressCard(params: {
  id: string;
  savingRate: number;
  targetSavingRate: number;
  periodLabel: string;
}): SavingSupportCard {
  const { id, savingRate, targetSavingRate, periodLabel } = params;

  const current = savingRate;
  const target = targetSavingRate;

  const diff = target - current;

  let tail = "";
  if (diff <= 0) {
    tail = "目標達成ペースです。いい感じ！";
  } else if (diff < 0.03) {
    tail = "あと少しで目標ペース。いけそう！";
  } else {
    tail = "少しだけ支出ペースを整えると近づけそうです。";
  }

  return {
    id,
    kind: "targetProgress",
    title: "貯金率の進捗",
    message: `${periodLabel}の貯金率は約${pct(current)}。目標は${pct(
      target
    )}。${tail}`,
    savingRate,
    targetSavingRate,
  };
}

function buildEncouragementCard(params: {
  id: string;
  savingRate: number;
  targetSavingRate?: number;
  saving: number;
}): SavingSupportCard | null {
  const { id, savingRate, targetSavingRate, saving } = params;

  // 収入0などで savingRate が変な場合は出さない
  if (!Number.isFinite(savingRate)) return null;

  const rateText = `現在の貯金率は約${pct(savingRate)}（${yen(saving)}）`;

  if (savingRate < 0) {
    return {
      id,
      kind: "encouragement",
      title: "今日はここから立て直せる",
      message: `${rateText}。落ち込まなくてOK。まずは「固定費以外の出費」を1つだけ見直してみましょう。`,
    };
  }

  if (
    typeof targetSavingRate === "number" &&
    Number.isFinite(targetSavingRate)
  ) {
    if (savingRate >= targetSavingRate) {
      return {
        id,
        kind: "encouragement",
        title: "いいペース！",
        message: `${rateText}。目標（${pct(
          targetSavingRate
        )}）を上回るペースです。このままコツコツ続けましょう。`,
      };
    }
    const gap = Math.max(0, targetSavingRate - savingRate);
    return {
      id,
      kind: "encouragement",
      title: "あとちょいで目標ペース",
      message: `${rateText}。目標（${pct(targetSavingRate)}）まであと約${pct(
        gap
      )}。無理せず、できる範囲で整えていきましょう。`,
    };
  }

  return {
    id,
    kind: "encouragement",
    title: "コツコツが最強",
    message: `${rateText}。続けられてる時点で勝ちです。`,
  };
}
