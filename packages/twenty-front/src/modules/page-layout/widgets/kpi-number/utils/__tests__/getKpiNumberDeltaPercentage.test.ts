import { getKpiNumberDeltaPercentage } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberDeltaPercentage';

describe('getKpiNumberDeltaPercentage', () => {
  it('should return the change relative to the previous value', () => {
    expect(
      getKpiNumberDeltaPercentage({ currentValue: 150, previousValue: 100 }),
    ).toBe(50);
    expect(
      getKpiNumberDeltaPercentage({ currentValue: 50, previousValue: 100 }),
    ).toBe(-50);
  });

  it('should have no change to show without a previous value', () => {
    expect(
      getKpiNumberDeltaPercentage({ currentValue: 10, previousValue: 0 }),
    ).toBeNull();
    expect(
      getKpiNumberDeltaPercentage({
        currentValue: 10,
        previousValue: undefined,
      }),
    ).toBeNull();
  });
});
