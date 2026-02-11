"use client";

import React, { useEffect, useRef, useState } from "react";
import { DetailRecord, Mode } from "../../types/calendar";
import {
  PAY_FROM_OPTIONS,
} from "../../lib/const";
import {
  loadPayFromPresets,
} from "../../lib/settingsStorage";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (record: DetailRecord) => void;
  isDark?: boolean;
  expenseCategoryOptions: string[];
  incomeCategoryOptions: string[];
  onSaveCategoryOptions: (targetMode: Mode, list: string[]) => void;
};

const toHalfWidthNumber = (value: string) =>
  value.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

const formatAmountInt = (amount: number | null | undefined) => {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return "¥0";
  return "¥" + n.toLocaleString("ja-JP");
};

export function DetailAddModal({
  open,
  onClose,
  onConfirm,
  isDark = false,
  expenseCategoryOptions,
  incomeCategoryOptions,
  onSaveCategoryOptions,
}: Props) {
  const [payFromOptions] = useState<string[]>(
    loadPayFromPresets([...PAY_FROM_OPTIONS])
  );

  const [draft, setDraft] = useState<DetailRecord>(() => {
    const now = new Date();
    return {
      mode: "expense",
      amount: 0,
      category: "",
      payFrom: "",
      memo: "",
      shopName: "",
      date: "",
      createdAt: now.toISOString(),
    } as DetailRecord;
  });
  const [amountText, setAmountText] = useState("");
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
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

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

  const handleChangeDraft = <K extends keyof DetailRecord>(
    key: K,
    value: DetailRecord[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value } as DetailRecord));
  };

  const handleChangeAmount = (raw: string) => {
    const half = toHalfWidthNumber(raw);
    const digitsOnly = half.replace(/[^\d]/g, "");

    if (digitsOnly === "") {
      setAmountText("");
      handleChangeDraft("amount", 0 as DetailRecord["amount"]);
      return;
    }

    const num = Number(digitsOnly);
    const formatted = num.toLocaleString("ja-JP");

    setAmountText(formatted);
    handleChangeDraft(
      "amount",
      (Number.isNaN(num) ? 0 : num) as DetailRecord["amount"]
    );
  };

  const handleSubmit = () => {
    onConfirm(draft);
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
    setCategoryManagerTab(draft.mode);
    setIsCategoryManagerEdit(true);
    setExpenseCategoryDraft([...expenseCategoryOptions]);
    setIncomeCategoryDraft([...incomeCategoryOptions]);
    setIsCategoryPickerOpen(false);
    setIsCategoryManagerOpen(true);
  };

  const updateCategoryDraft = (tab: Mode, index: number, value: string) => {
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

  const saveCategoryManager = () => {
    const nextExpense = normalizeCategoryList(expenseCategoryDraft);
    const nextIncome = normalizeCategoryList(incomeCategoryDraft);
    onSaveCategoryOptions("expense", nextExpense);
    onSaveCategoryOptions("income", nextIncome);
    setIsCategoryManagerOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[calc(100vh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 space-y-3">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
          aria-label="閉じる"
        >
          ×
        </button>

        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">項目を追加</h2>
        </div>

        {/* 種類切り替え（支出 / 収入） */}
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-500">種類</label>
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => handleChangeDraft("mode", "expense")}
              className={`px-3 py-1.5 rounded-full font-medium ${
                draft.mode !== "income"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => handleChangeDraft("mode", "income")}
              className={`px-3 py-1.5 rounded-full font-medium ${
                draft.mode === "income"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              収入
            </button>
          </div>
        </div>

        {/* カテゴリ */}
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-500">
            カテゴリを選択
          </label>

          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={draft.category ?? ""}
            onChange={(e) => handleChangeDraft("category", e.target.value)}
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
        </div>

        {/* 支出元 / 入金元 */}
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-500">
            {draft.mode === "income" ? "入金元を選択" : "支出元を選択"}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={draft.payFrom ?? ""}
            onChange={(e) => handleChangeDraft("payFrom", e.target.value)}
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
                {payFromOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      handleChangeDraft("payFrom", opt);
                      setShowPayFromSuggestions(false);
                    }}
                    className={`
                      w-full px-2 py-1 text-left text-[11px]
                      hover:bg-emerald-50
                      ${
                        opt === draft.payFrom
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-slate-700"
                      }
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 金額（新規追加） */}
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-500">金額</label>
          <input
            type="text"
            inputMode="numeric"
            className="
              w-full rounded-lg border border-slate-300 bg-white
              px-2 py-1 text-[12px] text-slate-800
              focus:outline-none focus:ring-2 focus:ring-emerald-300
            "
            value={amountText}
            onChange={(e) => handleChangeAmount(e.target.value)}
            placeholder="例：1200"
          />
          <p className="text-[10px] text-slate-500">
            入力中:{" "}
            <span className="font-semibold">
              {formatAmountInt(
                amountText === "" ? 0 : Number(amountText.replace(/,/g, ""))
              )}
            </span>
          </p>
        </div>

        {/* メモ */}
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-500">
            メモ（任意）
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            value={draft.memo ?? ""}
            onChange={(e) => handleChangeDraft("memo", e.target.value)}
            placeholder="お店の名前や用途など"
          />
        </div>

        {/* ボタン */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-600"
          >
            この項目を追加
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
            <div
              className={`flex items-center justify-between gap-2 border-b px-4 py-3 shrink-0 ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}
            >
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
                {draft.mode === "expense" ? "支出" : "収入"}カテゴリを選択
              </p>
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                {(draft.mode === "expense"
                  ? expenseCategoryOptions
                  : incomeCategoryOptions
                ).map((cat, idx) => (
                  <button
                    key={`${draft.mode}-${cat}-${idx}`}
                    type="button"
                    onClick={() => {
                      handleChangeDraft("category", cat);
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
                ).map((item, index) => {
                  if (!isCategoryManagerEdit) {
                    return (
                      <button
                        key={`${categoryManagerTab}-view-${index}`}
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
                      key={`${categoryManagerTab}-${index}`}
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
                            index,
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
                        onClick={() =>
                          removeCategoryDraft(categoryManagerTab, index)
                        }
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
    </div>
  );
}
