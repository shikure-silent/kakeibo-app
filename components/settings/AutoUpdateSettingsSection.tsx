import { ExpenseCategoryKey } from "../../lib/settingsStorage";

type Props = {
  autoUpdateMap: Record<ExpenseCategoryKey, boolean>;
  onToggle: (key: ExpenseCategoryKey) => void;
  copyCustomExpenseFromPrevious?: boolean;
  onToggleCopyCustom?: () => void;
  isDark?: boolean;
};

const LABELS: Record<ExpenseCategoryKey, string> = {
  food: "食費",
  utilities: "水道・光熱費",
  dailyGoods: "日用品",
  rent: "家賃・住居",
  transport: "交通費",
  subscription: "サブスク",
  entertainment: "娯楽費（趣味娯楽）",
  medicalInsurance: "医療・保険",
};

export function AutoUpdateSettingsSection({
  autoUpdateMap,
  onToggle,
  copyCustomExpenseFromPrevious = true,
  onToggleCopyCustom,
  isDark = false,
}: Props) {
  const keys = Object.keys(LABELS) as ExpenseCategoryKey[];

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
        自動更新の設定
      </h2>
      <p className={isDark ? "text-[11px] text-slate-300" : "text-[11px] text-slate-600"}>
        データページの「支出予算 (今月の予算)」で、年代別の初期値や固定費を自動反映するカテゴリを選べます。
        オフにしたカテゴリは手入力した値を維持します。
      </p>

      <div
        className={`rounded-xl border px-3 py-2 text-sm ${
          isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="flex-1">
            <p className={isDark ? "text-slate-100 text-[13px]" : "text-slate-800 text-[13px]"}>
              カスタム項目を前月からコピー
            </p>
            <p className={isDark ? "text-[11px] text-slate-300" : "text-[11px] text-slate-500"}>
              設定がオンのとき、未入力のカスタム項目は前月の金額・名前を引き継ぎます。
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCopyCustom}
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[12px] font-medium min-w-[72px] ${
              copyCustomExpenseFromPrevious
                ? isDark
                  ? "bg-emerald-900/40 border-emerald-400 text-emerald-100"
                  : "bg-emerald-50 border-emerald-400 text-emerald-700"
                : isDark
                ? "bg-slate-800 border-slate-600 text-slate-200"
                : "bg-white border-slate-300 text-slate-600"
            }`}
          >
            {copyCustomExpenseFromPrevious ? "オン" : "オフ"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {keys.map((key) => {
          const enabled = autoUpdateMap[key];
          return (
            <label
              key={key}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <span className={isDark ? "text-slate-100" : "text-slate-800"}>
                {LABELS[key]}
              </span>
              <button
                type="button"
                onClick={() => onToggle(key)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${
                  enabled
                    ? isDark
                      ? "bg-emerald-900/40 border-emerald-400 text-emerald-100"
                      : "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : isDark
                    ? "bg-slate-800 border-slate-600 text-slate-200"
                    : "bg-white border-slate-300 text-slate-600"
                }`}
              >
                {enabled ? "オン" : "オフ"}
              </button>
            </label>
          );
        })}
      </div>
    </section>
  );
}
