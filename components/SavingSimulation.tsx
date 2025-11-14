"use client";
import React from "react";
import { motion } from "framer-motion";

export default function SavingSimulation({
  incomeDigits,
  totalExpense,
}: {
  incomeDigits: string;
  totalExpense: number;
}) {
  if (!incomeDigits) return null;
  const income = Number(incomeDigits || 0);
  if (income <= 0) return null;

  const saving = income - totalExpense;
  const rate = (saving / income) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 p-3 rounded mt-3"
    >
      <div className="text-sm">
        ※貯金見込みはあなたが入力した支出合計（
        {totalExpense.toLocaleString()}
        円）を元に計算しています。
      </div>
      <div className="mt-2 font-medium">
        毎月の貯金見込み: {Math.max(0, saving).toLocaleString()}円
      </div>
      <div className="text-sm text-gray-600">貯蓄率: {rate.toFixed(1)}%</div>
    </motion.div>
  );
}
