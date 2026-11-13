import { type WidgetSizeConfig } from '@/page-layout/types/WidgetSizeConfig';
import { WidgetType } from '~/generated-metadata/graphql';

export const WIDGET_SIZES: Partial<Record<WidgetType, WidgetSizeConfig>> = {
  [WidgetType.IFRAME]: {
    default: { w: 6, h: 6 },
    minimum: { w: 4, h: 5 },
  },
  [WidgetType.STANDALONE_RICH_TEXT]: {
    default: { w: 4, h: 4 },
    minimum: { w: 2, h: 2 },
  },
  [WidgetType.FRONT_COMPONENT]: {
    default: { w: 8, h: 8 },
    minimum: { w: 4, h: 4 },
  },
  [WidgetType.WHATSAPP_CONNECTION]: {
    default: { w: 4, h: 8 },
    minimum: { w: 3, h: 7 },
  },
  [WidgetType.WHATSAPP_CHATS]: {
    default: { w: 6, h: 8 },
    minimum: { w: 4, h: 6 },
  },
  [WidgetType.OBJECT_LIST]: {
    default: { w: 8, h: 8 },
    minimum: { w: 4, h: 5 },
  },
  [WidgetType.KPI_NUMBER]: {
    default: { w: 3, h: 3 },
    minimum: { w: 2, h: 2 },
  },
  [WidgetType.ACTION_BUTTONS]: {
    default: { w: 6, h: 2 },
    minimum: { w: 2, h: 2 },
  },
  [WidgetType.NEXT_ACTIONS]: {
    default: { w: 4, h: 6 },
    minimum: { w: 3, h: 3 },
  },
  [WidgetType.RECORD_TABLE]: {
    default: { w: 6, h: 6 },
    minimum: { w: 4, h: 3 },
  },
};
