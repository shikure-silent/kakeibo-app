type Props = {
  onResetKakeiboData: () => void;
};

export function DataManagementSection({ onResetKakeiboData }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">データ管理</h2>

      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-700">
          家計簿データをリセット
        </p>
        <p className="text-[10px] text-slate-500">
          この端末のブラウザに保存されている予算・日別の支出／収入明細・固定費などの
          家計簿データをすべて削除します。テーマや給料日、カテゴリ・支出元プリセットの設定は残ります。
        </p>
        <button
          type="button"
          onClick={onResetKakeiboData}
          className="mt-1 inline-flex items-center rounded-full border border-red-400 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
        >
          家計簿データをすべて削除する
        </button>
      </div>

      <p className="text-[10px] text-slate-400">
        ※ 誤って削除した場合、データを元に戻すことはできません。
      </p>
    </section>
  );
}
