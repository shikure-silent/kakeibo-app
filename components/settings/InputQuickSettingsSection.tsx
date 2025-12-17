import { AppSettings } from "../../lib/settingsStorage";

type Props = {
  defaultInputMode: AppSettings["defaultInputMode"];
  quickExpenseCategories?: string[];
  quickIncomeCategories?: string[];
  expenseCategories: string[];
  incomeCategories: string[];
  onChangeDefaultMode: (mode: AppSettings["defaultInputMode"]) => void;
  onToggleQuickCategory: (kind: "expense" | "income", name: string) => void;
  isDark?: boolean;
};

export function InputQuickSettingsSection({
  defaultInputMode,
  quickExpenseCategories,
  quickIncomeCategories,
  expenseCategories,
  incomeCategories,
  onChangeDefaultMode,
  onToggleQuickCategory,
  isDark = false,
}: Props) {
  return (
    <section
      className={`rounded-2xl border shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <h2
        className={`text-sm font-semibold ${
          isDark ? "text-slate-100" : "text-slate-800"
        }`}
      >
        入力の基本設定・クイック入力
      </h2>

      {/* デフォルトの入力モード */}
      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          入力タブを開いたときの初期モード
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {[
            { value: "expense", label: "支出から入力を始める" },
            { value: "income", label: "収入から入力を始める" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
              onChangeDefaultMode(
                opt.value as AppSettings["defaultInputMode"]
              )
            }
              className={`px-3 py-1.5 rounded-full border ${
                defaultInputMode === opt.value ||
                (!defaultInputMode && opt.value === "expense")
                  ? isDark
                    ? "bg-emerald-900/40 border-emerald-400 text-emerald-100"
                    : "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : isDark
                  ? "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
          ※ 何も選ばれていない場合は「支出」から始まります。
        </p>
      </div>

      {/* クイックカテゴリ */}
      <div
        className="space-y-2 pt-3 border-t border-dashed"
        style={{ borderColor: isDark ? "#475569" : "#e2e8f0" }}
      >
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          クイックカテゴリ
        </p>
        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          よく使うカテゴリを選んでおくと、入力タブのカテゴリ欄の上部にチップとして表示されます。
        </p>

        {/* 支出クイックカテゴリ */}
        <div className="space-y-1.5">
          <p
            className={`text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            支出のクイックカテゴリ
          </p>
          <div className="flex flex-wrap gap-1.5">
            {expenseCategories.map((name) => {
              const isActive = (quickExpenseCategories ?? []).includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onToggleQuickCategory("expense", name)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] ${
                    isActive
                      ? isDark
                        ? "bg-emerald-900/40 border-emerald-400 text-emerald-100"
                        : "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : isDark
                      ? "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {name || "（未設定）"}
                </button>
              );
            })}
          </div>
        </div>

        {/* 収入クイックカテゴリ */}
        <div className="space-y-1.5">
          <p
            className={`text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            収入のクイックカテゴリ
          </p>
          <div className="flex flex-wrap gap-1.5">
            {incomeCategories.map((name) => {
              const isActive = (quickIncomeCategories ?? []).includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onToggleQuickCategory("income", name)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] ${
                    isActive
                      ? isDark
                        ? "bg-emerald-900/40 border-emerald-400 text-emerald-100"
                        : "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : isDark
                      ? "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {name || "（未設定）"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
