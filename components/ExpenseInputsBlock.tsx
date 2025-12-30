"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import NumberInput from "./NumberInput";
import { ExpenseMedian } from "../data/prefectureData";
import { CustomExpenseItem } from "../types/budget";
import { CUSTOM_EXPENSE_TEMPLATES } from "../lib/const";

type Props = {
  median: ExpenseMedian;
  inputs: Record<keyof ExpenseMedian, string>;
  onChange: (key: keyof ExpenseMedian, value: string) => void;
  customItems: CustomExpenseItem[];
  onAddCustomItem: () => void;
  onChangeCustomItemLabel: (id: string, label: string) => void;
  onChangeCustomItemAmount: (id: string, amount: string) => void;
  onRemoveCustomItem: (id: string) => void;
  autoUpdateMap: Record<keyof ExpenseMedian, boolean>;
  onToggleAutoUpdateCategory: (key: keyof ExpenseMedian) => void;
  customTemplates?: string[];
  isDark?: boolean;
  copyCustomFromPrevious?: boolean;
  onToggleCopyCustomFromPrevious?: () => void;
  lastAddedCustomItemId?: string | null;
};

// デフォルト8項目
const DEFAULT_ITEMS: {
  key: keyof ExpenseMedian;
  label: string;
}[] = [
  { key: "food", label: "食費" },
  { key: "utilities", label: "水道・光熱費" },
  { key: "dailyGoods", label: "日用品" },
  { key: "rent", label: "家賃・住居" },
  { key: "transport", label: "交通費" },
  { key: "subscription", label: "サブスク" },
  { key: "entertainment", label: "娯楽費（趣味娯楽）" },
  { key: "medicalInsurance", label: "医療・保険" },
];

export default function ExpenseInputsBlock({
  median,
  inputs,
  onChange,
  customItems,
  onAddCustomItem,
  onChangeCustomItemLabel,
  onChangeCustomItemAmount,
  onRemoveCustomItem,
  autoUpdateMap,
  onToggleAutoUpdateCategory,
  customTemplates,
  isDark = false,
  copyCustomFromPrevious = true,
  onToggleCopyCustomFromPrevious,
  lastAddedCustomItemId,
}: Props) {
  const [openTemplateFor, setOpenTemplateFor] = useState<string | null>(null);
  const templateRef = useRef<HTMLDivElement | null>(null);
  const customItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const customItemInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {}
  );
  const templateSource: string[] =
    customTemplates && customTemplates.length > 0
      ? [...CUSTOM_EXPENSE_TEMPLATES, ...customTemplates]
      : [...CUSTOM_EXPENSE_TEMPLATES];
  const defaultTemplateExcludes = new Set([
    ...DEFAULT_ITEMS.map((item) => item.label),
    "趣味・娯楽",
    "医療・美容",
  ]);
  const templateOptions = templateSource.filter((label, index) => {
    if (!label) return false;
    if (defaultTemplateExcludes.has(label)) return false;
    return templateSource.findIndex((item) => item === label) === index;
  });

  const lastAddedItem = useMemo(() => {
    if (!lastAddedCustomItemId) return null;
    return customItems.find((item) => item.id === lastAddedCustomItemId);
  }, [customItems, lastAddedCustomItemId]);

  useEffect(() => {
    if (!openTemplateFor) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (templateRef.current && !templateRef.current.contains(target)) {
        setOpenTemplateFor(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openTemplateFor]);

  useEffect(() => {
    if (!lastAddedItem) return;
    const node = customItemRefs.current[lastAddedItem.id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = customItemInputRefs.current[lastAddedItem.id];
    if (!input) return;
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }, [lastAddedItem]);

  return (
    <div className="space-y-4">
      {/* デフォルト8項目 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEFAULT_ITEMS.map((item) => {
          const isFixed = item.key === "rent" || item.key === "subscription";
          const isAuto = autoUpdateMap[item.key];

          return (
            <div
              key={item.key}
              className="
                rounded-2xl border
                px-3 py-3 lg:px-4 lg:py-3
                space-y-1.5
              "
              style={{
                borderColor: isDark ? "#475569" : "#e2e8f0",
                backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                color: isDark ? "#e2e8f0" : "#0f172a",
              }}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-[11px] font-medium ${
                      isDark ? "text-slate-100" : "text-slate-700"
                    }`}
                  >
                    {item.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => onToggleAutoUpdateCategory(item.key)}
                    aria-pressed={isAuto}
                    className={`text-[10px] px-2 py-[2px] rounded-full border ${
                      isAuto
                        ? isDark
                          ? "bg-emerald-900/40 text-emerald-100 border-emerald-400"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isDark
                        ? "bg-slate-800 text-slate-300 border-slate-600"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    自動更新: {isAuto ? "オン" : "オフ"}
                  </button>
                  {isFixed && (
                    <span
                      className="
                        text-[10px] px-2 py-[2px]
                        rounded-full
                        border
                      "
                      style={{
                        backgroundColor: isDark ? "#065f46" : "#ecfdf3",
                        color: isDark ? "#bbf7d0" : "#059669",
                        borderColor: isDark ? "#15803d" : "#d1fae5",
                      }}
                    >
                      固定費
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-[10px] ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    目安: ¥{median[item.key].toLocaleString()}
                  </p>
                </div>
              </div>
              <NumberInput
                label="予算額（半角数字）"
                value={inputs[item.key]}
                onChange={(v) => onChange(item.key, v)}
                placeholder={`例: ${median[item.key].toLocaleString()}`}
                isDark={isDark}
              />
            </div>
          );
        })}
      </div>

      {/* カスタム項目（他アプリにもありそうな項目＋手動入力） */}
      <div className="mt-2 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`text-xs font-medium ${
              isDark ? "text-slate-100" : "text-slate-700"
            }`}
          >
            カスタム項目（例: 教育費・ペット費・保険料の細分化 など）
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleCopyCustomFromPrevious}
              aria-pressed={copyCustomFromPrevious}
              className={`text-[11px] inline-flex items-center gap-1 rounded-full px-3 py-1 whitespace-nowrap ${
                copyCustomFromPrevious
                  ? isDark
                    ? "bg-emerald-900/40 text-emerald-100 border border-emerald-400"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isDark
                  ? "bg-slate-800 text-slate-200 border border-slate-600"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              前月コピー: {copyCustomFromPrevious ? "オン" : "オフ"}
            </button>
            <button
              type="button"
              onClick={onAddCustomItem}
              className="
                inline-flex items-center gap-1
                text-[11px] font-semibold whitespace-nowrap
                hover:text-emerald-800
              "
              style={{
                color: isDark ? "#bbf7d0" : "#047857",
              }}
            >
              <span>＋</span>
              <span>項目を追加</span>
            </button>
          </div>
        </div>

        {customItems.length === 0 && (
          <p
            className={`text-[11px] ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            まだカスタム項目はありません。「項目を追加」から作成できます。
          </p>
        )}

        <div className="space-y-2">
          {customItems.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                customItemRefs.current[item.id] = el;
              }}
              className="rounded-2xl border px-3 py-3 lg:px-4 lg:py-3 space-y-3"
              style={{
                borderColor: isDark ? "#475569" : "#e2e8f0",
                backgroundColor: isDark ? "#0f172a" : "white",
                color: isDark ? "#e2e8f0" : "#0f172a",
              }}
            >
              {/* 項目名 + 候補から選ぶ */}
              <div className="space-y-1.5">
                <label
                  className={`block text-[11px] font-medium ${
                    isDark ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  項目名
                </label>
                <input
                  type="text"
                  ref={(el) => {
                    customItemInputRefs.current[item.id] = el;
                  }}
                  value={item.label}
                  onChange={(e) =>
                    onChangeCustomItemLabel(item.id, e.target.value)
                  }
                  placeholder="例: 教育費 / ペット費 / 推し活 など"
                  className="
                    w-full border rounded-lg
                    px-3 py-1.5 text-[12px]
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                  "
                  style={{
                    backgroundColor: isDark ? "#0f172a" : "white",
                    color: isDark ? "#e2e8f0" : "#334155",
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                  }}
                />
                <div ref={templateRef} className="relative inline-block">
                  <button
                    type="button"
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
                    onClick={() =>
                      setOpenTemplateFor((prev) =>
                        prev === item.id ? null : item.id
                      )
                    }
                  >
                    候補から選ぶ
                  </button>
                  <div
                    className={`
                      absolute z-20 mt-1
                      max-h-40 w-48 overflow-auto
                      rounded-lg border border-slate-200
                      bg-white shadow-lg
                      ${openTemplateFor === item.id ? "" : "hidden"}
                    `}
                    style={{
                      backgroundColor: isDark ? "#0f172a" : "white",
                      borderColor: isDark ? "#475569" : "#e2e8f0",
                    }}
                  >
                    {templateOptions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          onChangeCustomItemLabel(item.id, label);
                          setOpenTemplateFor(null);
                        }}
                        className={`
                          w-full px-3 py-1.5 text-left text-[11px]
                          hover:bg-emerald-50
                          ${label === item.label ? "font-semibold" : ""}
                        `}
                        style={{
                          backgroundColor:
                            label === item.label
                              ? isDark
                                ? "#065f46"
                                : "#ecfdf3"
                              : "transparent",
                          color:
                            label === item.label
                              ? isDark
                                ? "#bbf7d0"
                                : "#047857"
                              : isDark
                              ? "#e2e8f0"
                              : "#334155",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <p
                  className={`text-[10px] ${
                    isDark ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  直接入力してもOKです。「候補から選ぶ」を押すと、よく使う項目から選べます。
                </p>
              </div>

              {/* 金額＋削除ボタン */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <div className="flex-1">
                  <NumberInput
                    label="予算額（半角数字）"
                    value={item.value}
                    onChange={(v) => onChangeCustomItemAmount(item.id, v)}
                    placeholder="例: 5000"
                    isDark={isDark}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCustomItem(item.id)}
                  className="
                    inline-flex items-center gap-1
                    px-3 py-1 rounded-full
                    border
                    text-[11px] font-medium
                    self-start sm:self-end
                  "
                  style={{
                    borderColor: isDark ? "#7f1d1d" : "#fecdd3",
                    backgroundColor: isDark ? "#450a0a" : "#fef2f2",
                    color: isDark ? "#fecdd3" : "#b91c1c",
                  }}
                >
                  <span>削除</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
