"use client";
import React from "react";
import { ExpenseMedian } from "../data/prefectureData";
import NumberInput from "./NumberInput";

export type ExpenseItem = {
  id: string;
  key: keyof ExpenseMedian | null; // 食費/家賃などのキー。カスタムは null
  label: string; // 画面に表示する項目名
  value: string; // 金額（文字列）
};

// プリセット選択時に親コンポーネントへ渡す情報
export type ExpensePresetSelection =
  | { kind: "basic"; key: keyof ExpenseMedian } // 中央値ありの基本カテゴリ
  | { kind: "extra"; label: string } // 中央値なしの追加カテゴリ
  | { kind: "custom" }; // 完全カスタム

const defaultLabels: Record<keyof ExpenseMedian, string> = {
  food: "食費",
  utilities: "水道・光熱費",
  dailyGoods: "日用品",
  rent: "住居費（家賃）",
  transport: "交通費",
};

type Props = {
  items: ExpenseItem[];
  median: ExpenseMedian;
  onItemLabelChange: (id: string, label: string) => void;
  onItemValueChange: (id: string, value: string) => void;
  onItemPresetChange: (id: string, preset: ExpensePresetSelection) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
};

// 中央値とひもづく「基本カテゴリ」
type BasicPresetOption = {
  id: string;
  key: keyof ExpenseMedian;
  label: string;
};

// その他のよくあるカテゴリ（中央値はひもづけない）
type ExtraPresetOption = { id: string; label: string };

const basicPresetOptions: BasicPresetOption[] = [
  { id: "food", key: "food", label: "食費" },
  { id: "dailyGoods", key: "dailyGoods", label: "日用品" },
  { id: "rent", key: "rent", label: "住居費（家賃）" },
  { id: "utilities", key: "utilities", label: "水道・光熱費" },
  { id: "transport", key: "transport", label: "交通費" },
];

const extraPresetOptions: ExtraPresetOption[] = [
  { id: "communication", label: "通信費" },
  { id: "social", label: "交際費" },
  { id: "hobby", label: "趣味・娯楽" },
  { id: "fashion", label: "衣服・美容" },
  { id: "health", label: "健康・医療" },
  { id: "education", label: "教育・子ども" },
  { id: "insurance", label: "保険" },
  { id: "special", label: "特別な支出" },
  { id: "other", label: "その他" },
];

export default function ExpenseInputsBlock({
  items,
  median,
  onItemLabelChange,
  onItemValueChange,
  onItemPresetChange,
  onAddItem,
  onRemoveItem,
}: Props) {
  return (
    <div>
      <h3 className="font-semibold mb-2">
        支出予想額（今月の予算。項目名は自由に編集できます）
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item, index) => {
          const medianValue = item.key != null ? median[item.key] : 0;

          const baseLabel =
            item.label ||
            (item.key ? defaultLabels[item.key] : `項目${index + 1}`);

          const labelText =
            item.key != null
              ? `${baseLabel}（中央値: ${medianValue.toLocaleString()}円）`
              : baseLabel;

          // セレクトボックスの現在値を決める
          const selectValue = (() => {
            if (item.key != null) {
              const basic = basicPresetOptions.find((o) => o.key === item.key);
              if (basic) return `basic:${basic.id}`;
            }
            const extra = extraPresetOptions.find(
              (o) => o.label === item.label
            );
            if (extra) return `extra:${extra.id}`;
            return "";
          })();

          return (
            <div
              key={item.id}
              className="bg-white p-3 rounded shadow-sm space-y-2 border border-gray-100"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  {/* デフォルト項目選択（食費/家賃など & その他カテゴリ） */}
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      項目の種類
                    </label>
                    <select
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={selectValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          onItemPresetChange(item.id, { kind: "custom" });
                          return;
                        }
                        if (v.startsWith("basic:")) {
                          const id = v.slice("basic:".length);
                          const basic = basicPresetOptions.find(
                            (o) => o.id === id
                          );
                          if (basic) {
                            onItemPresetChange(item.id, {
                              kind: "basic",
                              key: basic.key,
                            });
                          }
                          return;
                        }
                        if (v.startsWith("extra:")) {
                          const id = v.slice("extra:".length);
                          const extra = extraPresetOptions.find(
                            (o) => o.id === id
                          );
                          if (extra) {
                            onItemPresetChange(item.id, {
                              kind: "extra",
                              label: extra.label,
                            });
                          }
                          return;
                        }
                      }}
                    >
                      <option value="">カスタム（自由入力）</option>
                      <optgroup label="基本カテゴリ（中央値あり）">
                        {basicPresetOptions.map((opt) => (
                          <option key={opt.id} value={`basic:${opt.id}`}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="その他カテゴリ">
                        {extraPresetOptions.map((opt) => (
                          <option key={opt.id} value={`extra:${opt.id}`}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* 項目名（ユーザー編集用） */}
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      項目名
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={item.label}
                      onChange={(e) =>
                        onItemLabelChange(item.id, e.target.value)
                      }
                      placeholder={baseLabel}
                    />
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  type="button"
                  className="text-xs text-red-500 mt-6 px-2"
                  onClick={() => onRemoveItem(item.id)}
                >
                  削除
                </button>
              </div>

              {/* 金額入力 */}
              <NumberInput
                label={labelText}
                value={item.value}
                onChange={(v) => onItemValueChange(item.id, v)}
                placeholder={
                  item.key != null && medianValue
                    ? String(medianValue)
                    : "例: 10000"
                }
              />
            </div>
          );
        })}
      </div>

      {/* 追加ボタン */}
      <button
        type="button"
        className="mt-3 text-xs text-blue-600 underline"
        onClick={onAddItem}
      >
        ＋ 項目を追加
      </button>
    </div>
  );
}
