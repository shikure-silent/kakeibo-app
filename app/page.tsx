"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isInitialSetupComplete } from "../lib/initialSetupStorage";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialSetupComplete()) {
      router.replace("/calendar");
    } else {
      router.replace("/welcome");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 grid place-items-center text-sm">
      読み込み中...
    </div>
  );
}
