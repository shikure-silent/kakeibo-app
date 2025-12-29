"use client";

import { useEffect, useState } from "react";
import { clearFlashToast, getFlashToast } from "../lib/flashToast";

type FlashPayload = {
  message: string;
  tone?: "success" | "info" | "error";
};

export default function FlashToast() {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<FlashPayload["tone"]>("success");

  useEffect(() => {
    setMounted(true);
    const payload = getFlashToast();
    if (!payload) return;
    clearFlashToast();
    setMessage(payload.message);
    setTone(payload.tone ?? "success");
  }, []);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<FlashPayload>;
      const payload = customEvent.detail;
      if (!payload?.message) return;
      clearFlashToast();
      setMessage(payload.message);
      setTone(payload.tone ?? "success");
    };

    window.addEventListener("flash-toast", handleToast);
    return () => window.removeEventListener("flash-toast", handleToast);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => {
      setMessage(null);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!mounted || !message) return null;

  const toneClasses =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : tone === "info"
        ? "border-slate-200 bg-slate-50 text-slate-900"
        : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div className="pointer-events-none fixed left-1/2 top-12 z-50 -translate-x-1/2 px-4">
      <div
        className={`rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg ${toneClasses}`}
      >
        {message}
      </div>
    </div>
  );
}
