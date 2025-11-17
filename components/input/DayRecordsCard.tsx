"use client";

import React, { useMemo } from "react";
import { DetailRecord } from "../../types/calendar";

type Props = {
  dateLabel: string;
  records: DetailRecord[];
  onDeleteRecord: (index: number) => void;
};

export default function DayRecordsCard({
  dateLabel,
  records,
  onDeleteRecord,
}: Props) {
  const hasRecords = records.length > 0;

  const { expenseTotal, incomeTotal } = useMemo(
    () =>
      records.reduce(
        (totals, record) => {
          if (record.mode === "expense") {
            totals.expenseTotal += record.amount;
            return totals;
          }

          totals.incomeTotal += record.amount;
          return totals;
        },
        { expenseTotal: 0, incomeTotal: 0 }
      ),
    [records]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          選択した日の記録
        </h2>
        <p className="text-[11px] text-slate-500">
          日付を変更すると、その日の記録が表示されます。
        </p>
      </div>

      {dateLabel && (
        <p className="text-xs font-medium text-slate-700">{dateLabel}</p>
      )}

      {!hasRecords && (
        <p className="text-[11px] text-slate-400">
          この日はまだ記録がありません。
        </p>
      )}

      {hasRecords && (
        <>
          <div className="flex flex-col gap-1 text-[11px] text-slate-600">
            <p>
              支出合計:{" "}
              <span className="font-semibold text-slate-900">
                ¥{expenseTotal.toLocaleString()}
              </span>
            </p>
            {incomeTotal > 0 && (
              <p>
                収入合計:{" "}
                <span className="font-semibold text-emerald-700">
                  ¥{incomeTotal.toLocaleString()}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {records.map((rec, idx) => (
              <div
                key={idx}
                className="
                  rounded-xl border border-slate-200 bg-slate-50
                  px-3 py-2
                  flex items-start justify-between gap-3
                "
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                        ${
                          rec.mode === "expense"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      `}
                    >
                      {rec.mode === "expense" ? "支出" : "収入"}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {rec.mode === "expense" ? "支出元" : "入金元"}:{" "}
                    {rec.payFrom}
                  </p>
                  {rec.memo && (
                    <p className="text-[11px] text-slate-500 whitespace-pre-wrap break-words">
                      {rec.memo}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-semibold text-slate-900">
                    ¥{rec.amount.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(idx)}
                    className="
                      text-[10px] text-slate-400
                      hover:text-red-500 underline-offset-2 hover:underline
                    "
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
