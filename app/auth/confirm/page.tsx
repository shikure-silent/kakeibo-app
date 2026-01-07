import { Suspense } from "react";
import AuthConfirmClient from "./AuthConfirmClient";

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen max-w-xl mx-auto px-4 py-10 space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">確認中...</h1>
          <p className="text-sm text-slate-600">
            メールの確認リンクを検証しています。画面が切り替わるまでお待ちください。
          </p>
        </main>
      }
    >
      <AuthConfirmClient />
    </Suspense>
  );
}
