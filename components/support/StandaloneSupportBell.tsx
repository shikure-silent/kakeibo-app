"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { shouldShowSupportBell } from "../../lib/supportBellVisibility";
import SupportBell from "./SupportBell";
import { useSupportBell } from "./SupportBellProvider";

export default function StandaloneSupportBell() {
  const pathname = usePathname();
  const { cards } = useSupportBell();
  const [isIosNative, setIsIosNative] = useState(false);

  useEffect(() => {
    setIsIosNative(
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios"
    );
  }, []);

  const canShowOnPath = useMemo(() => shouldShowSupportBell(pathname), [pathname]);
  const showStandaloneBell = isIosNative && canShowOnPath;

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (showStandaloneBell) {
      document.body.setAttribute("data-ios-standalone-bell", "1");
      return;
    }
    document.body.removeAttribute("data-ios-standalone-bell");
  }, [showStandaloneBell]);

  if (!showStandaloneBell) return null;

  return (
    <div className="ios-standalone-bell z-30">
      <SupportBell cards={cards} mode="floating" />
    </div>
  );
}
