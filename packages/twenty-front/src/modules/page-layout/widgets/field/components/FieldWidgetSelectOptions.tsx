import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getFieldWidgetSelectOptionsNextValue } from '@/page-layout/widgets/field/utils/getFieldWidgetSelectOptionsNextValue';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useId } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { Checkbox, Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledOptionRow = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledControl = styled.span`
  align-items: center;
  display: flex;
  margin-left: auto;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]};
`;

type FieldWidgetSelectOptionsProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
};

// Shows every option of a Select or Multi-select field as a card: radio for Select, checkbox for Multi-select
export const FieldWidgetSelectOptions = ({
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
}: FieldWidgetSelectOptionsProps) => {
  const { t } = useLingui();
  const groupId = useId();
  const fieldName = fieldMetadataItem.name;
  const isMultiSelect =
    fieldMetadataItem.type === FieldMetadataType.MULTI_SELECT;

  const { updateOneRecord } = useUpdateOneRecord();

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

  const selectedValues = isMultiSelect
    ? Array.isArray(fieldValue)
      ? (fieldValue as string[])
      : []
    : typeof fieldValue === 'string'
      ? [fieldValue]
      : [];

  const persist = (optionValue: string) => {
    if (isRecordFieldReadOnly === true) {
      return;
    }

    const nextValue = getFieldWidgetSelectOptionsNextValue({
      isMultiSelect,
      selectedValues,
      toggledValue: optionValue,
    });

    setFieldValue(nextValue);

    updateOneRecord({
      objectNameSingular: objectMetadataItem.nameSingular,
      idToUpdate: recordId,
      updateOneRecordInput: { [fieldName]: nextValue },
    });
  };

  const cards = (
    <Card.Root fullWidth>
      {options.map((option, index) => {
        const controlId = `${groupId}-${index}`;
        const labelId = `${controlId}-label`;
        const isSelected = selectedValues.includes(option.value);

        return (
          <Fragment key={option.id}>
            <Card.Content divider={index < options.length - 1}>
              <Card.Action
                disabled={isRecordFieldReadOnly}
                render={<label htmlFor={controlId} aria-labelledby={labelId} />}
              />
              <StyledOptionRow>
                <ColorSample colorName={option.color} variant="circle" />
                <StyledLabel id={labelId}>{option.label}</StyledLabel>
                <Card.Control render={<StyledControl />}>
                  {isMultiSelect ? (
                    <Checkbox
                      id={controlId}
                      aria-labelledby={labelId}
                      checked={isSelected}
                      disabled={isRecordFieldReadOnly}
                      onCheckedChange={() => persist(option.value)}
                    />
                  ) : (
                    <Radio
                      id={controlId}
                      aria-labelledby={labelId}
                      value={option.value}
                    />
                  )}
                </Card.Control>
              </StyledOptionRow>
            </Card.Content>
          </Fragment>
        );
      })}
    </Card.Root>
  );

  if (isMultiSelect) {
    return <StyledContainer>{cards}</StyledContainer>;
  }

  const selectedValue = selectedValues[0];

  return (
    <StyledContainer>
      <RadioGroup
        name={`field-widget-options-${recordId}-${fieldName}`}
        value={isDefined(selectedValue) ? selectedValue : null}
        onValueChange={(nextValue) => persist(nextValue as string)}
        disabled={isRecordFieldReadOnly}
      >
        {cards}
      </RadioGroup>
    </StyledContainer>
  );
};
