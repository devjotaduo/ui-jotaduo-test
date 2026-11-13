import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ActionButtonsWidgetContent } from '@/page-layout/widgets/action-buttons/components/ActionButtonsWidgetContent';

type ActionButtonsWidgetProps = {
  widget: PageLayoutWidget;
};

export const ActionButtonsWidget = ({ widget }: ActionButtonsWidgetProps) => (
  <CommandMenuContextProvider
    displayType="button"
    containerType={CommandMenuItemContainerType.WidgetHeader}
  >
    <ActionButtonsWidgetContent widget={widget} />
  </CommandMenuContextProvider>
);
