"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomePageContainer from "../../components/home/HomePageContainer";
import InitialSetupSettingsCard from "../../components/setup/InitialSetupSettingsCard";
import {
  isInitialSetupComplete,
  saveInitialSetupComplete,
} from "../../lib/initialSetupStorage";

export default function SetupPage() {
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

  const handleConfirmSetup = () => {
    saveInitialSetupComplete();
    router.replace("/calendar");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 grid place-items-center text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <HomePageContainer
      variant="setup"
      pageTitle="初期設定"
      pageDescription="収入・支出の予算と、集計開始日や通知の基本設定を入力します。"
      setupExtraContent={<InitialSetupSettingsCard />}
      onConfirmSetup={handleConfirmSetup}
    />
  );
}
