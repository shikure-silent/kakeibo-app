"use client";

import React, { useEffect, useRef, useState } from "react";
import NumberInput from "../NumberInput";
import { Mode } from "../../types/calendar";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_FROM_OPTIONS,
} from "../../lib/const";
import {
  loadExpenseCategories,
  loadIncomeCategories,
  loadPayFromPresets,
} from "../../lib/settingsStorage";

type Props = {
  mode: Mode;
  onChangeMode: (mode: Mode) => void;
  dateStr: string;
  onChangeDate: (value: string) => void;
  customCategory: string;
  onChangeCustomCategory: (value: string) => void;
  category: string;
  onChangeCategory: (value: string) => void;
  payFrom: string;
  onChangePayFrom: (value: string) => void;
  shopName: string;
  onChangeShopName: (value: string) => void;
  memo: string;
  onChangeMemo: (value: string) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
  isDark?: boolean;
};

export default function InputFormCard({
  mode,
  onChangeMode,
  dateStr,
  onChangeDate,
  customCategory,
  onChangeCustomCategory,
  category,
  onChangeCategory,
  payFrom,
  onChangePayFrom,
  shopName,
  onChangeShopName,
  memo,
  onChangeMemo,
  amount,
  onChangeAmount,
  onSubmit,
  isDark = false,
}: Props) {
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const categoryRef = useRef<HTMLDivElement | null>(null);

  // ★ 設定に応じた候補リスト
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<
    string[]
  >([...EXPENSE_CATEGORIES]);
  const [incomeCategoryOptions, setIncomeCategoryOptions] = useState<string[]>([
    ...INCOME_CATEGORIES,
  ]);
  const [payFromOptions, setPayFromOptions] = useState<string[]>([
    ...PAY_FROM_OPTIONS,
  ]);

  // マウント時に localStorage から読み込み
  useEffect(() => {
    setExpenseCategoryOptions(loadExpenseCategories([...EXPENSE_CATEGORIES]));
    setIncomeCategoryOptions(loadIncomeCategories([...INCOME_CATEGORIES]));
    setPayFromOptions(loadPayFromPresets([...PAY_FROM_OPTIONS]));
  }, []);

  useEffect(() => {
    if (!showCategorySuggestions) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setShowCategorySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showCategorySuggestions]);

  // 今表示するカテゴリ候補（モードによって切り替え）
  // 今表示するカテゴリ候補（モードによって切り替え）
  const categoryOptions =
    mode === "expense" ? expenseCategoryOptions : incomeCategoryOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSelectCategory = (value: string) => {
    onChangeCategory(value);
    onChangeCustomCategory("");
    setShowCategorySuggestions(false);
  };

  return (
    <div
      className={`rounded-2xl shadow-sm border px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* タイトル行 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <h2
            className={`text-sm lg:text-base font-semibold ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            記録を追加
          </h2>
          <p
            className={`text-[11px] leading-snug lg:text-right ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            支出・収入を選んで、日付やカテゴリを入力してください。
          </p>
        </div>

        {/* モード切り替え（支出 / 収入） */}
        <div className="space-y-1.5">
          <label
            className={`block text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            種類
          </label>
          <div
            className="inline-flex rounded-full p-1 text-xs"
            style={{
              backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
              border: isDark ? "1px solid #475569" : "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={() => onChangeMode("expense")}
              className={`
                px-3 py-1.5 rounded-full font-medium
                ${
                  mode === "expense"
                    ? isDark
                      ? "bg-slate-800 text-emerald-200 shadow-sm"
                      : "bg-white text-emerald-700 shadow-sm"
                    : isDark
                    ? "text-slate-300"
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
                px-3 py-1.5 rounded-full font-medium
                ${
                  mode === "income"
                    ? isDark
                      ? "bg-slate-800 text-emerald-200 shadow-sm"
                      : "bg-white text-emerald-700 shadow-sm"
                    : isDark
                    ? "text-slate-300"
                    : "text-slate-500"
                }
              `}
            >
              収入
            </button>
          </div>
        </div>
        {/* 日付＋カテゴリ＋支出元/入金元 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 日付 */}
          <div className="space-y-1.5 min-w-0">
            <label
              className={`block text-[11px] font-medium ${
                isDark ? "text-slate-200" : "text-slate-600"
              }`}
            >
              日付
            </label>
            <div
              className="w-full rounded-full border overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-400"
              style={{
                backgroundColor: isDark ? "#0f172a" : "white",
                borderColor: isDark ? "#475569" : "#e2e8f0",
              }}
            >
              <input
                type="date"
                value={dateStr}
                onChange={(e) => onChangeDate(e.target.value)}
                className="w-full bg-transparent px-3 py-1.5 text-xs text-ellipsis"
                style={{
                  color: isDark ? "#e2e8f0" : "#334155",
                }}
              />
            </div>
          </div>

          {/* カテゴリ */}
          <div className="space-y-1.5 min-w-0">
            <label
              className={`block text-[11px] ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              カテゴリ
            </label>

            {/* 自由入力欄 */}
            <input
              type="text"
              className="
                w-full rounded-lg border
                px-2 py-1 text-[12px]
                focus:outline-none focus:ring-2 focus:ring-emerald-300
              "
              style={{
                backgroundColor: isDark ? "#0f172a" : "white",
                color: isDark ? "#e2e8f0" : "#1f2937",
                borderColor: isDark ? "#475569" : "#cbd5e1",
              }}
              value={customCategory || category}
              onChange={(e) => {
                onChangeCategory(e.target.value);
                onChangeCustomCategory(e.target.value);
              }}
              placeholder={
                mode === "expense"
                  ? "例：食費 / 日用品 など"
                  : "例：給与 / ボーナス / 臨時収入 など"
              }
            />

            {/* 候補から選ぶボタン（入力欄の“真下”） */}
            <div ref={categoryRef} className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowCategorySuggestions((prev) => !prev)}
                className="
                    rounded-full border
                    px-4 py-1.5 text-[12px]
                    hover:bg-slate-100
                  "
                style={{
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  color: isDark ? "#e2e8f0" : "#334155",
                  borderColor: isDark ? "#475569" : "#cbd5e1",
                }}
              >
                候補から選ぶ
              </button>

              {showCategorySuggestions && (
                <div
                  className="
                    absolute z-20 mt-1
                    max-h-40 w-44 overflow-auto
                    rounded-lg border
                    bg-white shadow-lg
                  "
                  style={{
                    backgroundColor: isDark ? "#0f172a" : "white",
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                  }}
                >
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectCategory(opt)}
                      className={`
                        w-full px-2 py-1 text-left text-[11px]
                        hover:bg-emerald-50
                        ${opt === category ? "font-semibold" : ""}
                      `}
                      style={{
                        backgroundColor:
                          opt === category
                            ? isDark
                              ? "#065f46"
                              : "#ecfdf3"
                            : "transparent",
                        color:
                          opt === category
                            ? isDark
                              ? "#bbf7d0"
                              : "#047857"
                            : isDark
                            ? "#e2e8f0"
                            : "#334155",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 支出元 / 入金元 */}
          <div className="space-y-1.5">
            <label
              className={`block text-[11px] font-medium ${
                isDark ? "text-slate-200" : "text-slate-600"
              }`}
            >
              {mode === "expense" ? "支出元" : "入金元"}
            </label>

            {mode === "expense" ? (
              <>
                {/* 支出モード：選択式 */}
                <select
                  value={payFrom}
                  onChange={(e) => onChangePayFrom(e.target.value)}
                  className="
                    w-full border rounded-full
                    px-3 py-1.5 text-xs
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                  "
                  style={{
                    backgroundColor: isDark ? "#0f172a" : "white",
                    color: isDark ? "#e2e8f0" : "#334155",
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                  }}
                >
                  {payFromOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                {/* 収入モード：自由入力 */}
                <input
                  type="text"
                  value={payFrom}
                  onChange={(e) => onChangePayFrom(e.target.value)}
                  className="
                    w-full border rounded-full
                    px-3 py-1.5 text-xs
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                  "
                  style={{
                    backgroundColor: isDark ? "#0f172a" : "white",
                    color: isDark ? "#e2e8f0" : "#334155",
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                  }}
                  placeholder="例: 給与、〇〇銀行、フリマ売上 など"
                />
                <p
                  className={`text-[10px] ${
                    isDark ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  入金元を自由に入力できます。（会社名・銀行名・サービス名など）
                </p>
              </>
            )}
          </div>
        </div>

        {/* 店舗/相手先 */}
        <div className="space-y-1.5">
          <label
            className={`block text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            店舗・相手先（任意）
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => onChangeShopName(e.target.value)}
            className="
              w-full rounded-lg border
              px-3 py-2 text-[12px]
              focus:outline-none focus:ring-2 focus:ring-emerald-300
            "
            style={{
              backgroundColor: isDark ? "#0f172a" : "white",
              color: isDark ? "#e2e8f0" : "#334155",
              borderColor: isDark ? "#475569" : "#e2e8f0",
            }}
            placeholder="例：スーパー〇〇 / Amazon / 給与振込 など"
          />
        </div>

        {/* メモ */}
        <div className="space-y-1.5">
          <label
            className={`block text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
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
            style={{
              backgroundColor: isDark ? "#0f172a" : "white",
              color: isDark ? "#e2e8f0" : "#334155",
              borderColor: isDark ? "#475569" : "#e2e8f0",
            }}
            placeholder="用途やメモを書き残せます。"
          />
        </div>

        {/* 金額＋追加ボタン */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex-1">
            <NumberInput
              label="金額"
              value={amount}
              onChange={onChangeAmount}
              placeholder="例: 3,000"
              isDark={isDark}
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
