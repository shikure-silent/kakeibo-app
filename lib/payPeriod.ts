// lib/payPeriod.ts

export type PayPeriod = {
  start: Date; // 期間開始日（含む）
  end: Date; // 期間終了日（含む）
};

/**
 * 指定した year/month に対して、
 * 「その月の給料日を起点とする1サイクル」を返す。
 *
 * 例）year=2025, month=4, payday=25
 *   → 2025/4/25 〜 2025/5/24
 */
export function getPayPeriodForMonth(
  year: number,
  month: number, // 1-12
  payday: number
): PayPeriod {
  // payday が変な値でもとりあえず 1〜31 に丸める
  const basePayday = Math.min(31, Math.max(1, Math.floor(payday || 1)));

  // その月の最終日
  const lastDayThisMonth = new Date(year, month, 0).getDate();
  const normalizedPayday = Math.min(basePayday, lastDayThisMonth);

  // 開始日: 今の月の normalizedPayday 日
  const start = new Date(year, month - 1, normalizedPayday);

  // 翌月
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  // 翌月の給料日（その月の日数が少なくても収まるように調整）
  const lastDayNextMonth = new Date(nextMonthYear, nextMonth, 0).getDate();
  const nextMonthPayday = Math.min(basePayday, lastDayNextMonth);

  // 「翌月の給料日 - 1日」が終了日
  const endCandidate = new Date(nextMonthYear, nextMonth - 1, nextMonthPayday);
  const end = new Date(endCandidate);
  end.setDate(endCandidate.getDate() - 1);

  return { start, end };
}

/**
 * 期間に含まれるすべての日付を列挙
 */
export function listDatesInPeriod(period: PayPeriod): Date[] {
  const days: Date[] = [];
  const cur = new Date(period.start);

  while (cur <= period.end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return days;
}
