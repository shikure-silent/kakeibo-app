"use client";

import React from "react";
import { DetailRecord } from "../../types/calendar";

type Props = {
  open: boolean;
  selectedDay: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  onClose: () => void;
  onEdit: () => void;
};

export function DetailOverviewModal({
  open,
  selectedDay,
  selectedDateLabel,
  selectedDetails,
  onClose,
  onEdit,
}: Props) {
  if (!open || !selectedDay) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-3 py-6 pb-24 sm:px-4 sm:py-10 sm:pb-12 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-100 px-3 py-3 sm:px-4 sm:py-4 space-y-3">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
          aria-label="閉じる"
        >
          ×
        </button>

        <div>
          <p className="text-[11px] text-slate-500">選択中の日付</p>
          <p className="text-sm font-semibold text-slate-900">
            {selectedDateLabel}
          </p>
        </div>

        {selectedDetails.length === 0 ? (
          <p className="text-[12px] text-slate-500">
            この日はまだ内訳が登録されていません。
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {selectedDetails.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">
                    {rec.category || "未分類"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {rec.payFrom ||
                      (rec.mode === "income" ? "入金元なし" : "支出元なし")}
                  </p>
                  {rec.memo && (
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {rec.memo}
                    </p>
                  )}
                </div>
                <div className="text-right text-[12px] font-semibold text-slate-900 whitespace-nowrap">
                  ¥{Number(rec.amount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-1 flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-600"
          >
            編集・追加する
          </button>
        </div>
      </div>
    </div>
  );
}
