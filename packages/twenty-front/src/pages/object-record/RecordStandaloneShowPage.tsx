import { Navigate, useParams } from 'react-router-dom';
import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';
import {
  type RecordShowPageParameters,
  RecordShowPageContent,
} from '~/pages/object-record/RecordShowPageContent';

// A record page of its own: the title replaces the path back to the object's list
export const RecordStandaloneShowPage = () => {
  const parameters = useParams<RecordShowPageParameters>();

  const hasDedicatedShowPage =
    parameters.objectNameSingular ===
      StandardObjectNameSingular.AgentChatThread ||
    isDefined(findCoreObjectShowPage(parameters.objectNameSingular));

  // Chats, workflows and other core objects keep their own pages
  if (
    hasDedicatedShowPage &&
    isDefined(parameters.objectNameSingular) &&
    isDefined(parameters.objectRecordId)
  ) {
    return (
      <Navigate
        replace
        to={getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: parameters.objectNameSingular,
          objectRecordId: parameters.objectRecordId,
        })}
      />
    );
  }

  return (
    <RecordShowPageContent
      parameters={parameters}
      headerTitleMode="record-title"
    />
  );
};
