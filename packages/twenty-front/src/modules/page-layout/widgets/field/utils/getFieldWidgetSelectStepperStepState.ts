export type FieldWidgetSelectStepperStepState = 'done' | 'current' | 'upcoming';

export const getFieldWidgetSelectStepperStepState = ({
  stepIndex,
  currentIndex,
}: {
  stepIndex: number;
  currentIndex: number;
}): FieldWidgetSelectStepperStepState => {
  if (stepIndex === currentIndex) {
    return 'current';
  }

  return stepIndex < currentIndex ? 'done' : 'upcoming';
};
