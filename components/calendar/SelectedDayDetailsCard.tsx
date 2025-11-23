"use client";

import React, { useState } from "react";
import { DetailRecord } from "../../types/calendar";

type Props = {
  selectedDay: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  onChangeRecord: (index: number, record: DetailRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void; // 互換性のため残しておく（内部では使用しない）
};

const DEFAULT_CATEGORIES = [
  "食費",
  "水道・光熱費",
  "日用品",
  "家賃・住居",
  "交通費",
  "サブスク",
  "娯楽費",
  "医療・保険",
];

const DEFAULT_PAY_FROM = [
  "現金",
  "クレジットカード",
  "電子決済",
  "口座振替",
  "その他",
];

const chipClass = (active: boolean) =>
  `px-2 py-0.5 rounded-full border text-[10px] ${
    active
      ? "bg-emerald-500 border-emerald-500 text-white"
      : "bg-white border-slate-300 text-slate-600 hover:bg-emerald-50"
  }`;

const OptionChips = ({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected?: string | null;
  onSelect: (value: string) => void;
}) => (
  <div className="flex flex-wrap gap-1 mb-1">
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onSelect(opt)}
        className={chipClass(selected === opt)}
      >
        {opt}
      </button>
    ))}
  </div>
);

// 全角数字を半角数字に変換
const toHalfWidthNumber = (value: string) =>
  value.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// 桁区切り（小数点なし）のフォーマット
const formatAmountInt = (amount: number | null | undefined) => {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return "¥0";
  return "¥" + n.toLocaleString("ja-JP");
};

export default function SelectedDayDetailsCard({
  selectedDay,
  selectedDateLabel,
  selectedDetails,
  onChangeRecord,
  onDeleteRecord,
}: Props) {
  // 追加用モーダルの状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<DetailRecord | null>(null);
  const [addAmountText, setAddAmountText] = useState("");

  if (selectedDay == null) {
    return null;
  }

  const handleOpenAddModal = () => {
    const now = new Date();
    const draft: DetailRecord = {
      mode: "expense",
      amount: 0,
      category: "",
      payFrom: "現金",
      memo: "",
      date: "",
      createdAt: now.toISOString(),
    };
    setAddDraft(draft);
    setAddAmountText("");
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddDraft(null);
    setAddAmountText("");
  };

  const handleSubmitAdd = () => {
    if (!addDraft) return;
    const index = selectedDetails.length;

    const digits = addAmountText.replace(/,/g, "");
    const num = digits === "" ? 0 : Number(digits);
    const normalized: DetailRecord = {
      ...addDraft,
      amount: Number.isNaN(num) ? 0 : num,
      mode: addDraft.mode || "expense",
    } as DetailRecord;

    onChangeRecord(index, normalized);
    handleCloseAddModal();
  };

  const handleChangeDraft = <K extends keyof DetailRecord>(
    key: K,
    value: DetailRecord[K]
  ) => {
    setAddDraft((prev) =>
      prev
        ? ({
            ...prev,
            [key]: value,
          } as DetailRecord)
        : prev
    );
  };

  const handleChangeAddAmount = (raw: string) => {
    // 全角 → 半角
    const half = toHalfWidthNumber(raw);
    // 数字だけ抽出
    const digitsOnly = half.replace(/[^\d]/g, "");

    if (digitsOnly === "") {
      setAddAmountText("");
      handleChangeDraft("amount", 0 as DetailRecord["amount"]);
      return;
    }

    const num = Number(digitsOnly);
    const formatted = num.toLocaleString("ja-JP");

    // 入力欄には桁区切り付きで表示
    setAddAmountText(formatted);
    // Draft 側は数値で保持
    handleChangeDraft(
      "amount",
      (Number.isNaN(num) ? 0 : num) as DetailRecord["amount"]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[11px] text-slate-500">選択中の日付</p>
          <p className="text-sm font-semibold text-slate-900">
            {selectedDateLabel || `${selectedDay}日の内訳`}
          </p>
        </div>
      </div>

      {/* 内訳がまだない場合 */}
      {selectedDetails.length === 0 ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-[12px] text-slate-500">
            この日はまだ内訳が登録されていません。
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
          >
            ＋ 項目を追加
          </button>
        </div>
      ) : (
        <>
          {/* 既存の明細リスト */}
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {selectedDetails.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2"
              >
                {/* 上段：カテゴリ＋金額 */}
                <div className="flex items-start justify-between gap-3">
                  {/* カテゴリ */}
                  <div className="flex-1 space-y-1">
                    <label className="block text-[11px] text-slate-500">
                      カテゴリ
                    </label>

                    {/* デフォルトカテゴリボタン */}
                    <OptionChips
                      options={DEFAULT_CATEGORIES}
                      selected={rec.category}
                      onSelect={(cat) =>
                        onChangeRecord(idx, { ...rec, category: cat })
                      }
                    />

                    {/* 自由入力 */}
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      value={rec.category ?? ""}
                      onChange={(e) =>
                        onChangeRecord(idx, {
                          ...rec,
                          category: e.target.value,
                        } as DetailRecord)
                      }
                      placeholder="例：食費 / 日用品 など"
                    />
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
                        rec.amount === null ||
                        rec.amount === undefined ||
                        Number.isNaN(Number(rec.amount))
                          ? ""
                          : String(rec.amount)
                      }
                      onChange={(e) => {
                        // 全角→半角にしつつ、数字だけ残す（ここは桁区切りまではしない）
                        const half = toHalfWidthNumber(e.target.value);
                        const digitsOnly = half.replace(/[^\d]/g, "");
                        const num =
                          digitsOnly === "" ? NaN : Number(digitsOnly);

                        onChangeRecord(idx, {
                          ...rec,
                          amount: num as any,
                        } as DetailRecord);
                      }}
                    />
                    <p className="text-[10px] text-slate-500">
                      入力中:{" "}
                      <span className="font-semibold">
                        {formatAmountInt(rec.amount)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 下段：支出元＋メモ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* 支出元 */}
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500">
                      支出元
                    </label>

                    {/* デフォルト支出元ボタン */}
                    <OptionChips
                      options={DEFAULT_PAY_FROM}
                      selected={rec.payFrom}
                      onSelect={(src) =>
                        onChangeRecord(idx, { ...rec, payFrom: src })
                      }
                    />

                    {/* 自由入力 */}
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      value={rec.payFrom ?? ""}
                      onChange={(e) =>
                        onChangeRecord(idx, {
                          ...rec,
                          payFrom: e.target.value,
                        } as DetailRecord)
                      }
                      placeholder="例：現金 / クレジットカード / 電子決済 など"
                    />
                  </div>

                  {/* メモ */}
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500">
                      メモ
                    </label>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                      value={rec.memo ?? ""}
                      onChange={(e) =>
                        onChangeRecord(idx, {
                          ...rec,
                          memo: e.target.value,
                        } as DetailRecord)
                      }
                      placeholder="お店の名前や用途など"
                    />
                  </div>
                </div>

                {/* 削除ボタン */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(idx)}
                    className="text-[11px] font-medium text-red-500 hover:text-red-600"
                  >
                    この項目を削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 追加ボタン */}
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
            >
              ＋ 項目を追加
            </button>
          </div>
        </>
      )}

      {/* ▼ 新規追加用モーダル ▼ */}
      {isAddModalOpen && addDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 space-y-3">
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-slate-900">
                項目を追加
              </h2>
              <p className="text-[11px] text-slate-500">
                カテゴリ・支出元・金額・メモを入力して、この日の内訳に追加します。
              </p>
            </div>

            {/* カテゴリ */}
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-500">
                カテゴリ（選択または自由入力）
              </label>
              <OptionChips
                options={DEFAULT_CATEGORIES}
                selected={addDraft.category}
                onSelect={(cat) => handleChangeDraft("category", cat)}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={addDraft.category ?? ""}
                onChange={(e) => handleChangeDraft("category", e.target.value)}
                placeholder="例：食費 / 日用品 など"
              />
            </div>

            {/* 支出元 */}
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-500">
                支出元（選択または自由入力）
              </label>
              <OptionChips
                options={DEFAULT_PAY_FROM}
                selected={addDraft.payFrom}
                onSelect={(src) => handleChangeDraft("payFrom", src)}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={addDraft.payFrom ?? ""}
                onChange={(e) => handleChangeDraft("payFrom", e.target.value)}
                placeholder="例：現金 / クレジットカード / 電子決済 など"
              />
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
                value={addAmountText}
                onChange={(e) => handleChangeAddAmount(e.target.value)}
                placeholder="例：1200"
              />
              <p className="text-[10px] text-slate-400">
                ※全角数字で入力された場合も、自動で半角に変換して桁区切りで表示します。
              </p>
              <p className="text-[10px] text-slate-500">
                入力中:{" "}
                <span className="font-semibold">
                  {formatAmountInt(
                    addAmountText === ""
                      ? 0
                      : Number(addAmountText.replace(/,/g, ""))
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
                value={addDraft.memo ?? ""}
                onChange={(e) => handleChangeDraft("memo", e.target.value)}
                placeholder="お店の名前や用途など"
              />
            </div>

            {/* ボタン */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseAddModal}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSubmitAdd}
                className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-600"
              >
                この項目を追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
