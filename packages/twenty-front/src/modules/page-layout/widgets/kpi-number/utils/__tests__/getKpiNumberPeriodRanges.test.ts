import { getKpiNumberPeriodRanges } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberPeriodRanges';

describe('getKpiNumberPeriodRanges', () => {
  it('should compare the month so far with the same span of the month before', () => {
    const now = new Date(2026, 10, 13, 12);

    const { current, previous } = getKpiNumberPeriodRanges({
      period: 'MONTH',
      now,
    });

    expect(current).toEqual({ start: new Date(2026, 10, 1), end: now });
    expect(previous).toEqual({
      start: new Date(2026, 9, 1),
      end: new Date(2026, 9, 13, 12),
    });
  });

  it('should start weeks on monday', () => {
    const { current, previous } = getKpiNumberPeriodRanges({
      period: 'WEEK',
      now: new Date(2026, 10, 13, 12),
    });

    expect(current.start).toEqual(new Date(2026, 10, 9));
    expect(previous.start).toEqual(new Date(2026, 10, 2));
  });

  it('should never let the previous range run into the current one', () => {
    const { current, previous } = getKpiNumberPeriodRanges({
      period: 'MONTH',
      now: new Date(2026, 2, 31, 23),
    });

    expect(previous.end).toEqual(current.start);
  });

  it('should go back a quarter and a year', () => {
    const now = new Date(2026, 10, 13);

    expect(
      getKpiNumberPeriodRanges({ period: 'QUARTER', now }).previous.start,
    ).toEqual(new Date(2026, 6, 1));
    expect(
      getKpiNumberPeriodRanges({ period: 'YEAR', now }).previous.start,
    ).toEqual(new Date(2025, 0, 1));
  });
});
