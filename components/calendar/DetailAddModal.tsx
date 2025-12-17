"use client";

import React, { useState } from "react";
import { DetailRecord } from "../../types/calendar";
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
  open: boolean;
  onClose: () => void;
  onConfirm: (record: DetailRecord) => void;
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

export function DetailAddModal({ open, onClose, onConfirm }: Props) {
  const [expenseCategoryOptions] = useState<string[]>(
    loadExpenseCategories([...EXPENSE_CATEGORIES])
  );
  const [incomeCategoryOptions] = useState<string[]>(
    loadIncomeCategories([...INCOME_CATEGORIES])
  );
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
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showPayFromSuggestions, setShowPayFromSuggestions] = useState(false);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 space-y-3">
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
          <p className="text-[11px] text-slate-500">
            カテゴリ・支出/収入元・金額・メモを入力して、この日の内訳に追加します。
          </p>
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

          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowCategorySuggestions((prev) => !prev)}
              className="
                rounded-full border border-slate-300
                bg-slate-50 px-4 py-1.5 text-[12px]
                text-slate-700 hover:bg-slate-100
              "
            >
              候補から選ぶ
            </button>

            {showCategorySuggestions && (
              <div
                className="
                  absolute z-20 mt-1
                  max-h-40 w-44 overflow-auto
                  rounded-lg border border-slate-200
                  bg-white shadow-lg
                "
              >
                {(draft.mode === "income"
                  ? incomeCategoryOptions
                  : expenseCategoryOptions
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      handleChangeDraft("category", cat);
                      setShowCategorySuggestions(false);
                    }}
                    className={`
                      w-full px-2 py-1 text-left text-[11px]
                      hover:bg-emerald-50
                      ${
                        cat === draft.category
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-slate-700"
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            直接入力してもOKです。「候補から選ぶ」を押すと、よく使うカテゴリ一覧から選べます。
          </p>
        </div>

        {/* 店舗名（支出のみ表示） */}
        {draft.mode !== "income" && (
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-500">
              店舗名（任意）
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={draft.shopName ?? ""}
              onChange={(e) => handleChangeDraft("shopName", e.target.value)}
              placeholder="例: スーパーA、コンビニB など"
            />
          </div>
        )}

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

          <div className="relative inline-block">
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
          <p className="text-[10px] text-slate-400">
            直接入力してもOKです。「候補から選ぶ」を押すと、よく使う支出元・入金元から選べます。
          </p>
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
          <p className="text-[10px] text-slate-400">
            ※全角数字で入力された場合も、自動で半角に変換して桁区切りで表示します。
          </p>
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
          <label className="block text-[11px] text-slate-500">メモ（任意）</label>
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
    </div>
  );
}
