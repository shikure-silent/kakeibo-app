"use client";

import React, { useState } from "react";

type Props = {
  label: string;
  value: string; // 親からは「カンマなしの数字文字列」が来る想定
  onChange: (value: string) => void;
  placeholder?: string;
};

// 全角数字 → 半角数字、数字以外は除去（カンマも削除）
const normalizeNumber = (value: string): string => {
  const zenkakuToHankaku = value.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
  return zenkakuToHankaku.replace(/[^0-9]/g, "");
};

// "1000" → "1,000" にする
const formatWithComma = (digits: string): string => {
  if (!digits) return "";
  const onlyDigits = digits.replace(/[^0-9]/g, "");
  if (!onlyDigits) return "";
  return onlyDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: Props) {
  const [showWarning, setShowWarning] = useState(false);

  // 見た目用の値（カンマ付き）
  const displayValue = formatWithComma(value);

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          // カンマ付き表示を許容
          pattern="[0-9,]*"
          className="
            flex-1 rounded-xl border border-slate-200 bg-white
            px-3 py-2 text-sm
            text-right text-slate-700
            shadow-sm
            placeholder:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
          "
          value={displayValue}
          onChange={(e) => {
            const raw = e.target.value;

            // 全角や数字以外（カンマと空白を除く）が含まれていたら警告
            const hasFullWidthOrInvalid =
              /[０-９]/.test(raw) || /[^0-9,\s]/.test(raw);

            setShowWarning(hasFullWidthOrInvalid && raw.trim().length > 0);

            // 親には「カンマなしの数字文字列」を渡す（今まで通り）
            const normalized = normalizeNumber(raw);
            onChange(normalized);
          }}
          placeholder={placeholder}
        />
        <span className="text-xs text-slate-500">円 / 月</span>
      </div>
      {showWarning && (
        <p className="text-[11px] text-amber-600">
          半角数字のみ入力してください（全角は自動的に半角に変換されます）
        </p>
      )}
    </div>
  );
}
