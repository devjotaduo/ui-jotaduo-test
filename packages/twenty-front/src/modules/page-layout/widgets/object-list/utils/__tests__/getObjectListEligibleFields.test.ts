import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectListEligibleFields } from '@/page-layout/widgets/object-list/utils/getObjectListEligibleFields';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const field = (overrides: Partial<FieldMetadataItem>) =>
  ({
    id: overrides.name,
    isActive: true,
    isSystem: false,
    type: FieldMetadataType.TEXT,
    ...overrides,
  }) as FieldMetadataItem;

describe('getObjectListEligibleFields', () => {
  it('should keep plain fields and many-to-one relations only', () => {
    const fields = [
      field({ name: 'name' }),
      field({ name: 'position', isSystem: true }),
      field({ name: 'body', type: FieldMetadataType.RICH_TEXT }),
      field({
        name: 'company',
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.MANY_TO_ONE },
      }),
      field({
        name: 'people',
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.ONE_TO_MANY },
      }),
      field({ name: 'archived', isActive: false }),
    ];

    expect(getObjectListEligibleFields(fields).map(({ name }) => name)).toEqual(
      ['name', 'company'],
    );
  });
});
