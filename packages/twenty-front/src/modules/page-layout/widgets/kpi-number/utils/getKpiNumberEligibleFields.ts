import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

const SUMMABLE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.CURRENCY,
];

export const getKpiNumberEligibleFields = (fields: FieldMetadataItem[]) =>
  fields.filter(
    (field) =>
      field.isActive === true &&
      field.isSystem !== true &&
      SUMMABLE_FIELD_TYPES.includes(field.type),
  );
