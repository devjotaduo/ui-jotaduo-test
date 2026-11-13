import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { FieldWidgetDisplay } from '@/page-layout/widgets/field/components/FieldWidgetDisplay';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/icon/provider';
import { Card } from 'twenty-ui/primitives/surfaces';

// Sets the control width without the settings container query, which would wrap the value under the text in a narrow column
const StyledControlWidth = styled.div`
  --settings-select-control-width: fit-content;
  width: 100%;
`;

type FieldWidgetSettingRowProps = {
  fieldDefinition: FieldDefinition<any>;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
  isInSidePanel: boolean;
};

export const FieldWidgetSettingRow = ({
  fieldDefinition,
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
  isInSidePanel,
}: FieldWidgetSettingRowProps) => {
  const { getIcon } = useIcons();

  return (
    <StyledControlWidth>
      <Card.Root fullWidth>
        <SettingsOptionCardContentSelect
          Icon={getIcon(fieldMetadataItem.icon)}
          title={fieldMetadataItem.label}
          description={
            isNonEmptyString(fieldMetadataItem.description)
              ? fieldMetadataItem.description
              : undefined
          }
        >
          <FieldWidgetDisplay
            fieldDefinition={{ ...fieldDefinition, showLabel: false }}
            fieldMetadataItem={fieldMetadataItem}
            objectMetadataItem={objectMetadataItem}
            recordId={recordId}
            isInSidePanel={isInSidePanel}
          />
        </SettingsOptionCardContentSelect>
      </Card.Root>
    </StyledControlWidth>
  );
};
