import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type RecordShowPagePathMatch = {
  objectNameSingular: string;
  objectRecordId: string;
  isStandalone: boolean;
};

// Both routes render a record page; only the standalone one is detached from the object's list
export const matchRecordShowPagePathname = (
  pathname: string,
): RecordShowPagePathMatch | null => {
  for (const [path, isStandalone] of [
    [AppPath.RecordShowPage, false],
    [AppPath.RecordStandaloneShowPage, true],
  ] as const) {
    const match = matchPath(path, pathname);

    if (
      isDefined(match?.params.objectNameSingular) &&
      isDefined(match.params.objectRecordId)
    ) {
      return {
        objectNameSingular: match.params.objectNameSingular,
        objectRecordId: match.params.objectRecordId,
        isStandalone,
      };
    }
  }

  return null;
};
