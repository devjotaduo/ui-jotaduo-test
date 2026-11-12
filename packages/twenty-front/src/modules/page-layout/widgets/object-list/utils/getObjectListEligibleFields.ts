import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

// Types without a one-line text form, or that would need a sub-list per row
const UNLISTABLE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.FILES,
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.POSITION,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.TS_VECTOR,
];

export const getObjectListEligibleFields = (fields: FieldMetadataItem[]) =>
  fields.filter(
    (field) =>
      field.isActive === true &&
      field.isSystem !== true &&
      !UNLISTABLE_FIELD_TYPES.includes(field.type) &&
      !(
        field.type === FieldMetadataType.RELATION &&
        field.settings !== null &&
        field.settings !== undefined &&
        'relationType' in field.settings &&
        field.settings.relationType === RelationType.ONE_TO_MANY
      ),
  );
