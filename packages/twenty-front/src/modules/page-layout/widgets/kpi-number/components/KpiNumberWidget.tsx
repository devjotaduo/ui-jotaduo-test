import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useSaveWidgetConfiguration } from '@/page-layout/widgets/hooks/useSaveWidgetConfiguration';
import { KpiNumberValue } from '@/page-layout/widgets/kpi-number/components/KpiNumberValue';
import { getKpiNumberEligibleFields } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberEligibleFields';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type KpiNumberAggregateOperation,
  type KpiNumberConfiguration,
  type KpiNumberPeriod,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCaption = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

type KpiNumberWidgetProps = {
  widget: PageLayoutWidget;
};

export const KpiNumberWidget = ({ widget }: KpiNumberWidgetProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const canEditLayout = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const { saveWidgetConfiguration } = useSaveWidgetConfiguration(widget.id);

  const [configuration, setConfiguration] = useState<KpiNumberConfiguration>(
    () => ({
      configurationType: 'KPI_NUMBER',
      ...(widget.configuration as Partial<KpiNumberConfiguration>),
    }),
  );

  const selectableObjects = objectMetadataItems
    .filter((item) => item.isActive && !item.isSystem)
    .sort((itemA, itemB) => itemA.labelPlural.localeCompare(itemB.labelPlural));

  const objectMetadataItem =
    selectableObjects.find(
      (item) => item.id === configuration.objectMetadataId,
    ) ?? selectableObjects[0];

  if (!isDefined(objectMetadataItem)) {
    return <StyledEmpty>{t`No object to measure.`}</StyledEmpty>;
  }

  const eligibleFields = getKpiNumberEligibleFields(objectMetadataItem.fields);
  const field =
    eligibleFields.find(({ id }) => id === configuration.kpiFieldMetadataId) ??
    eligibleFields[0];
  // Sum and average need a number to work on
  const operation: KpiNumberAggregateOperation = isDefined(field)
    ? (configuration.kpiOperation ?? 'COUNT')
    : 'COUNT';
  const period: KpiNumberPeriod = configuration.period ?? 'MONTH';

  const operationLabels: Record<KpiNumberAggregateOperation, string> = {
    COUNT: t`Count`,
    SUM: t`Sum`,
    AVG: t`Average`,
  };
  const periodLabels: Record<KpiNumberPeriod, string> = {
    WEEK: t`This week`,
    MONTH: t`This month`,
    QUARTER: t`This quarter`,
    YEAR: t`This year`,
  };

  const updateConfiguration = (patch: Partial<KpiNumberConfiguration>) => {
    const nextConfiguration = { ...configuration, ...patch };

    setConfiguration(nextConfiguration);
    saveWidgetConfiguration(nextConfiguration);
  };

  const ObjectIcon = getIcon(objectMetadataItem.icon);
  const measuredLabel =
    operation === 'COUNT' || !isDefined(field)
      ? objectMetadataItem.labelPlural
      : `${operationLabels[operation]} · ${field.label}`;

  return (
    <StyledContainer>
      {canEditLayout && (
        <StyledToolbar>
          <Dropdown.Root type="menu">
            <Dropdown.Trigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  startIcon={<ObjectIcon />}
                  endIcon={<IconChevronDown />}
                />
              }
            >
              {objectMetadataItem.labelPlural}
            </Dropdown.Trigger>
            <Dropdown.Content aria-label={t`Object`} align="start">
              <Dropdown.Section scrollable>
                {selectableObjects.map((item) => {
                  const ItemIcon = getIcon(item.icon);

                  return (
                    <Dropdown.OptionItem
                      key={item.id}
                      selected={item.id === objectMetadataItem.id}
                      startIcon={<ItemIcon />}
                      onSelect={() =>
                        updateConfiguration({
                          objectMetadataId: item.id,
                          kpiFieldMetadataId: null,
                        })
                      }
                    >
                      {item.labelPlural}
                    </Dropdown.OptionItem>
                  );
                })}
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>

          <Dropdown.Root type="menu">
            <Dropdown.Trigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  endIcon={<IconChevronDown />}
                />
              }
            >
              {operationLabels[operation]}
            </Dropdown.Trigger>
            <Dropdown.Content aria-label={t`Calculation`} align="start">
              <Dropdown.Section>
                {(Object.keys(operationLabels) as KpiNumberAggregateOperation[])
                  .filter((option) => option === 'COUNT' || isDefined(field))
                  .map((option) => (
                    <Dropdown.OptionItem
                      key={option}
                      selected={option === operation}
                      onSelect={() =>
                        updateConfiguration({ kpiOperation: option })
                      }
                    >
                      {operationLabels[option]}
                    </Dropdown.OptionItem>
                  ))}
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>

          {operation !== 'COUNT' && isDefined(field) && (
            <Dropdown.Root type="menu">
              <Dropdown.Trigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    endIcon={<IconChevronDown />}
                  />
                }
              >
                {field.label}
              </Dropdown.Trigger>
              <Dropdown.Content aria-label={t`Field`} align="start">
                <Dropdown.Section scrollable>
                  {eligibleFields.map((eligibleField) => {
                    const FieldIcon = getIcon(eligibleField.icon);

                    return (
                      <Dropdown.OptionItem
                        key={eligibleField.id}
                        selected={eligibleField.id === field.id}
                        startIcon={<FieldIcon />}
                        onSelect={() =>
                          updateConfiguration({
                            kpiFieldMetadataId: eligibleField.id,
                          })
                        }
                      >
                        {eligibleField.label}
                      </Dropdown.OptionItem>
                    );
                  })}
                </Dropdown.Section>
              </Dropdown.Content>
            </Dropdown.Root>
          )}

          <Dropdown.Root type="menu">
            <Dropdown.Trigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  endIcon={<IconChevronDown />}
                />
              }
            >
              {periodLabels[period]}
            </Dropdown.Trigger>
            <Dropdown.Content aria-label={t`Period`} align="start">
              <Dropdown.Section>
                {(Object.keys(periodLabels) as KpiNumberPeriod[]).map(
                  (option) => (
                    <Dropdown.OptionItem
                      key={option}
                      selected={option === period}
                      onSelect={() => updateConfiguration({ period: option })}
                    >
                      {periodLabels[option]}
                    </Dropdown.OptionItem>
                  ),
                )}
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>
        </StyledToolbar>
      )}

      {!canEditLayout && (
        <StyledCaption>
          {measuredLabel} · {periodLabels[period]}
        </StyledCaption>
      )}

      <KpiNumberValue
        key={`${objectMetadataItem.id}-${operation}-${field?.id}-${period}`}
        objectMetadataItem={objectMetadataItem}
        operation={operation}
        field={field}
        period={period}
      />
    </StyledContainer>
  );
};
