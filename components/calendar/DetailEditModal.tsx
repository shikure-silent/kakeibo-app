"use client";

import React from "react";
import SelectedDayDetailsCard from "./SelectedDayDetailsCard";
import { DetailRecord } from "../../types/calendar";

type Props = {
  open: boolean;
  selectedDay: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
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
  onClose,
  onChangeRecord,
  onDeleteRecord,
  onAddRecord,
}: Props) {
  if (!open || !selectedDay) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-3 py-6 pb-24 sm:px-4 sm:py-10 sm:pb-12 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-lg border border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
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
          onChangeRecord={onChangeRecord}
          onDeleteRecord={onDeleteRecord}
          onAddRecord={onAddRecord}
          onCloseCalendar={onClose}
        />
      </div>
    </div>
  );
}
