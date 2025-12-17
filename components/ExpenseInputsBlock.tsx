"use client";

import React, { useState } from "react";
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
}: Props) {
  const [openTemplateFor, setOpenTemplateFor] = useState<string | null>(null);
  const templateOptions = customTemplates && customTemplates.length > 0
    ? customTemplates
    : CUSTOM_EXPENSE_TEMPLATES;

  return (
    <div className="space-y-4">
      {/* デフォルト8項目 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEFAULT_ITEMS.map((item) => {
          const isFixed = item.key === "rent" || item.key === "subscription";

          return (
            <div
              key={item.key}
              className="
                rounded-2xl border border-slate-100 bg-slate-50
                px-3 py-3 lg:px-4 lg:py-3
                space-y-1.5
              "
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-medium text-slate-700">
                    {item.label}
                  </p>
                  {isFixed && (
                    <span
                      className="
                        text-[10px] px-2 py-[2px]
                        rounded-full
                        bg-emerald-50 text-emerald-600
                        border border-emerald-100
                      "
                    >
                      固定費
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] text-slate-400">
                    目安: ¥{median[item.key].toLocaleString()}
                  </p>
                  {isFixed && (
                    <button
                      type="button"
                      onClick={() => onToggleAutoUpdateCategory(item.key)}
                      className="text-[10px] px-2 py-[4px] rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      自動更新:{" "}
                      <span
                        className={
                          autoUpdateMap[item.key]
                            ? "text-emerald-600 font-semibold"
                            : "text-slate-500"
                        }
                      >
                        {autoUpdateMap[item.key] ? "オン" : "オフ"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <NumberInput
                label="予算額（半角数字）"
                value={inputs[item.key]}
                onChange={(v) => onChange(item.key, v)}
                placeholder={`例: ${median[item.key].toLocaleString()}`}
              />
            </div>
          );
        })}
      </div>

      {/* カスタム項目（他アプリにもありそうな項目＋手動入力） */}
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-700">
            カスタム項目（例: 教育費・ペット費・保険料の細分化 など）
          </p>
          <button
            type="button"
            onClick={onAddCustomItem}
            className="
              inline-flex items-center gap-1
              text-[11px] font-semibold
              text-emerald-700
              hover:text-emerald-800
            "
          >
            <span>＋</span>
            <span>項目を追加</span>
          </button>
        </div>

        {customItems.length === 0 && (
          <p className="text-[11px] text-slate-400">
            まだカスタム項目はありません。「項目を追加」から作成できます。
          </p>
        )}

        <div className="space-y-2">
          {customItems.map((item) => (
            <div
              key={item.id}
              className="
                rounded-2xl border border-slate-100 bg-white
                px-3 py-3 lg:px-4 lg:py-3
                space-y-3
              "
            >
              {/* 項目名 + 候補から選ぶ */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-600">
                  項目名
                </label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    onChangeCustomItemLabel(item.id, e.target.value)
                  }
                  placeholder="例: 教育費 / ペット費 / 推し活 など"
                  className="
                    w-full border border-slate-200 rounded-lg
                    px-3 py-1.5 text-[12px] text-slate-700
                    bg-white
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                  "
                />
                <div className="relative inline-block">
                  <button
                    type="button"
                    className="
                      rounded-full border border-slate-300
                      bg-slate-50 px-4 py-1.5 text-[12px]
                      text-slate-700 hover:bg-slate-100
                    "
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
                          ${
                            label === item.label
                              ? "bg-emerald-50 text-emerald-700 font-semibold"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
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
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCustomItem(item.id)}
                  className="
                    inline-flex items-center gap-1
                    px-3 py-1 rounded-full
                    border border-red-200
                    text-[11px] font-medium
                    text-red-600 bg-red-50
                    hover:bg-red-100 hover:border-red-300
                    self-start sm:self-end
                  "
                >
                  <span>🗑</span>
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
