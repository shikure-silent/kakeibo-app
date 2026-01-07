"use client";

import { useEffect, useState } from "react";
import {
  SETTINGS_EVENT,
  ThemeOption,
  loadAppSettings,
} from "../lib/settingsStorage";
import { useResolvedTheme } from "../lib/useResolvedTheme";

type Props = {
  children: React.ReactNode;
};

export default function ThemeRoot({ children }: Props) {
  const [theme, setTheme] = useState<ThemeOption>(() => {
    return loadAppSettings().theme ?? "system";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setTheme(loadAppSettings().theme ?? "system");

    window.addEventListener("storage", update);
    window.addEventListener(SETTINGS_EVENT, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(SETTINGS_EVENT, update);
    };
  }, []);

  const { themeClass } = useResolvedTheme(theme);

  return <div className={`min-h-screen ${themeClass}`}>{children}</div>;
}
