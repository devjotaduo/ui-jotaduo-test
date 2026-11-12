import { matchRecordShowPagePathname } from '@/object-record/record-show/utils/matchRecordShowPagePathname';

describe('matchRecordShowPagePathname', () => {
  it('should match the record page inside its list', () => {
    expect(matchRecordShowPagePathname('/object/person/record-1')).toEqual({
      objectNameSingular: 'person',
      objectRecordId: 'record-1',
      isStandalone: false,
    });
  });

  it('should match the standalone record page', () => {
    expect(matchRecordShowPagePathname('/page/record/person/record-1')).toEqual(
      {
        objectNameSingular: 'person',
        objectRecordId: 'record-1',
        isStandalone: true,
      },
    );
  });

  it('should not match other pages', () => {
    expect(matchRecordShowPagePathname('/objects/people')).toBeNull();
    expect(matchRecordShowPagePathname('/page/page-layout-1')).toBeNull();
  });
});
