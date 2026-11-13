import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// On a record page the number only counts records that belong to that record
export const getKpiNumberRecordScopeFilter = ({
  fields,
  targetRecordIdentifier,
}: {
  fields: FieldMetadataItem[];
  targetRecordIdentifier: TargetRecordIdentifier | undefined;
}): RecordGqlOperationFilter | undefined => {
  if (!isDefined(targetRecordIdentifier)) {
    return undefined;
  }

  const relationField = fields.find(
    (field) =>
      field.isActive === true &&
      field.type === FieldMetadataType.RELATION &&
      field.relation?.type === RelationType.MANY_TO_ONE &&
      field.relation.targetObjectMetadata.nameSingular ===
        targetRecordIdentifier.targetObjectNameSingular,
  );

  if (!isDefined(relationField)) {
    return undefined;
  }

  return {
    [getForeignKeyNameFromRelationFieldName(relationField.name)]: {
      eq: targetRecordIdentifier.id,
    },
  };
};
