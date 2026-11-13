import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getKpiNumberRecordScopeFilter } from '@/page-layout/widgets/kpi-number/utils/getKpiNumberRecordScopeFilter';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const fields = [
  { name: 'name', isActive: true, type: FieldMetadataType.TEXT },
  {
    name: 'company',
    isActive: true,
    type: FieldMetadataType.RELATION,
    relation: {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadata: { nameSingular: 'company' },
    },
  },
] as FieldMetadataItem[];

describe('getKpiNumberRecordScopeFilter', () => {
  it('should filter on the relation that points to the page record', () => {
    expect(
      getKpiNumberRecordScopeFilter({
        fields,
        targetRecordIdentifier: {
          id: 'company-1',
          targetObjectNameSingular: 'company',
        },
      }),
    ).toEqual({ companyId: { eq: 'company-1' } });
  });

  it('should not filter outside a record page or without a relation', () => {
    expect(
      getKpiNumberRecordScopeFilter({
        fields,
        targetRecordIdentifier: undefined,
      }),
    ).toBeUndefined();
    expect(
      getKpiNumberRecordScopeFilter({
        fields,
        targetRecordIdentifier: {
          id: 'person-1',
          targetObjectNameSingular: 'person',
        },
      }),
    ).toBeUndefined();
  });
});
