import { type Task } from '@/activities/types/Task';
import { endOfDay, startOfDay } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

export type NextActionTask = Pick<Task, 'id' | 'title' | 'status' | 'dueAt'>;

export type NextActionTaskGroups<TTask extends NextActionTask> = {
  overdue: TTask[];
  today: TTask[];
  upcoming: TTask[];
  unscheduled: TTask[];
};

export const groupNextActionTasks = <TTask extends NextActionTask>({
  tasks,
  now,
}: {
  tasks: TTask[];
  now: Date;
}): NextActionTaskGroups<TTask> => {
  const todayStart = startOfDay(now).getTime();
  const todayEnd = endOfDay(now).getTime();

  const groups: NextActionTaskGroups<TTask> = {
    overdue: [],
    today: [],
    upcoming: [],
    unscheduled: [],
  };

  const pendingTasks = tasks
    .filter((task) => task.status !== 'DONE')
    .sort(
      (taskA, taskB) =>
        new Date(taskA.dueAt ?? 0).getTime() -
        new Date(taskB.dueAt ?? 0).getTime(),
    );

  for (const task of pendingTasks) {
    if (!isDefined(task.dueAt)) {
      groups.unscheduled.push(task);
      continue;
    }

    const dueTime = new Date(task.dueAt).getTime();

    if (dueTime < todayStart) {
      groups.overdue.push(task);
    } else if (dueTime <= todayEnd) {
      groups.today.push(task);
    } else {
      groups.upcoming.push(task);
    }
  }

  return groups;
};
