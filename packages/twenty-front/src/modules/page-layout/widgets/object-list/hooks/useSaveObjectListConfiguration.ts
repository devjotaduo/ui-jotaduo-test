import { useSaveWidgetConfiguration } from '@/page-layout/widgets/hooks/useSaveWidgetConfiguration';
import { type ObjectListConfiguration } from 'twenty-shared/types';

export const useSaveObjectListConfiguration = (widgetId: string) => {
  const { saveWidgetConfiguration } = useSaveWidgetConfiguration(widgetId);

  const saveObjectListConfiguration = (
    configuration: ObjectListConfiguration,
    title?: string,
  ) => saveWidgetConfiguration(configuration, title);

  return { saveObjectListConfiguration };
};
