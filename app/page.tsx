"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PrefectureSelector from "../components/PrefectureSelector";
import NumberInput from "../components/NumberInput";
import ExpenseInputsBlock, {
  ExpenseItem,
  ExpensePresetSelection,
} from "../components/ExpenseInputsBlock";
import ExpenseChart from "../components/ExpenseChart";
import SavingSimulation from "../components/SavingSimulation";
import { prefectureData, ExpenseMedian } from "../data/prefectureData";

// デフォルトラベル（基本カテゴリ）
const defaultLabels: Record<keyof ExpenseMedian, string> = {
  food: "食費",
  utilities: "水道・光熱費",
  dailyGoods: "日用品",
  rent: "住居費（家賃）",
  transport: "交通費",
};

// 初期状態の支出項目（食費/日用品/住居費/水道・光熱費/交通費）
const createInitialExpenseItems = (prefName: string): ExpenseItem[] => {
  const med = prefectureData[prefName];
  return (Object.keys(med) as (keyof ExpenseMedian)[]).map((key) => ({
    id: key, // とりあえず key をそのまま ID に
    key,
    label: defaultLabels[key],
    value: String(med[key]),
  }));
};

export default function Page() {
  const router = useRouter();

  const keys = useMemo(() => Object.keys(prefectureData), []);
  const defaultPref = keys.includes("東京都") ? "東京都" : keys[0];

  const [pref, setPref] = useState<string>(defaultPref);

  // ▼ 世帯人数と人数分の収入
  const [memberCount, setMemberCount] = useState<number>(1);
  const [memberIncomes, setMemberIncomes] = useState<string[]>([""]);

  // ▼ 支出予想額（項目名＋金額の配列）
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(() =>
    createInitialExpenseItems(defaultPref)
  );

  // 都道府県が変わったら、中央値ベースで「ひもづいている項目だけ金額更新」
  useEffect(() => {
    const med = prefectureData[pref];
    setExpenseItems((prev) =>
      prev.map((item) =>
        item.key != null ? { ...item, value: String(med[item.key]) } : item
      )
    );
  }, [pref]);

  // 世帯人数が変わったら、収入入力欄の数を合わせる
  useEffect(() => {
    setMemberIncomes((prev) => {
      if (memberCount <= prev.length) {
        return prev.slice(0, memberCount);
      } else {
        return [...prev, ...Array(memberCount - prev.length).fill("")];
      }
    });
  }, [memberCount]);

  // 1人分の収入変更
  const handleMemberIncomeChange = (index: number, value: string) => {
    setMemberIncomes((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // 支出：項目名変更
  const handleExpenseLabelChange = (id: string, label: string) => {
    setExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  // 支出：金額変更
  const handleExpenseValueChange = (id: string, value: string) => {
    setExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  // 支出：デフォルト項目の選択変更（基本カテゴリ or その他 or カスタム）
  const handleExpensePresetChange = (
    id: string,
    preset: ExpensePresetSelection
  ) => {
    setExpenseItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (preset.kind === "custom") {
          // カスタム：中央値とのひもづけを外し、ラベル/金額はそのまま
          return {
            ...item,
            key: null,
          };
        }

        if (preset.kind === "basic") {
          // 基本カテゴリ：その都道府県の中央値を反映しつつラベルも更新
          const med = prefectureData[pref];
          const newKey = preset.key;
          return {
            ...item,
            key: newKey,
            label: defaultLabels[newKey],
            value: String(med[newKey]),
          };
        }

        if (preset.kind === "extra") {
          // その他カテゴリ：ラベルだけ変える（中央値はなし）
          return {
            ...item,
            key: null,
            label: preset.label,
          };
        }

        return item;
      })
    );
  };

  // 支出：項目追加
  const handleAddExpenseItem = () => {
    setExpenseItems((prev) => {
      const newId = `custom-${Date.now()}-${prev.length}`;
      return [
        ...prev,
        {
          id: newId,
          key: null, // カスタム項目
          label: "",
          value: "",
        },
      ];
    });
  };

  // 支出：項目削除（最低1件は残す）
  const handleRemoveExpenseItem = (id: string) => {
    setExpenseItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  // 支出予想額の合計
  const totalExpense = expenseItems.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  // 世帯収入合計
  const totalIncome = memberIncomes.reduce(
    (sum, income) => sum + (Number(income) || 0),
    0
  );

  // SavingSimulation に渡す用
  const totalIncomeDigits = totalIncome > 0 ? String(totalIncome) : "";

  // 現在の都道府県の中央値（コンポーネントに渡す用）
  const currentMedian: ExpenseMedian = prefectureData[pref];

  // ✅ 「この予算でスタート」ボタンの処理
  const handleStartBudget = () => {
    if (typeof window === "undefined") return;

    const payload = {
      prefecture: pref,
      totalIncome,
      totalExpense,
      expenseItems,
      memberCount,
      memberIncomes,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem("kakeibo-budget", JSON.stringify(payload));
    router.push("/calendar");
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">貯金ができる家計簿アプリ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            {/* 都道府県選択 */}
            <PrefectureSelector selectedPref={pref} onChange={setPref} />

            {/* 世帯人数 */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                収入の人数
              </label>
              <select
                value={memberCount}
                onChange={(e) => setMemberCount(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}人
                  </option>
                ))}
              </select>
            </div>

            {/* 人数分の収入入力 + 収入割合表示 */}
            <div className="mt-3 space-y-2">
              {memberIncomes.map((value, index) => {
                const incomeNum = Number(value) || 0;
                const hasIncome = incomeNum > 0 && totalIncome > 0;
                const ratio = hasIncome ? (incomeNum / totalIncome) * 100 : 0;

                const label = hasIncome
                  ? `収入（${index + 1}人目・世帯の${ratio.toFixed(
                      1
                    )}%・半角数字のみ）`
                  : `収入（${index + 1}人目・半角数字のみ）`;

                return (
                  <NumberInput
                    key={index}
                    label={label}
                    value={value}
                    onChange={(val) => handleMemberIncomeChange(index, val)}
                    placeholder="例: 200000"
                  />
                );
              })}
            </div>

            {/* 世帯収入合計 */}
            <div className="mt-2 font-semibold">
              世帯収入合計: {totalIncome.toLocaleString()}円
            </div>

            {/* 支出予想額入力（項目名編集＋追加/削除＋プリセット） */}
            <div className="mt-4">
              <ExpenseInputsBlock
                items={expenseItems}
                median={currentMedian}
                onItemLabelChange={handleExpenseLabelChange}
                onItemValueChange={handleExpenseValueChange}
                onItemPresetChange={handleExpensePresetChange}
                onAddItem={handleAddExpenseItem}
                onRemoveItem={handleRemoveExpenseItem}
              />
            </div>

            {/* 支出予想額の合計 */}
            <div className="mt-4 font-semibold">
              支出予想額の合計: {totalExpense.toLocaleString()}円
            </div>

            {/* 貯金シミュレーション */}
            <SavingSimulation
              incomeDigits={totalIncomeDigits}
              totalExpense={totalExpense}
            />

            {/* ▶ この予算でスタート（カレンダーへ） */}
            <button
              type="button"
              onClick={handleStartBudget}
              className="mt-4 inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              この予算でスタート（カレンダーページへ）
            </button>
          </div>

          {/* 支出予算のグラフ（項目名の変更も反映される） */}
          <div className="bg-white p-4 rounded shadow">
            <ExpenseChart items={expenseItems} />
          </div>
        </section>

        {/* サイドバー：使い方 */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow text-sm">
            <p className="font-medium mb-2">使い方</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                まず<strong>都道府県</strong>を選択します。
              </li>
              <li>
                <strong>収入の人数</strong>
                を選ぶと、その人数分の収入入力欄が表示されます。
              </li>
              <li>
                各収入欄には、その人の収入が
                <strong>世帯収入合計の何％か</strong>が表示されます。
              </li>
              <li>
                支出の<strong>項目の種類</strong>
                から、食費・住居費・水道光熱費・
                交通費などの基本カテゴリ、または通信費・交際費・趣味・娯楽などの
                その他カテゴリを選べます。
              </li>
              <li>
                支出欄には「今月の<strong>支出予想額（予算）</strong>
                」を入力してください。 項目名は自由に編集できます（例: 日用品 →
                サブスク代）。
              </li>
              <li>
                「＋
                項目を追加」で支出項目を増やせます。不要な行は「削除」で消せます。
              </li>
              <li>
                貯金見込みは、
                <strong>世帯収入合計 − あなたの支出予想額合計</strong>
                に基づいて計算します。
              </li>
              <li>
                「この予算でスタート」を押すと、カレンダーページに移動し、
                予算情報が保存されます。
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
