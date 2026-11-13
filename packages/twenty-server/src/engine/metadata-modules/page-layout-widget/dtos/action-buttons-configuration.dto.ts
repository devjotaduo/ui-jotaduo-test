import { Field, ObjectType } from '@nestjs/graphql';

import { IsArray, IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { type ActionButtonsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('ActionButtonsConfiguration')
export class ActionButtonsConfigurationDTO implements ActionButtonsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.ACTION_BUTTONS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.ACTION_BUTTONS;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  commandMenuItemIds?: string[] | null;
}
