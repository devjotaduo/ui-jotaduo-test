import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getFieldWidgetSelectStepperStepState } from '@/page-layout/widgets/field/utils/getFieldWidgetSelectStepperStepState';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowRight } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledCounter = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTrack = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledStep = styled.button<{ fillColor: string }>`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex: 1;
  height: ${themeCssVariables.spacing[5]};
  min-width: 0;
  padding: 0;

  &:disabled {
    cursor: default;
  }

  &::after {
    background: ${({ fillColor }) => fillColor};
    border-radius: ${themeCssVariables.border.radius.pill};
    content: '';
    height: ${themeCssVariables.spacing[1]};
    width: 100%;
  }

  &:hover:not(:disabled)::after {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
  }
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]};
`;

type FieldWidgetSelectStepperProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
};

// Select options read as ordered stages: the track fills up to the current one
export const FieldWidgetSelectStepper = ({
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
}: FieldWidgetSelectStepperProps) => {
  const { t } = useLingui();
  const fieldName = fieldMetadataItem.name;

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

  const stages = [...(fieldMetadataItem.options ?? [])].sort(
    (optionA, optionB) => optionA.position - optionB.position,
  );

  if (stages.length === 0) {
    return <StyledEmpty>{t`This field has no options yet`}</StyledEmpty>;
  }

  const currentIndex = isNonEmptyString(fieldValue)
    ? stages.findIndex((stage) => stage.value === fieldValue)
    : -1;
  const currentStage = currentIndex >= 0 ? stages[currentIndex] : undefined;
  const nextStage = stages[currentIndex + 1];

  const moveTo = (stageValue: string) => {
    if (isRecordFieldReadOnly === true || stageValue === fieldValue) {
      return;
    }

    setFieldValue(stageValue);

    updateOneRecord({
      objectNameSingular: objectMetadataItem.nameSingular,
      idToUpdate: recordId,
      updateOneRecordInput: { [fieldName]: stageValue },
    });
  };

  const filledColor = isDefined(currentStage)
    ? (themeCssVariables.tag.text[currentStage.color] ??
      themeCssVariables.tag.text.gray)
    : themeCssVariables.tag.text.gray;

  const stageCount = stages.length;
  const stagePosition = currentIndex + 1;

  return (
    <StyledContainer>
      <StyledHeader>
        {isDefined(currentStage) ? (
          <Tag color={currentStage.color}>{currentStage.label}</Tag>
        ) : (
          <StyledCounter>{t`No stage yet`}</StyledCounter>
        )}
        {isDefined(currentStage) && (
          <StyledCounter>{t`${stagePosition} of ${stageCount}`}</StyledCounter>
        )}
      </StyledHeader>
      <StyledTrack>
        {stages.map((stage, index) => {
          const stepState = getFieldWidgetSelectStepperStepState({
            stepIndex: index,
            currentIndex,
          });
          const stageLabel = stage.label;

          return (
            <StyledStep
              key={stage.id}
              type="button"
              title={stageLabel}
              aria-label={t`Move to ${stageLabel}`}
              aria-current={stepState === 'current' ? 'step' : undefined}
              disabled={isRecordFieldReadOnly}
              fillColor={
                stepState === 'upcoming'
                  ? themeCssVariables.background.quaternary
                  : filledColor
              }
              onClick={() => moveTo(stage.value)}
            />
          );
        })}
      </StyledTrack>
      {isDefined(nextStage) && !isRecordFieldReadOnly && (
        <Button
          variant="outline"
          size="sm"
          endIcon={<IconArrowRight />}
          onClick={() => moveTo(nextStage.value)}
        >
          {t`Move to ${nextStage.label}`}
        </Button>
      )}
    </StyledContainer>
  );
};
