import { useSaveWidgetConfiguration } from '@/page-layout/widgets/hooks/useSaveWidgetConfiguration';

export const useSaveObjectListConfiguration = (widgetId: string) => {
  const { saveWidgetConfiguration } = useSaveWidgetConfiguration(widgetId);

  return { saveObjectListConfiguration: saveWidgetConfiguration };
};
