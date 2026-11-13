import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { getKpiNumberDeltaPercentage } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberDeltaPercentage';
import { getKpiNumberPeriodRanges } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberPeriodRanges';
import { getKpiNumberRecordScopeFilter } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberRecordScopeFilter';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { startOfMinute } from 'date-fns';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type KpiNumberAggregateOperation,
  type KpiNumberPeriod,
} from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  combineFilters,
  isDefined,
} from 'twenty-shared/utils';
import { IconTrendingDown, IconTrendingUp } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { AggregateOperations } from '~/generated-metadata/graphql';

const MICROS_PER_UNIT = 1_000_000;

const AGGREGATE_OPERATION_BY_KPI_OPERATION: Record<
  KpiNumberAggregateOperation,
  AggregateOperations
> = {
  COUNT: AggregateOperations.COUNT,
  SUM: AggregateOperations.SUM,
  AVG: AggregateOperations.AVG,
};

const StyledValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.1;
`;

const StyledDelta = styled.div<{ trend: 'up' | 'down' | 'flat' }>`
  align-items: center;
  color: ${({ trend }) =>
    trend === 'up'
      ? themeCssVariables.color.green
      : trend === 'down'
        ? themeCssVariables.font.color.danger
        : themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledComparison = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type KpiNumberValueProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  operation: KpiNumberAggregateOperation;
  field: FieldMetadataItem | undefined;
  period: KpiNumberPeriod;
};

export const KpiNumberValue = ({
  objectMetadataItem,
  operation,
  field,
  period,
}: KpiNumberValueProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  // Minute precision keeps the query variables stable between renders and still follows a period rollover
  const now = startOfMinute(new Date());

  const { current, previous } = getKpiNumberPeriodRanges({ period, now });
  const recordScopeFilter = getKpiNumberRecordScopeFilter({
    fields: objectMetadataItem.fields,
    targetRecordIdentifier,
  });

  const aggregateOperation = AGGREGATE_OPERATION_BY_KPI_OPERATION[operation];
  const aggregateFieldName =
    operation === 'COUNT' || !isDefined(field)
      ? FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION
      : field.name;
  const recordGqlFieldsAggregate = {
    [aggregateFieldName]: [aggregateOperation],
  };

  // The API takes one operator per field, so each bound is its own filter
  const buildRangeFilter = ({ start, end }: { start: Date; end?: Date }) =>
    combineFilters([
      recordScopeFilter ?? {},
      { createdAt: { gte: start.toISOString() } },
      ...(isDefined(end) ? [{ createdAt: { lt: end.toISOString() } }] : []),
    ]);

  const {
    data: currentData,
    loading,
    error,
  } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    // No upper bound: one frozen at mount would leave out records created while the widget stays open
    filter: buildRangeFilter({ start: current.start }),
  });

  const { data: previousData } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: buildRangeFilter(previous),
  });

  const isCurrency =
    operation !== 'COUNT' && field?.type === FieldMetadataType.CURRENCY;

  const readValue = (data: typeof currentData) => {
    const rawValue = data[aggregateFieldName]?.[aggregateOperation];

    if (!isDefined(rawValue)) {
      return undefined;
    }

    const value = Number(rawValue);

    return isCurrency ? value / MICROS_PER_UNIT : value;
  };

  const currentValue = readValue(currentData);
  const deltaPercentage = getKpiNumberDeltaPercentage({
    currentValue,
    previousValue: readValue(previousData),
  });

  // The aggregate query is skipped for an unreadable object and drops an unreadable field, both of which would show as zero
  const isObjectRestricted = !canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions: objectPermissions,
    operationType: 'read',
  });
  const isFieldRestricted =
    operation !== 'COUNT' &&
    isDefined(field) &&
    !objectMetadataItem.readableFields.some(({ id }) => id === field.id);

  if (isObjectRestricted || isFieldRestricted) {
    return (
      <StyledComparison>{t`You do not have access to this number.`}</StyledComparison>
    );
  }

  if (isDefined(error)) {
    return (
      <StyledComparison>{t`Could not load this number.`}</StyledComparison>
    );
  }

  if (loading && !isDefined(currentValue)) {
    return <Loader />;
  }

  const decimals = operation === 'COUNT' ? 0 : 2;
  const formattedValue = formatNumber(currentValue ?? 0, { decimals });
  const trend = !isDefined(deltaPercentage)
    ? 'flat'
    : deltaPercentage > 0
      ? 'up'
      : deltaPercentage < 0
        ? 'down'
        : 'flat';
  const formattedDelta = isDefined(deltaPercentage)
    ? `${deltaPercentage > 0 ? '+' : ''}${formatNumber(deltaPercentage, { decimals: 1 })}%`
    : undefined;

  return (
    <>
      <StyledValue>{formattedValue}</StyledValue>
      <StyledDelta trend={trend}>
        {trend === 'up' && <IconTrendingUp size={14} />}
        {trend === 'down' && <IconTrendingDown size={14} />}
        {isDefined(formattedDelta) ? (
          <>
            {formattedDelta}
            <StyledComparison>{t`vs previous period`}</StyledComparison>
          </>
        ) : (
          <StyledComparison>{t`No previous period to compare`}</StyledComparison>
        )}
      </StyledDelta>
    </>
  );
};
