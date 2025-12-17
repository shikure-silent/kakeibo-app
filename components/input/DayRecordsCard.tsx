"use client";

import React, { useMemo } from "react";
import { DetailRecord } from "../../types/calendar";

type Props = {
  dateLabel: string;
  records: DetailRecord[];
  onDeleteRecord: (index: number) => void;
  isDark?: boolean;
};

export default function DayRecordsCard({
  dateLabel,
  records,
  onDeleteRecord,
  isDark = false,
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

  const net = incomeTotal - expenseTotal;

  return (
    <div
      className={`rounded-2xl shadow-sm border px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-3 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h2
          className={`text-sm font-semibold ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          選択した日の記録
        </h2>
        <p
          className={`text-[11px] lg:text-right leading-snug ${
            isDark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          日付を変更すると、その日の記録が表示されます。
        </p>
      </div>

      {dateLabel && (
        <p
          className={`text-xs font-medium ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {dateLabel}
        </p>
      )}

      {!hasRecords && (
        <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
          この日はまだ記録がありません。
        </p>
      )}

      {hasRecords && (
        <>
          <div
            className={`flex flex-col gap-1 text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <p>
              支出合計:{" "}
              <span
                className={`font-semibold ${
                  isDark ? "text-slate-50" : "text-slate-900"
                }`}
              >
                ¥{expenseTotal.toLocaleString()}
              </span>
            </p>
            {incomeTotal > 0 && (
              <p>
                収入合計:{" "}
                <span
                  className={`font-semibold ${
                    isDark ? "text-emerald-200" : "text-emerald-700"
                  }`}
                >
                  ¥{incomeTotal.toLocaleString()}
                </span>
              </p>
            )}
            <p>
              その日の収支:{" "}
              <span
                className={`font-semibold ${
                  net < 0
                    ? isDark
                      ? "text-slate-200"
                      : "text-slate-900"
                    : isDark
                    ? "text-emerald-200"
                    : "text-emerald-700"
                }`}
              >
                {net >= 0
                  ? `+¥${net.toLocaleString()}`
                  : `¥-${Math.abs(net).toLocaleString()}`}
              </span>
            </p>
          </div>

          <div className="space-y-2 max-h-[55vh] overflow-auto pr-1">
            {records.map((rec, idx) => (
              <div
                key={idx}
                className="
                  rounded-xl border px-3 py-2
                  flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2
                "
                style={{
                  borderColor: isDark ? "#475569" : "#e2e8f0",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                }}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                        ${
                          rec.mode === "expense"
                            ? isDark
                              ? "bg-red-900 text-red-200"
                              : "bg-red-100 text-red-700"
                            : isDark
                            ? "bg-emerald-900 text-emerald-100"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      `}
                    >
                      {rec.mode === "expense" ? "支出" : "収入"}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      {rec.category}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {rec.mode === "expense" ? "支出元" : "入金元"}:{" "}
                    {rec.payFrom}
                  </p>
                  {rec.shopName && (
                    <p
                      className={`text-[11px] ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      店舗: {rec.shopName}
                    </p>
                  )}
                  {rec.memo && (
                    <p
                      className={`text-[11px] whitespace-pre-wrap break-words ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {rec.memo}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-slate-50" : "text-slate-900"
                    }`}
                  >
                    ¥{rec.amount.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(idx)}
                    className="
                      text-[10px] underline-offset-2 hover:underline
                      self-start sm:self-end
                    "
                    style={{
                      color: isDark ? "#94a3b8" : "#94a3b8",
                    }}
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
