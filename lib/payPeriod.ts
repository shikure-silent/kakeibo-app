export type PayPeriod = {
  start: Date;
  end: Date;
};

const lastDayOfMonth = (y: number, m: number): number =>
  new Date(y, m, 0).getDate();

export const getEffectivePaydayForMonth = (
  year: number,
  month: number,
  payday: number
): number => {
  const normalizedPayday = Math.min(31, Math.max(1, Math.floor(payday || 1)));
  return Math.min(normalizedPayday, lastDayOfMonth(year, month));
};

/**
 * 指定された year/month に対して、
 * 「その月で締める給料日サイクル」を返すヘルパー。
 *
 * 例）給料日=15 の場合
 *  - 2025年12月 → 2025-11-15 〜 2025-12-14
 *  - 2025年1月  → 2024-12-15 〜 2025-01-14
 *
 * 給料日=1 のときは「月初〜月末」（カレンダー月そのまま）とみなす。
 */
export const getPayPeriodForMonth = (
  year: number,
  month: number,
  payday: number
): PayPeriod | null => {
  if (!payday) return null;

  const normalizedPayday = Math.min(31, Math.max(1, Math.floor(payday)));

  // 月初〜月末サイクル（給料日=1 相当）
  if (normalizedPayday === 1) {
    const endDay = lastDayOfMonth(year, month);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month - 1, endDay);
    return { start, end };
  }

  // 前月の実在する給料日を開始日、
  // 当月の実在する給料日の前日を締め日とする（境界日の重複を防ぐ）
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const startDay = getEffectivePaydayForMonth(prevYear, prevMonth, normalizedPayday);
  const start = new Date(prevYear, prevMonth - 1, startDay);

  const thisMonthEffectivePayday = getEffectivePaydayForMonth(
    year,
    month,
    normalizedPayday
  );
  const nextStart = new Date(year, month - 1, thisMonthEffectivePayday);
  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);

  return { start, end };
};

// 期間内の日付配列
export const listDatesInPeriod = (period: PayPeriod): Date[] => {
  const dates: Date[] = [];
  const cur = new Date(period.start);

  while (cur <= period.end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
};
