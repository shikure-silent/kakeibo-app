"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
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
  const PICKER_ROW_HEIGHT = 48;
  const PICKER_SHEET_HEIGHT = 192;
  const PICKER_EDGE_SPACE = (PICKER_SHEET_HEIGHT - PICKER_ROW_HEIGHT) / 2;

  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryManagerTab, setCategoryManagerTab] = useState<Mode>(mode);
  const [isCategoryManagerEdit, setIsCategoryManagerEdit] = useState(false);
  const [dragCategoryIndex, setDragCategoryIndex] = useState<number | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [dragGhostY, setDragGhostY] = useState<number | null>(null);
  const [expenseCategoryDraft, setExpenseCategoryDraft] = useState<string[]>([]);
  const [incomeCategoryDraft, setIncomeCategoryDraft] = useState<string[]>([]);
  const touchDragTimerRef = useRef<number | null>(null);
  const touchDragStartedRef = useRef(false);
  const touchDragStartYRef = useRef(0);

  const [showPayFromSuggestions, setShowPayFromSuggestions] = useState(false);
  const payFromRef = useRef<HTMLDivElement | null>(null);
  const pickerScrollRef = useRef<HTMLDivElement | null>(null);
  const pickerScrollStopTimerRef = useRef<number | null>(null);
  const pickerScrollRafRef = useRef<number | null>(null);
  const pickerTouchingRef = useRef(false);
  const lastPickerIndexRef = useRef<number>(-1);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [pickerVisualCenter, setPickerVisualCenter] = useState(0);

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

  useEffect(() => {
    return () => {
      if (touchDragTimerRef.current !== null) {
        window.clearTimeout(touchDragTimerRef.current);
      }
      if (pickerScrollStopTimerRef.current !== null) {
        window.clearTimeout(pickerScrollStopTimerRef.current);
      }
      if (pickerScrollRafRef.current !== null) {
        window.cancelAnimationFrame(pickerScrollRafRef.current);
      }
    };
  }, []);

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

  const moveCategoryDraft = (tab: Mode, from: number, to: number) => {
    if (from === to) return;
    const move = (list: string[]) => {
      const next = [...list];
      const [picked] = next.splice(from, 1);
      next.splice(to, 0, picked);
      return next;
    };
    if (tab === "expense") {
      setExpenseCategoryDraft((prev) => move(prev));
      return;
    }
    setIncomeCategoryDraft((prev) => move(prev));
  };

  const clearTouchDragTimer = () => {
    if (touchDragTimerRef.current !== null) {
      window.clearTimeout(touchDragTimerRef.current);
      touchDragTimerRef.current = null;
    }
  };

  const startTouchDrag = (event: React.TouchEvent, index: number) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    touchDragStartedRef.current = false;
    touchDragStartYRef.current = touch.clientY;
    clearTouchDragTimer();
    touchDragTimerRef.current = window.setTimeout(() => {
      touchDragStartedRef.current = true;
      setDragCategoryIndex(index);
      setTouchDragIndex(index);
      setDragGhostY(touch.clientY);
    }, 260);
  };

  const handleTouchDragMove = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    if (!touchDragStartedRef.current) {
      event.preventDefault();
      if (Math.abs(touch.clientY - touchDragStartYRef.current) > 8) {
        clearTouchDragTimer();
      }
      return;
    }
    event.preventDefault();
    setDragGhostY(touch.clientY);
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as
      | HTMLElement
      | null;
    const row = target?.closest("[data-category-row-index]") as
      | HTMLElement
      | null;
    if (!row) return;
    const to = Number(row.dataset.categoryRowIndex);
    if (touchDragIndex == null || Number.isNaN(to) || to === touchDragIndex) {
      return;
    }
    moveCategoryDraft(categoryManagerTab, touchDragIndex, to);
    setTouchDragIndex(to);
    setDragCategoryIndex(to);
  };

  const endTouchDrag = () => {
    clearTouchDragTimer();
    if (touchDragStartedRef.current) {
      setDragCategoryIndex(null);
      setTouchDragIndex(null);
      setDragGhostY(null);
    }
    touchDragStartedRef.current = false;
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

  const pickerOptions =
    mode === "expense" ? expenseCategoryOptions : incomeCategoryOptions;

  const runSelectionHaptic = async (
    type: "selectionStart" | "selectionChanged" | "selectionEnd"
  ) => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
      return;
    }
    type HapticsPluginLike = {
      selectionStart?: () => Promise<void> | void;
      selectionChanged?: () => Promise<void> | void;
      selectionEnd?: () => Promise<void> | void;
    };
    const plugins = (
      window as typeof window & {
        Capacitor?: { Plugins?: { Haptics?: HapticsPluginLike } };
      }
    ).Capacitor?.Plugins;
    const haptics = plugins?.Haptics;
    if (!haptics || typeof haptics[type] !== "function") return;
    try {
      await haptics[type]();
    } catch {
      // ignore
    }
  };

  const syncPickerSelection = (index: number, updateVisual = true) => {
    const next = Math.max(0, Math.min(index, pickerOptions.length - 1));
    setPickerIndex((prev) => (prev === next ? prev : next));
    if (updateVisual) {
      setPickerVisualCenter(next);
    }
    if (lastPickerIndexRef.current !== next) {
      lastPickerIndexRef.current = next;
      void runSelectionHaptic("selectionChanged");
    }
  };

  const commitPickerSelection = (index: number) => {
    const value = pickerOptions[index];
    if (value && (customCategory.trim() !== "" || category !== value)) {
      handleSelectCategory(value);
    }
  };

  const snapToNearestIndex = (scrollTop: number) => {
    if (pickerOptions.length === 0) return 0;
    return Math.max(
      0,
      Math.min(Math.round(scrollTop / PICKER_ROW_HEIGHT), pickerOptions.length - 1)
    );
  };

  const getNearestPickerIndexFromDom = useCallback(() => {
    const el = pickerScrollRef.current;
    if (!el || pickerOptions.length === 0) return 0;
    const centerY = el.getBoundingClientRect().top + el.clientHeight / 2;
    const items = el.querySelectorAll<HTMLElement>("[data-picker-item-index]");
    let nearest = 0;
    let minDistance = Number.POSITIVE_INFINITY;
    items.forEach((node) => {
      const idx = Number(node.dataset.pickerItemIndex);
      if (Number.isNaN(idx)) return;
      const rect = node.getBoundingClientRect();
      const nodeCenter = rect.top + rect.height / 2;
      const distance = Math.abs(centerY - nodeCenter);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = idx;
      }
    });
    return Math.max(0, Math.min(nearest, pickerOptions.length - 1));
  }, [pickerOptions.length]);

  const closeCategoryPicker = () => {
    const el = pickerScrollRef.current;
    const next =
      el != null
        ? getNearestPickerIndexFromDom()
        : snapToNearestIndex(pickerIndex * PICKER_ROW_HEIGHT);
    syncPickerSelection(next);
    commitPickerSelection(next);
    scrollPickerToIndex(next, false);
    setIsCategoryPickerOpen(false);
  };

  const openCategoryManagerFromPickerWithCommit = () => {
    const el = pickerScrollRef.current;
    const next =
      el != null
        ? getNearestPickerIndexFromDom()
        : snapToNearestIndex(pickerIndex * PICKER_ROW_HEIGHT);
    syncPickerSelection(next);
    commitPickerSelection(next);
    openCategoryManagerFromPicker();
  };

  const scrollPickerToIndex = (index: number, smooth = true) => {
    const el = pickerScrollRef.current;
    if (!el) return;
    const top = Math.max(0, index) * PICKER_ROW_HEIGHT;
    el.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  };

  const snapPickerToNearest = (smooth = true) => {
    const el = pickerScrollRef.current;
    if (!el || pickerOptions.length === 0) return;
    const next = getNearestPickerIndexFromDom();
    syncPickerSelection(next);
    commitPickerSelection(next);
    scrollPickerToIndex(next, smooth);
  };

  const startPickerInteraction = () => {
    if (!pickerTouchingRef.current) {
      pickerTouchingRef.current = true;
      void runSelectionHaptic("selectionStart");
    }
  };

  const endPickerInteraction = () => {
    if (!pickerTouchingRef.current) return;
    pickerTouchingRef.current = false;
    snapPickerToNearest();
    void runSelectionHaptic("selectionEnd");
  };

  const handlePickerScroll = () => {
    const el = pickerScrollRef.current;
    if (!el || pickerOptions.length === 0) return;
    if (pickerScrollRafRef.current === null) {
      pickerScrollRafRef.current = window.requestAnimationFrame(() => {
        pickerScrollRafRef.current = null;
        const next = getNearestPickerIndexFromDom();
        setPickerVisualCenter(next);
        syncPickerSelection(next, false);
      });
    }
    if (pickerScrollStopTimerRef.current !== null) {
      window.clearTimeout(pickerScrollStopTimerRef.current);
    }
    pickerScrollStopTimerRef.current = window.setTimeout(() => {
      if (!pickerTouchingRef.current) {
        snapPickerToNearest();
      }
    }, 90);
  };

  useEffect(() => {
    if (!isCategoryPickerOpen) return;
    const index = Math.max(0, pickerOptions.indexOf(category));
    setPickerIndex(index);
    setPickerVisualCenter(index);
    lastPickerIndexRef.current = index;
    requestAnimationFrame(() => {
      scrollPickerToIndex(index, false);
      setPickerVisualCenter(getNearestPickerIndexFromDom());
    });
  }, [isCategoryPickerOpen, pickerOptions, category, getNearestPickerIndexFromDom]);

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
        <div className="fixed inset-0 z-[80] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4 flex items-end justify-center">
          <div
            className={`mx-auto w-full max-w-sm rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
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
                onClick={closeCategoryPicker}
                className="rounded-full border px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={openCategoryManagerFromPickerWithCommit}
                className="rounded-full border px-3 py-1.5 text-sm font-medium text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
              >
                追加・編集
              </button>
            </div>

            <div className="px-3 py-3 overflow-y-auto overscroll-contain flex-1 min-h-0">
              <p
                className={`text-xs mb-3 ${
                  isDark ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {mode === "expense" ? "支出" : "収入"}カテゴリを選択
              </p>
              <div className="relative mx-auto w-full max-w-sm">
                <div
                  className={`pointer-events-none absolute inset-x-0 top-1/2 z-10 h-12 -translate-y-1/2 rounded-xl border bg-transparent ${
                    isDark
                      ? "border-slate-600"
                      : "border-slate-300"
                  }`}
                />
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-12 rounded-t-xl ${
                    isDark
                      ? "bg-gradient-to-b from-slate-900 to-transparent"
                      : "bg-gradient-to-b from-white to-transparent"
                  }`}
                />
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 rounded-b-xl ${
                    isDark
                      ? "bg-gradient-to-t from-slate-900 to-transparent"
                      : "bg-gradient-to-t from-white to-transparent"
                  }`}
                />
                <div
                  ref={pickerScrollRef}
                  onScroll={handlePickerScroll}
                  onTouchStart={startPickerInteraction}
                  onTouchEnd={endPickerInteraction}
                  onTouchCancel={endPickerInteraction}
                  onMouseDown={startPickerInteraction}
                  onMouseUp={endPickerInteraction}
                  onMouseLeave={endPickerInteraction}
                  className={`h-48 overflow-y-auto snap-y snap-mandatory rounded-xl border overscroll-contain ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <div style={{ height: PICKER_EDGE_SPACE }} />
                  {(mode === "expense"
                    ? expenseCategoryOptions
                    : incomeCategoryOptions
                  ).map((item, index) => {
                    const distance = Math.abs(pickerVisualCenter - index);
                    const isCenter = distance === 0;
                    return (
                      <button
                        key={`${mode}-${item}-${index}`}
                        data-picker-item-index={index}
                        type="button"
                        onClick={() => {
                          syncPickerSelection(index);
                          scrollPickerToIndex(index);
                          commitPickerSelection(index);
                        }}
                        className={`h-12 w-full snap-center px-3 text-center leading-none transition-all duration-150 ${
                          isCenter
                            ? isDark
                              ? "text-slate-100 font-medium"
                              : "text-slate-800 font-medium"
                            : distance === 1
                            ? isDark
                              ? "text-slate-400"
                              : "text-slate-600"
                            : isDark
                            ? "text-slate-600"
                            : "text-slate-500"
                        }`}
                        style={{
                          fontSize: isCenter ? "28px" : distance === 1 ? "22px" : "18px",
                          opacity: isCenter ? 1 : distance === 1 ? 0.96 : 0.9,
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                  <div style={{ height: PICKER_EDGE_SPACE }} />
                </div>
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
              height:
                "min(42rem, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem))",
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
                        draggable
                        data-category-row-index={index}
                        onDragStart={() => setDragCategoryIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragCategoryIndex == null) return;
                          moveCategoryDraft(categoryManagerTab, dragCategoryIndex, index);
                          setDragCategoryIndex(index);
                        }}
                        onDragEnd={() => setDragCategoryIndex(null)}
                        className={`flex items-center gap-2 px-3 py-2 border-b last:border-b-0 ${
                          isDark ? "border-slate-700" : "border-slate-100"
                        } ${dragCategoryIndex === index ? "opacity-40" : ""}`}
                      >
                        <button
                          type="button"
                          onTouchStart={(e) => startTouchDrag(e, index)}
                          onTouchMove={handleTouchDragMove}
                          onTouchEnd={endTouchDrag}
                          onTouchCancel={endTouchDrag}
                          onContextMenu={(e) => e.preventDefault()}
                          className={`shrink-0 cursor-grab active:cursor-grabbing text-sm select-none touch-none ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            WebkitTouchCallout: "none",
                          }}
                          aria-label="ドラッグで並び替え"
                          title="ドラッグで並び替え"
                        >
                          ⋮⋮
                        </button>
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
            {touchDragIndex !== null && dragGhostY !== null && (
              <div
                className="pointer-events-none fixed left-1/2 z-[95] -translate-x-1/2"
                style={{ top: dragGhostY - 24 }}
              >
                <div
                  className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-lg ${
                    isDark
                      ? "border-slate-600 bg-slate-800 text-slate-100"
                      : "border-slate-300 bg-white text-slate-800"
                  }`}
                >
                  {(categoryManagerTab === "expense"
                    ? expenseCategoryDraft
                    : incomeCategoryDraft)[touchDragIndex] ?? "カテゴリ"}
                </div>
              </div>
            )}

            <div
              className={`flex justify-end gap-2 border-t px-4 py-3 shrink-0 backdrop-blur-sm ${
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
