"use client";

import React, { useEffect, useRef, useState } from "react";
import { DetailRecord, Mode } from "../../types/calendar";
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
  isDark?: boolean;
  onChange: (index: number, record: DetailRecord) => void;
  onDelete: (index: number) => void;
  expenseCategoryOptions?: string[];
  incomeCategoryOptions?: string[];
  payFromOptions?: string[];
  onSaveCategoryOptions?: (targetMode: Mode, list: string[]) => void;
};

export function DetailListItem({
  record,
  index,
  isDark = false,
  onChange,
  onDelete,
  expenseCategoryOptions = [...EXPENSE_CATEGORIES],
  incomeCategoryOptions = [...INCOME_CATEGORIES],
  payFromOptions = [...PAY_FROM_OPTIONS],
  onSaveCategoryOptions,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCategoryManagerEdit, setIsCategoryManagerEdit] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryManagerTab, setCategoryManagerTab] = useState<Mode>("expense");
  const [expenseCategoryDraft, setExpenseCategoryDraft] = useState<string[]>([]);
  const [incomeCategoryDraft, setIncomeCategoryDraft] = useState<string[]>([]);
  const [showPayFromSuggestions, setShowPayFromSuggestions] = useState(false);
  const payFromRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isEditing) return;
    setIsCategoryPickerOpen(false);
    setShowPayFromSuggestions(false);
  }, [isEditing]);

  useEffect(() => {
    if (!showPayFromSuggestions) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showPayFromSuggestions &&
        payFromRef.current &&
        !payFromRef.current.contains(target)
      ) {
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
    setCategoryManagerTab(record.mode);
    setIsCategoryManagerEdit(true);
    setExpenseCategoryDraft([...expenseCategoryOptions]);
    setIncomeCategoryDraft([...incomeCategoryOptions]);
    setIsCategoryPickerOpen(false);
    setIsCategoryManagerOpen(true);
  };

  const updateCategoryDraft = (tab: Mode, idx: number, value: string) => {
    if (tab === "expense") {
      setExpenseCategoryDraft((prev) =>
        prev.map((item, i) => (i === idx ? value : item))
      );
      return;
    }
    setIncomeCategoryDraft((prev) =>
      prev.map((item, i) => (i === idx ? value : item))
    );
  };

  const removeCategoryDraft = (tab: Mode, idx: number) => {
    if (tab === "expense") {
      setExpenseCategoryDraft((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setIncomeCategoryDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveCategoryManager = () => {
    if (!onSaveCategoryOptions) {
      setIsCategoryManagerOpen(false);
      return;
    }
    onSaveCategoryOptions("expense", normalizeCategoryList(expenseCategoryDraft));
    onSaveCategoryOptions("income", normalizeCategoryList(incomeCategoryDraft));
    setIsCategoryManagerOpen(false);
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
    setIsAddCategoryModalOpen(false);
    setNewCategoryName("");
  };

  if (!isEditing) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div>
            <p className="text-[11px] text-slate-500">カテゴリ</p>
            <p className="mt-0.5 text-slate-800 font-medium">
              {record.category?.trim() || "未設定"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">金額</p>
            <p className="mt-0.5 text-slate-800 font-semibold">
              {formatAmountInt(record.amount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">
              {record.mode === "income" ? "入金元" : "支出元"}
            </p>
            <p className="mt-0.5 text-slate-800 font-medium">
              {record.payFrom?.trim() || "未設定"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">メモ</p>
            <p className="mt-0.5 text-slate-700 whitespace-pre-wrap break-words">
              {record.memo?.trim() || "なし"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100"
          >
            削除
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2">
      {/* 上段：カテゴリ＋金額 */}
      <div className="flex items-start justify-between gap-3">
        {/* カテゴリ */}
        <div className="flex-1 space-y-1">
          <label className="block text-[11px] text-slate-500">カテゴリ</label>
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
          <button
            type="button"
            onClick={() => setIsCategoryPickerOpen(true)}
            className="
              rounded-full border border-slate-300
              bg-slate-50 px-4 py-1.5 text-[12px]
              text-slate-700 hover:bg-slate-100
            "
          >
            カテゴリを選ぶ
          </button>
          <p className="text-[10px] text-slate-400">
            直接入力してもOKです。「カテゴリを選ぶ」を押すと、よく使うカテゴリ一覧から選べます。
          </p>
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
              const amount = Number.isNaN(num) ? 0 : num;

              onChange(index, {
                ...record,
                amount,
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

      {/* 下段：支出元 ＋ メモ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 左カラム：支出元 */}
        <div className="space-y-2">
          {/* 支出元 / 入金元 */}
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-500">
              {record.mode === "income" ? "入金元" : "支出元"}
            </label>
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

            <div ref={payFromRef} className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowPayFromSuggestions((prev) => !prev)}
                className="
                  rounded-full border border-slate-300
                  bg-slate-50 px-4 py-1.5 text-[12px]
                  text-slate-700 hover:bg-slate-100
                "
              >
                候補から選ぶ
              </button>

              {showPayFromSuggestions && (
                <div
                  className="
                    absolute z-20 mt-1
                    max-h-40 w-44 overflow-auto
                    rounded-lg border border-slate-200
                    bg-white shadow-lg
                  "
                >
                  {payFromOptions.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        onChange(
                          index,
                          { ...record, payFrom: src } as DetailRecord
                        );
                        setShowPayFromSuggestions(false);
                      }}
                      className={`
                        w-full px-2 py-1 text-left text-[11px]
                        hover:bg-emerald-50
                        ${
                          src === record.payFrom
                            ? "bg-emerald-50 text-emerald-700 font-semibold"
                            : "text-slate-700"
                        }
                      `}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              直接入力してもOKです。「候補から選ぶ」を押すと、よく使う支出元・入金元から選べます。
            </p>
          </div>

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
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
        >
          編集を閉じる
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-[11px] font-medium text-red-500 hover:text-red-600"
        >
          この項目を削除
        </button>
      </div>
    </div>
    {isCategoryPickerOpen && (
      <div className="fixed inset-0 z-[70] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
        <div
          className={`mx-auto w-full max-w-xl max-h-[calc(100vh-3rem)] rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
            isDark
              ? "border-slate-700 bg-slate-900 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
          style={{
            maxHeight:
              "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem)",
          }}
        >
          <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 shrink-0 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <button
              type="button"
              onClick={() => setIsCategoryPickerOpen(false)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                isDark
                  ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={openCategoryManagerFromPicker}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-100"
            >
              追加・編集
            </button>
          </div>
          <div className="px-4 py-4 overflow-y-auto overscroll-contain flex-1 min-h-0">
            <p className={`mb-3 text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {record.mode === "expense" ? "支出" : "収入"}カテゴリを選択
            </p>
            <div className={`rounded-xl border overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              {(record.mode === "expense"
                ? expenseCategoryOptions
                : incomeCategoryOptions
              ).map((cat, idx) => (
                <button
                  key={`${record.mode}-${cat}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(index, { ...record, category: cat } as DetailRecord);
                    setIsCategoryPickerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between border-b last:border-b-0 px-3 py-3 text-left ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>{cat}</span>
                  <span className="text-slate-400">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {isCategoryManagerOpen && (
      <div className="fixed inset-0 z-[75] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
        <div
          className={`mx-auto w-full max-w-xl max-h-[calc(100vh-3rem)] rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
            isDark
              ? "border-slate-700 bg-slate-900 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
          style={{
            maxHeight:
              "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem)",
          }}
        >
          <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 shrink-0 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="w-16" />
            <div className={`inline-flex rounded-full p-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
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
              onClick={() => setIsCategoryManagerOpen(false)}
              className={`text-sm font-medium ${
                isDark ? "text-slate-300 hover:text-slate-100" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              閉じる
            </button>
          </div>
          <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 min-h-0">
            <button
              type="button"
              onClick={() => {
                setNewCategoryName("");
                setIsAddCategoryModalOpen(true);
              }}
              className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
              }`}
            >
              新規カテゴリの追加
            </button>
            <div className={`rounded-xl border overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              {(categoryManagerTab === "expense"
                ? expenseCategoryDraft
                : incomeCategoryDraft
              ).map((item, idx) => {
                if (!isCategoryManagerEdit) {
                  return (
                    <button
                      key={`${categoryManagerTab}-view-${idx}`}
                      type="button"
                      onClick={() => setIsCategoryManagerEdit(true)}
                      className={`w-full px-3 py-3 text-left border-b last:border-b-0 ${
                        isDark
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  );
                }
                return (
                  <div
                    key={`${categoryManagerTab}-${idx}`}
                    className={`flex items-center gap-2 border-b last:border-b-0 px-3 py-2 ${
                      isDark ? "border-slate-700" : "border-slate-100"
                    }`}
                  >
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateCategoryDraft(
                          categoryManagerTab,
                          idx,
                          e.target.value
                        )
                      }
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${
                        isDark
                          ? "border-slate-600 bg-slate-800 text-slate-100"
                          : "border-slate-300 bg-white text-slate-800"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCategoryDraft(categoryManagerTab, idx)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      削除
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`sticky bottom-0 z-10 flex justify-end gap-2 border-t px-4 py-3 shrink-0 backdrop-blur-sm ${
            isDark ? "border-slate-700 bg-slate-900/95" : "border-slate-200 bg-white/95"
          }`}>
            <button
              type="button"
              onClick={() => setIsCategoryManagerOpen(false)}
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
      <div className="fixed inset-0 z-[76] bg-black/60 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] overflow-y-auto sm:px-6">
        <div className={`mx-auto mt-20 w-full max-w-sm rounded-2xl border p-4 shadow-xl ${
          isDark
            ? "border-slate-700 bg-slate-900 text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        }`}>
          <h3 className="text-sm font-semibold">新規カテゴリの追加</h3>
          <p className={`mt-1 text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
              onClick={() => {
                setIsAddCategoryModalOpen(false);
                setNewCategoryName("");
              }}
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
    </>
  );
}
