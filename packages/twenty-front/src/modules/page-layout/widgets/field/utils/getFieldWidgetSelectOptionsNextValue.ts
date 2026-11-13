// Select keeps one value; Multi-select toggles the clicked option in or out
export const getFieldWidgetSelectOptionsNextValue = ({
  isMultiSelect,
  selectedValues,
  toggledValue,
}: {
  isMultiSelect: boolean;
  selectedValues: string[];
  toggledValue: string;
}): string | string[] => {
  if (!isMultiSelect) {
    return toggledValue;
  }

  return selectedValues.includes(toggledValue)
    ? selectedValues.filter((value) => value !== toggledValue)
    : [...selectedValues, toggledValue];
};
