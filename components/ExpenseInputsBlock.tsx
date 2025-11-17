"use client";

import React from "react";
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
}: Props) {
  return (
    <div className="space-y-4">
      {/* デフォルト8項目 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEFAULT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="
              rounded-2xl border border-slate-100 bg-slate-50
              px-3 py-3 lg:px-4 lg:py-3
              space-y-1.5
            "
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-slate-700">
                {item.label}
              </p>
              <p className="text-[10px] text-slate-400">
                目安: ¥{median[item.key].toLocaleString()}
              </p>
            </div>
            <NumberInput
              label="予算額（半角数字）"
              value={inputs[item.key]}
              onChange={(v) => onChange(item.key, v)}
              placeholder="例: 30000"
            />
          </div>
        ))}
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      onChangeCustomItemLabel(item.id, e.target.value)
                    }
                    placeholder="例: 教育費 / ペット費 / 推し活 など"
                    className="
                      flex-1 border border-slate-200 rounded-full
                      px-3 py-1.5 text-xs text-slate-700
                      bg-white
                      focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    "
                  />
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) {
                        onChangeCustomItemLabel(item.id, v);
                      }
                    }}
                    className="
                      w-full sm:w-48 border border-slate-200 rounded-full
                      px-3 py-1.5 text-[11px] text-slate-700
                      bg-white
                      focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    "
                  >
                    <option value="">候補から選ぶ</option>
                    {CUSTOM_EXPENSE_TEMPLATES.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    text-[10px] text-slate-400
                    hover:text-red-500 underline-offset-2 hover:underline
                    self-start sm:self-end
                  "
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
