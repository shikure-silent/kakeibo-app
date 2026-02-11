"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isInitialSetupComplete } from "../../lib/initialSetupStorage";

export default function WelcomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialSetupComplete()) {
      router.replace("/calendar");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 grid place-items-center text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <section className="w-full rounded-3xl border border-emerald-100 bg-white/90 p-7 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-700">
            WELCOME
          </p>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[#0f172a]">
            無理なく貯金ができる家計簿アプリにようこそ！
          </h1>
          <p className="mt-4 text-sm leading-7 font-medium text-[#334155]">
            最初にあなた向けの初期設定を行います。収入や予算、集計開始日などを入力して、家計管理をすぐ始めましょう。
          </p>
          <Link
            href="/setup"
            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            はじめる
          </Link>
        </section>
      </div>
    </main>
  );
}
