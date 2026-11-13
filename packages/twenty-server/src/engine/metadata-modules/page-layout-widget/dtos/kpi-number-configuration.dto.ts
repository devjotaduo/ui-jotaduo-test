import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {
  type KpiNumberAggregateOperation,
  type KpiNumberConfiguration,
  type KpiNumberPeriod,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const KPI_NUMBER_AGGREGATE_OPERATIONS: KpiNumberAggregateOperation[] = [
  'COUNT',
  'SUM',
  'AVG',
];

const KPI_NUMBER_PERIODS: KpiNumberPeriod[] = [
  'WEEK',
  'MONTH',
  'QUARTER',
  'YEAR',
];

@ObjectType('KpiNumberConfiguration')
export class KpiNumberConfigurationDTO implements KpiNumberConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.KPI_NUMBER])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.KPI_NUMBER;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  objectMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(KPI_NUMBER_AGGREGATE_OPERATIONS)
  kpiOperation?: KpiNumberAggregateOperation | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  kpiFieldMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(KPI_NUMBER_PERIODS)
  period?: KpiNumberPeriod | null;
}
