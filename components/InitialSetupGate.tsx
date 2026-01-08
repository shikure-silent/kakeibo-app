"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  INITIAL_SETUP_EVENT,
  isInitialSetupComplete,
} from "../lib/initialSetupStorage";

const ALLOWED_PREFIXES = [
  "/setup",
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
    setSetupComplete(isInitialSetupComplete());
    const handleComplete = () => setSetupComplete(true);
    window.addEventListener(INITIAL_SETUP_EVENT, handleComplete);
    return () => {
      window.removeEventListener(INITIAL_SETUP_EVENT, handleComplete);
    };
  }, []);

  useEffect(() => {
    if (shouldAllow) return;
    if (setupComplete === false) {
      router.replace("/setup");
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
