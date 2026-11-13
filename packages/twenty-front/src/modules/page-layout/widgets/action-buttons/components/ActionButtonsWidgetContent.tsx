import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useSaveWidgetConfiguration } from '@/page-layout/widgets/hooks/useSaveWidgetConfiguration';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { type ActionButtonsConfiguration } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown, IconSettings } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledEmpty = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type ActionButtonsWidgetContentProps = {
  widget: PageLayoutWidget;
};

export const ActionButtonsWidgetContent = ({
  widget,
}: ActionButtonsWidgetContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const canEditLayout = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const { saveWidgetConfiguration } = useSaveWidgetConfiguration(widget.id);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    () =>
      (widget.configuration as Partial<ActionButtonsConfiguration>)
        .commandMenuItemIds ?? [],
  );

  const selectableItems = commandMenuItems
    .map((item) => ({
      item,
      ...interpolateCommandMenuItemFields(item, commandMenuContextApi),
    }))
    .sort((itemA, itemB) => itemA.label.localeCompare(itemB.label));

  // A command that does not apply to this page or record is left out
  const selectedItems = selectedIds.flatMap((selectedId) => {
    const selectedItem = commandMenuItems.find(({ id }) => id === selectedId);

    return isDefined(selectedItem) ? [selectedItem] : [];
  });

  const toggleItem = (itemId: string) => {
    const nextSelectedIds = selectedIds.includes(itemId)
      ? selectedIds.filter((selectedId) => selectedId !== itemId)
      : [...selectedIds, itemId];

    setSelectedIds(nextSelectedIds);
    saveWidgetConfiguration({
      configurationType: 'ACTION_BUTTONS',
      commandMenuItemIds: nextSelectedIds,
    });
  };

  return (
    <StyledContainer>
      {selectedItems.map((item) => (
        <CommandMenuItemRenderer key={item.id} item={item} />
      ))}

      {selectedItems.length === 0 && (
        <StyledEmpty>
          {canEditLayout
            ? t`Pick the actions to show here.`
            : t`No action available.`}
        </StyledEmpty>
      )}

      {canEditLayout && (
        <Dropdown.Root type="menu" multiple>
          <Dropdown.Trigger
            render={
              <Button
                variant="outline"
                size="sm"
                startIcon={<IconSettings />}
                endIcon={<IconChevronDown />}
              />
            }
          >
            {t`Actions`}
          </Dropdown.Trigger>
          <Dropdown.Content aria-label={t`Actions`} align="start">
            <Dropdown.Section scrollable>
              {selectableItems.map(({ item, label, iconKey }) => {
                const ItemIcon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

                return (
                  <Dropdown.OptionItem
                    key={item.id}
                    selected={selectedIds.includes(item.id)}
                    startIcon={<ItemIcon />}
                    onSelect={() => toggleItem(item.id)}
                  >
                    {label}
                  </Dropdown.OptionItem>
                );
              })}
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Root>
      )}
    </StyledContainer>
  );
};
