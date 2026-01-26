export type HolidayMap = Record<string, string>;

const STORAGE_KEY = "kakeibo-holidays-jp-v1";
const HOLIDAY_API_URL = "https://holidays-jp.github.io/api/v1/date.json";

const parseHolidayMap = (raw: string | null): HolidayMap | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as HolidayMap;
  } catch {
    return null;
  }
};

export async function loadHolidayMap(): Promise<HolidayMap> {
  if (typeof window === "undefined") return {};

  const cached = parseHolidayMap(window.localStorage.getItem(STORAGE_KEY));
  if (cached) return cached;

  const res = await fetch(HOLIDAY_API_URL);
  if (!res.ok) return {};

  const data = (await res.json()) as HolidayMap;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
  return data;
}
