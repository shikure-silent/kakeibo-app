"use client";

import React from "react";

type Props = {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  isDark: boolean;
};

export default function CalendarHeader({
  monthLabel,
  onPrev,
  onNext,
  isDark,
}: Props) {
  const navButtonBase =
    "rounded-full w-8 h-8 flex items-center justify-center text-sm border transition-colors";

  const navButtonClass = isDark
    ? `${navButtonBase} bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700`
    : `${navButtonBase} bg-white border-slate-200 text-slate-600 hover:bg-slate-50`;

  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
      <div className="space-y-0.5">
        <h1 className="text-lg lg:text-xl font-semibold tracking-tight">
          カレンダー
        </h1>
        <p
          className={`text-xs lg:text-sm ${
            isDark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          日々の支出・収入を確認しながら、給料日サイクル単位での予算管理ができます。
        </p>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3">
        <button
          type="button"
          onClick={onPrev}
          className={navButtonClass}
          aria-label="前の月へ"
        >
          ◀
        </button>

        <span
          className={`text-sm lg:text-base font-semibold min-w-[120px] text-center ${
            isDark ? "text-slate-100" : "text-slate-700"
          }`}
        >
          {monthLabel}
        </span>

        <button
          type="button"
          onClick={onNext}
          className={navButtonClass}
          aria-label="次の月へ"
        >
          ▶
        </button>
      </div>
    </header>
  );
}
