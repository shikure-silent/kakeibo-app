"use client";

import { useEffect, useState, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import {
  isInitialSetupComplete,
  isIntroWizardComplete,
  saveIntroWizardComplete,
} from "../../lib/initialSetupStorage";

type IntroStep = {
  id: string;
  title: string;
  description: string;
  point: string;
};

const INTRO_STEPS: IntroStep[] = [
  {
    id: "setup",
    title: "初期設定",
    description:
      "最初に収入や予算、集計開始日などを入力します。年代別の平均値をe-Statから取得しているので、年代を選ぶとより自然な予算の初期値が設定されます。",
    point:
      "迷った項目は後から設定で変更できます。まずはおおまかな金額で始めて大丈夫です。",
  },
  {
    id: "input",
    title: "入力画面",
    description:
      "毎日の支出や収入を、カテゴリごとに手早く記録できます。使うほど、日々の支出ペースが見えやすくなります。",
    point:
      "金額を細かく完璧に合わせるより、続けられる入力ペースを優先するのがコツです。",
  },
  {
    id: "calendar",
    title: "カレンダー",
    description:
      "記録した内容は日付ごとに一覧で確認できます。カレンダーの日付から入力画面に移動して、内容の修正もできます。",
    point:
      "週末にまとめて見返すだけでも、支出の傾向がつかみやすくなります。無理のない改善ポイントを見つけるのに役立ちます。",
  },
  {
    id: "data",
    title: "データ",
    description:
      "今月の貯金見込みや今月あと使える金額など、家計の全体像を把握できます。初期設定の収入の設定と支出予算の見直しもここから行えます。",
    point:
      "支出カテゴリ別の合計や支出元別の合計、入金元別の合計も確認できるので、家計の傾向をつかむのに役立ちます。",
  },
  {
    id: "settings",
    title: "設定",
    description:
      "アカウント設定や通知、カテゴリ・項目設定など、細かい設定を行えます。集計開始日の変更もここから行えます。",
    point:
      "集計開始日を月初以外に設定している場合、月の途中で予算の見直しが必要になることがあります。設定画面から簡単に変更できるので、家計の状況に合わせて調整してみてください。",
  },
];

export default function IntroPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [animateNextArrow, setAnimateNextArrow] = useState(false);

  const isLast = index === INTRO_STEPS.length - 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialSetupComplete()) {
      router.replace("/calendar/");
      return;
    }
    if (isIntroWizardComplete()) {
      router.replace("/welcome/");
      return;
    }
    setReady(true);
  }, [router]);

  const goNext = () => {
    if (isLast) {
      saveIntroWizardComplete();
      router.replace("/welcome/");
      return;
    }
    setAnimateNextArrow(true);
    setIndex((prev) => Math.min(prev + 1, INTRO_STEPS.length - 1));
    window.setTimeout(() => setAnimateNextArrow(false), 350);
  };

  const goPrev = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    const threshold = 48;
    if (delta <= -threshold) {
      goNext();
    } else if (delta >= threshold) {
      goPrev();
    }
    setTouchStartX(null);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 grid place-items-center text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <main className="intro-light-mode min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <section className="w-full rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-700">
            APP GUIDE
          </p>
          <h1 className="intro-light-title mt-3 text-xl font-extrabold tracking-tight text-slate-900">
            無理なく貯金ができる家計簿アプリの使い方
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {index + 1}/{INTRO_STEPS.length}
          </p>

          <div
            className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                width: `${INTRO_STEPS.length * 100}%`,
                transform: `translateX(-${(100 / INTRO_STEPS.length) * index}%)`,
              }}
            >
              {INTRO_STEPS.map((step) => (
                <article
                  key={step.id}
                  className="shrink-0 p-5"
                  style={{ width: `${100 / INTRO_STEPS.length}%` }}
                >
                  <h2 className="text-lg font-bold text-slate-900">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {step.description}
                  </p>
                  <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs leading-6 text-slate-600">
                    {step.point}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {INTRO_STEPS.map((step, dotIndex) => (
              <span
                key={step.id}
                className={`h-2 rounded-full transition-all ${
                  dotIndex === index ? "w-5 bg-emerald-500" : "w-2 bg-slate-300"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            {index === 0 ? (
              <div className="h-9 w-[72px]" aria-hidden="true" />
            ) : (
              <button
                type="button"
                onClick={goPrev}
                className="intro-light-back rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                戻る
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              {isLast ? "ウェルカムへ" : "次へ"}
              {!isLast ? (
                <span
                  className={`inline-block transition-transform duration-150 ${
                    animateNextArrow ? "translate-x-2" : "translate-x-0"
                  }`}
                  aria-hidden="true"
                >
                  →
                </span>
              ) : null}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
