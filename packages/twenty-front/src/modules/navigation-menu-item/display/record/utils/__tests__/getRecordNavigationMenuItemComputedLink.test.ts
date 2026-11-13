import { getRecordNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/record/utils/getRecordNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const objectMetadataItems = [
  {
    id: 'obj-person',
    nameSingular: 'person',
    namePlural: 'people',
    fields: [],
  },
] as unknown as EnrichedObjectMetadataItem[];

describe('getRecordNavigationMenuItemComputedLink', () => {
  it('should open a pinned record as a standalone page', () => {
    expect(
      getRecordNavigationMenuItemComputedLink(
        {
          targetObjectMetadataId: 'obj-person',
          targetRecordIdentifier: {
            id: 'record-1',
            labelIdentifier: 'Kimberly Gordon',
          },
        },
        objectMetadataItems,
      ),
    ).toBe('/page/record/person/record-1');
  });

  it('should return an empty link when the object is unknown', () => {
    expect(
      getRecordNavigationMenuItemComputedLink(
        {
          targetObjectMetadataId: 'unknown',
          targetRecordIdentifier: {
            id: 'record-1',
            labelIdentifier: 'Kimberly Gordon',
          },
        },
        objectMetadataItems,
      ),
    ).toBe('');
  });
});
