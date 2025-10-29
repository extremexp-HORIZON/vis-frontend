import { useMemo } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import TaskTreeItem from './TaskTreeItem';
import NullTaskFallback from './NullTaskFallback';

export default function WorkflowDetailsAccordion() {
  const { tab } = useAppSelector((s: RootState) => s.workflowPage);

  const uniqueTasks = useMemo(() => {
    const tasks = tab?.workflowConfiguration.tasks ?? [];
    const seen = new Set<string>();

    return tasks.reduce((acc: { id: string; name: string }[], task) => {
      if (task.name && !seen.has(task.id)) { seen.add(task.id); acc.push({ id: task.id, name: task.name }); }

      return acc;
    }, []);
  }, [tab?.workflowConfiguration.tasks]);

  const expandedTaskItemIds = useMemo(() => {
    const tasks = tab?.workflowConfiguration.tasks ?? [];

    return tasks
      .filter(task => {
        const hasParams = tab?.workflowConfiguration.params?.some(p => p.task === task.id) ?? false;
        const hasMetrics = tab?.workflowMetrics.data?.some(m => m.task === task.id && m.name !== 'rating') ?? false;

        return hasParams || hasMetrics;
      })
      .map(task => `task-${task.id}`);
  }, [tab?.workflowConfiguration.tasks, tab?.workflowConfiguration.params, tab?.workflowMetrics.data]);

  return (
    <SimpleTreeView
      defaultExpandedItems={expandedTaskItemIds}
      selectedItems={tab?.dataTaskTable?.selectedId ?? null}
    >
      {uniqueTasks.map(({ id, name }) => (
        <TaskTreeItem key={id} taskId={id} taskName={name} />
      ))}

      {uniqueTasks.length === 0 && <NullTaskFallback />}
    </SimpleTreeView>
  );
}
