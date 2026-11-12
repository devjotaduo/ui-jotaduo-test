import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WhatsappConnectionConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WhatsappConnectionConfiguration')
export class WhatsappConnectionConfigurationDTO implements WhatsappConnectionConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WHATSAPP_CONNECTION])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WHATSAPP_CONNECTION;
}
