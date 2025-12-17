import { BudgetBaseOption } from "../../lib/settingsStorage";

type Props = {
  payday: number;
  budgetBase: BudgetBaseOption;
  onChangePayday: (day: number) => void;
  onChangeBudgetBase: (base: BudgetBaseOption) => void;
  isDark?: boolean;
};

export function AggregationSettingsSection({
  payday,
  budgetBase,
  onChangePayday,
  onChangeBudgetBase,
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
        集計・予算の設定
      </h2>

      {/* 集計開始日 */}
      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          集計開始日（給料日）
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-[12px]">
          <select
            value={payday}
            onChange={(e) => onChangePayday(Number(e.target.value) || 1)}
            className="border rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 w-full sm:w-auto"
            style={{
              backgroundColor: isDark ? "#0f172a" : "white",
              color: isDark ? "#e2e8f0" : "#334155",
              borderColor: isDark ? "#475569" : "#cbd5e1",
            }}
          >
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              return (
                <option key={day} value={day}>
                  {day}日
                </option>
              );
            })}
          </select>
          <span
            className={`text-[11px] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            例：25日に給料日の場合は「25日」を選択
          </span>
        </div>
      </div>

      {/* 予算の基準 */}
      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          予算の基準（将来のオプション）
        </p>
        <div className="flex flex-col gap-1 text-[11px]">
          {(["nationalMedian", "userAverage"] as BudgetBaseOption[]).map(
            (opt) => (
              <label
                key={opt}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="budgetBase"
                  value={opt}
                  checked={budgetBase === opt}
                  onChange={() => onChangeBudgetBase(opt)}
                  className="h-3 w-3"
                />
                <span className={isDark ? "text-slate-200" : "text-slate-700"}>
                  {opt === "nationalMedian" &&
                    "全国×年代別の支出中央値をベースにする（現在使用中）"}
                  {opt === "userAverage" &&
                    "自分の過去数ヶ月の平均支出をベースにする（今後追加予定）"}
                </span>
              </label>
            )
          )}
        </div>
        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
          ※ 「自分の平均から計算する」は今後のバージョンで実装予定です。
        </p>
      </div>
    </section>
  );
}
