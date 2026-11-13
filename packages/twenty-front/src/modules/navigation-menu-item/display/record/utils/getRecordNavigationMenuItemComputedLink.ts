import { getNavigationMenuItemBehavior } from '@/navigation-menu-item/common/utils/getNavigationMenuItemBehavior';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getRecordNavigationMenuItemComputedLink = (
  item: Pick<
    NavigationMenuItem,
    'targetObjectMetadataId' | 'targetRecordIdentifier'
  >,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (
    !isDefined(objectMetadataItem) ||
    !isDefined(item.targetRecordIdentifier)
  ) {
    return '';
  }
  const objectRecordIdentifier = recordIdentifierToObjectRecordIdentifier({
    recordIdentifier: item.targetRecordIdentifier,
    objectMetadataItem,
  });

  const linkToShowPage = objectRecordIdentifier.linkToShowPage ?? '';

  // Records without a show page (e.g. workspace members) stay without a link
  if (
    !isNonEmptyString(linkToShowPage) ||
    !getNavigationMenuItemBehavior({ type: NavigationMenuItemType.RECORD })
      .opensAsStandalonePage
  ) {
    return linkToShowPage;
  }

  return getAppPath(AppPath.RecordStandaloneShowPage, {
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: item.targetRecordIdentifier.id,
  });
};
