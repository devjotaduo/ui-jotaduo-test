import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type NextActionsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('NextActionsConfiguration')
export class NextActionsConfigurationDTO implements NextActionsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.NEXT_ACTIONS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.NEXT_ACTIONS;
}
