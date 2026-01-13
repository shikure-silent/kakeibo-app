"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SavingSupportCard } from "../../lib/savingSupport";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import BudgetHighlightCard from "./BudgetHighlightCard";
import { DetailRecord, MonthlyBudget } from "../../types/calendar";
import { DetailOverviewModal } from "./DetailOverviewModal";
import { DetailEditModal } from "./DetailEditModal";

type Props = {
  themeClass: string;
  calendarCells: (number | null)[];
  amounts: number[];
  incomeAmounts: number[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
  onLongPressDay?: (day: number) => void;
  today: Date;
  currentYear: number;
  currentMonth: number;
  budget: MonthlyBudget | null;
  monthlyTotal: number;
  remainingBudget: number | null;
  budgetUsagePercent: number | null;
  dailyDetails: DetailRecord[][];
  periodLabel?: string;
  hasPeriod: boolean;
  periodTotal: number;
  periodRemainingBudget: number | null;
  periodBudgetUsagePercent: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isOverviewModalOpen: boolean;
  isDetailModalOpen: boolean;
  onCloseOverview: () => void;
  onOpenDetailFromOverview: () => void;
  onCloseDetail: () => void;
  onChangeRecord: (index: number, record: DetailRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void;
  supportCards?: SavingSupportCard[];
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uniqAdd(prev: string[], id: string) {
  return prev.includes(id) ? prev : [...prev, id];
}

export default function CalendarView(props: Props) {
  const {
    themeClass,
    // 表示系
    periodLabel,
    hasPeriod,
    selectedDay,
    selectedDateLabel,
    isOverviewModalOpen,
    isDetailModalOpen,
    // データ
    calendarCells,
    amounts,
    incomeAmounts,
    onSelectDay,
    onLongPressDay,
    today,
    currentYear,
    currentMonth,
    budget,
    monthlyTotal,
    remainingBudget,
    budgetUsagePercent,
    dailyDetails,
    periodTotal,
    periodRemainingBudget,
    periodBudgetUsagePercent,
    selectedDetails,
    // ハンドラ
    onCloseOverview,
    onOpenDetailFromOverview,
    onCloseDetail,
    onChangeRecord,
    onDeleteRecord,
    onAddRecord,
    onPrevMonth,
    onNextMonth,
    supportCards,
  } = props;

  const isDark = themeClass.includes("theme-dark");
  const monthLabel = `${currentYear}年${currentMonth}月`;

  // =========================
  // 通知カード（サポート）
  // =========================
  const storageKey = useMemo(() => {
    // 「今日」の通知だけ消したい想定（翌日は復活してOK）
    return `kakeibo_support_dismissed_${formatDateKey(today)}`;
  }, [today]);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [pcExpanded, setPcExpanded] = useState(false);
  const [activeSupportCard, setActiveSupportCard] =
    useState<SavingSupportCard | null>(null);

  // load persisted dismiss
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDismissedIds(parsed.filter((x) => typeof x === "string"));
      }
    } catch {
      // noop
    }
  }, [storageKey]);

  // persist dismiss
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
    } catch {
      // noop
    }
  }, [storageKey, dismissedIds]);

  const visibleSupportCards = useMemo(() => {
    if (!supportCards?.length) return [];
    if (!dismissedIds.length) return supportCards;
    const set = new Set(dismissedIds);
    return supportCards.filter((c) => !set.has(c.id));
  }, [supportCards, dismissedIds]);

  const pcPreviewCount = 2;
  const pcPreviewCards = useMemo(
    () => visibleSupportCards.slice(0, pcPreviewCount),
    [visibleSupportCards]
  );
  const pcHiddenCount = Math.max(
    0,
    visibleSupportCards.length - pcPreviewCards.length
  );

  const dismissAll = () => {
    setDismissedIds((prev) => {
      const next = [...prev];
      for (const c of visibleSupportCards) {
        if (!next.includes(c.id)) next.push(c.id);
      }
      return next;
    });
    setPcExpanded(false);
  };

  const resetDismissed = () => {
    setDismissedIds([]);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // noop
    }
  };

  const dismissOne = (id: string) => {
    setDismissedIds((prev) => uniqAdd(prev, id));
  };

  const openSupportDetail = (card: SavingSupportCard) => {
    setActiveSupportCard(card);
  };

  const closeSupportDetail = () => {
    setActiveSupportCard(null);
  };

  const getCardMeta = (kind: SavingSupportCard["kind"]) => {
    switch (kind) {
      case "budgetAlert":
        return { badge: "予算", icon: "⚠️" };
      case "inputGap":
        return { badge: "入力", icon: "📝" };
      case "weeklySummary":
        return { badge: "週次", icon: "📌" };
      case "midPeriod":
        return { badge: "中間", icon: "🔎" };
      case "cycleEndReview":
        return { badge: "終盤", icon: "✅" };
      case "targetProgress":
        return { badge: "目標", icon: "🎯" };
      case "encouragement":
      default:
        return { badge: "ひとこと", icon: "🌿" };
    }
  };

  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-4">
        {/* ヘッダー */}
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          isDark={isDark}
        />

        {/* 集計期間ラベル（給料日サイクルがある場合） */}
        {periodLabel && (
          <p
            className={`mt-1 text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            集計期間：{periodLabel}
          </p>
        )}

        {/* 今日のサポート（通知カード） - スマホ/タブレットは上 */}
        <section
          className={`lg:hidden rounded-2xl border px-3 py-3 sm:px-4 sm:py-4 ${
            isDark
              ? "bg-slate-900/40 border-slate-700"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">今日のサポート</h2>
            {visibleSupportCards.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetDismissed}
                  className={`text-[11px] ${
                    isDark
                      ? "text-slate-300 hover:text-slate-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  非表示リセット
                </button>
                <button
                  type="button"
                  onClick={dismissAll}
                  className={`text-[11px] ${
                    isDark
                      ? "text-slate-300 hover:text-slate-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  すべて非表示
                </button>
              </div>
            )}
          </div>

          {visibleSupportCards.length > 0 ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {visibleSupportCards.map((card) => {
                const meta = getCardMeta(card.kind);
                return (
                  <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openSupportDetail(card)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSupportDetail(card);
                      }
                    }}
                    className={`relative rounded-xl border px-3 py-2.5 cursor-pointer ${
                      isDark
                        ? "bg-slate-900 border-slate-700"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissOne(card.id);
                      }}
                      className={`absolute top-2 right-2 text-sm leading-none ${
                        isDark
                          ? "text-slate-400 hover:text-slate-200"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      aria-label="閉じる"
                    >
                      ×
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meta.icon}</span>
                      <span
                        className={`text-[10px] rounded-full px-2 py-0.5 border ${
                          isDark
                            ? "border-slate-600 text-slate-200"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {meta.badge}
                      </span>
                    </div>

                    <p className="mt-1 text-[12px] font-semibold">
                      {card.title}
                    </p>
                    <p
                      className={`mt-1 text-[11px] leading-snug ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {card.message}
                    </p>

                    {/* ちょい便利導線（任意） */}
                    {card.kind === "inputGap" && (
                      <div className="mt-2">
                        <Link
                          href="/input"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                            isDark
                              ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                              : "border-slate-200 text-slate-700 hover:bg-white"
                          }`}
                        >
                          入力へ
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`mt-2 rounded-xl border px-3 py-3 text-[11px] ${
                isDark
                  ? "border-dashed border-slate-700 text-slate-400"
                  : "border-dashed border-slate-200 text-slate-500"
              }`}
            >
              <p>通知サポートは現在表示されていません。</p>
              <div className="mt-2">
                <Link
                  href="/settings#saving"
                  className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                    isDark
                      ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  設定を開く
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* レイアウト：左カレンダー／右サマリー */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左：カレンダー */}
          <div className="lg:col-span-2 space-y-3">
            <CalendarGrid
              calendarCells={calendarCells}
              amounts={amounts}
              incomeAmounts={incomeAmounts}
              selectedDay={selectedDay}
              onSelectDay={onSelectDay}
              onLongPressDay={onLongPressDay}
              today={today}
              currentYear={currentYear}
              currentMonth={currentMonth}
              dailyDetails={dailyDetails}
              isDark={isDark}
            />
          </div>

          {/* 右：予算ハイライト */}
          <section className="space-y-4">
            {/* 今日のサポート（通知カード） - PCは右上（2件 + もっと見る） */}
            <section
              className={`hidden lg:block rounded-2xl border px-4 py-4 ${
                isDark
                  ? "bg-slate-900/40 border-slate-700"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-[12px] font-semibold whitespace-nowrap">
                    今日のサポート
                  </h2>
                  <span
                    className={`text-[10px] rounded-full px-2 py-0.5 border whitespace-nowrap ${
                      isDark
                        ? "border-slate-600 text-slate-200"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {visibleSupportCards.length}件
                  </span>
                </div>

                {visibleSupportCards.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <Link
                      href="/settings"
                      className={`whitespace-nowrap ${
                        isDark
                          ? "text-slate-300 hover:text-slate-100"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      設定
                    </Link>
                    <button
                      type="button"
                      onClick={resetDismissed}
                      className={`whitespace-nowrap ${
                        isDark
                          ? "text-slate-300 hover:text-slate-100"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      非表示リセット
                    </button>
                    <button
                      type="button"
                      onClick={dismissAll}
                      className={`whitespace-nowrap ${
                        isDark
                          ? "text-slate-300 hover:text-slate-100"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      すべて非表示
                    </button>
                  </div>
                )}
              </div>

              {visibleSupportCards.length > 0 ? (
                // コンパクト表示
                !pcExpanded ? (
                  <div className="mt-3 space-y-2">
                    {pcPreviewCards.map((card) => {
                      const meta = getCardMeta(card.kind);
                      return (
                        <div
                          key={card.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openSupportDetail(card)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openSupportDetail(card);
                            }
                          }}
                          className={`relative rounded-xl border px-3 py-2 ${
                            isDark
                              ? "bg-slate-900 border-slate-700"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissOne(card.id);
                            }}
                            className={`absolute top-2 right-2 text-sm leading-none ${
                              isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                            aria-label="閉じる"
                          >
                            ×
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="text-sm">{meta.icon}</span>
                            <span
                              className={`text-[10px] rounded-full px-2 py-0.5 border ${
                                isDark
                                  ? "border-slate-600 text-slate-200"
                                  : "border-slate-200 text-slate-600"
                              }`}
                            >
                              {meta.badge}
                            </span>
                            <p className="text-[12px] font-semibold truncate">
                              {card.title}
                            </p>
                          </div>

                          {/* PCは高さ増加を抑えるため 1行だけ */}
                          <p
                            className={`mt-1 text-[11px] ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            } truncate`}
                          >
                            {card.message}
                          </p>
                        </div>
                      );
                    })}

                    {pcHiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setPcExpanded(true)}
                        className={`w-full rounded-xl border px-3 py-2 text-[11px] font-semibold ${
                          isDark
                            ? "border-slate-700 text-slate-100 hover:bg-slate-900"
                            : "border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        もっと見る（+{pcHiddenCount}）
                      </button>
                    )}
                  </div>
                ) : (
                  // 展開表示（全部）
                  <div className="mt-3 space-y-2">
                    {visibleSupportCards.map((card) => {
                      const meta = getCardMeta(card.kind);
                      return (
                        <div
                          key={card.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openSupportDetail(card)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openSupportDetail(card);
                            }
                          }}
                          className={`relative rounded-xl border px-3 py-2.5 ${
                            isDark
                              ? "bg-slate-900 border-slate-700"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissOne(card.id);
                            }}
                            className={`absolute top-2 right-2 text-sm leading-none ${
                              isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                            aria-label="閉じる"
                          >
                            ×
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="text-sm">{meta.icon}</span>
                            <span
                              className={`text-[10px] rounded-full px-2 py-0.5 border ${
                                isDark
                                  ? "border-slate-600 text-slate-200"
                                  : "border-slate-200 text-slate-600"
                              }`}
                            >
                              {meta.badge}
                            </span>
                            <p className="text-[12px] font-semibold">
                              {card.title}
                            </p>
                          </div>

                          <p
                            className={`mt-1 text-[11px] leading-snug ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            {card.message}
                          </p>

                          {card.kind === "inputGap" && (
                            <div className="mt-2">
                              <Link
                                href="/input"
                                onClick={(e) => e.stopPropagation()}
                                className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                                  isDark
                                    ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                                    : "border-slate-200 text-slate-700 hover:bg-white"
                                }`}
                              >
                                入力へ
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setPcExpanded(false)}
                      className={`w-full rounded-xl border px-3 py-2 text-[11px] font-semibold ${
                        isDark
                          ? "border-slate-700 text-slate-100 hover:bg-slate-900"
                          : "border-slate-100 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      閉じる
                    </button>
                  </div>
                )
              ) : (
                <div
                  className={`mt-3 rounded-xl border px-3 py-3 text-[11px] ${
                    isDark
                      ? "border-dashed border-slate-700 text-slate-400"
                      : "border-dashed border-slate-200 text-slate-500"
                  }`}
                >
                  <p>通知サポートは現在表示されていません。</p>
                  <div className="mt-2">
                    <Link
                      href="/settings#saving"
                      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                        isDark
                          ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                          : "border-slate-200 text-slate-700 hover:bg-white"
                      }`}
                    >
                      設定を開く
                    </Link>
                  </div>
                </div>
              )}
            </section>

            <BudgetHighlightCard
              budget={budget}
              monthlyTotal={hasPeriod ? periodTotal : monthlyTotal}
              remainingBudget={
                hasPeriod && periodRemainingBudget !== null
                  ? periodRemainingBudget
                  : remainingBudget
              }
              budgetUsagePercent={
                hasPeriod && periodBudgetUsagePercent !== null
                  ? periodBudgetUsagePercent
                  : budgetUsagePercent
              }
              isDark={isDark}
            />
          </section>
        </div>
      </div>

      <DetailOverviewModal
        open={isOverviewModalOpen}
        selectedDay={selectedDay}
        selectedDateLabel={selectedDateLabel}
        selectedDetails={selectedDetails}
        onClose={onCloseOverview}
        onEdit={onOpenDetailFromOverview}
      />

      {activeSupportCard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6">
          <div
            className={`relative w-full max-w-md rounded-2xl border px-4 py-4 shadow-lg ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-100 text-slate-900"
            }`}
          >
            <button
              type="button"
              onClick={closeSupportDetail}
              className={`absolute top-2 right-3 text-xl leading-none ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="flex items-center gap-2">
              <span className="text-base">
                {getCardMeta(activeSupportCard.kind).icon}
              </span>
              <span
                className={`text-[10px] rounded-full px-2 py-0.5 border ${
                  isDark
                    ? "border-slate-600 text-slate-200"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {getCardMeta(activeSupportCard.kind).badge}
              </span>
            </div>

            <h3 className="mt-2 text-sm font-semibold">
              {activeSupportCard.title}
            </h3>
            <p
              className={`mt-2 text-[12px] leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {activeSupportCard.message}
            </p>

            {activeSupportCard.kind === "inputGap" && (
              <div className="mt-3">
                <Link
                  href="/input"
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[12px] font-semibold border ${
                    isDark
                      ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  入力へ
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <DetailEditModal
        open={isDetailModalOpen}
        selectedDay={selectedDay}
        selectedDateLabel={selectedDateLabel}
        selectedDetails={selectedDetails}
        onClose={onCloseDetail}
        onChangeRecord={onChangeRecord}
        onDeleteRecord={onDeleteRecord}
        onAddRecord={onAddRecord}
      />

    </main>
  );
}
