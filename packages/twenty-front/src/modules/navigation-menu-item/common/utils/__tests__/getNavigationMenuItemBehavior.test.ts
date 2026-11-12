import { getNavigationMenuItemBehavior } from '@/navigation-menu-item/common/utils/getNavigationMenuItemBehavior';
import { NavigationMenuItemType } from 'twenty-shared/types';

describe('getNavigationMenuItemBehavior', () => {
  it('should make a pinned record behave like a page of its own', () => {
    expect(
      getNavigationMenuItemBehavior({ type: NavigationMenuItemType.RECORD }),
    ).toEqual({
      opensAsStandalonePage: true,
      showsObjectLabel: false,
      canQuickUnpin: false,
    });
  });

  it('should keep the default behavior for other items', () => {
    for (const type of [
      NavigationMenuItemType.VIEW,
      NavigationMenuItemType.OBJECT,
      NavigationMenuItemType.FOLDER,
      NavigationMenuItemType.LINK,
    ]) {
      expect(getNavigationMenuItemBehavior({ type })).toEqual({
        opensAsStandalonePage: false,
        showsObjectLabel: true,
        canQuickUnpin: true,
      });
    }
  });
});
