import { getFieldWidgetSelectStepperStepState } from '@/page-layout/widgets/field/utils/getFieldWidgetSelectStepperStepState';

describe('getFieldWidgetSelectStepperStepState', () => {
  it('should mark stages before the current one as done', () => {
    expect(
      getFieldWidgetSelectStepperStepState({ stepIndex: 1, currentIndex: 3 }),
    ).toBe('done');
  });

  it('should mark the current stage', () => {
    expect(
      getFieldWidgetSelectStepperStepState({ stepIndex: 3, currentIndex: 3 }),
    ).toBe('current');
  });

  it('should mark stages after the current one as upcoming', () => {
    expect(
      getFieldWidgetSelectStepperStepState({ stepIndex: 4, currentIndex: 3 }),
    ).toBe('upcoming');
  });

  it('should mark every stage as upcoming when no stage is set', () => {
    expect(
      getFieldWidgetSelectStepperStepState({ stepIndex: 0, currentIndex: -1 }),
    ).toBe('upcoming');
  });
});
