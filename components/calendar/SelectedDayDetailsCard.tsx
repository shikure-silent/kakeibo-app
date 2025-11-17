"use client";

import React from "react";
import { DetailRecord } from "../../types/calendar";

type Props = {
  selectedDay: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
};

export default function SelectedDayDetailsCard({
  selectedDay,
  selectedDateLabel,
  selectedDetails,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          選択した日の内訳
        </h2>
        <p className="text-[11px] text-slate-500">
          カレンダーの日付をクリックすると明細が表示されます。
        </p>
      </div>

      {!selectedDay && (
        <p className="text-xs text-slate-500">
          まだ日付が選択されていません。カレンダーの日付をクリックしてください。
        </p>
      )}

      {selectedDay && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">
            {selectedDateLabel}
          </p>

          {selectedDetails.length === 0 ? (
            <p className="text-[11px] text-slate-400">
              この日はまだ入力がありません。
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {selectedDetails.map((rec, idx) => (
                <div
                  key={idx}
                  className="
                    rounded-xl border border-slate-200 bg-slate-50
                    px-3 py-2
                    flex items-start justify-between gap-3
                  "
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800">
                      {rec.category}
                    </p>
                    <p className="text-[11px] text-slate-500">{rec.payFrom}</p>
                    {rec.memo && (
                      <p className="text-[11px] text-slate-500 whitespace-pre-wrap break-words">
                        {rec.memo}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 ml-2 shrink-0">
                    ¥{rec.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
