"use client";

import React, { useEffect } from "react";
import SelectedDayDetailsCard from "./SelectedDayDetailsCard";
import { DetailRecord } from "../../types/calendar";

type Props = {
  open: boolean;
  selectedDay: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  isDark?: boolean;
  onClose: () => void;
  onChangeRecord: (index: number, record: DetailRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void;
};

export function DetailEditModal({
  open,
  selectedDay,
  selectedDateLabel,
  selectedDetails,
  isDark = false,
  onClose,
  onChangeRecord,
  onDeleteRecord,
  onAddRecord,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !selectedDay) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3 py-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-4 sm:py-[calc(env(safe-area-inset-top)+2.5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+2.5rem)] overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-4 sm:px-5 sm:py-5 pr-6 sm:pr-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
          aria-label="閉じる"
        >
          ×
        </button>

        <SelectedDayDetailsCard
          selectedDay={selectedDay}
          selectedDateLabel={selectedDateLabel}
          selectedDetails={selectedDetails}
          isDark={isDark}
          onChangeRecord={onChangeRecord}
          onDeleteRecord={onDeleteRecord}
          onAddRecord={onAddRecord}
          onCloseCalendar={onClose}
        />
      </div>
    </div>
  );
}
