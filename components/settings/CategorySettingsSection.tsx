import { useEffect, useState } from "react";
import { EditableListSection } from "./EditableListSection";

type Props = {
  expenseCategories: string[];
  incomeCategories: string[];
  payFromPresets: string[];
  onEditExpenseCategory: (index: number, value: string) => void;
  onAddExpenseCategory: () => void;
  onRemoveExpenseCategory: (index: number) => void;
  onReorderExpenseCategory: (from: number, to: number) => void;
  onEditIncomeCategory: (index: number, value: string) => void;
  onAddIncomeCategory: () => void;
  onRemoveIncomeCategory: (index: number) => void;
  onReorderIncomeCategory: (from: number, to: number) => void;
  onEditPayFrom: (index: number, value: string) => void;
  onAddPayFrom: () => void;
  onRemovePayFrom: (index: number) => void;
  onReorderPayFrom: (from: number, to: number) => void;
  onResetExpenseCategories: () => void;
  onResetIncomeCategories: () => void;
  onResetPayFromPresets: () => void;
  showHeader?: boolean;
  isDark?: boolean;
};

export function CategorySettingsSection({
  expenseCategories,
  incomeCategories,
  payFromPresets,
  onEditExpenseCategory,
  onAddExpenseCategory,
  onRemoveExpenseCategory,
  onReorderExpenseCategory,
  onEditIncomeCategory,
  onAddIncomeCategory,
  onRemoveIncomeCategory,
  onReorderIncomeCategory,
  onEditPayFrom,
  onAddPayFrom,
  onRemovePayFrom,
  onReorderPayFrom,
  onResetExpenseCategories,
  onResetIncomeCategories,
  onResetPayFromPresets,
  showHeader = true,
  isDark = false,
}: Props) {
  const [activeModal, setActiveModal] = useState<
    "expense" | "income" | "payfrom" | null
  >(null);

  const previewItems = (items: string[]) => {
    if (!items.length) return "未登録";
    const head = items.slice(0, 3).join(" / ");
    return items.length > 3 ? `${head} ほか${items.length - 3}件` : head;
  };

  const cardBase = isDark
    ? "bg-slate-900 border-slate-700 text-slate-100"
    : "bg-white border-slate-100 text-slate-900";
  const subText = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <section
      className={`rounded-2xl border shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      {showHeader && (
        <h2
          className={`text-sm font-semibold ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          カテゴリ・項目設定
        </h2>
      )}

      <div className="space-y-3">
        {/* 支出カテゴリ */}
        <div className={`rounded-2xl border p-4 ${cardBase}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">支出カテゴリ</h3>
              <p className={`mt-1 text-[11px] ${subText}`}>
                {previewItems(expenseCategories)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetExpenseCategories}
                className="rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap"
                style={{
                  borderColor: isDark ? "#475569" : "#e2e8f0",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  color: isDark ? "#e2e8f0" : "#334155",
                }}
              >
                デフォルトに戻す
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("expense")}
                className="rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
                style={{
                  borderColor: isDark ? "#34d399" : "#34d399",
                  backgroundColor: isDark ? "rgba(6,95,70,0.25)" : "#ecfdf3",
                  color: isDark ? "#bbf7d0" : "#047857",
                }}
              >
                編集
              </button>
            </div>
          </div>
        </div>

        {/* 収入カテゴリ */}
        <div className={`rounded-2xl border p-4 ${cardBase}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">収入カテゴリ</h3>
              <p className={`mt-1 text-[11px] ${subText}`}>
                {previewItems(incomeCategories)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetIncomeCategories}
                className="rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap"
                style={{
                  borderColor: isDark ? "#475569" : "#e2e8f0",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  color: isDark ? "#e2e8f0" : "#334155",
                }}
              >
                デフォルトに戻す
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("income")}
                className="rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
                style={{
                  borderColor: isDark ? "#34d399" : "#34d399",
                  backgroundColor: isDark ? "rgba(6,95,70,0.25)" : "#ecfdf3",
                  color: isDark ? "#bbf7d0" : "#047857",
                }}
              >
                編集
              </button>
            </div>
          </div>
        </div>

        {/* 支出元プリセット */}
        <div className={`rounded-2xl border p-4 ${cardBase}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">支出元の候補</h3>
              <p className={`mt-1 text-[11px] ${subText}`}>
                {previewItems(payFromPresets)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetPayFromPresets}
                className="rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap"
                style={{
                  borderColor: isDark ? "#475569" : "#e2e8f0",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  color: isDark ? "#e2e8f0" : "#334155",
                }}
              >
                デフォルトに戻す
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("payfrom")}
                className="rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
                style={{
                  borderColor: isDark ? "#34d399" : "#34d399",
                  backgroundColor: isDark ? "rgba(6,95,70,0.25)" : "#ecfdf3",
                  color: isDark ? "#bbf7d0" : "#047857",
                }}
              >
                編集
              </button>
            </div>
          </div>
        </div>
      </div>

      <p
        className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}
      >
        ※ ここで編集した内容は、入力タブのカテゴリ候補や支出元候補、
        カレンダーの内訳編集モーダルに反映されます。
      </p>

      {activeModal && (
        <ModalOverlay>
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6">
            <div
              className={`relative w-[92vw] max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 pr-12 shadow-lg ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100"
                  : "bg-white border-slate-100 text-slate-900"
              }`}
            >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className={`absolute top-3 right-5 text-xl leading-none ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
                aria-label="閉じる"
              >
                ×
              </button>

              {activeModal === "expense" && (
                <EditableListSection
                  title="支出カテゴリ"
                  description="入力タブやカレンダー編集モーダルで使う支出カテゴリの名前と並び順を変更できます。"
                  items={expenseCategories}
                  onEdit={onEditExpenseCategory}
                  onAdd={onAddExpenseCategory}
                  onRemove={onRemoveExpenseCategory}
                  onReorder={onReorderExpenseCategory}
                  isDark={isDark}
                />
              )}

              {activeModal === "income" && (
                <EditableListSection
                  title="収入カテゴリ"
                  description="ボーナスや臨時収入など、自分に合った収入カテゴリに編集できます。入力タブやカレンダー編集モーダルに反映されます。"
                  items={incomeCategories}
                  onEdit={onEditIncomeCategory}
                  onAdd={onAddIncomeCategory}
                  onRemove={onRemoveIncomeCategory}
                  onReorder={onReorderIncomeCategory}
                  isDark={isDark}
                />
              )}

              {activeModal === "payfrom" && (
                <EditableListSection
                  title="支出元の候補"
                  description="現金・クレジットカード・電子決済など、よく使う支出元の候補を編集できます。入力タブとカレンダー編集モーダルに反映されます。"
                  items={payFromPresets}
                  onEdit={onEditPayFrom}
                  onAdd={onAddPayFrom}
                  onRemove={onRemovePayFrom}
                  onReorder={onReorderPayFrom}
                  isDark={isDark}
                />
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </section>
  );
}

function ModalOverlay({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      onTouchMove={(e) => e.preventDefault()}
      className="contents"
    >
      {children}
    </div>
  );
}
