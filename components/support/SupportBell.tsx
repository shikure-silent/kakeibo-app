"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SavingSupportCard } from "../../lib/savingSupport";
import {
  confirmCurrentCycleWithLatestPlan,
  OPEN_WIZARD_STEP_KEY,
} from "../../lib/homeStorage";
import { setFlashToast } from "../../lib/flashToast";

type Props = {
  cards: SavingSupportCard[];
  mode?: "nav" | "floating";
};

type PanelStyle = {
  left: number;
  top: number;
  width: number;
};

const STORAGE_KEY_PREFIX = "kakeibo_support_dismissed_";

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uniqAdd(prev: string[], id: string) {
  return prev.includes(id) ? prev : [...prev, id];
}

function getCardMeta(kind: SavingSupportCard["kind"]) {
  switch (kind) {
    case "budgetAlert":
      return { badge: "予算", icon: "⚠️" };
    case "planUpdate":
      return { badge: "更新", icon: "🗓️" };
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
}

export default function SupportBell({ cards, mode = "nav" }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<PanelStyle | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeSupportCard, setActiveSupportCard] =
    useState<SavingSupportCard | null>(null);
  const [hasBlockingModal, setHasBlockingModal] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);

  const storageKey = useMemo(() => {
    return `${STORAGE_KEY_PREFIX}${formatDateKey(new Date())}`;
  }, []);

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

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
    } catch {
      // noop
    }
  }, [storageKey, dismissedIds]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (bellRef.current && !bellRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!activeSupportCard) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [activeSupportCard]);

  useEffect(() => {
    if (mode !== "floating") return;
    const checkModal = () => {
      const hasOverlay =
        !!document.querySelector("div.fixed.inset-0[class*='bg-black']");
      setHasBlockingModal(hasOverlay);
    };

    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!hasBlockingModal) return;
    setIsOpen(false);
  }, [hasBlockingModal]);

  useEffect(() => {
    if (!isOpen) return;
    const updatePanelPosition = () => {
      const anchor = bellRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const maxWidth = Math.floor(viewportWidth * 0.9);
      const width = Math.min(320, maxWidth);
      const left = Math.min(
        Math.max(8, rect.right - width),
        viewportWidth - width - 8
      );
      const top = rect.bottom + 8;
      setPanelStyle({ left, top, width });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen]);

  const visibleSupportCards = useMemo(() => {
    if (!cards?.length) return [];
    if (!dismissedIds.length) return cards;
    const set = new Set(dismissedIds);
    return cards.filter((c) => !set.has(c.id));
  }, [cards, dismissedIds]);

  const dismissAll = () => {
    setDismissedIds((prev) => {
      const next = [...prev];
      for (const c of visibleSupportCards) {
        if (!next.includes(c.id)) next.push(c.id);
      }
      return next;
    });
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
    setIsOpen(false);
  };

  const closeSupportDetail = () => {
    setActiveSupportCard(null);
  };

  const handlePlanEdit = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(OPEN_WIZARD_STEP_KEY, "2");
    }
    setActiveSupportCard(null);
    router.push("/data");
  };

  const handlePlanSameOk = () => {
    const ok = confirmCurrentCycleWithLatestPlan(new Date());
    if (ok) {
      setFlashToast({
        message: "今月分を前回と同じ内容で確定しました。",
        tone: "success",
      });
      if (activeSupportCard) dismissOne(activeSupportCard.id);
      setActiveSupportCard(null);
      return;
    }

    setFlashToast({
      message: "前回の内容が見つからないため、編集画面を開きます。",
      tone: "info",
    });
    handlePlanEdit();
  };

  if (mode === "floating" && hasBlockingModal) {
    return null;
  }

  const buttonClass =
    mode === "floating"
      ? "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-700 shadow-md transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      : "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div ref={bellRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={buttonClass}
        aria-label="今日のサポート"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            d="M12 3a5 5 0 00-5 5v3.7c0 .5-.2 1-.6 1.4l-1.1 1.1a1 1 0 00.7 1.7h12a1 1 0 00.7-1.7l-1.1-1.1c-.4-.4-.6-.9-.6-1.4V8a5 5 0 00-5-5z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M9.5 18a2.5 2.5 0 005 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {visibleSupportCards.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-rose-500 px-1 py-[1px] text-[10px] font-semibold leading-none text-white">
            {visibleSupportCards.length > 99 ? "99+" : visibleSupportCards.length}
          </span>
        )}
      </button>

      {isOpen && panelStyle && (
        <div
          className="fixed overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          style={{
            left: panelStyle.left,
            top: panelStyle.top,
            width: panelStyle.width,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <div className="text-[12px] font-semibold">今日のサポート</div>
            {(visibleSupportCards.length > 0 || dismissedIds.length > 0) && (
              <div className="flex items-center gap-2 text-[11px]">
                {visibleSupportCards.length > 0 ? (
                  <button
                    type="button"
                    onClick={dismissAll}
                    className="whitespace-nowrap text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    通知を非表示
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetDismissed}
                    className="whitespace-nowrap text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    通知を表示
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            通知の設定は
            <Link
              href="/settings#osnotify"
              className="ml-1 font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
              onClick={() => setIsOpen(false)}
            >
              こちら
            </Link>
          </div>

          {visibleSupportCards.length > 0 ? (
            <div className="max-h-[60vh] space-y-2 overflow-auto p-2">
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
                    className="relative cursor-pointer rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissOne(card.id);
                      }}
                      className="absolute top-2 right-2 text-sm leading-none text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                      aria-label="閉じる"
                    >
                      ×
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-[10px] rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 dark:border-slate-600 dark:text-slate-200">
                        {meta.badge}
                      </span>
                    </div>

                    <p className="mt-1 text-[12px] font-semibold">{card.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                      {card.message}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
              <p>通知サポートは現在表示されていません。</p>
            </div>
          )}
        </div>
      )}

      {activeSupportCard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <button
              type="button"
              onClick={closeSupportDetail}
              className="absolute top-2 right-3 text-xl leading-none text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="flex items-center gap-2">
              <span className="text-base">
                {getCardMeta(activeSupportCard.kind).icon}
              </span>
              <span className="text-[10px] rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 dark:border-slate-600 dark:text-slate-200">
                {getCardMeta(activeSupportCard.kind).badge}
              </span>
            </div>

            <h3 className="mt-2 text-sm font-semibold">
              {activeSupportCard.title}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
              {activeSupportCard.message}
            </p>

            {activeSupportCard.kind === "inputGap" && (
              <div className="mt-3">
                <Link
                  href="/input"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  入力へ
                </Link>
              </div>
            )}

            {activeSupportCard.kind === "planUpdate" && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handlePlanSameOk}
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                >
                  同じでOK
                </button>
                <button
                  type="button"
                  onClick={handlePlanEdit}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  編集する
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
