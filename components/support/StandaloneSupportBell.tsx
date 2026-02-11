"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import SupportBell from "./SupportBell";
import { useSupportBell } from "./SupportBellProvider";

const HIDE_PREFIXES = [
  "/setup",
  "/welcome",
  "/login",
  "/signup",
  "/reset-email",
  "/reset-password",
  "/auth",
  "/error",
];

function shouldHide(pathname: string) {
  return HIDE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function StandaloneSupportBell() {
  const pathname = usePathname();
  const { cards } = useSupportBell();
  const [isIosNative, setIsIosNative] = useState(false);

  useEffect(() => {
    setIsIosNative(
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios"
    );
  }, []);

  const hidden = useMemo(() => shouldHide(pathname), [pathname]);
  const showStandaloneBell = isIosNative && !hidden;

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
