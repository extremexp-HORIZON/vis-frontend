import { Box, Typography } from '@mui/material';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import CommitIcon from '@mui/icons-material/Commit';
import theme from '../../../../mui-theme';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { setSelectedId, setSelectedTask } from '../../../../store/slices/workflowPageSlice';

import ParametersSection from './ParametersSection';
import MetricsSection from './MetricsSection';
import DatasetsSection from './DatasetsSection';

type Props = { taskId: string; taskName: string };

export default function TaskTreeItem({ taskId, taskName }: Props) {
  const dispatch = useAppDispatch();
  const { experimentId } = useParams();
  const { tab } = useAppSelector((s: RootState) => s.workflowPage);

  const {
    paramsForTask,
    uniqueMetricsByName,
    datasetsForTask,
    taskVariants,
    isInteractiveUnfinished,
    workflowId,
  } = useMemo(() => {
    const params = tab?.workflowConfiguration.params?.filter(p => p.task === taskId) ?? [];
    const metricsAll = tab?.workflowMetrics.data?.filter(m => m.task === taskId && m.name !== 'rating') ?? [];

    const seenNames = new Set<string>();
    const uniqueMetrics = [];
    for (const m of metricsAll) {
      if (!seenNames.has(m.name)) { seenNames.add(m.name); uniqueMetrics.push(m); }
    }

    const datasets = tab?.workflowConfiguration.dataAssets?.filter(d => d.task === taskId) ?? [];

    const variants = (tab?.workflowConfiguration.tasks ?? []).reduce((acc: Record<string,string>, t) => {
      acc[t.name] = t.id; return acc;
    }, {});

    const fullTask = tab?.workflowConfiguration.tasks?.find(t => t.id === taskId);
    const unfinished = fullTask?.tags?.type === 'interactive' && !fullTask?.endTime;

    return {
      paramsForTask: params,
      uniqueMetricsByName: uniqueMetrics,
      datasetsForTask: datasets,
      taskVariants: variants,
      isInteractiveUnfinished: !!unfinished,
      workflowId: tab?.workflowId,
    };
  }, [tab, taskId]);

  return (
    <TreeItem2
      aria-expanded
      itemId={`task-${taskId}`}
      slotProps={{
        content: {
          style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
          onClick: (e) => e.stopPropagation(),
        },
      }}
      label={
        <Box
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setSelectedId(`task-${taskId}`));
            dispatch(setSelectedTask({ role: 'TASK', task: taskName, taskId, variant: taskVariants[taskName] }));
          }}
          sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, flexWrap: 'wrap', minWidth: 0 }}>
            <CommitIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography sx={{ fontWeight: 500, mr: 1, color: isInteractiveUnfinished ? 'orange' : 'inherit' }}>
              {taskName}
            </Typography>
            {taskVariants[taskName] && taskVariants[taskName] !== taskName && (
              <Typography sx={{ fontWeight: 500, color: isInteractiveUnfinished ? 'orange' : theme.palette.primary.main }}>
                [{taskVariants[taskName]}]
              </Typography>
            )}
          </Box>
        </Box>
      }
    >
      <ParametersSection taskId={taskId} paramsForTask={paramsForTask} variantId={taskVariants[taskName]} />
      <MetricsSection taskId={taskId} metrics={uniqueMetricsByName} />
      <DatasetsSection
        taskId={taskId}
        datasets={datasetsForTask}
        experimentId={experimentId}
        workflowId={workflowId}
      />
    </TreeItem2>
  );
}
