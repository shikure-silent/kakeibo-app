"use client";

import { useEffect, useState } from "react";
import {
  SETTINGS_EVENT,
  ThemeOption,
  loadAppSettings,
} from "../lib/settingsStorage";
import { useResolvedTheme } from "../lib/useResolvedTheme";
import { registerNationalMedianFetcher } from "../lib/budgetBaseProvider";
import { AgeGroup } from "../data/ageGroupData";
import { ExpenseMedian } from "../data/prefectureData";

type Props = {
  children: React.ReactNode;
};

type EstatAgeItem = {
  age: string;
  ageCode?: string;
  categories: Record<string, number>;
};

type EstatAgeResponse = {
  items?: EstatAgeItem[];
};

let estatCache: EstatAgeResponse | null = null;
let estatInFlight: Promise<EstatAgeResponse | null> | null = null;

const fetchEstatAgeData = async (): Promise<EstatAgeResponse | null> => {
  if (estatCache) return estatCache;
  if (estatInFlight) return estatInFlight;
  estatInFlight = fetch("/api/estat/spending-by-age")
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null)
    .finally(() => {
      estatInFlight = null;
    });
  const data = await estatInFlight;
  if (data) estatCache = data;
  return data;
};

const normalize = (value: string) => value.replace(/\s+/g, "").trim();

const parseAgeRange = (
  label: string
): { min?: number; max?: number; isUpperOnly?: boolean } => {
  const normalized = normalize(label);
  const nums = (normalized.match(/\d+/g) ?? []).map((n) => Number(n));
  if (nums.length >= 2) {
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }
  if (nums.length === 1) {
    const n = nums[0];
    if (normalized.includes("以上")) return { min: n, isUpperOnly: true };
    if (normalized.includes("以下") || normalized.includes("未満")) {
      return { max: n };
    }
  }
  return {};
};

const matchAgeGroupItem = (
  items: EstatAgeItem[],
  ageGroup: AgeGroup
): EstatAgeItem | null => {
  const normalizedItems = items.map((item) => ({
    item,
    label: normalize(item.age ?? ""),
  }));

  if (ageGroup === "all") {
    const hit = normalizedItems.find(({ label }) =>
      ["総数", "全体", "計", "合計"].some((kw) => label.includes(kw))
    );
    return hit?.item ?? normalizedItems[0]?.item ?? null;
  }

  for (const { item, label } of normalizedItems) {
    const { min, max, isUpperOnly } = parseAgeRange(label);

    if (ageGroup === "under29") {
      if (max !== undefined && max <= 29) return item;
      if (
        label.includes("29") &&
        (label.includes("以下") || label.includes("未満"))
      )
        return item;
    }
    if (ageGroup === "thirties" && min === 30 && max === 39) return item;
    if (ageGroup === "forties" && min === 40 && max === 49) return item;
    if (ageGroup === "fifties" && min === 50 && max === 59) return item;
    if (ageGroup === "sixties" && min === 60 && max === 69) return item;
    if (ageGroup === "seventiesPlus") {
      if (
        (min !== undefined && min >= 70 && isUpperOnly) ||
        (label.includes("70") && label.includes("以上"))
      ) {
        return item;
      }
    }
  }

  return null;
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toExpenseMedian = (categories: Record<string, number>): ExpenseMedian => ({
  food: toNumber(categories.food),
  utilities: toNumber(categories.utilities),
  dailyGoods: toNumber(categories.dailyGoods),
  rent: toNumber(categories.rent),
  transport: toNumber(categories.transport),
  subscription: toNumber(categories.subscription),
  entertainment: toNumber(categories.entertainment),
  medicalInsurance: toNumber(categories.medicalInsurance),
});

registerNationalMedianFetcher(async (ageGroup: AgeGroup) => {
  const data = await fetchEstatAgeData();
  if (!data?.items || data.items.length === 0) return null;
  const match = matchAgeGroupItem(data.items, ageGroup);
  if (!match?.categories) return null;
  return toExpenseMedian(match.categories);
});

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
