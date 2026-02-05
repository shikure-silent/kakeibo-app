"use client";

import React, { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import { DetailRecord } from "../../types/calendar";
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
  dailyDetails: DetailRecord[][];
  periodLabel?: string;
  hasPeriod: boolean;
  periodStart?: Date | null;
  periodEnd?: Date | null;
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
};

export default function CalendarView(props: Props) {
  const {
    themeClass,
    // 表示系
    periodLabel,
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
    dailyDetails,
    periodStart,
    periodEnd,
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
  } = props;

  const isDark = themeClass.includes("theme-dark");
  const monthLabel = `${currentYear}年${currentMonth}月`;
  const [isIos, setIsIos] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setIsIos(Capacitor.getPlatform() === "ios");
  }, []);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isIos) return;
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isIos) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const SWIPE_THRESHOLD = 50;
    if (absX < SWIPE_THRESHOLD) return;
    if (absX <= absY * 1.2) return;
    if (dx > 0) {
      onPrevMonth();
    } else {
      onNextMonth();
    }
  };

  const containerClass =
    "mx-0 max-w-none px-0 py-6 lg:py-8 space-y-4 flex flex-col flex-1";
  const headerPaddingClass = "px-4 lg:px-6";

  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateSpacer = () => {
      const spacer = document.querySelector<HTMLElement>(".bottom-nav-spacer");
      const spacerHeight = spacer?.getBoundingClientRect().height ?? 0;
      const total = document.documentElement.scrollHeight - spacerHeight;
      const viewport = window.innerHeight;
      const shouldCompact = total <= viewport + 1;
      if (shouldCompact) {
        document.body.dataset.bottomSpacer = "none";
        document.body.style.overflowY = "hidden";
      } else {
        delete document.body.dataset.bottomSpacer;
        document.body.style.overflowY = "";
      }
    };

    const id = window.setTimeout(updateSpacer, 0);
    window.addEventListener("resize", updateSpacer);
    window.addEventListener("orientationchange", updateSpacer);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", updateSpacer);
      window.removeEventListener("orientationchange", updateSpacer);
      delete document.body.dataset.bottomSpacer;
      document.body.style.overflowY = "";
    };
  }, [calendarCells.length, periodLabel, isOverviewModalOpen, isDetailModalOpen]);

  return (
    <main
      ref={mainRef}
      className={`min-h-[calc(100svh-8rem-env(safe-area-inset-bottom))] lg:min-h-screen ${themeClass} overflow-x-hidden flex flex-col`}
    >
      <div className={containerClass}>
        {/* ヘッダー */}
        <div className={headerPaddingClass}>
          <CalendarHeader
            monthLabel={monthLabel}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            isDark={isDark}
          />
        </div>

        {/* 集計期間ラベル（給料日サイクルがある場合） */}
        {periodLabel && (
          <div className={headerPaddingClass}>
            <p
              className={`mt-1 text-[11px] ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              集計期間：{periodLabel}
            </p>
          </div>
        )}

        {/* レイアウト：左カレンダー／右サマリー */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1">
          {/* 左：カレンダー */}
          <div
            className="lg:col-span-2 space-y-3 flex-1 min-h-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex-1 min-h-0">
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
                periodStart={periodStart ?? null}
                periodEnd={periodEnd ?? null}
                isDark={isDark}
              />
            </div>
          </div>

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
