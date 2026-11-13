import {
  groupNextActionTasks,
  type NextActionTask,
} from '@/page-layout/widgets/next-actions/utils/groupNextActionTasks';

const now = new Date(2026, 10, 13, 12);

const task = (overrides: Partial<NextActionTask>): NextActionTask => ({
  id: 'task',
  title: 'Task',
  status: 'TODO',
  dueAt: null,
  ...overrides,
});

describe('groupNextActionTasks', () => {
  it('should split pending tasks by how soon they are due', () => {
    const groups = groupNextActionTasks({
      now,
      tasks: [
        task({ id: 'later', dueAt: new Date(2026, 10, 20).toISOString() }),
        task({
          id: 'tonight',
          dueAt: new Date(2026, 10, 13, 22).toISOString(),
        }),
        task({ id: 'yesterday', dueAt: new Date(2026, 10, 12).toISOString() }),
        task({
          id: 'this-morning',
          dueAt: new Date(2026, 10, 13, 8).toISOString(),
        }),
        task({ id: 'no-date' }),
      ],
    });

    expect(groups.overdue.map(({ id }) => id)).toEqual(['yesterday']);
    expect(groups.today.map(({ id }) => id)).toEqual([
      'this-morning',
      'tonight',
    ]);
    expect(groups.upcoming.map(({ id }) => id)).toEqual(['later']);
    expect(groups.unscheduled.map(({ id }) => id)).toEqual(['no-date']);
  });

  it('should leave done tasks out', () => {
    const groups = groupNextActionTasks({
      now,
      tasks: [
        task({ status: 'DONE', dueAt: new Date(2026, 10, 12).toISOString() }),
        task({ id: 'in-progress', status: 'IN_PROGRESS' }),
      ],
    });

    expect(groups.overdue).toEqual([]);
    expect(groups.unscheduled.map(({ id }) => id)).toEqual(['in-progress']);
  });
});
