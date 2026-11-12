import { formatObjectListFieldValue } from '@/page-layout/widgets/object-list/utils/formatObjectListFieldValue';
import { FieldMetadataType } from 'twenty-shared/types';

const format = (
  type: FieldMetadataType,
  value: unknown,
  options: {
    id: string;
    label: string;
    value: string;
    color: 'red';
    position: number;
  }[] = [],
) =>
  formatObjectListFieldValue({
    field: { type, options },
    value,
    locale: 'en-US',
    booleanLabels: { yes: 'Yes', no: 'No' },
  });

describe('formatObjectListFieldValue', () => {
  it('should format a currency in its code', () => {
    expect(
      format(FieldMetadataType.CURRENCY, {
        amountMicros: 2_500_000_000_000,
        currencyCode: 'USD',
      }),
    ).toEqual({ kind: 'text', text: '$2.5M' });
  });

  it('should show a select value as a tag with its color', () => {
    expect(
      format(FieldMetadataType.SELECT, 'NEW', [
        { id: '1', label: 'New', value: 'NEW', color: 'red', position: 0 },
      ]),
    ).toEqual({ kind: 'tags', tags: [{ label: 'New', color: 'red' }] });
  });

  it('should join a full name', () => {
    expect(
      format(FieldMetadataType.FULL_NAME, {
        firstName: 'Ana',
        lastName: 'Souza',
      }),
    ).toEqual({ kind: 'text', text: 'Ana Souza' });
  });

  it('should read the name of a related record', () => {
    expect(
      format(FieldMetadataType.RELATION, {
        id: '1',
        name: { firstName: 'Mark', lastName: 'Young' },
      }),
    ).toEqual({ kind: 'text', text: 'Mark Young' });
  });

  it('should leave empty values empty', () => {
    expect(format(FieldMetadataType.TEXT, null)).toEqual({
      kind: 'text',
      text: '',
    });
  });
});
