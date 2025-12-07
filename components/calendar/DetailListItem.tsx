"use client";

import React from "react";
import { DetailRecord } from "../../types/calendar";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_FROM_OPTIONS,
} from "../../lib/const";

const toHalfWidthNumber = (value: string) =>
  value.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

const formatAmountInt = (amount: number | null | undefined) => {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return "¥0";
  return "¥" + n.toLocaleString("ja-JP");
};

type Props = {
  record: DetailRecord;
  index: number;
  onChange: (index: number, record: DetailRecord) => void;
  onDelete: (index: number) => void;
  expenseCategoryOptions?: string[];
  incomeCategoryOptions?: string[];
  payFromOptions?: string[];
};

export function DetailListItem({
  record,
  index,
  onChange,
  onDelete,
  expenseCategoryOptions = [...EXPENSE_CATEGORIES],
  incomeCategoryOptions = [...INCOME_CATEGORIES],
  payFromOptions = [...PAY_FROM_OPTIONS],
}: Props) {
  const categoryOptionsForRow =
    record.mode === "income" ? incomeCategoryOptions : expenseCategoryOptions;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2">
      {/* 上段：カテゴリ＋金額 */}
      <div className="flex items-start justify-between gap-3">
        {/* カテゴリ */}
        <div className="flex-1 space-y-1">
          <label className="block text-[11px] text-slate-500">カテゴリ</label>
          <select
            value={record.category ?? ""}
            onChange={(e) =>
              onChange(index, {
                ...record,
                category: e.target.value,
              } as DetailRecord)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">選択してください</option>
            {categoryOptionsForRow.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={record.category ?? ""}
            onChange={(e) =>
              onChange(index, {
                ...record,
                category: e.target.value,
              } as DetailRecord)
            }
            placeholder="直接入力（例：食費 / 日用品 など）"
          />
        </div>

        {/* 金額（既存行） */}
        <div className="w-32 space-y-1 text-right">
          <label className="block text-[11px] text-slate-500 text-left">
            金額
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={
              record.amount === null ||
              record.amount === undefined ||
              Number.isNaN(Number(record.amount))
                ? ""
                : String(record.amount)
            }
            onChange={(e) => {
              const half = toHalfWidthNumber(e.target.value);
              const digitsOnly = half.replace(/[^\d]/g, "");
              const num = digitsOnly === "" ? NaN : Number(digitsOnly);

              onChange(index, {
                ...record,
                amount: num as any,
              } as DetailRecord);
            }}
          />
          <p className="text-[10px] text-slate-500">
            入力中:{" "}
            <span className="font-semibold">
              {formatAmountInt(record.amount)}
            </span>
          </p>
        </div>
      </div>

      {/* 下段：支出元 ＋ 店舗名 ＋ メモ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 左カラム：支出元 ＋ 店舗名 */}
        <div className="space-y-2">
          {/* 支出元 / 入金元 */}
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-500">
              {record.mode === "income" ? "入金元" : "支出元"}
            </label>
            <select
              value={record.payFrom ?? ""}
              onChange={(e) =>
                onChange(index, {
                  ...record,
                  payFrom: e.target.value,
                } as DetailRecord)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">選択してください</option>
              {payFromOptions.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={record.payFrom ?? ""}
              onChange={(e) =>
                onChange(index, {
                  ...record,
                  payFrom: e.target.value,
                } as DetailRecord)
              }
              placeholder="直接入力（例：現金 / クレジットカード / 電子決済 など）"
            />
          </div>

          {/* 店舗名（支出のみ表示） */}
          {record.mode !== "income" && (
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-500">
                店舗名（任意）
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={record.shopName ?? ""}
                onChange={(e) =>
                  onChange(index, {
                    ...record,
                    shopName: e.target.value,
                  } as DetailRecord)
                }
                placeholder="例：〇〇スーパー / △△ドラッグ"
              />
            </div>
          )}
        </div>

        {/* 右カラム：メモ */}
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-500">メモ</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            value={record.memo ?? ""}
            onChange={(e) =>
              onChange(index, {
                ...record,
                memo: e.target.value,
              } as DetailRecord)
            }
            placeholder="その他メモ（用途など）"
          />
        </div>
      </div>

      {/* 削除ボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-[11px] font-medium text-red-500 hover:text-red-600"
        >
          この項目を削除
        </button>
      </div>
    </div>
  );
}
