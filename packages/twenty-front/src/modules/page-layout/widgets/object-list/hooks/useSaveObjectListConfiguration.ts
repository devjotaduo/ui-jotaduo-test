import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { type ObjectListConfiguration } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { UpdatePageLayoutWidgetDocument } from '~/generated-metadata/graphql';

type LayoutWithWidgets = { tabs: { widgets: PageLayoutWidget[] }[] };

const updateWidgetInLayout = <TLayout extends LayoutWithWidgets>(
  layout: TLayout,
  widgetId: string,
  updates: Partial<PageLayoutWidget>,
): TLayout => ({
  ...layout,
  tabs: layout.tabs.map((tab) => ({
    ...tab,
    widgets: tab.widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, ...updates } : widget,
    ),
  })),
});

export const useSaveObjectListConfiguration = (widgetId: string) => {
  const [updatePageLayoutWidget] = useMutation(UpdatePageLayoutWidgetDocument);
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const store = useStore();

  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );
  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const pageLayoutPersistedState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const saveObjectListConfiguration = async (
    configuration: ObjectListConfiguration,
    title?: string,
  ) => {
    const response = await updatePageLayoutWidget({
      variables: {
        id: widgetId,
        input: { configuration, ...(isDefined(title) ? { title } : {}) },
      },
    }).catch(() => null);

    const updatedWidget = response?.data?.updatePageLayoutWidget;

    if (!isDefined(updatedWidget)) {
      return;
    }

    const updates = {
      configuration,
      ...(isDefined(title) ? { title } : {}),
    } as Partial<PageLayoutWidget>;

    // The rendered layout lives in these copies; updating both keeps edit mode from seeing an unsaved change
    store.set(pageLayoutDraftState, (layout) =>
      updateWidgetInLayout(layout, widgetId, updates),
    );
    store.set(pageLayoutPersistedState, (layout) =>
      isDefined(layout)
        ? updateWidgetInLayout(layout, widgetId, updates)
        : layout,
    );

    updateInDraft('pageLayoutWidgets', [
      { id: updatedWidget.id, ...updates } as FlatPageLayoutWidget,
    ]);
    applyChanges();
  };

  return { saveObjectListConfiguration };
};
