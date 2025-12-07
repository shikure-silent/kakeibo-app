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
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">
        カテゴリ・項目設定
      </h2>

      {/* 支出カテゴリ */}
      <div className="space-y-1.5">
        <EditableListSection
          title="支出カテゴリ"
          description="入力タブやカレンダー編集モーダルで使う支出カテゴリの名前と並び順を変更できます。"
          items={expenseCategories}
          onEdit={onEditExpenseCategory}
          onAdd={onAddExpenseCategory}
          onRemove={onRemoveExpenseCategory}
          onReorder={onReorderExpenseCategory}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onResetExpenseCategories}
            className="
              inline-flex items-center gap-1.5
              rounded-full border border-slate-200 bg-slate-50
              px-3 py-1.5 text-[11px] font-medium text-slate-700
              shadow-sm hover:bg-slate-100 hover:border-slate-300
            "
          >
            支出カテゴリをデフォルトに戻す
          </button>
        </div>
      </div>

      {/* 収入カテゴリ */}
      <div className="space-y-1.5">
        <EditableListSection
          title="収入カテゴリ"
          description="ボーナスや臨時収入など、自分に合った収入カテゴリに編集できます。入力タブやカレンダー編集モーダルに反映されます。"
          items={incomeCategories}
          onEdit={onEditIncomeCategory}
          onAdd={onAddIncomeCategory}
          onRemove={onRemoveIncomeCategory}
          onReorder={onReorderIncomeCategory}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onResetIncomeCategories}
            className="
              inline-flex items-center gap-1.5
              rounded-full border border-slate-200 bg-slate-50
              px-3 py-1.5 text-[11px] font-medium text-slate-700
              shadow-sm hover:bg-slate-100 hover:border-slate-300
            "
          >
            収入カテゴリをデフォルトに戻す
          </button>
        </div>
      </div>

      {/* 支出元 / 入金元プリセット */}
      <div className="space-y-1.5">
        <EditableListSection
          title="支出元・入金元の候補"
          description="現金・クレジットカード・電子決済など、よく使う支出元や入金元の候補を編集できます。入力タブとカレンダー編集モーダルに反映されます。"
          items={payFromPresets}
          onEdit={onEditPayFrom}
          onAdd={onAddPayFrom}
          onRemove={onRemovePayFrom}
          onReorder={onReorderPayFrom}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onResetPayFromPresets}
            className="
              inline-flex items-center gap-1.5
              rounded-full border border-slate-200 bg-slate-50
              px-3 py-1.5 text-[11px] font-medium text-slate-700
              shadow-sm hover:bg-slate-100 hover:border-slate-300
            "
          >
            支出元・入金元の候補をデフォルトに戻す
          </button>
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        ※ ここで編集した内容は、入力タブのカテゴリ候補や支出元候補、
        カレンダーの内訳編集モーダルに反映されます。
      </p>
    </section>
  );
}
