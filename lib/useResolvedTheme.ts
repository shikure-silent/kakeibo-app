import { useEffect, useState } from "react";
import { ThemeOption, getThemeClasses } from "./settingsStorage";

function getSystemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useResolvedTheme(theme: ThemeOption) {
  const [prefersDark, setPrefersDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setPrefersDark(media.matches);
    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const resolvedTheme: ThemeOption =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  const themeClass = getThemeClasses(resolvedTheme);
  const isDark = themeClass.includes("theme-dark");

  return { themeClass, isDark };
}
