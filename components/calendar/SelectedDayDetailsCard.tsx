"use client";

import React, { useState, useEffect } from "react";
import { DetailRecord } from "../../types/calendar";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAY_FROM_OPTIONS } from "../../lib/const";
import {
  loadExpenseCategories,
  loadIncomeCategories,
  loadPayFromPresets,
} from "../../lib/settingsStorage";
import { DetailAddModal } from "./DetailAddModal";
import { DetailConfirmModal } from "./DetailConfirmModal";
import { DetailListItem } from "./DetailListItem";

type Props = {
  selectedDay: number | null;
  selectedDateLabel: string;
  selectedDetails: DetailRecord[];
  onChangeRecord: (index: number, record: DetailRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void; // 互換性のため残しておく（内部では使用しない）
  onCloseCalendar?: () => void; // 追加後にカレンダー画面に戻したいとき用（任意）
};

export default function SelectedDayDetailsCard({
  selectedDay,
  selectedDateLabel,
  selectedDetails,
  onChangeRecord,
  onDeleteRecord,
  onCloseCalendar,
}: Props) {
  // 設定ページ由来のカテゴリ・支出元候補
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<string[]>(
    [...EXPENSE_CATEGORIES]
  );
  const [incomeCategoryOptions, setIncomeCategoryOptions] = useState<string[]>(
    [...INCOME_CATEGORIES]
  );
  const [payFromOptions, setPayFromOptions] = useState<string[]>([
    ...PAY_FROM_OPTIONS,
  ]);

  useEffect(() => {
    setExpenseCategoryOptions(loadExpenseCategories([...EXPENSE_CATEGORIES]));
    setIncomeCategoryOptions(loadIncomeCategories([...INCOME_CATEGORIES]));
    setPayFromOptions(loadPayFromPresets([...PAY_FROM_OPTIONS]));
  }, []);

  // 追加用モーダルの状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 追加・削除 共通の確認モーダル状態
  const [confirmState, setConfirmState] = useState<{
    type: "add" | "delete" | null;
    targetIndex: number | null;
  }>({ type: null, targetIndex: null });

  if (selectedDay == null) {
    return null;
  }

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // 削除ボタンクリック時に確認モーダルを開く
  const handleOpenDeleteConfirm = (index: number) => {
    setConfirmState({ type: "delete", targetIndex: index });
  };

  const handleCloseConfirm = () => {
    setConfirmState({ type: null, targetIndex: null });
  };

  const handleConfirmAdd = (rec: DetailRecord) => {
    const index = selectedDetails.length;
    onChangeRecord(index, rec);
    setIsAddModalOpen(false);
    setConfirmState({ type: null, targetIndex: null });
    if (onCloseCalendar) {
      onCloseCalendar();
    }
  };

  const handleConfirmOk = () => {
    if (confirmState.type === "delete" && confirmState.targetIndex !== null) {
      onDeleteRecord(confirmState.targetIndex);
      setConfirmState({ type: null, targetIndex: null });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-3 py-3 sm:px-4 sm:py-4 max-h-[80vh] overflow-y-auto">
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
          <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
            {selectedDetails.map((rec, idx) => (
              <DetailListItem
                key={idx}
                record={rec}
                index={idx}
                onChange={onChangeRecord}
                onDelete={handleOpenDeleteConfirm}
                expenseCategoryOptions={expenseCategoryOptions}
                incomeCategoryOptions={incomeCategoryOptions}
                payFromOptions={payFromOptions}
              />
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

      <DetailAddModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onConfirm={(rec) => {
          const digits = Number(rec.amount ?? 0);
          const normalized: DetailRecord = {
            ...rec,
            amount: Number.isNaN(digits) ? 0 : digits,
            mode: rec.mode || "expense",
          } as DetailRecord;
          handleConfirmAdd(normalized);
        }}
      />

      <DetailConfirmModal
        open={confirmState.type === "delete"}
        mode="delete"
        onCancel={handleCloseConfirm}
        onConfirm={handleConfirmOk}
      />
    </div>
  );
}
