import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldWidgetSelectTileContent } from '@/page-layout/widgets/field/components/FieldWidgetSelectTileContent';
import { FieldWidgetSelectTilesCustomize } from '@/page-layout/widgets/field/components/FieldWidgetSelectTilesCustomize';
import { getFieldWidgetSelectTilesUpdatedOptions } from '@/page-layout/widgets/field/utils/getFieldWidgetSelectTilesUpdatedOptions';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]};
`;

type FieldWidgetSelectTilesProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
};

// Select options as a grid of cards; Customize renames or recolors the selected option for everyone
export const FieldWidgetSelectTiles = ({
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
}: FieldWidgetSelectTilesProps) => {
  const { t } = useLingui();
  const colorLabels = useColorLabels();
  const fieldName = fieldMetadataItem.name;

  const { updateOneRecord } = useUpdateOneRecord();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  const canEditDataModel = useHasPermissionFlag(PermissionFlagType.DATA_MODEL);

  const [fieldValue, setFieldValue] = useAtomFamilySelectorState(
    recordStoreFamilySelector,
    { recordId, fieldName },
  );

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: fieldMetadataItem.id,
  });

  const options = [...(fieldMetadataItem.options ?? [])].sort(
    (optionA, optionB) => optionA.position - optionB.position,
  );

  if (options.length === 0) {
    return <StyledEmpty>{t`This field has no options yet`}</StyledEmpty>;
  }

  const selectedValue = isNonEmptyString(fieldValue) ? fieldValue : null;
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const select = (optionValue: string) => {
    if (isRecordFieldReadOnly === true || optionValue === selectedValue) {
      return;
    }

    setFieldValue(optionValue);

    updateOneRecord({
      objectNameSingular: objectMetadataItem.nameSingular,
      idToUpdate: recordId,
      updateOneRecordInput: { [fieldName]: optionValue },
    });
  };

  return (
    <StyledContainer>
      <RadioGroup
        layout="grid"
        minColumnWidth={120}
        aria-label={fieldMetadataItem.label}
        value={selectedValue}
        disabled={isRecordFieldReadOnly}
        onValueChange={(nextValue) => select(nextValue as string)}
      >
        {options.map((option) => (
          <Radio
            key={option.id}
            value={option.value}
            aria-label={option.label}
            variant="card"
          >
            <FieldWidgetSelectTileContent
              color={option.color}
              title={option.label}
              description={colorLabels[option.color] ?? option.color}
            />
          </Radio>
        ))}
        {canEditDataModel && isDefined(selectedOption) && (
          <FieldWidgetSelectTilesCustomize
            key={selectedOption.id}
            option={selectedOption}
            onChange={(patch) =>
              updateOneFieldMetadataItem({
                objectMetadataId: objectMetadataItem.id,
                fieldMetadataIdToUpdate: fieldMetadataItem.id,
                updatePayload: {
                  options: getFieldWidgetSelectTilesUpdatedOptions({
                    options,
                    optionId: selectedOption.id,
                    patch,
                  }),
                },
              })
            }
          />
        )}
      </RadioGroup>
    </StyledContainer>
  );
};
