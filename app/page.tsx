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
    id: key,
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
          return {
            ...item,
            key: null,
          };
        }

        if (preset.kind === "basic") {
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
          key: null,
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

  // 貯金予測
  const predictedSaving = totalIncome - totalExpense;
  const savingRate =
    totalIncome > 0 ? (predictedSaving / totalIncome) * 100 : 0;

  // SavingSimulation に渡す用
  const totalIncomeDigits = totalIncome > 0 ? String(totalIncome) : "";

  // 現在の都道府県の中央値（コンポーネントに渡す用）
  const currentMedian: ExpenseMedian = prefectureData[pref];

  // 「この予算でスタート」ボタン
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
    <main>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー（ブランド＋サブタイトル） */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              貯金ができる家計簿アプリ
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              今月の収入・支出・貯金見込みをひと目で確認できるダッシュボード
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium">
              β版 / データはこの端末のブラウザにのみ保存
            </span>
          </div>
        </header>

        {/* サマリーカード */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-emerald-50 px-4 py-4 lg:px-6 lg:py-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  今月の家計サマリー
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  世帯収入・支出予算・貯金見込みの全体像
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-medium">
                {pref}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-emerald-50 rounded-xl px-3 py-3">
                <p className="text-xs text-emerald-800 font-medium mb-1">
                  世帯収入合計
                </p>
                <p className="text-lg font-semibold">
                  {totalIncome.toLocaleString()}円
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-3">
                <p className="text-xs text-slate-600 font-medium mb-1">
                  支出予想額（予算）
                </p>
                <p className="text-lg font-semibold">
                  {totalExpense.toLocaleString()}円
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-3">
                <p className="text-xs text-slate-600 font-medium mb-1">
                  毎月の貯金見込み
                </p>
                <p
                  className={`text-lg font-semibold ${
                    predictedSaving >= 0 ? "text-emerald-700" : "text-red-500"
                  }`}
                >
                  {predictedSaving.toLocaleString()}円
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  貯蓄率:{" "}
                  {Number.isFinite(savingRate) ? savingRate.toFixed(1) : "0.0"}%
                </p>
              </div>
            </div>

            {/* 予算消化バー */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>予算消化の目安</span>
                <span>
                  {totalExpense > 0 && totalIncome > 0
                    ? `${((totalExpense / totalIncome) * 100).toFixed(1)}%`
                    : "0.0%"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    totalExpense <= totalIncome
                      ? "bg-emerald-500"
                      : "bg-red-400"
                  }`}
                  style={{
                    width: `${
                      totalIncome > 0
                        ? Math.min(100, (totalExpense / totalIncome) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 右側ミニカード（都道府県選択） */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 text-sm space-y-3">
            <p className="text-xs font-semibold text-slate-700">地域を選択</p>
            <p className="text-xs text-slate-500">
              都道府県ごとの支出中央値をもとに、初期の予算を自動セットします。
            </p>
            <PrefectureSelector selectedPref={pref} onChange={setPref} />
            <p className="text-[11px] text-slate-400">
              ※中央値は実際のデータに近づけておくと、より現実に近いシミュレーションができます。
            </p>
          </div>
        </section>

        {/* メインコンテンツ：収入・支出予算・ボタン・グラフ */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* 左：収入＆支出入力 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 space-y-4">
              {/* 収入ブロック */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">
                    収入の設定
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    人数ごとの収入を入力してください
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    収入の人数
                  </label>
                  <select
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="border rounded-md px-2 py-1 text-sm w-32"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}人
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {memberIncomes.map((value, index) => {
                    const incomeNum = Number(value) || 0;
                    const hasIncome = incomeNum > 0 && totalIncome > 0;
                    const ratio = hasIncome
                      ? (incomeNum / totalIncome) * 100
                      : 0;

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

                <div className="text-sm font-semibold text-slate-700">
                  世帯収入合計:{" "}
                  <span className="text-base">
                    {totalIncome.toLocaleString()}円
                  </span>
                </div>
              </div>

              {/* 支出予算ブロック */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">
                    支出予想額（今月の予算）
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    カテゴリ別の今月の予算を設定してください
                  </span>
                </div>

                <ExpenseInputsBlock
                  items={expenseItems}
                  median={currentMedian}
                  onItemLabelChange={handleExpenseLabelChange}
                  onItemValueChange={handleExpenseValueChange}
                  onItemPresetChange={handleExpensePresetChange}
                  onAddItem={handleAddExpenseItem}
                  onRemoveItem={handleRemoveExpenseItem}
                />

                <div className="text-sm font-semibold text-slate-700">
                  支出予想額の合計:{" "}
                  <span className="text-base">
                    {totalExpense.toLocaleString()}円
                  </span>
                </div>

                {/* 貯金シミュレーション */}
                <SavingSimulation
                  incomeDigits={totalIncomeDigits}
                  totalExpense={totalExpense}
                />

                {/* カレンダーへ */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartBudget}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-emerald-700 transition-colors"
                  >
                    この予算でスタート
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右：使い方・ヒント */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-5 lg:py-5 text-sm">
              <p className="font-semibold text-slate-800 mb-2">使い方</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>
                  都道府県を選ぶと、その地域の支出中央値をもとに
                  初期予算がセットされます。
                </li>
                <li>
                  収入の人数を選び、それぞれの収入を半角数字で入力してください。
                </li>
                <li>
                  支出の項目の種類から「食費」「住居費」などを選ぶと、
                  中央値をもとに予算が提案されます。
                </li>
                <li>項目名は自由に編集できます（例: 日用品 → サブスク代）。</li>
                <li>
                  「この予算でスタート」でカレンダーページに移動し、
                  日別の実績を入力できます。
                </li>
              </ul>
            </div>
          </aside>
        </section>

        {/* 支出予算のグラフ */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5">
            <ExpenseChart items={expenseItems} />
          </div>
        </section>
      </div>
    </main>
  );
}
