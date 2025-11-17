"use client";
import React from "react";
import { PREFECTURE_MEDIANS } from "../data/prefectureData";

export default function PrefectureSelector({
  selectedPref,
  onChange,
}: {
  selectedPref: string;
  onChange: (p: string) => void;
}) {
  const prefectures = Object.keys(PREFECTURE_MEDIANS);
  return (
    <div>
      <label className="block font-medium mb-1">都道府県</label>
      <select
        value={selectedPref}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2"
      >
        {prefectures.length === 0 ? (
          <option value="">未登録</option>
        ) : (
          prefectures.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
