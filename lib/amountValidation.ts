export const MAX_ENTRY_AMOUNT = 9_999_999;
export const MAX_ENTRY_AMOUNT_DIGITS = String(MAX_ENTRY_AMOUNT).length;

export function isValidEntryAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= MAX_ENTRY_AMOUNT;
}

