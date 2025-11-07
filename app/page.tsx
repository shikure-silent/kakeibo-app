"use client";

import React, { useEffect, useMemo, useState } from "react";
import PrefectureSelector from "../components/PrefectureSelector";
import NumberInput from "../components/NumberInput";
import ExpenseInputsBlock from "../components/ExpenseInputsBlock";
import ExpenseChart from "../components/ExpenseChart";
import SavingSimulation from "../components/SavingSimulation";
import {
  prefectureData,
  nationalAverageExpenseTotal,
  ExpenseMedian,
} from "../data/prefectureData";

export default function Page() {
  const keys = useMemo(() => Object.keys(prefectureData), []);
  const defaultPref = keys.includes("東京都") ? "東京都" : keys[0];

  const [pref, setPref] = useState<string>(defaultPref);
  const [incomeDigits, setIncomeDigits] = useState<string>("");
  const [expenseInputs, setExpenseInputs] = useState<
    Record<keyof ExpenseMedian, string>
  >(() => {
    const base = prefectureData[defaultPref];
    return {
      food: String(base.food),
      utilities: String(base.utilities),
      dailyGoods: String(base.dailyGoods),
      rent: String(base.rent),
      transport: String(base.transport),
    };
  });

  useEffect(() => {
    const med = prefectureData[pref];
    setExpenseInputs({
      food: String(med.food),
      utilities: String(med.utilities),
      dailyGoods: String(med.dailyGoods),
      rent: String(med.rent),
      transport: String(med.transport),
    });
  }, [pref]);

  const handleExpenseChange = (k: keyof ExpenseMedian, v: string) =>
    setExpenseInputs((p) => ({ ...p, [k]: v }));

  const expenseNumbers: ExpenseMedian = {
    food: Number(expenseInputs.food) || 0,
    utilities: Number(expenseInputs.utilities) || 0,
    dailyGoods: Number(expenseInputs.dailyGoods) || 0,
    rent: Number(expenseInputs.rent) || 0,
    transport: Number(expenseInputs.transport) || 0,
  };

  const totalExpense = Object.values(expenseNumbers).reduce((s, v) => s + v, 0);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">家計簿アプリ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <PrefectureSelector selectedPref={pref} onChange={setPref} />

            <NumberInput
              label="収入（半角数字のみ）"
              value={incomeDigits}
              onChange={setIncomeDigits}
              placeholder="例: 20000"
            />

            <ExpenseInputsBlock
              median={prefectureData[pref]}
              inputs={expenseInputs}
              onChange={handleExpenseChange}
            />

            <div className="mt-4 font-semibold">
              支出合計: {totalExpense.toLocaleString()}円
            </div>

            <SavingSimulation
              incomeDigits={incomeDigits}
              averageExpense={nationalAverageExpenseTotal}
            />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <ExpenseChart expense={expenseNumbers} />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow text-sm">
            <p className="font-medium mb-2">使い方</p>
            <ul className="list-disc pl-5">
              <li>
                収入・支出は <strong>半角数字</strong>{" "}
                のみ入力してください（全角入力は無効化）。
              </li>
              <li>
                支出は初期で選択した都道府県の中央値が表示されます。編集可能です。
              </li>
              <li>
                貯金見込みは全国平均の支出合計（
                {nationalAverageExpenseTotal.toLocaleString()}
                円）を用いて計算します。
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
