"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  INITIAL_SETUP_EVENT,
  isInitialSetupComplete,
  saveInitialSetupComplete,
} from "../lib/initialSetupStorage";
import { isHomeCycleConfirmed } from "../lib/homeStorage";

const ALLOWED_PREFIXES = [
  "/intro",
  "/setup",
  "/welcome",
  "/login",
  "/signup",
  "/reset-email",
  "/reset-password",
  "/auth",
  "/error",
];

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function resolveSetupComplete(): boolean {
  if (isInitialSetupComplete()) return true;
  const now = new Date();
  const cycleConfirmed = isHomeCycleConfirmed(
    now.getFullYear(),
    now.getMonth() + 1
  );
  if (cycleConfirmed) {
    // 初期設定フラグが欠けていても、予算確定済みなら完了扱いに戻す。
    saveInitialSetupComplete();
    return true;
  }
  return false;
}

export default function InitialSetupGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const shouldAllow = useMemo(() => isAllowedPath(pathname), [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncSetupState = () => setSetupComplete(resolveSetupComplete());
    syncSetupState();
    const handleComplete = () => setSetupComplete(true);
    const handleVisible = () => {
      if (document.visibilityState === "visible") syncSetupState();
    };
    window.addEventListener(INITIAL_SETUP_EVENT, handleComplete);
    window.addEventListener("focus", syncSetupState);
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      window.removeEventListener(INITIAL_SETUP_EVENT, handleComplete);
      window.removeEventListener("focus", syncSetupState);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, []);

  useEffect(() => {
    if (shouldAllow) return;
    if (setupComplete === false) {
      router.replace("/welcome/");
    }
  }, [router, shouldAllow, setupComplete]);

  if (!shouldAllow && setupComplete !== true) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 grid place-items-center text-sm">
        読み込み中...
      </div>
    );
  }

  return <>{children}</>;
}
