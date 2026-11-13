import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldWidgetSelectTilesUpdatedOptions } from '@/page-layout/widgets/field/utils/getFieldWidgetSelectTilesUpdatedOptions';

const OPTIONS: FieldMetadataItemOption[] = [
  { id: 'option-1', label: 'New', value: 'NEW', color: 'red', position: 0 },
  {
    id: 'option-2',
    label: 'Proposal',
    value: 'PROPOSAL',
    color: 'turquoise',
    position: 1,
  },
];

describe('getFieldWidgetSelectTilesUpdatedOptions', () => {
  it('should rename the option and keep its value', () => {
    const updatedOptions = getFieldWidgetSelectTilesUpdatedOptions({
      options: OPTIONS,
      optionId: 'option-2',
      patch: { label: 'Offer' },
    });

    expect(updatedOptions[1]).toEqual({
      id: 'option-2',
      label: 'Offer',
      value: 'PROPOSAL',
      color: 'turquoise',
      position: 1,
    });
  });

  it('should recolor only the targeted option', () => {
    const updatedOptions = getFieldWidgetSelectTilesUpdatedOptions({
      options: OPTIONS,
      optionId: 'option-1',
      patch: { color: 'blue' },
    });

    expect(updatedOptions.map((option) => option.color)).toEqual([
      'blue',
      'turquoise',
    ]);
  });

  it('should drop fields the metadata API does not accept', () => {
    const optionWithTypename = {
      ...OPTIONS[0],
      __typename: 'FieldOption',
    } as FieldMetadataItemOption;

    const [updatedOption] = getFieldWidgetSelectTilesUpdatedOptions({
      options: [optionWithTypename],
      optionId: 'option-1',
      patch: {},
    });

    expect(updatedOption).not.toHaveProperty('__typename');
  });
});
