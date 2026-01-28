"use client";

import React, { useEffect } from "react";

type Props = {
  open: boolean;
  mode: "add" | "delete";
  onCancel: () => void;
  onConfirm: () => void;
};

export function DetailConfirmModal({ open, mode, onCancel, onConfirm }: Props) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-lg border border-slate-100">
        <p className="mb-4 text-sm text-slate-800">
          {mode === "add"
            ? "この内容を追加しますか？"
            : "この項目を削除しますか？"}
        </p>
        <div className="flex justify-end gap-2 text-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            {mode === "add" ? "追加する" : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
