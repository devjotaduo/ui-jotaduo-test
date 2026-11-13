import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldWidgetRelationLinkPath } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationLinkPath';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

type FieldWidgetRelationLinkCardProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: unknown;
  recordId: string;
};

export const FieldWidgetRelationLinkCard = ({
  fieldDefinition,
  relationValue,
  recordId,
}: FieldWidgetRelationLinkCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      fieldDefinition.metadata.relationObjectMetadataId,
  );

  const relatedRecordCount = Array.isArray(relationValue)
    ? relationValue.length
    : isDefined(relationValue)
      ? 1
      : 0;

  const relatedObjectLabel =
    relatedRecordCount === 1
      ? (relationObjectMetadataItem?.labelSingular ?? '')
      : (relationObjectMetadataItem?.labelPlural ?? '');

  const inverseFieldName = fieldDefinition.metadata.targetFieldMetadataName;

  const Icon = getIcon(
    relationObjectMetadataItem?.icon ?? fieldDefinition.iconName,
  );

  return (
    <SettingsCard
      to={
        isNonEmptyString(inverseFieldName)
          ? getFieldWidgetRelationLinkPath({
              relationObjectNamePlural:
                fieldDefinition.metadata.relationObjectMetadataNamePlural,
              inverseFieldName,
              recordId,
            })
          : undefined
      }
      Icon={<Icon size={theme.icon.size.lg} stroke={theme.icon.stroke.sm} />}
      title={fieldDefinition.label}
      description={t`${relatedRecordCount} ${relatedObjectLabel}`}
    />
  );
};
