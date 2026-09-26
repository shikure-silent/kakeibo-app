"use client";

import React, { useState } from "react";

type Props = {
  label: string;
  value: string; // 親からは「カンマなしの数字文字列」が来る想定
  onChange: (value: string) => void;
  placeholder?: string;
  maxDigits?: number;
  isDark?: boolean;
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
  maxDigits,
  isDark = false,
}: Props) {
  const [showInvalidWarning, setShowInvalidWarning] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // 見た目用の値（カンマ付き）
  const displayValue = formatWithComma(value);

  return (
    <div className="space-y-1.5">
      <label
        className={`block text-[11px] font-medium ${
          isDark ? "text-slate-200" : "text-slate-600"
        }`}
      >
        {label}
      </label>
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          // カンマ付き表示を許容
          pattern="[0-9,]*"
          className="
            min-w-0 flex-1 rounded-xl border
            px-3 py-2 text-sm
            text-right
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
          "
          style={{
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#e2e8f0" : "#475569",
            borderColor: isDark ? "#475569" : "#e2e8f0",
          }}
          value={displayValue}
          onChange={(e) => {
            const raw = e.target.value;

            // 全角や数字以外（カンマと空白を除く）が含まれていたら警告
            const hasFullWidthOrInvalid =
              /[０-９]/.test(raw) || /[^0-9,\s]/.test(raw);

            setShowInvalidWarning(hasFullWidthOrInvalid && raw.trim().length > 0);

            // 親には「カンマなしの数字文字列」を渡す（今まで通り）
            const normalized = normalizeNumber(raw);
            const limited =
              typeof maxDigits === "number" && maxDigits > 0
                ? normalized.slice(0, maxDigits)
                : normalized;
            setShowLimitWarning(
              typeof maxDigits === "number" &&
                maxDigits > 0 &&
                normalized.length > maxDigits
            );
            onChange(limited);
          }}
          placeholder={placeholder}
        />
        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          円 / 月
        </span>
      </div>
      {showInvalidWarning && (
        <p className="text-[11px] text-amber-600">
          半角数字のみ入力してください（全角は自動的に半角に変換されます）
        </p>
      )}
      {showLimitWarning && maxDigits && (
        <p className="text-[11px] text-amber-600">
          {maxDigits}桁まで入力できます。
        </p>
      )}
    </div>
  );
}
