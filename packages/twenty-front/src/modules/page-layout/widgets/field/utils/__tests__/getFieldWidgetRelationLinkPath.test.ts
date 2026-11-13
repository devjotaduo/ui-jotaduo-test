import { getFieldWidgetRelationLinkPath } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationLinkPath';

describe('getFieldWidgetRelationLinkPath', () => {
  it('should open the related list filtered on the current record', () => {
    const path = getFieldWidgetRelationLinkPath({
      relationObjectNamePlural: 'taskTargets',
      inverseFieldName: 'opportunity',
      recordId: 'record-1',
    });

    const [pathname, query] = path.split('?');
    const searchParams = new URLSearchParams(query);

    expect(pathname).toBe('/objects/taskTargets');
    expect(
      JSON.parse(searchParams.get('filter[opportunity][IS]') ?? ''),
    ).toEqual({ selectedRecordIds: ['record-1'] });
  });
});
