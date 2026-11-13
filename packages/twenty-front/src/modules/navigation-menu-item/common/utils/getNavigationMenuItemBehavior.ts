import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemBehavior = {
  // Opens on AppPath.RecordStandaloneShowPage instead of the record page inside its list
  opensAsStandalonePage: boolean;
  // Shows the object name (e.g. " · Person") next to the label outside edit mode
  showsObjectLabel: boolean;
  // Shows the one-click "Remove from favorites" button
  canQuickUnpin: boolean;
};

// Single place deciding how a navigation menu item behaves in the drawer
export const getNavigationMenuItemBehavior = (
  item: Pick<NavigationMenuItem, 'type'>,
): NavigationMenuItemBehavior => {
  const isPinnedRecord = item.type === NavigationMenuItemType.RECORD;

  return {
    opensAsStandalonePage: isPinnedRecord,
    showsObjectLabel: !isPinnedRecord,
    canQuickUnpin: !isPinnedRecord,
  };
};
