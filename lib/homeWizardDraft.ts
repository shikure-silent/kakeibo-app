import { ExpenseMedian } from "../data/prefectureData";
import { AgeGroup } from "../data/ageGroupData";
import { CustomExpenseItem } from "../types/budget";

export const HOME_WIZARD_DRAFT_KEY = "kakeibo_home_wizard_draft_v1";
export const HOME_WIZARD_SCHEMA_VERSION = 1;

export type HomeWizardIncomeMember = {
  name: string;
  value: string;
};

export type HomeWizardDraft = {
  schema_version: number;
  updatedAt: number;
  appVersion?: string;
  step?: number;
  ageGroup: AgeGroup;
  memberCount: number;
  incomeMembers: HomeWizardIncomeMember[];
  expenseInputs: Record<keyof ExpenseMedian, string>;
  customExpenseItems: CustomExpenseItem[];
};

export const loadHomeWizardDraft = (): HomeWizardDraft | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(HOME_WIZARD_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HomeWizardDraft;
    if (!parsed || typeof parsed.updatedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveHomeWizardDraft = (draft: HomeWizardDraft) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HOME_WIZARD_DRAFT_KEY, JSON.stringify(draft));
};

export const clearHomeWizardDraft = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HOME_WIZARD_DRAFT_KEY);
};

export const isHomeWizardDraftOld = (
  updatedAt: number,
  now: Date = new Date()
) => {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return updatedAt < startOfMonth;
};
