"use client";

import React from "react";
import NumberInput from "../NumberInput";
import { Mode } from "../../types/calendar";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_FROM_OPTIONS,
} from "../../lib/const";

type Props = {
  mode: Mode;
  onChangeMode: (mode: Mode) => void;
  dateStr: string;
  onChangeDate: (value: string) => void;
  category: string;
  onChangeCategory: (value: string) => void;
  payFrom: string;
  onChangePayFrom: (value: string) => void;
  memo: string;
  onChangeMemo: (value: string) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
};

export default function InputFormCard({
  mode,
  onChangeMode,
  dateStr,
  onChangeDate,
  category,
  onChangeCategory,
  payFrom,
  onChangePayFrom,
  memo,
  onChangeMemo,
  amount,
  onChangeAmount,
  onSubmit,
}: Props) {
  const categoryOptions =
    mode === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* タイトル行 */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm lg:text-base font-semibold text-slate-800">
            記録を追加
          </h2>
          <p className="text-[11px] text-slate-400">
            支出・収入を選んで、日付やカテゴリを入力してください。
          </p>
        </div>

        {/* モード切り替え（支出 / 収入） */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-600">
            種類
          </label>
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => onChangeMode("expense")}
              className={`
                px-3 py-1.5 rounded-full
                font-medium
                ${
                  mode === "expense"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500"
                }
              `}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("income")}
              className={`
                px-3 py-1.5 rounded-full
                font-medium
                ${
                  mode === "income"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500"
                }
              `}
            >
              収入
            </button>
          </div>
        </div>

        {/* 日付＋カテゴリ＋支出元 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 日付 */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-600">
              日付
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => onChangeDate(e.target.value)}
              className="
                w-full border border-slate-200 rounded-full
                px-3 py-1.5 text-xs text-slate-700
                bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
            />
          </div>

          {/* カテゴリ */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-600">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="
                w-full border border-slate-200 rounded-full
                px-3 py-1.5 text-xs text-slate-700
                bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 支出元 / 入金元 */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-600">
              {mode === "expense" ? "支出元" : "入金元"}
            </label>
            <select
              value={payFrom}
              onChange={(e) => onChangePayFrom(e.target.value)}
              className="
                w-full border border-slate-200 rounded-full
                px-3 py-1.5 text-xs text-slate-700
                bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              "
            >
              {PAY_FROM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* メモ */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-600">
            メモ（任意）
          </label>
          <textarea
            value={memo}
            onChange={(e) => onChangeMemo(e.target.value)}
            rows={2}
            className="
              w-full border border-slate-200 rounded-2xl
              px-3 py-2 text-xs text-slate-700
              bg-white
              focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
              resize-none
            "
            placeholder="お店の名前や用途などをメモできます。"
          />
        </div>

        {/* 金額＋追加ボタン */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex-1">
            <NumberInput
              label="金額（半角数字）"
              value={amount}
              onChange={onChangeAmount}
              placeholder="例: 3000"
            />
          </div>
          <div>
            <button
              type="submit"
              className="
                inline-flex items-center justify-center gap-2
                rounded-full
                bg-emerald-600 text-white
                text-xs lg:text-sm font-semibold
                px-4 py-2.5
                hover:bg-emerald-700
                shadow-sm
              "
            >
              <span>＋</span>
              <span>この内容で追加</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
