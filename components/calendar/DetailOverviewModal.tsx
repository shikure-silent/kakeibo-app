"use client";

import React, { useMemo } from "react";
import { DetailRecord } from "../../types/calendar";

const CATEGORY_COLORS: Record<string, string> = {
  "食費": "bg-amber-400",
  "日用品": "bg-teal-400",
  "家賃・住居": "bg-indigo-400",
  "水道・光熱費": "bg-sky-400",
  "通信費": "bg-blue-400",
  "交通費": "bg-cyan-400",
  "交際費": "bg-pink-400",
  "趣味・娯楽": "bg-violet-400",
  "医療・美容": "bg-rose-400",
  "教育・子ども": "bg-lime-400",
  "サブスク": "bg-emerald-400",
  "その他": "bg-slate-400",
  "給与・賞与": "bg-emerald-500",
  "事業・報酬": "bg-teal-500",
  "副業・臨時収入": "bg-cyan-500",
  "投資・配当": "bg-sky-500",
  "年金": "bg-blue-500",
  "給付金・助成金・還付金": "bg-indigo-500",
  "お小遣い": "bg-fuchsia-500",
  "その他収入": "bg-slate-500",
};

const getCategoryColor = (category: string) =>
  CATEGORY_COLORS[category] ?? "bg-slate-300";

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

  const payFromSummary = useMemo(() => {
    const totals = new Map<string, number>();
    selectedDetails.forEach((rec) => {
      const label = rec.payFrom?.trim()
        ? rec.payFrom
        : rec.mode === "income"
          ? "入金元なし"
          : "支出元なし";
      const amount = Number(rec.amount || 0);
      const signed = rec.mode === "income" ? amount : -amount;
      totals.set(label, (totals.get(label) || 0) + signed);
    });
    return Array.from(totals.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  }, [selectedDetails]);

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
          <div className="space-y-2">
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {selectedDetails.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-800 truncate flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${getCategoryColor(
                          rec.category || "未分類"
                        )}`}
                      />
                      <span className="truncate">
                        {rec.category || "未分類"}
                      </span>
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

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">
                支出・収入元別の合計
              </p>
              {payFromSummary.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  支出・収入の記録がありません。
                </p>
              ) : (
                <div className="mt-1 space-y-1 max-h-28 overflow-auto pr-1">
                  {payFromSummary.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-[11px] text-slate-700"
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="font-semibold">
                        {item.amount >= 0 ? "+¥" : "¥"}
                        {Math.abs(Number(item.amount || 0)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
