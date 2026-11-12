import { Field, ObjectType } from '@nestjs/graphql';

import { IsArray, IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {
  type ObjectListConfiguration,
  type ObjectListDisplayMode,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const OBJECT_LIST_DISPLAY_MODES: ObjectListDisplayMode[] = ['LIST', 'TABLE'];

@ObjectType('ObjectListConfiguration')
export class ObjectListConfigurationDTO implements ObjectListConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.OBJECT_LIST])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.OBJECT_LIST;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  objectMetadataId?: string | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  fieldMetadataIds?: string[] | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(OBJECT_LIST_DISPLAY_MODES)
  displayMode?: ObjectListDisplayMode | null;
}
