import { AppMenuItemIcon } from '@/applications/components/AppMenuItemIcon';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useInsertCreatedWidgetAtContext } from '@/page-layout/hooks/useInsertCreatedWidgetAtContext';
import { useCreateRecordPageNoteWidget } from '@/page-layout/hooks/useCreateRecordPageNoteWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultFieldWidget } from '@/page-layout/utils/createDefaultFieldWidget';
import { createDefaultFieldsWidget } from '@/page-layout/utils/createDefaultFieldsWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import { getFieldWidgetDefaultDisplayMode } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { getFrontComponentWidgetTypeSelectItemId } from '@/side-panel/pages/page-layout/utils/getFrontComponentWidgetTypeSelectItemId';
import { resolveWidgetTypeSelectTargetTabId } from '@/side-panel/pages/page-layout/utils/resolveWidgetTypeSelectTargetTabId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  isDefined,
  isFrontComponentAvailableInWidgetPicker,
} from 'twenty-shared/utils';
import {
  IconApps,
  IconBrandWhatsapp,
  IconTable,
  IconNumber,
  IconClick,
  IconListCheck,
  IconCreditCard,
  IconListDetails,
  IconListSearch,
  IconNotes,
} from 'twenty-ui/icon';
import { v4 as uuidv4 } from 'uuid';
import {
  type FrontComponent,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const SidePanelPageLayoutRecordPageWidgetTypeSelect = () => {
  const { t } = useLingui();
  const {
    pageLayoutId,
    targetRecordIdentifier: { targetObjectNameSingular },
  } = usePageLayoutSidePanelTarget();

  const { closeSidePanelMenu } = useSidePanelMenu();
  const { createRecordPageNoteWidget } =
    useCreateRecordPageNoteWidget(pageLayoutId);

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useAtomComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const widgetInsertionContext = useAtomComponentStateValue(
    widgetInsertionContextComponentState,
    pageLayoutId,
  );

  const widgetCreationTargetTabId = useAtomComponentStateValue(
    widgetCreationTargetTabIdComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const { insertCreatedWidgetAtContext } =
    useInsertCreatedWidgetAtContext(pageLayoutId);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const allFieldWidgetFields = useFieldWidgetEligibleFields(
    targetObjectNameSingular,
  );

  const tabId = resolveWidgetTypeSelectTargetTabId({
    pageLayoutEditingWidgetId,
    tabs: pageLayoutDraft.tabs,
    widgetCreationTargetTabId,
  });

  const isReplaceMode =
    isDefined(pageLayoutEditingWidgetId) && !isDefined(widgetInsertionContext);

  const existingWidget = isReplaceMode
    ? pageLayoutDraft.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId)
    : undefined;

  const getExistingWidgetPositionIndex = useCallback(() => {
    if (!isDefined(existingWidget?.position)) {
      return undefined;
    }

    if (isVerticalListPosition(existingWidget.position)) {
      return existingWidget.position.index;
    }

    return undefined;
  }, [existingWidget]);

  const removeExistingWidgetIfReplacing = useCallback(() => {
    if (!isReplaceMode || !isDefined(pageLayoutEditingWidgetId)) {
      return;
    }

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: removeWidgetFromTab(prev.tabs, tabId, pageLayoutEditingWidgetId),
    }));
  }, [
    isReplaceMode,
    pageLayoutDraftState,
    pageLayoutEditingWidgetId,
    store,
    tabId,
  ]);

  const { data: frontComponentsData } = useQuery<{
    frontComponents: FrontComponent[];
  }>(FIND_MANY_FRONT_COMPONENTS);

  const frontComponents = (frontComponentsData?.frontComponents ?? []).filter(
    (frontComponent) =>
      isFrontComponentAvailableInWidgetPicker({
        frontComponent,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: objectMetadataItem.id,
      }),
  );

  const frontComponentsWithSelectItemId = frontComponents.map(
    (frontComponent) => ({
      frontComponent,
      selectItemId: getFrontComponentWidgetTypeSelectItemId(frontComponent.id),
    }),
  );

  const handleCreateFieldsWidget = useCallback(() => {
    const replacePositionIndex = getExistingWidgetPositionIndex();

    const viewId = uuidv4();

    removeExistingWidgetIfReplacing();

    const updatedPageLayout = store.get(pageLayoutDraftState);
    const activeTab = updatedPageLayout.tabs.find((tab) => tab.id === tabId);
    const positionIndex =
      replacePositionIndex ?? activeTab?.widgets.length ?? 0;
    const widgetId = uuidv4();

    const newWidget = createDefaultFieldsWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      viewId,
      objectMetadataId: objectMetadataItem.id,
      positionIndex,
    });

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));

    setPageLayoutEditingWidgetId(widgetId);
    insertCreatedWidgetAtContext({ newWidgetId: widgetId });

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.RecordPageFieldsSettings,
      focusTitleInput: true,
      resetNavigationStack: true,
    });
  }, [
    getExistingWidgetPositionIndex,
    insertCreatedWidgetAtContext,
    navigatePageLayoutSidePanel,
    objectMetadataItem.id,
    pageLayoutDraftState,
    removeExistingWidgetIfReplacing,
    setPageLayoutEditingWidgetId,
    store,
    tabId,
  ]);

  const handleCreateFieldWidget = useCallback(() => {
    const replacePositionIndex = getExistingWidgetPositionIndex();
    removeExistingWidgetIfReplacing();

    const updatedPageLayout = store.get(pageLayoutDraftState);
    const activeTab = updatedPageLayout.tabs.find((tab) => tab.id === tabId);
    const existingWidgets = activeTab?.widgets ?? [];
    const positionIndex = replacePositionIndex ?? existingWidgets.length;
    const widgetId = uuidv4();

    const usedFieldMetadataIds = new Set(
      existingWidgets
        .filter(
          (widget) =>
            widget.configuration.configurationType ===
            WidgetConfigurationType.FIELD,
        )
        .map((widget) => {
          const configuration = widget.configuration as {
            fieldMetadataId: string;
          };
          return configuration.fieldMetadataId;
        }),
    );

    const unusedField = allFieldWidgetFields.find(
      (field) => !usedFieldMetadataIds.has(field.id),
    );

    const selectedField = unusedField ?? allFieldWidgetFields[0];

    const fieldMetadataId = selectedField?.id ?? '';
    const title = selectedField?.label ?? '';

    const newWidget = createDefaultFieldWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      title,
      fieldMetadataId,
      fieldDisplayMode: isDefined(selectedField)
        ? getFieldWidgetDefaultDisplayMode(selectedField.type)
        : undefined,
      objectMetadataId: objectMetadataItem.id,
      positionIndex,
    });

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));

    setPageLayoutEditingWidgetId(widgetId);
    insertCreatedWidgetAtContext({ newWidgetId: widgetId });

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.RecordPageFieldSettings,
      focusTitleInput: true,
      resetNavigationStack: true,
    });
  }, [
    allFieldWidgetFields,
    getExistingWidgetPositionIndex,
    insertCreatedWidgetAtContext,
    navigatePageLayoutSidePanel,
    objectMetadataItem.id,
    pageLayoutDraftState,
    removeExistingWidgetIfReplacing,
    setPageLayoutEditingWidgetId,
    store,
    tabId,
  ]);

  const handleCreateNoteWidget = () => {
    const replacePositionIndex = getExistingWidgetPositionIndex();
    removeExistingWidgetIfReplacing();

    const newWidget = createRecordPageNoteWidget({
      tabId,
      positionIndex: replacePositionIndex,
    });

    insertCreatedWidgetAtContext({ newWidgetId: newWidget.id });
  };

  const insertSimpleRecordPageWidget = useCallback(
    ({
      title,
      type,
      configuration,
    }: Pick<PageLayoutWidget, 'title' | 'type' | 'configuration'>) => {
      const replacePositionIndex = getExistingWidgetPositionIndex();
      removeExistingWidgetIfReplacing();

      const updatedPageLayout = store.get(pageLayoutDraftState);
      const activeTab = updatedPageLayout.tabs.find((tab) => tab.id === tabId);
      const positionIndex =
        replacePositionIndex ?? activeTab?.widgets.length ?? 0;
      const widgetId = uuidv4();

      const newWidget: PageLayoutWidget = {
        __typename: 'PageLayoutWidget',
        id: widgetId,
        applicationId: '',
        universalIdentifier: widgetId,
        isSystemSideEffect: false,
        isActive: true,
        pageLayoutTabId: tabId,
        title,
        type,
        configuration,
        position: {
          __typename: 'PageLayoutWidgetVerticalListPosition',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: positionIndex,
        },
        objectMetadataId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
      }));

      setPageLayoutEditingWidgetId(widgetId);
      insertCreatedWidgetAtContext({ newWidgetId: widgetId });

      closeSidePanelMenu();
    },
    [
      closeSidePanelMenu,
      getExistingWidgetPositionIndex,
      insertCreatedWidgetAtContext,
      pageLayoutDraftState,
      removeExistingWidgetIfReplacing,
      setPageLayoutEditingWidgetId,
      store,
      tabId,
    ],
  );

  const handleCreateFrontComponentWidget = (frontComponent: FrontComponent) =>
    insertSimpleRecordPageWidget({
      title: frontComponent.name,
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        __typename: 'FrontComponentConfiguration',
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: frontComponent.id,
      },
    });

  const handleCreateObjectListWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`Records`,
      type: WidgetType.OBJECT_LIST,
      configuration: {
        __typename: 'ObjectListConfiguration',
        configurationType: WidgetConfigurationType.OBJECT_LIST,
      },
    });

  const handleCreateKpiNumberWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`Number`,
      type: WidgetType.KPI_NUMBER,
      configuration: {
        __typename: 'KpiNumberConfiguration',
        configurationType: WidgetConfigurationType.KPI_NUMBER,
      },
    });

  const handleCreateActionButtonsWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`Actions`,
      type: WidgetType.ACTION_BUTTONS,
      configuration: {
        __typename: 'ActionButtonsConfiguration',
        configurationType: WidgetConfigurationType.ACTION_BUTTONS,
      },
    });

  const handleCreateNextActionsWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`Next actions`,
      type: WidgetType.NEXT_ACTIONS,
      configuration: {
        __typename: 'NextActionsConfiguration',
        configurationType: WidgetConfigurationType.NEXT_ACTIONS,
      },
    });

  const handleCreateWhatsappChatsWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`WhatsApp chats`,
      type: WidgetType.WHATSAPP_CHATS,
      configuration: {
        __typename: 'WhatsappChatsConfiguration',
        configurationType: WidgetConfigurationType.WHATSAPP_CHATS,
      },
    });

  const handleCreatePixChargeWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`Pix charge`,
      type: WidgetType.PIX_CHARGE,
      configuration: {
        __typename: 'PixChargeConfiguration',
        configurationType: WidgetConfigurationType.PIX_CHARGE,
      },
    });

  const handleCreateWhatsappConversationWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`WhatsApp conversation`,
      type: WidgetType.WHATSAPP_CONVERSATION,
      configuration: {
        __typename: 'WhatsappConversationConfiguration',
        configurationType: WidgetConfigurationType.WHATSAPP_CONVERSATION,
      },
    });

  const handleCreateWhatsappConnectionWidget = () =>
    insertSimpleRecordPageWidget({
      title: t`WhatsApp connection`,
      type: WidgetType.WHATSAPP_CONNECTION,
      configuration: {
        __typename: 'WhatsappConnectionConfiguration',
        configurationType: WidgetConfigurationType.WHATSAPP_CONNECTION,
      },
    });

  const selectableItemIds = [
    'fields',
    'field',
    'note',
    'whatsapp-connection',
    'whatsapp-conversation',
    'pix-charge',
    'whatsapp-chats',
    'object-list',
    'kpi-number',
    'action-buttons',
    'next-actions',
    ...frontComponentsWithSelectItemId.map(({ selectItemId }) => selectItemId),
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Standard widgets`}>
        <SelectableListItem itemId="fields" onEnter={handleCreateFieldsWidget}>
          <CommandMenuItem
            Icon={IconListDetails}
            label={t`Fields group`}
            id="fields"
            onClick={handleCreateFieldsWidget}
          />
        </SelectableListItem>
        <SelectableListItem itemId="field" onEnter={handleCreateFieldWidget}>
          <CommandMenuItem
            Icon={IconListSearch}
            label={t`Field`}
            id="field"
            onClick={handleCreateFieldWidget}
          />
        </SelectableListItem>
        <SelectableListItem itemId="note" onEnter={handleCreateNoteWidget}>
          <CommandMenuItem
            Icon={IconNotes}
            label={t`Note`}
            description={t`Static text shared across all record pages`}
            id="note"
            onClick={handleCreateNoteWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="whatsapp-connection"
          onEnter={handleCreateWhatsappConnectionWidget}
        >
          <CommandMenuItem
            Icon={IconBrandWhatsapp}
            label={t`WhatsApp connection`}
            description={t`QR code or pairing code to link a number`}
            id="whatsapp-connection"
            onClick={handleCreateWhatsappConnectionWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="whatsapp-conversation"
          onEnter={handleCreateWhatsappConversationWidget}
        >
          <CommandMenuItem
            Icon={IconBrandWhatsapp}
            label={t`WhatsApp conversation`}
            description={t`Messages with this record's phone number`}
            id="whatsapp-conversation"
            onClick={handleCreateWhatsappConversationWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="pix-charge"
          onEnter={handleCreatePixChargeWidget}
        >
          <CommandMenuItem
            Icon={IconCreditCard}
            label={t`Pix charge`}
            description={t`Pix QR code for this record's amount`}
            id="pix-charge"
            onClick={handleCreatePixChargeWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="whatsapp-chats"
          onEnter={handleCreateWhatsappChatsWidget}
        >
          <CommandMenuItem
            Icon={IconBrandWhatsapp}
            label={t`WhatsApp chats`}
            description={t`Latest conversations of the linked number`}
            id="whatsapp-chats"
            onClick={handleCreateWhatsappChatsWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="object-list"
          onEnter={handleCreateObjectListWidget}
        >
          <CommandMenuItem
            Icon={IconTable}
            label={t`Records list`}
            description={t`Records of any object as a list or a table`}
            id="object-list"
            onClick={handleCreateObjectListWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="kpi-number"
          onEnter={handleCreateKpiNumberWidget}
        >
          <CommandMenuItem
            Icon={IconNumber}
            label={t`Key number`}
            description={t`A count, sum or average compared with the previous period`}
            id="kpi-number"
            onClick={handleCreateKpiNumberWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="action-buttons"
          onEnter={handleCreateActionButtonsWidget}
        >
          <CommandMenuItem
            Icon={IconClick}
            label={t`Action buttons`}
            description={t`Buttons that run a workflow or a command`}
            id="action-buttons"
            onClick={handleCreateActionButtonsWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="next-actions"
          onEnter={handleCreateNextActionsWidget}
        >
          <CommandMenuItem
            Icon={IconListCheck}
            label={t`Next actions`}
            description={t`Overdue, due today and upcoming tasks`}
            id="next-actions"
            onClick={handleCreateNextActionsWidget}
          />
        </SelectableListItem>
      </SidePanelGroup>

      {frontComponentsWithSelectItemId.length > 0 && (
        <SidePanelGroup heading={t`Front Components`}>
          {frontComponentsWithSelectItemId.map(
            ({ frontComponent, selectItemId }) => (
              <SelectableListItem
                key={frontComponent.id}
                itemId={selectItemId}
                onEnter={() => handleCreateFrontComponentWidget(frontComponent)}
              >
                <CommandMenuItem
                  LeftComponent={
                    <AppMenuItemIcon
                      Icon={IconApps}
                      applicationId={frontComponent.applicationId}
                    />
                  }
                  label={frontComponent.name}
                  id={selectItemId}
                  onClick={() =>
                    handleCreateFrontComponentWidget(frontComponent)
                  }
                />
              </SelectableListItem>
            ),
          )}
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
