import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type Task } from '@/activities/types/Task';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { NextActionsList } from '@/page-layout/widgets/next-actions/components/NextActionsList';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const MEMBER_TASKS_LIMIT = 100;

type NextActionsForRecordProps = {
  targetRecordIdentifier: TargetRecordIdentifier;
};

const NextActionsForRecord = ({
  targetRecordIdentifier,
}: NextActionsForRecordProps) => {
  const { tasks, tasksLoading } = useTasks({
    targetableObjects: [targetRecordIdentifier],
  });

  return <NextActionsList tasks={tasks} loading={tasksLoading} />;
};

// Outside a record page the list is the member's own to-do
const NextActionsForCurrentMember = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { records: tasks, loading } = useFindManyRecords<Task>({
    objectNameSingular: StandardObjectNameSingular.Task,
    filter: {
      assigneeId: { eq: currentWorkspaceMember?.id },
      status: { in: ['TODO', 'IN_PROGRESS'] },
    },
    recordGqlFields: { id: true, title: true, status: true, dueAt: true },
    limit: MEMBER_TASKS_LIMIT,
    skip: !isDefined(currentWorkspaceMember),
  });

  return <NextActionsList tasks={tasks} loading={loading} />;
};

export const NextActionsWidget = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  return (
    <StyledWidgetScrollContainer>
      {isDefined(targetRecordIdentifier) ? (
        <NextActionsForRecord targetRecordIdentifier={targetRecordIdentifier} />
      ) : (
        <NextActionsForCurrentMember />
      )}
    </StyledWidgetScrollContainer>
  );
};
