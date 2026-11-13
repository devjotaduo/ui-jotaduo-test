import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getObjectListRelationLabelField = ({
  field,
  objectMetadataItems,
}: {
  field: Pick<FieldMetadataItem, 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): FieldMetadataItem | undefined => {
  const targetObjectMetadataId = field.relation?.targetObjectMetadata.id;
  const targetObjectMetadataItem = objectMetadataItems.find(
    ({ id }) => id === targetObjectMetadataId,
  );

  return isDefined(targetObjectMetadataItem)
    ? getLabelIdentifierFieldMetadataItem(targetObjectMetadataItem)
    : undefined;
};
