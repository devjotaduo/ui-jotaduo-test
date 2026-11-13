import { NextActionsTaskRow } from '@/page-layout/widgets/next-actions/components/NextActionsTaskRow';
import {
  groupNextActionTasks,
  type NextActionTask,
} from '@/page-layout/widgets/next-actions/utils/groupNextActionTasks';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Loader } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledGroupTitle = styled.div<{ isOverdue: boolean }>`
  color: ${({ isOverdue }) =>
    isOverdue
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type NextActionsListProps = {
  tasks: NextActionTask[];
  loading: boolean;
};

export const NextActionsList = ({ tasks, loading }: NextActionsListProps) => {
  const { t } = useLingui();

  const { overdue, today, upcoming, unscheduled } = groupNextActionTasks({
    tasks,
    now: new Date(),
  });

  const groups = [
    { key: 'overdue', title: t`Overdue`, tasks: overdue },
    { key: 'today', title: t`Today`, tasks: today },
    { key: 'upcoming', title: t`Upcoming`, tasks: upcoming },
    { key: 'unscheduled', title: t`No due date`, tasks: unscheduled },
  ].filter((group) => group.tasks.length > 0);

  if (loading && tasks.length === 0) {
    return <Loader />;
  }

  if (groups.length === 0) {
    return <StyledEmpty>{t`Nothing pending.`}</StyledEmpty>;
  }

  return (
    <StyledContainer>
      {groups.map((group) => (
        <div key={group.key}>
          <StyledGroupTitle isOverdue={group.key === 'overdue'}>
            {group.title} · {group.tasks.length}
          </StyledGroupTitle>
          {group.tasks.map((task) => (
            <NextActionsTaskRow
              key={task.id}
              task={task}
              isOverdue={group.key === 'overdue'}
            />
          ))}
        </div>
      ))}
    </StyledContainer>
  );
};
