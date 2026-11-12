import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

// The index page reads filter[<field>][<operand>] from the URL, so the link opens the list already narrowed to this record
export const getFieldWidgetRelationLinkPath = ({
  relationObjectNamePlural,
  inverseFieldName,
  recordId,
}: {
  relationObjectNamePlural: string;
  inverseFieldName: string;
  recordId: string;
}) => {
  const searchParams = new URLSearchParams();

  searchParams.set(
    `filter[${inverseFieldName}][${ViewFilterOperand.IS}]`,
    JSON.stringify({ selectedRecordIds: [recordId] }),
  );

  return `${getAppPath(AppPath.RecordIndexPage, {
    objectNamePlural: relationObjectNamePlural,
  })}?${searchParams.toString()}`;
};
