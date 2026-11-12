import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WhatsappChatsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WhatsappChatsConfiguration')
export class WhatsappChatsConfigurationDTO implements WhatsappChatsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WHATSAPP_CHATS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WHATSAPP_CHATS;
}
