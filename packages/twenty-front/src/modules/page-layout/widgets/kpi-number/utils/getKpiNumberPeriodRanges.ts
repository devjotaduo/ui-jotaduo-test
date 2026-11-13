import {
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from 'date-fns';
import { type KpiNumberPeriod } from 'twenty-shared/types';

type KpiNumberRange = { start: Date; end: Date };

const PERIOD_BOUNDARIES: Record<
  KpiNumberPeriod,
  { startOf: (date: Date) => Date; previous: (date: Date) => Date }
> = {
  WEEK: {
    startOf: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    previous: (date) => subWeeks(date, 1),
  },
  MONTH: { startOf: startOfMonth, previous: (date) => subMonths(date, 1) },
  QUARTER: {
    startOf: startOfQuarter,
    previous: (date) => subQuarters(date, 1),
  },
  YEAR: { startOf: startOfYear, previous: (date) => subYears(date, 1) },
};

// The previous range stops at the same point in its period, so a month
// half way through is compared with half of the month before
export const getKpiNumberPeriodRanges = ({
  period,
  now,
}: {
  period: KpiNumberPeriod;
  now: Date;
}): { current: KpiNumberRange; previous: KpiNumberRange } => {
  const { startOf, previous } = PERIOD_BOUNDARIES[period];

  const currentStart = startOf(now);
  const previousStart = startOf(previous(currentStart));
  const elapsedMilliseconds = now.getTime() - currentStart.getTime();
  const previousEnd = new Date(
    Math.min(
      previousStart.getTime() + elapsedMilliseconds,
      currentStart.getTime(),
    ),
  );

  return {
    current: { start: currentStart, end: now },
    previous: { start: previousStart, end: previousEnd },
  };
};
