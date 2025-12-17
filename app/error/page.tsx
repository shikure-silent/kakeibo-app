export default function ErrorPage() {
  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-10 space-y-2">
      <h1 className="text-xl font-semibold text-slate-900">エラー</h1>
      <p className="text-sm text-slate-600">
        認証リンクの有効期限切れ、URL設定、または入力内容に問題がある可能性があります。
      </p>
      <p className="text-sm text-slate-600">
        もう一度ログイン/登録を試してください。
      </p>
    </main>
  );
}
