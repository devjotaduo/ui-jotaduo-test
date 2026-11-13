import { getFieldWidgetSelectOptionsNextValue } from '@/page-layout/widgets/field/utils/getFieldWidgetSelectOptionsNextValue';

describe('getFieldWidgetSelectOptionsNextValue', () => {
  it('should replace the value of a Select field', () => {
    expect(
      getFieldWidgetSelectOptionsNextValue({
        isMultiSelect: false,
        selectedValues: ['SENT'],
        toggledValue: 'NONE',
      }),
    ).toBe('NONE');
  });

  it('should add an unselected option to a Multi-select field', () => {
    expect(
      getFieldWidgetSelectOptionsNextValue({
        isMultiSelect: true,
        selectedValues: ['SENT'],
        toggledValue: 'RECEIVED',
      }),
    ).toEqual(['SENT', 'RECEIVED']);
  });

  it('should remove a selected option from a Multi-select field', () => {
    expect(
      getFieldWidgetSelectOptionsNextValue({
        isMultiSelect: true,
        selectedValues: ['SENT', 'RECEIVED'],
        toggledValue: 'SENT',
      }),
    ).toEqual(['RECEIVED']);
  });
});
