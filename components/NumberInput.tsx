"use client";
import React, { useState } from "react";

const onlyAsciiDigits = (s: string) => /^[0-9]*$/.test(s);
const containsFullWidthDigits = (s: string) => /[０-９]/.test(s);
const formatWithCommas = (n: number) => n.toLocaleString();

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [warning, setWarning] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("");
      setWarning(null);
      return;
    }
    if (containsFullWidthDigits(raw)) {
      setWarning("全角数字は使用できません。半角で入力してください。");
      return;
    }

    const noCommas = raw.replace(/,/g, "");
    if (!onlyAsciiDigits(noCommas)) {
      setWarning("半角数字以外は使えません");
      return;
    }

    onChange(noCommas);
    setWarning(null);
  };

  const display = value === "" ? "" : formatWithCommas(Number(value));

  return (
    <div className="mb-3">
      <label className="block font-medium mb-1">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />
      {warning && <div className="text-red-600 text-sm mt-1">{warning}</div>}
    </div>
  );
}
