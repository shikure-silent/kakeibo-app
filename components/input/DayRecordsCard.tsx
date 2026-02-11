"use client";

import React, { useMemo, useState } from "react";
import { DetailRecord } from "../../types/calendar";

type Props = {
  dateLabel: string;
  records: DetailRecord[];
  onDeleteRecord: (index: number) => void;
  onUpdateRecord: (index: number, next: DetailRecord) => void;
  isDark?: boolean;
};

export default function DayRecordsCard({
  dateLabel,
  records,
  onDeleteRecord,
  onUpdateRecord,
  isDark = false,
}: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<DetailRecord | null>(null);

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

  const startEdit = (index: number, record: DetailRecord) => {
    setEditingIndex(index);
    setDraft({ ...record });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (editingIndex == null || !draft) return;
    const amount = Number(draft.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("金額は0より大きい数字で入力してください。");
      return;
    }
    onUpdateRecord(editingIndex, {
      ...draft,
      amount,
      category: (draft.category || "").trim(),
      payFrom: (draft.payFrom || "").trim(),
      memo: draft.memo || "",
    });
    cancelEdit();
  };

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
                {editingIndex === idx && draft ? (
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={draft.mode}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  mode: e.target.value as DetailRecord["mode"],
                                }
                              : prev
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800"
                      >
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(draft.amount ?? "")}
                        onChange={(e) => {
                          const half = e.target.value.replace(/[０-９]/g, (ch) =>
                            String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
                          );
                          const digits = half.replace(/[^\d]/g, "");
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  amount: digits === "" ? 0 : Number(digits),
                                }
                              : prev
                          );
                        }}
                        placeholder="金額"
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800"
                      />
                      <input
                        type="text"
                        value={draft.category}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev ? { ...prev, category: e.target.value } : prev
                          )
                        }
                        placeholder="カテゴリ"
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800"
                      />
                      <input
                        type="text"
                        value={draft.payFrom}
                        onChange={(e) =>
                          setDraft((prev) =>
                            prev ? { ...prev, payFrom: e.target.value } : prev
                          )
                        }
                        placeholder={draft.mode === "expense" ? "支出元" : "入金元"}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={draft.memo}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev ? { ...prev, memo: e.target.value } : prev
                        )
                      }
                      placeholder="メモ"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 resize-none"
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="inline-flex min-h-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(idx, rec)}
                          className="inline-flex min-h-9 items-center justify-center rounded-full border px-3 py-1.5 text-[12px] font-medium"
                          style={{
                            borderColor: isDark ? "#475569" : "#cbd5e1",
                            color: isDark ? "#cbd5e1" : "#475569",
                          }}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(idx)}
                          className="inline-flex min-h-9 items-center justify-center rounded-full border px-3 py-1.5 text-[12px] font-medium"
                          style={{
                            borderColor: isDark ? "#7f1d1d" : "#fecaca",
                            color: isDark ? "#fecaca" : "#dc2626",
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
