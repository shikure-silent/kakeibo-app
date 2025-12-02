"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseMedian } from "../data/prefectureData";
import {
  AgeGroup,
  ageGroupLabels,
  ageGroupMedians,
} from "../data/ageGroupData";
import { buildBudgetKey } from "../lib/const";
import {
  buildExpenseInputs,
  FixedExpenseKey,
  fixedExpenseKeys,
  loadFixedExpenses,
  mergeFixedExpenses,
  saveFixedExpense,
} from "../lib/homeStorage";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  getThemeClasses,
} from "../lib/settingsStorage";

import SavingHighlightCard from "../components/home/SavingHighlightCard";
import IncomeSettingsCard, {
  IncomeMember,
} from "../components/home/IncomeSettingsCard";
import BudgetSettingsCard from "../components/home/BudgetSettingsCard";
import { CustomExpenseItem } from "../types/budget";

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);
  }, []);

  const themeClass = getThemeClasses(settings.theme);

  // 年代（全国×年代別のデフォルト予算に使う）
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("all");

  // デフォルト8項目ぶんの支出予算（年代別データ＋固定費上書き）
  const [expenseInputs, setExpenseInputs] = useState<
    Record<keyof ExpenseMedian, string>
  >(() => {
    return buildExpenseInputs("all");
  });

  // カスタム支出項目
  const [customExpenseItems, setCustomExpenseItems] = useState<
    CustomExpenseItem[]
  >([]);

  // 収入：人数＋メンバーごとの収入
  const [memberCount, setMemberCount] = useState<number>(1);
  const [incomeMembers, setIncomeMembers] = useState<IncomeMember[]>([
    { name: "本人", value: "" },
  ]);

  // 「スタート前確認」モーダル
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 年代が変わったら、その年代の全国値をベースに支出予算をリセット
  // ＋ 家賃・サブスクは固定費ストアで上書き
  useEffect(() => {
    const baseInputs = buildExpenseInputs(ageGroup);
    const merged = mergeFixedExpenses(baseInputs, loadFixedExpenses());
    setExpenseInputs(merged);
    // カスタム項目は「自分で決める部分」なのでそのまま維持
  }, [ageGroup]);

  // 初回マウント時に固定費を反映（SSRとの不一致を避けるため）
  useEffect(() => {
    const fixed = loadFixedExpenses();
    if (Object.keys(fixed).length === 0) return;
    setExpenseInputs((prev) => mergeFixedExpenses(prev, fixed));
  }, []);

  // 人数変更 → メンバー配列を増減
  useEffect(() => {
    setIncomeMembers((prev) => {
      if (memberCount > prev.length) {
        const newMembers = [...prev];
        for (let i = prev.length; i < memberCount; i++) {
          newMembers.push({
            name: `メンバー${i + 1}`,
            value: "",
          });
        }
        return newMembers;
      }
      if (memberCount < prev.length) {
        return prev.slice(0, memberCount);
      }
      return prev;
    });
  }, [memberCount]);

  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);
  }, []);

  // デフォルト8項目の入力変更（家賃・サブスクは固定費保存）
  const handleExpenseChange = (k: keyof ExpenseMedian, v: string) => {
    setExpenseInputs((prev) => ({ ...prev, [k]: v }));

    if (k === "rent" || k === "subscription") {
      const num = Number(v || "0");
      const safe = Number.isNaN(num) ? 0 : num;
      saveFixedExpense(k as FixedExpenseKey, safe);
    }
  };

  // カスタム支出項目：追加
  const handleAddCustomExpenseItem = () => {
    setCustomExpenseItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}-${prev.length + 1}`,
        label: "",
        value: "",
      },
    ]);
  };

  // カスタム支出項目：ラベル変更
  const handleCustomExpenseLabelChange = (id: string, label: string) => {
    setCustomExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  // カスタム支出項目：金額変更
  const handleCustomExpenseValueChange = (id: string, value: string) => {
    setCustomExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  // カスタム支出項目：削除
  const handleRemoveCustomExpenseItem = (id: string) => {
    setCustomExpenseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAgeGroupChange = (next: AgeGroup) => {
    setAgeGroup(next);
  };

  // 年代に応じた中央値を取得
  const medianForAge = ageGroupMedians[ageGroup];

  const handleMemberCountChange = (count: number) => {
    setMemberCount(count);
  };

  const handleMemberNameChange = (index: number, name: string) => {
    setIncomeMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name };
      return next;
    });
  };

  const handleMemberValueChange = (index: number, value: string) => {
    setIncomeMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };

  // デフォルト8項目の数値
  const expenseNumbers: ExpenseMedian = {
    food: Number(expenseInputs.food) || 0,
    utilities: Number(expenseInputs.utilities) || 0,
    dailyGoods: Number(expenseInputs.dailyGoods) || 0,
    rent: Number(expenseInputs.rent) || 0,
    transport: Number(expenseInputs.transport) || 0,
    subscription: Number(expenseInputs.subscription) || 0,
    entertainment: Number(expenseInputs.entertainment) || 0,
    medicalInsurance: Number(expenseInputs.medicalInsurance) || 0,
  };

  // カスタム項目ぶんの支出合計
  const customExpensesTotal = customExpenseItems.reduce((sum, item) => {
    const n = Number(item.value || "0");
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  // 支出予算トータル = デフォルト8項目 + カスタム項目
  const totalExpense =
    Object.values(expenseNumbers).reduce((sum, v) => sum + v, 0) +
    customExpensesTotal;

  // 収入合計
  const totalIncome = incomeMembers.reduce((sum, m) => {
    const v = Number(m.value || "0");
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  const saving = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? (saving / totalIncome) * 100 : null;

  // 「この予算でスタート」クリック時 → まず確認モーダルを開く
  const handleOpenConfirmModal = () => {
    setIsConfirmOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmOpen(false);
  };

  // モーダルで「カレンダーへ進む」押下 → 実際に保存して遷移
  const handleConfirmStart = () => {
    if (typeof window === "undefined") return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const key = buildBudgetKey(year, month);

    const detailItems = [
      { label: "食費", amount: expenseNumbers.food },
      { label: "水道・光熱費", amount: expenseNumbers.utilities },
      { label: "日用品", amount: expenseNumbers.dailyGoods },
      { label: "家賃・住居", amount: expenseNumbers.rent },
      { label: "交通費", amount: expenseNumbers.transport },
      { label: "サブスク", amount: expenseNumbers.subscription },
      {
        label: "娯楽費（趣味娯楽）",
        amount: expenseNumbers.entertainment,
      },
      {
        label: "医療・保険",
        amount: expenseNumbers.medicalInsurance,
      },
      ...customExpenseItems.map((item) => ({
        label: item.label || "カスタム項目",
        amount: Number(item.value || "0") || 0,
      })),
    ];

    window.localStorage.setItem(
      key,
      JSON.stringify({
        year,
        month,
        totalBudget: totalExpense,
        items: detailItems,
        totalIncome,
        saving,
      })
    );

    setIsConfirmOpen(false);
    router.push("/calendar");
  };

  return (
    <main className={`min-h-screen ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ヘッダー */}
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            ホーム
          </h1>
          <p className="text-xs lg:text-sm text-slate-500">
            今月の収入と支出予算を設定して、貯金の見込みを確認できます。
            カレンダーや入力タブと連動して、日々のお金の動きも管理できます。
          </p>
        </header>

        {/* 🌟 今月の貯金見込みカード */}
        <SavingHighlightCard
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          saving={saving}
          savingRate={savingRate}
          ageGroupLabel={ageGroupLabels[ageGroup]}
        />

        {/* 左：カード群／右：説明 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <section className="lg:col-span-2 space-y-4">
            {/* 🧾 収入の設定カード */}
            <IncomeSettingsCard
              ageGroup={ageGroup}
              onAgeGroupChange={handleAgeGroupChange}
              memberCount={memberCount}
              onMemberCountChange={handleMemberCountChange}
              incomeMembers={incomeMembers}
              onMemberNameChange={handleMemberNameChange}
              onMemberValueChange={handleMemberValueChange}
              totalIncome={totalIncome}
            />

            {/* 💸 支出予算カード */}
            <BudgetSettingsCard
              ageGroupLabel={ageGroupLabels[ageGroup]}
              median={medianForAge}
              inputs={expenseInputs}
              onChange={handleExpenseChange}
              totalExpense={totalExpense}
              customItems={customExpenseItems}
              onAddCustomItem={handleAddCustomExpenseItem}
              onChangeCustomItemLabel={handleCustomExpenseLabelChange}
              onChangeCustomItemAmount={handleCustomExpenseValueChange}
              onRemoveCustomItem={handleRemoveCustomExpenseItem}
              onStart={handleOpenConfirmModal}
            />
          </section>

          {/* 右：使い方・説明 */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 text-xs lg:text-sm text-slate-700 space-y-2">
              <p className="font-medium">この画面でできること</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  世帯主の年代を選ぶと、その年代の全国データから8項目の支出予算の初期値が設定されます。
                </li>
                <li>
                  世帯のメンバーごとの収入と支出予算を設定すると、「今月の貯金見込み」が自動計算されます。
                </li>
                <li>
                  家賃・サブスクなどの固定費は、一度入力すると毎月自動で反映されます。
                </li>
                <li>
                  娯楽費や医療・保険も年代別の目安を出しつつ、自分に合わせて調整できます。
                </li>
                <li>
                  その他の項目は「カスタム項目」として追加・削除できます。
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ⭐ スタート前の確認モーダル */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-lg p-5 space-y-4">
            {/* ✖︎ ボタン */}
            <button
              type="button"
              onClick={handleCloseConfirmModal}
              aria-label="閉じる"
              className="
          absolute top-2.5 right-2.5
          text-slate-400 hover:text-slate-600
          text-lg leading-none
        "
            >
              ×
            </button>

            <h2 className="text-sm lg:text-base font-semibold text-slate-900">
              この予算でスタートしますか？
            </h2>
            <p className="text-sm text-slate-700">
              今の設定だと、
              <span className="font-semibold">
                {" "}
                今月の貯金見込みは{" "}
                <span
                  className={saving >= 0 ? "text-emerald-600" : "text-red-500"}
                >
                  ¥{Math.abs(saving).toLocaleString()}
                </span>
              </span>
              {saving >= 0
                ? " です。一緒に貯金をがんばりましょう！"
                : " の赤字になりそうです。予算を見直してからスタートしてもOKです。"}
            </p>
            {savingRate !== null && (
              <p className="text-xs text-slate-500">
                貯金率の目安:{" "}
                <span
                  className={
                    saving >= 0
                      ? "text-emerald-600 font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {savingRate.toFixed(1)}%
                </span>
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseConfirmModal}
                className="
            px-3 py-1.5 rounded-full
            text-[11px] font-medium
            text-slate-600 bg-slate-100
            hover:bg-slate-200
          "
              >
                あとで変更する
              </button>
              <button
                type="button"
                onClick={handleConfirmStart}
                className="
            px-4 py-1.5 rounded-full
            text-[11px] font-semibold
            bg-emerald-600 text-white
            hover:bg-emerald-700
          "
              >
                カレンダーへ進む
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
