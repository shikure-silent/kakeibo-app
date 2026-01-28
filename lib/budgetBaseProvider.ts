import { AgeGroup, ageGroupMedians } from "../data/ageGroupData";
import { ExpenseMedian } from "../data/prefectureData";

export type NationalMedianFetcher = (
  ageGroup: AgeGroup
) => Promise<ExpenseMedian | null>;

export type NationalMedianSource = "api" | "local";

export type NationalMedianFetchResult = {
  median: ExpenseMedian;
  source: NationalMedianSource;
};

let nationalMedianFetcher: NationalMedianFetcher | null = null;

export const registerNationalMedianFetcher = (
  fetcher: NationalMedianFetcher | null
) => {
  nationalMedianFetcher = fetcher;
};

const isValidMedian = (value: ExpenseMedian | null | undefined): boolean => {
  if (!value) return false;
  return (
    Number.isFinite(value.food) &&
    Number.isFinite(value.utilities) &&
    Number.isFinite(value.dailyGoods) &&
    Number.isFinite(value.rent) &&
    Number.isFinite(value.transport) &&
    Number.isFinite(value.subscription) &&
    Number.isFinite(value.entertainment) &&
    Number.isFinite(value.medicalInsurance)
  );
};

export const getNationalMedianForAgeGroup = async (
  ageGroup: AgeGroup
): Promise<NationalMedianFetchResult> => {
  const fallback = ageGroupMedians[ageGroup];

  if (typeof window === "undefined") {
    return { median: fallback, source: "local" };
  }

  if (!nationalMedianFetcher) {
    return { median: fallback, source: "local" };
  }

  try {
    const result = await nationalMedianFetcher(ageGroup);
    if (isValidMedian(result)) {
      return { median: result, source: "api" };
    }
  } catch {
    // fall back to local data
  }

  return { median: fallback, source: "local" };
};
