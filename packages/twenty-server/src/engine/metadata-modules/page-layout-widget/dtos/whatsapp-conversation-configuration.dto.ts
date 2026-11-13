import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WhatsappConversationConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WhatsappConversationConfiguration')
export class WhatsappConversationConfigurationDTO implements WhatsappConversationConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WHATSAPP_CONVERSATION])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WHATSAPP_CONVERSATION;
}
