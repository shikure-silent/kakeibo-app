export function AccountLoginSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">
        アカウント・ログイン
      </h2>

      <p className="text-[11px] text-slate-500 leading-snug">
        現在は、この端末のブラウザにのみデータを保存する「ログインなしモード」で利用できます。
        ブラウザのキャッシュを削除すると家計簿データも消えるため、大きな環境変更の前にはご注意ください。
      </p>

      <p className="text-[11px] text-slate-500 leading-snug">
        将来的には、メールアドレスとパスワードでログインして、複数の端末（スマホ・PCなど）で家計簿データを同期できるようにする予定です。
      </p>

      <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 gap-2">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
        <span>ログイン機能は準備中です</span>
      </div>
    </section>
  );
}
