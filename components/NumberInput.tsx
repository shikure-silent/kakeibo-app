"use client";

import React, { useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

// 全角数字 → 半角数字、数字以外は除去
const normalizeNumber = (value: string): string => {
  const zenkakuToHankaku = value.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
  return zenkakuToHankaku.replace(/[^0-9]/g, "");
};

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: Props) {
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="
            flex-1 rounded-xl border border-slate-200 bg-white
            px-3 py-2 text-sm
            text-right text-slate-700
            shadow-sm
            placeholder:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
          "
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            const normalized = normalizeNumber(raw);
            setShowWarning(raw !== normalized && raw.trim().length > 0);
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
