import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type PixChargeConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('PixChargeConfiguration')
export class PixChargeConfigurationDTO implements PixChargeConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.PIX_CHARGE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.PIX_CHARGE;
}
