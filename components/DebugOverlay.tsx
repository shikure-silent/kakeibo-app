"use client";

import { useEffect, useState } from "react";

type DebugEntry = {
  message: string;
  stack?: string;
  source?: string;
};

export default function DebugOverlay() {
  const [entries, setEntries] = useState<DebugEntry[]>([]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const msg = event.message || "Unknown error";
      const stack = event.error?.stack;
      const source = event.filename
        ? `${event.filename}:${event.lineno ?? 0}:${event.colno ?? 0}`
        : undefined;
      setEntries((prev) => [
        ...prev,
        { message: msg, stack, source },
      ]);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
          ? reason
          : JSON.stringify(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      setEntries((prev) => [
        ...prev,
        { message: `Unhandled rejection: ${message}`, stack },
      ]);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        color: "white",
        zIndex: 9999,
        padding: "12px",
        overflow: "auto",
        fontSize: "11px",
        lineHeight: 1.4,
        whiteSpace: "pre-wrap",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Debug Overlay (Errors)
      </div>
      {entries.map((e, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div>#{i + 1}</div>
          <div>{e.message}</div>
          {e.source && <div>{e.source}</div>}
          {e.stack && <div>{e.stack}</div>}
        </div>
      ))}
    </div>
  );
}
