import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isPlainObject } from 'twenty-shared/utils';
import { FieldDisplayMode, WidgetType } from '~/generated-metadata/graphql';

const SELF_TITLED_DISPLAY_MODES: string[] = [
  FieldDisplayMode.ROW,
  FieldDisplayMode.LINK,
];

// Row and Link cards carry the field name themselves, so the widget title would repeat it
export const isFieldWidgetWithOwnTitle = (
  widget: Pick<PageLayoutWidget, 'type' | 'configuration'>,
) =>
  widget.type === WidgetType.FIELD &&
  isPlainObject(widget.configuration) &&
  'fieldDisplayMode' in widget.configuration &&
  SELF_TITLED_DISPLAY_MODES.includes(
    String(widget.configuration.fieldDisplayMode),
  );
