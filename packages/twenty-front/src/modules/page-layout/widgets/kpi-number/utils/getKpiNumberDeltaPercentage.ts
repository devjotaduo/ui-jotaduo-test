import { isDefined } from 'twenty-shared/utils';

export const getKpiNumberDeltaPercentage = ({
  currentValue,
  previousValue,
}: {
  currentValue: number | undefined;
  previousValue: number | undefined;
}): number | null => {
  if (
    !isDefined(currentValue) ||
    !isDefined(previousValue) ||
    previousValue === 0
  ) {
    return null;
  }

  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
};
