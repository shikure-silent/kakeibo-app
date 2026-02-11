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
  saveExpenseCategories,
  saveIncomeCategories,
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
  memo,
  onChangeMemo,
  amount,
  onChangeAmount,
  onSubmit,
  isDark = false,
}: Props) {
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryManagerTab, setCategoryManagerTab] = useState<Mode>(mode);
  const [isCategoryManagerEdit, setIsCategoryManagerEdit] = useState(false);
  const [expenseCategoryDraft, setExpenseCategoryDraft] = useState<string[]>([]);
  const [incomeCategoryDraft, setIncomeCategoryDraft] = useState<string[]>([]);

  const [showPayFromSuggestions, setShowPayFromSuggestions] = useState(false);
  const payFromRef = useRef<HTMLDivElement | null>(null);

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
    if (!showPayFromSuggestions) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (payFromRef.current && !payFromRef.current.contains(target)) {
        setShowPayFromSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showPayFromSuggestions]);

  useEffect(() => {
    const isAnyCategoryModalOpen =
      isCategoryPickerOpen || isCategoryManagerOpen || isAddCategoryModalOpen;
    if (!isAnyCategoryModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isCategoryPickerOpen, isCategoryManagerOpen, isAddCategoryModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSelectCategory = (value: string) => {
    onChangeCategory(value);
    onChangeCustomCategory("");
  };

  const normalizeCategoryList = (list: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    list.forEach((item) => {
      const t = item.trim();
      if (!t || seen.has(t)) return;
      seen.add(t);
      out.push(t);
    });
    return out;
  };

  const openCategoryManagerFromPicker = () => {
    setCategoryManagerTab(mode);
    setIsCategoryManagerEdit(true);
    setExpenseCategoryDraft([...expenseCategoryOptions]);
    setIncomeCategoryDraft([...incomeCategoryOptions]);
    setIsCategoryPickerOpen(false);
    setIsCategoryManagerOpen(true);
  };

  const closeCategoryManager = () => {
    setIsCategoryManagerOpen(false);
  };

  const openAddCategoryModal = () => {
    setNewCategoryName("");
    setIsAddCategoryModalOpen(true);
  };

  const closeAddCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
    setNewCategoryName("");
  };

  const confirmAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      window.alert("カテゴリ名を入力してください。");
      return;
    }

    if (categoryManagerTab === "expense") {
      if (expenseCategoryDraft.some((item) => item.trim() === trimmed)) {
        window.alert("同じカテゴリ名がすでにあります。");
        return;
      }
      setExpenseCategoryDraft((prev) => [...prev, trimmed]);
    } else {
      if (incomeCategoryDraft.some((item) => item.trim() === trimmed)) {
        window.alert("同じカテゴリ名がすでにあります。");
        return;
      }
      setIncomeCategoryDraft((prev) => [...prev, trimmed]);
    }
    closeAddCategoryModal();
  };

  const updateCategoryDraft = (
    tab: Mode,
    index: number,
    value: string
  ) => {
    if (tab === "expense") {
      setExpenseCategoryDraft((prev) =>
        prev.map((item, i) => (i === index ? value : item))
      );
      return;
    }
    setIncomeCategoryDraft((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const removeCategoryDraft = (tab: Mode, index: number) => {
    if (tab === "expense") {
      setExpenseCategoryDraft((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setIncomeCategoryDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const saveCategoryManager = () => {
    const nextExpense = normalizeCategoryList(expenseCategoryDraft);
    const nextIncome = normalizeCategoryList(incomeCategoryDraft);

    if (nextExpense.length === 0 || nextIncome.length === 0) {
      window.alert("支出カテゴリ・収入カテゴリは最低1件必要です。");
      return;
    }

    saveExpenseCategories(nextExpense);
    saveIncomeCategories(nextIncome);
    setExpenseCategoryOptions(nextExpense);
    setIncomeCategoryOptions(nextIncome);
    setIsCategoryManagerOpen(false);
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
                lang="ja-JP"
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

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(true)}
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
                カテゴリを選ぶ
              </button>
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
                <div ref={payFromRef} className="relative inline-block">
                  <button
                    type="button"
                    onClick={() =>
                      setShowPayFromSuggestions((prev) => !prev)
                    }
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

                  {showPayFromSuggestions && (
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
                      {payFromOptions.map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => {
                            onChangePayFrom(src);
                            setShowPayFromSuggestions(false);
                          }}
                          className={`
                            w-full px-2 py-1 text-left text-[11px]
                            hover:bg-emerald-50
                            ${src === payFrom ? "font-semibold" : ""}
                          `}
                          style={{
                            backgroundColor:
                              src === payFrom
                                ? isDark
                                  ? "#065f46"
                                  : "#ecfdf3"
                                : "transparent",
                            color:
                              src === payFrom
                                ? isDark
                                  ? "#bbf7d0"
                                  : "#047857"
                                : isDark
                                ? "#e2e8f0"
                                : "#334155",
                          }}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

      {isCategoryPickerOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
          <div
            className={`mx-auto w-full max-w-xl max-h-[calc(100vh-3rem)] rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
            style={{
              maxHeight:
                "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem)",
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3 shrink-0 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(false)}
                className="rounded-full border px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={openCategoryManagerFromPicker}
                className="rounded-full border px-3 py-1.5 text-sm font-medium text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
              >
                追加・編集
              </button>
            </div>

            <div className="px-4 py-4 overflow-y-auto overscroll-contain flex-1 min-h-0">
              <p
                className={`text-xs mb-3 ${
                  isDark ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {mode === "expense" ? "支出" : "収入"}カテゴリを選択
              </p>
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                {(mode === "expense"
                  ? expenseCategoryOptions
                  : incomeCategoryOptions
                ).map((item, index) => (
                  <button
                    key={`${mode}-${item}-${index}`}
                    type="button"
                    onClick={() => {
                      handleSelectCategory(item);
                      setIsCategoryPickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 text-left border-b last:border-b-0 ${
                      isDark
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm">{item}</span>
                    <span className="text-slate-400">›</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[85] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
          <div
            className={`mx-auto w-full max-w-xl max-h-[calc(100vh-3rem)] rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
            style={{
              maxHeight:
                "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem)",
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3 shrink-0 dark:border-slate-700">
              <div className="w-16" />

              <div
                className={`inline-flex rounded-full p-1 ${
                  isDark ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCategoryManagerTab("expense")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    categoryManagerTab === "expense"
                      ? isDark
                        ? "bg-slate-700 text-slate-100"
                        : "bg-white text-slate-800"
                      : isDark
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  支出
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryManagerTab("income")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    categoryManagerTab === "income"
                      ? isDark
                        ? "bg-slate-700 text-slate-100"
                        : "bg-white text-slate-800"
                      : isDark
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  収入
                </button>
              </div>

              <button
                type="button"
                onClick={closeCategoryManager}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
              >
                閉じる
              </button>
            </div>

            <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 min-h-0">
              <button
                type="button"
                onClick={openAddCategoryModal}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                }`}
              >
                新規カテゴリの追加
              </button>

              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                {(categoryManagerTab === "expense"
                  ? expenseCategoryDraft
                  : incomeCategoryDraft
                ).map((item, index) => {
                  if (isCategoryManagerEdit) {
                    return (
                      <div
                        key={`${categoryManagerTab}-${index}`}
                        className={`flex items-center gap-2 px-3 py-2 border-b last:border-b-0 ${
                          isDark ? "border-slate-700" : "border-slate-100"
                        }`}
                      >
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateCategoryDraft(
                              categoryManagerTab,
                              index,
                              e.target.value
                            )
                          }
                          placeholder="カテゴリ名を入力"
                          className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${
                            isDark
                              ? "border-slate-600 bg-slate-800 text-slate-100"
                              : "border-slate-300 bg-white text-slate-800"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeCategoryDraft(categoryManagerTab, index)
                          }
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          削除
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`${categoryManagerTab}-${index}`}
                      type="button"
                      onClick={() => {
                        handleSelectCategory(item);
                        setIsCategoryManagerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 text-left border-b last:border-b-0 ${
                        isDark
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm">{item}</span>
                      <span className="text-slate-400">›</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`sticky bottom-0 z-10 flex justify-end gap-2 border-t px-4 py-3 shrink-0 backdrop-blur-sm ${
                isDark
                  ? "border-slate-700 bg-slate-900/95"
                  : "border-slate-200 bg-white/95"
              }`}
            >
              <button
                type="button"
                onClick={closeCategoryManager}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  isDark
                    ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveCategoryManager}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/60 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6 overflow-y-auto">
          <div
            className={`mx-auto mt-20 w-full max-w-sm rounded-2xl border p-4 shadow-xl ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <h3 className="text-sm font-semibold">新規カテゴリの追加</h3>
            <p
              className={`mt-1 text-[11px] ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {categoryManagerTab === "expense" ? "支出" : "収入"}カテゴリに追加します。
            </p>

            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="カテゴリ名を入力"
              className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-slate-100"
                  : "border-slate-300 bg-white text-slate-800"
              }`}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAddCategoryModal}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  isDark
                    ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmAddCategory}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
