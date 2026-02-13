"use client";

import { Capacitor } from "@capacitor/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const PICKER_ROW_HEIGHT = 48;
  const PICKER_SHEET_HEIGHT = 180;
  const PICKER_EDGE_SPACE = (PICKER_SHEET_HEIGHT - PICKER_ROW_HEIGHT) / 2;

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
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [dragCategoryIndex, setDragCategoryIndex] = useState<number | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [dragGhostY, setDragGhostY] = useState<number | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryManagerTab, setCategoryManagerTab] = useState<Mode>("expense");
  const [expenseCategoryDraft, setExpenseCategoryDraft] = useState<string[]>([]);
  const [incomeCategoryDraft, setIncomeCategoryDraft] = useState<string[]>([]);
  const [showPayFromSuggestions, setShowPayFromSuggestions] = useState(false);
  const payFromRef = useRef<HTMLDivElement | null>(null);
  const touchDragTimerRef = useRef<number | null>(null);
  const touchDragStartedRef = useRef(false);
  const touchDragStartYRef = useRef(0);
  const pickerScrollRef = useRef<HTMLDivElement | null>(null);
  const pickerScrollStopTimerRef = useRef<number | null>(null);
  const pickerScrollRafRef = useRef<number | null>(null);
  const pickerTouchingRef = useRef(false);
  const lastPickerIndexRef = useRef<number>(-1);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [pickerVisualCenter, setPickerVisualCenter] = useState(0);

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
      isCategoryPickerOpen ||
      isCategoryManagerOpen ||
      isAddCategoryModalOpen ||
      isSubmitConfirmOpen;
    if (!isAnyCategoryModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [
    isCategoryPickerOpen,
    isCategoryManagerOpen,
    isAddCategoryModalOpen,
    isSubmitConfirmOpen,
  ]);

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

  const handleChangeDraft = <K extends keyof DetailRecord>(
    key: K,
    value: DetailRecord[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value } as DetailRecord));
  };

  const handleSwitchMode = (nextMode: Mode) => {
    setDraft((prev) => {
      if (prev.mode === nextMode) return prev;
      return {
        ...prev,
        mode: nextMode,
        category: "",
      } as DetailRecord;
    });
    setIsCategoryPickerOpen(false);
    setShowPayFromSuggestions(false);
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
    setIsSubmitConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitConfirmOpen(false);
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

  const pickerOptions =
    draft.mode === "expense" ? expenseCategoryOptions : incomeCategoryOptions;

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
    if (value && draft.category !== value) {
      handleChangeDraft("category", value as DetailRecord["category"]);
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
    const index = Math.max(0, pickerOptions.indexOf(draft.category ?? ""));
    setPickerIndex(index);
    setPickerVisualCenter(index);
    lastPickerIndexRef.current = index;
    requestAnimationFrame(() => {
      scrollPickerToIndex(index, false);
      setPickerVisualCenter(getNearestPickerIndexFromDom());
    });
  }, [isCategoryPickerOpen, pickerOptions, draft.category, getNearestPickerIndexFromDom]);

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
              onClick={() => handleSwitchMode("expense")}
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
              onClick={() => handleSwitchMode("income")}
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
            {draft.mode === "income" ? "入金元を入力" : "支出元を選択"}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={draft.payFrom ?? ""}
            onChange={(e) => handleChangeDraft("payFrom", e.target.value)}
            placeholder={
              draft.mode === "income"
                ? "直接入力（例：会社名 / 銀行名 / サービス名 など）"
                : "直接入力（例：現金 / クレジットカード / 電子決済 など）"
            }
          />

          {draft.mode === "expense" && (
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
          )}
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
        <div
          className="fixed inset-0 z-[70] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4 flex items-end justify-center"
          onClick={closeCategoryPicker}
        >
          <div
          className={`mx-auto w-full max-w-[22rem] rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
            onClick={(e) => e.stopPropagation()}
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
                onClick={openCategoryManagerFromPickerWithCommit}
                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-100"
              >
                追加・編集
              </button>
              <button
                type="button"
                onClick={closeCategoryPicker}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  isDark
                    ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                完了
              </button>
            </div>
            <div className="px-3 py-3 overflow-y-auto overscroll-contain flex-1 min-h-0">
              <p className={`mb-3 text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                {draft.mode === "expense" ? "支出" : "収入"}カテゴリを選択
              </p>
              <div className="relative mx-auto w-full max-w-[20rem]">
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
                  className={`h-[180px] overflow-y-auto snap-y snap-mandatory rounded-xl border overscroll-contain ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <div style={{ height: PICKER_EDGE_SPACE }} />
                  {(draft.mode === "expense"
                    ? expenseCategoryOptions
                    : incomeCategoryOptions
                  ).map((cat, idx) => {
                    const distance = Math.abs(pickerVisualCenter - idx);
                    const isCenter = distance === 0;
                    return (
                    <button
                      key={`${draft.mode}-${cat}-${idx}`}
                      data-picker-item-index={idx}
                      type="button"
                      onClick={() => {
                        syncPickerSelection(idx);
                        scrollPickerToIndex(idx);
                        commitPickerSelection(idx);
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
                      {cat}
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
        <div className="fixed inset-0 z-[75] bg-black/60 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
          <div
            className={`mx-auto w-full max-w-xl max-h-[calc(100vh-3rem)] rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
            style={{
              height:
                "min(42rem, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem))",
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
                      className={`flex items-center gap-2 border-b last:border-b-0 px-3 py-2 ${
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
            <div className={`flex justify-end gap-2 border-t px-4 py-3 shrink-0 backdrop-blur-sm ${
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

      {isSubmitConfirmOpen && (
        <div
          className="fixed inset-0 z-[86] bg-black/60 px-4 flex items-center justify-center"
          onClick={() => setIsSubmitConfirmOpen(false)}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border p-4 shadow-xl ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold">この内容でよろしいですか？</h3>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSubmitConfirmOpen(false)}
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
                onClick={handleConfirmSubmit}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
