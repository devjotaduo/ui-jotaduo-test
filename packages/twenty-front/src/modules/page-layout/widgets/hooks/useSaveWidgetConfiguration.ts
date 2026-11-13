import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { useMutation } from '@apollo/client/react';
import { type PageLayoutWidgetConfiguration } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { UpdatePageLayoutWidgetDocument } from '~/generated-metadata/graphql';

export const useSaveWidgetConfiguration = (widgetId: string) => {
  const [updatePageLayoutWidget] = useMutation(UpdatePageLayoutWidgetDocument);
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const saveWidgetConfiguration = async (
    configuration: PageLayoutWidgetConfiguration,
  ) => {
    const response = await updatePageLayoutWidget({
      variables: { id: widgetId, input: { configuration } },
    }).catch(() => null);

    const updatedWidget = response?.data?.updatePageLayoutWidget;

    if (isDefined(updatedWidget)) {
      updateInDraft('pageLayoutWidgets', [
        {
          id: updatedWidget.id,
          configuration,
        } as FlatPageLayoutWidget,
      ]);
      applyChanges();
    }
  };

  return { saveWidgetConfiguration };
};
