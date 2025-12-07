import { AppSettings } from "../../lib/settingsStorage";

type Props = {
  settings: AppSettings;
  onChangeSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
};

export function SavingSupportSection({ settings, onChangeSetting }: Props) {
  const {
    enableInputGapReminder = true,
    enableWeeklySummaryReminder = true,
    enableMidPeriodCheckReminder = true,
    enableCycleEndReviewReminder = true,
    budgetAlertRate = 0.8,
    targetSavingRate,
    enableEncouragingMessages = true,
  } = settings;

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">
        貯金サポート・メンタルケア
      </h2>

      {/* 1. 入力＆振り返りリマインド */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-slate-600">
          入力＆振り返りリマインド
        </p>

        {/* 数日入力していないときの声かけ */}
        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            className="mt-[2px] h-3 w-3"
            checked={enableInputGapReminder}
            onChange={(e) =>
              onChangeSetting("enableInputGapReminder", e.target.checked)
            }
          />
          <span>
            数日入力していないときに、「ここ数日分をまとめて入力しませんか？」というカードをホーム画面に表示する
          </span>
        </label>

        {/* サイクル中間のペース確認 */}
        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            className="mt-[2px] h-3 w-3"
            checked={enableMidPeriodCheckReminder}
            onChange={(e) =>
              onChangeSetting("enableMidPeriodCheckReminder", e.target.checked)
            }
          />
          <span>
            給料日サイクルの中間ごろに、「ここまでの支出」と「このペースだと今サイクルの貯金見込み」をホーム画面でお知らせする
          </span>
        </label>

        {/* サイクル終盤のふりかえり提案 */}
        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            className="mt-[2px] h-3 w-3"
            checked={enableCycleEndReviewReminder}
            onChange={(e) =>
              onChangeSetting("enableCycleEndReviewReminder", e.target.checked)
            }
          />
          <span>
            サイクルの終わりごろに、「今サイクルの家計をかんたんにふりかえりましょう」というカードを表示する
          </span>
        </label>

        {/* 週次サマリー（余裕あれば使う） */}
        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            className="mt-[2px] h-3 w-3"
            checked={enableWeeklySummaryReminder}
            onChange={(e) =>
              onChangeSetting("enableWeeklySummaryReminder", e.target.checked)
            }
          />
          <span>週に1回、「今週のふりかえり」カードをホーム画面に表示する</span>
        </label>

        <p className="text-[10px] text-slate-400">
          ※
          現時点ではアプリ内のカード表示のみです。スマホ版では将来的にプッシュ通知への拡張も検討しています。
        </p>
      </div>

      {/* 2. 予算超過の目安（ゆるいアラート） */}
      <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-200">
        <p className="text-[11px] font-medium text-slate-600">
          予算超過の目安（ゆるいアラート）
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {[0.7, 0.8, 0.9].map((rate) => {
            const isActive = budgetAlertRate === rate;
            return (
              <button
                key={rate}
                type="button"
                onClick={() => onChangeSetting("budgetAlertRate", rate)}
                className={`px-3 py-1.5 rounded-full border ${
                  isActive
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                予算の {Math.round(rate * 100)}% を超えたらお知らせ
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400">
          例：80%
          を選ぶと、今サイクルの支出が予算の80%を超えたタイミングで「少しペース早めかもしれません」といった軽めのメッセージを出すための目安になります。
        </p>
      </div>

      {/* 3. 貯金目標＆メンタルサポート */}
      <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
        {/* 貯金目標 */}
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-600">
            サイクルごとの貯金目標
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {[
              { label: "目標を設定しない", value: undefined },
              { label: "手取りの10%を目安に貯金したい", value: 0.1 },
              { label: "手取りの20%を目安に貯金したい", value: 0.2 },
              { label: "手取りの30%を目安に貯金したい", value: 0.3 },
            ].map((opt) => {
              const active =
                targetSavingRate === undefined
                  ? opt.value === undefined
                  : targetSavingRate === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() =>
                    onChangeSetting("targetSavingRate", opt.value as any)
                  }
                  className={`px-3 py-1.5 rounded-full border ${
                    active
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400">
            設定した貯金率をもとに、「このサイクルでの目標貯金額」を自動で計算し、ホーム画面のサマリーに反映します。
          </p>
        </div>

        {/* メンタルサポート */}
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-600">
            メンタルサポート
          </p>
          <label className="flex items-start gap-2 text-[11px] text-slate-700">
            <input
              type="checkbox"
              className="mt-[2px] h-3 w-3"
              checked={enableEncouragingMessages}
              onChange={(e) =>
                onChangeSetting("enableEncouragingMessages", e.target.checked)
              }
            />
            <span>
              貯金がうまくいっているときや予算オーバー気味のときに、責めない・やさしい一言メッセージを表示する
            </span>
          </label>
          <p className="text-[10px] text-slate-400">
            赤字のときも「ダメ！」とは言わず、「今月は少しペース早めかも。来月に向けて一緒に調整していきましょう。」のようなトーンで表示されます。
          </p>
        </div>
      </div>
    </section>
  );
}
