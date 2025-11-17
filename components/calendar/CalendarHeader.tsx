"use client";

import React from "react";

type Props = {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
};

export default function CalendarHeader({ monthLabel, onPrev, onNext }: Props) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          カレンダー
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 mt-1">
          日ごとの支出の流れをカレンダーで確認できます。入力タブで記録した内容もここに反映されます。
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="
            rounded-full border border-slate-200 bg-white
            w-8 h-8 flex items-center justify-center
            text-slate-600 text-sm
            hover:bg-slate-50
          "
        >
          ‹
        </button>
        <span className="text-sm lg:text-base font-semibold text-slate-700 min-w-[120px] text-center">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="
            rounded-full border border-slate-200 bg-white
            w-8 h-8 flex items-center justify-center
            text-slate-600 text-sm
            hover:bg-slate-50
          "
        >
          ›
        </button>
      </div>
    </header>
  );
}
