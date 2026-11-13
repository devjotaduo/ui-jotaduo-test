import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { type NextActionTask } from '@/page-layout/widgets/next-actions/utils/groupNextActionTasks';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { beautifyExactDate } from '~/utils/date-utils';

const StyledRow = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDueDate = styled.span<{ isOverdue: boolean }>`
  color: ${({ isOverdue }) =>
    isOverdue
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

type NextActionsTaskRowProps = {
  task: NextActionTask;
  isOverdue: boolean;
};

export const NextActionsTaskRow = ({
  task,
  isOverdue,
}: NextActionsTaskRowProps) => {
  const { t } = useLingui();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { completeTask } = useCompleteTask(task as Task);

  return (
    <StyledRow
      onClick={() =>
        openRecordInSidePanel({
          recordId: task.id,
          objectNameSingular: StandardObjectNameSingular.Task,
        })
      }
    >
      <span onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={false}
          shape="round"
          aria-label={t`Mark as done`}
          onCheckedChange={completeTask}
        />
      </span>
      <StyledTitle>
        {isNonEmptyString(task.title) ? task.title : t`Task title`}
      </StyledTitle>
      {isDefined(task.dueAt) && (
        <StyledDueDate isOverdue={isOverdue}>
          {beautifyExactDate(task.dueAt)}
        </StyledDueDate>
      )}
    </StyledRow>
  );
};
