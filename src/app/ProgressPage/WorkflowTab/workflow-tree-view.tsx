import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  setSelectedId,
  setSelectedTask,
} from '../../../store/slices/workflowPageSlice';

import { setSelectedItem } from '../../../store/slices/workflowPageSlice';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import BarChartIcon from '@mui/icons-material/BarChart';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CommitIcon from '@mui/icons-material/Commit';
import theme from '../../../mui-theme';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import InsightsIcon from '@mui/icons-material/Insights';
import { useParams } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';

export default function WorkflowTreeView() {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage);
  const dispatch = useAppDispatch();
  const [workflowExpanded, setWorkflowExpanded] = useState(true);
  const [modelExpanded, setModelExpanded] = useState(true);
  const workflowId = tab?.workflowId;
  const { experimentId } = useParams();

  function getDatasetIcon(format: string | null | undefined) {
    if (!format || format.trim() === '') return;

    switch (format.toLowerCase()) {
      case 'csv':
      case 'xls':
      case 'xlsx':
        return (
          <TableChartRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        );

      case 'json':
      case 'yaml':
        return (
          <DataObjectRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'image':
        return (
          <ImageRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        );

      default:
        return (
          <InsertDriveFileRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        );
    }
  }

  const uniqueTasks = useMemo(() => {
    if (!tab?.workflowConfiguration.tasks) return [];

    const seen = new Set<string>();

    return tab.workflowConfiguration.tasks.reduce(
      (acc: { id: string; name: string }[], task) => {
        if (task.name && !seen.has(task.id)) {
          seen.add(task.id);
          acc.push({ id: task.id, name: task.name });
        }

        return acc;
      },
      [],
    );
  }, [tab?.workflowConfiguration.tasks]);

  const expandedTaskItemIds = useMemo(() => {
    if (!tab?.workflowConfiguration.tasks) return [];

    return tab.workflowConfiguration.tasks
      .filter(task => {
        const hasParams =
          tab?.workflowConfiguration.params?.some(p => p.task === task.id) ??
          false;
        const hasMetrics =
          tab?.workflowMetrics.data?.some(
            m => m.task === task.id && m.name !== 'rating',
          ) ?? false;

        return hasParams || hasMetrics;
      })
      .map(task => `task-${task.id}`);
  }, [
    tab?.workflowConfiguration.tasks,
    tab?.workflowConfiguration.params,
    tab?.workflowMetrics.data,
  ]);

  if (!tab?.workflowConfiguration) return null;

  return (
    <Box sx={{ overflow: 'auto' }}>
      {/* Enhanced Title and Separator */}
      <Accordion
        expanded={workflowExpanded}
        disableGutters
        sx={{
          boxShadow: 'none',
          '&::before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary
          onClick={(e) => e.stopPropagation()}
          sx={{ borderBottom: '1px solid #ccc', pointerEvents: 'none' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              width: '100%',
              pointerEvents: 'auto',
              cursor: 'default',
            }}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'default',
              }}
            >
              <AccountTreeIcon color="primary" />
              <Typography fontWeight={600}>Workflow Details</Typography>
            </Box>

            {/* Right-side icon */}
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setWorkflowExpanded((prev) => !prev);
              }}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <ExpandMoreIcon />
            </Box>
          </Box>
        </AccordionSummary>

        {/* TreeView with adjusted padding */}
        <AccordionDetails>
          <SimpleTreeView defaultExpandedItems={expandedTaskItemIds} selectedItems={ tab.dataTaskTable.selectedId ? tab.dataTaskTable.selectedId : null}>
            {uniqueTasks.map(({ id, name }) => {
              const paramsForTask =
              tab?.workflowConfiguration.params?.filter(p => p.task === id) ||
              [];
              const metricsForTask =
              tab?.workflowMetrics.data?.filter(
                m => m.task === id && m.name !== 'rating',
              ) || [];

              const seenNames = new Set<string>();
              const uniqueMetricsByName: typeof metricsForTask = [];

              // keep only the first instance
              for (const metric of metricsForTask) {
                if (!seenNames.has(metric.name)) {
                  seenNames.add(metric.name);
                  uniqueMetricsByName.push(metric);
                }
              }

              const datasetsForTask =
              tab?.workflowConfiguration.dataAssets?.filter(
                d => d.task === id,
              ) || [];
              const taskVariants: Record<string, string> =
              tab?.workflowConfiguration.tasks?.reduce(
                (acc, task) => {
                  acc[task.name] = task.id;

                  return acc;
                },
                {} as Record<string, string>,
              ) || {};

              const inputDatasets = datasetsForTask.filter(ds => ds.role === 'INPUT');
              const outputDatasets = datasetsForTask.filter(ds => ds.role === 'OUTPUT');

              const inputGrouped = inputDatasets.reduce(
                (acc, ds) => {
                  if (ds.folder) {
                    if (!acc.folders[ds.folder]) acc.folders[ds.folder] = [];
                    acc.folders[ds.folder].push(ds);
                  } else {
                    acc.noFolder.push(ds);
                  }

                  return acc;
                },
                { folders: {} as Record<string, typeof inputDatasets>, noFolder: [] as typeof inputDatasets }
              );

              const outputGrouped = outputDatasets.reduce(
                (acc, ds) => {
                  if (ds.folder) {
                    if (!acc.folders[ds.folder]) acc.folders[ds.folder] = [];
                    acc.folders[ds.folder].push(ds);
                  } else {
                    acc.noFolder.push(ds);
                  }

                  return acc;
                },
                { folders: {} as Record<string, typeof outputDatasets>, noFolder: [] as typeof outputDatasets }
              );

              return (
                <TreeItem2
                  aria-expanded={true}
                  key={id}
                  itemId={`task-${id}`}
                  slotProps={{
                    content: {
                      style: {
                        paddingTop: 0,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                      },
                      onClick: (e) => {
                        e.stopPropagation();
                      },
                    },
                  }}
                  label={
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedId(`task-${id}`));
                        dispatch(
                          setSelectedTask({
                            role: 'TASK',
                            task: name,
                            taskId: id,
                            variant: taskVariants[name],
                          }),
                        );
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexGrow: 1,
                          flexWrap: 'wrap',
                          minWidth: 0,
                        }}
                      >
                        <CommitIcon
                          fontSize="small"
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        {(() => {
                          const fullTask = tab.workflowConfiguration.tasks?.find(t => t.id === id);
                          const isInteractiveUnfinished =
          fullTask?.tags?.type === 'interactive' && !fullTask?.endTime;

                          return (
                            <Typography
                              sx={{
                                fontWeight: 500,
                                mr: 1,
                                color: isInteractiveUnfinished ? 'orange' : 'inherit',
                              }}
                            >
                              {name}
                            </Typography>
                          );
                        })()}

                        {taskVariants[name] && taskVariants[name] !== name && (() => {
                          const fullTask = tab.workflowConfiguration.tasks?.find(t => t.id === id);
                          const isInteractiveUnfinished =
    fullTask?.tags?.type === 'interactive' && fullTask?.endTime == null;

                          return (
                            <Typography
                              sx={{
                                fontWeight: 500,
                                color: isInteractiveUnfinished ? 'orange' : theme.palette.primary.main,
                              }}
                            >
                              {`[${taskVariants[name]}]`}
                            </Typography>
                          );
                        })()}
                      </Box>
                    </Box>
                  }
                >
                  {/* Parameters */}
                  <TreeItem2
                    itemId={`parameters-header-${id}`} // ✅ Use a dynamic, unique ID
                    slotProps={{
                      content: {
                        style: {
                          pointerEvents: 'none',
                          backgroundColor: 'transparent',
                        },
                        onMouseEnter: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },

                      },
                    }}
                    label={
                      <Box sx={{ px: 1, py: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 1,
                            bgcolor: 'transparent',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            Parameters
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, ml: 1 }}
                          >
                            ({paramsForTask.length})
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {paramsForTask.map((param, index) => (
                    <TreeItem2
                      key={`${param.name}-${index}`}
                      itemId={`param-${id}-${index}`}
                      label={
                        <Box
                          onClick={() => {
                            dispatch(setSelectedId(`param-${id}-${index}`));
                            dispatch(
                              setSelectedItem({
                                type: 'param',
                                data: { param: param, variant: taskVariants[name] },
                              }),
                            );
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Grid3x3Icon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              {param.name}: {param.value}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  ))}

                  {/* Metrics */}
                  <TreeItem2
                    itemId={`metrics-header-${id}`} // ✅ Use a dynamic, unique ID
                    slotProps={{
                      content: {
                        style: {
                          pointerEvents: 'none',
                          backgroundColor: 'transparent',
                        },
                        onMouseEnter: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },

                      },
                    }}
                    label={
                      <Box sx={{ px: 1, py: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 1,
                            bgcolor: 'transparent',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            Metrics
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, ml: 1 }}
                          >
                            ({uniqueMetricsByName.length})
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {uniqueMetricsByName.map((metric, index) => (
                    <TreeItem2
                      key={`${metric.name}-${index}`}
                      itemId={`metric-${id}-${index}`}
                      label={
                        <Box
                          onClick={() => {
                            dispatch(setSelectedId(`metric-${id}-${index}`));
                            dispatch(
                              setSelectedItem({ type: 'metric', data: { metric: metric } }),
                            );
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BarChartIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              {metric.name}: {Math.round(metric.value * 100) / 100}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  ))}

                  {/* Inpputs */}
                  {datasetsForTask.some(ds => ds.role === 'INPUT') && (
                    <TreeItem2
                      itemId={`task-${id}-inputs`}
                      slotProps={{
                        content: {
                          style: {
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                          },
                          onClick: (e) => {
                            e.stopPropagation();
                          },
                        },
                      }}
                      label={
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'default',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InputIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography>
                            Inputs (
                              {
                                datasetsForTask.filter(ds => ds.role === 'INPUT')
                                  .length
                              }
                            )
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {inputGrouped.noFolder.map((ds, index) => (
                        <TreeItem2
                          key={`input-${id}-nofolder-${index}`}
                          itemId={`input-ds-${id}-nofolder-${index}`}
                          disabled={!ds.source}
                          label={
                            <Box
                              onClick={() => {
                                if (ds.source) {
                                  dispatch(setSelectedId(`input-ds-${id}-nofolder-${index}`));
                                  dispatch(
                                    setSelectedItem({
                                      type: 'DATASET',
                                      data: { dataset: ds },
                                      meta: { experimentId, workflowId },
                                    }),
                                  );
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                              }}
                            >
                              {getDatasetIcon(ds.format)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {ds.name}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                      {Object.entries(inputGrouped.folders).map(([folder, dsList], folderIndex) => (
                        <TreeItem2
                          key={`input-folder-${id}-${folderIndex}`}
                          itemId={`input-folder-${id}-${folderIndex}`}
                          slotProps={{
                            content: {
                              style: {
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                              },
                              onClick: (e) => e.stopPropagation(),
                            },
                          }}
                          label={
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'default',
                                bgcolor: 'transparent',
                              }}
                            >
                              <FolderIcon
                                fontSize="small"
                                sx={{ mr: 1, color: theme.palette.primary.main }}
                              />
                              <Typography variant="body2">{folder}</Typography>
                            </Box>
                          }
                        >
                          {dsList.map((ds, index) => (
                            <TreeItem2
                              key={`input-${id}-${folder}-${index}`}
                              itemId={`input-ds-${id}-${folder}-${index}`}
                              disabled={!ds.source}
                              label={
                                <Box
                                  onClick={() => {
                                    if (ds.source) {
                                      dispatch(setSelectedId(`input-ds-${id}-${folder}-${index}`));
                                      dispatch(
                                        setSelectedItem({
                                          type: 'DATASET',
                                          data: { dataset: ds },
                                          meta: { experimentId, workflowId },
                                        }),
                                      );
                                    }
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {getDatasetIcon(ds.format)}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {ds.name}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem2>
                      ))}
                    </TreeItem2>
                  )}

                  {/* Outputs */}
                  {datasetsForTask.some(ds => ds.role === 'OUTPUT') && (
                    <TreeItem2
                      itemId={`task-${id}-outputs`}
                      slotProps={{
                        content: {
                          style: {
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                          },
                          onClick: (e) => {
                            e.stopPropagation();
                          },
                        },
                      }}
                      label={
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'default',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <OutputIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography>
                            Outputs (
                              {
                                datasetsForTask.filter(ds => ds.role === 'OUTPUT')
                                  .length
                              }
                            )
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {outputGrouped.noFolder.map((ds, index) => (
                        <TreeItem2
                          key={`output-${id}-nofolder-${index}`}
                          itemId={`output-ds-${id}-nofolder-${index}`}
                          disabled={!ds.source}
                          label={
                            <Box
                              onClick={() => {
                                if (ds.source) {
                                  dispatch(setSelectedId(`output-ds-${id}-nofolder-${index}`));
                                  dispatch(
                                    setSelectedItem({
                                      type: 'DATASET',
                                      data: { dataset: ds },
                                      meta: { experimentId, workflowId },
                                    }),
                                  );
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                              }}
                            >
                              {getDatasetIcon(ds.format)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {ds.name}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}

                      {Object.entries(outputGrouped.folders).map(([folder, dsList], folderIndex) => (
                        <TreeItem2
                          key={`input-folder-${id}-${folderIndex}`}
                          itemId={`input-folder-${id}-${folderIndex}`}
                          slotProps={{
                            content: {
                              style: {
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                              },
                              onClick: (e) => e.stopPropagation(),
                            },
                          }}
                          label={
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'default',
                                bgcolor: 'transparent',
                              }}
                            >
                              <FolderIcon
                                fontSize="small"
                                sx={{ mr: 1, color: theme.palette.primary.main }}
                              />
                              <Typography variant="body2">{folder}</Typography>
                            </Box>
                          }
                        >
                          {dsList.map((ds, index) => (
                            <TreeItem2
                              key={`output-${id}-${folder}-${index}`}
                              itemId={`output-ds-${id}-${folder}-${index}`}
                              disabled={!ds.source}
                              label={
                                <Box
                                  onClick={() => {
                                    if (ds.source) {
                                      dispatch(setSelectedId(`output-ds-${id}-${folder}-${index}`));
                                      dispatch(
                                        setSelectedItem({
                                          type: 'DATASET',
                                          data: { dataset: ds },
                                          meta: { experimentId, workflowId },
                                        }),
                                      );
                                    }
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {getDatasetIcon(ds.format)}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {ds.name}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem2>
                      ))}
                    </TreeItem2>
                  )}
                </TreeItem2>
              );
            })}

            {/* Fallback for null-task entries if no unique tasks. Supporting mlflow */}
            {uniqueTasks.length === 0 &&
            (() => {
              const nullTask = (val: { task?: string | null }) => val.task == null;

              const fallbackParams =
                tab?.workflowConfiguration.params?.filter(nullTask) || [];
              const fallbackDatasets = tab?.workflowConfiguration.dataAssets?.filter(nullTask) || [];

              const fallbackInput = fallbackDatasets.filter(ds => ds.role === 'INPUT');
              const fallbackOutput = fallbackDatasets.filter(ds => ds.role === 'OUTPUT');

              const fallbackInputGrouped = fallbackInput.reduce(
                (acc, ds) => {
                  if (ds.folder) {
                    if (!acc.folders[ds.folder]) acc.folders[ds.folder] = [];
                    acc.folders[ds.folder].push(ds);
                  } else {
                    acc.noFolder.push(ds);
                  }

                  return acc;
                },
                { folders: {} as Record<string, typeof fallbackInput>, noFolder: [] as typeof fallbackInput }
              );

              const fallbackOutputGrouped = fallbackOutput.reduce(
                (acc, ds) => {
                  if (ds.folder) {
                    if (!acc.folders[ds.folder]) acc.folders[ds.folder] = [];
                    acc.folders[ds.folder].push(ds);
                  } else {
                    acc.noFolder.push(ds);
                  }

                  return acc;
                },
                { folders: {} as Record<string, typeof fallbackOutput>, noFolder: [] as typeof fallbackOutput }
              );
              const fallbackMetrics =
                tab?.workflowMetrics.data?.filter(
                  m => nullTask(m) && m.name !== 'rating',
                ) || [];

              if (
                fallbackParams.length === 0 &&
                fallbackDatasets.length === 0 &&
                fallbackMetrics.length === 0
              )
                return null;

              return (
                <>
                  {/* Parameters */}
                  <TreeItem2
                    itemId={'parameters-header'}
                    slotProps={{
                      content: {
                        style: {
                          pointerEvents: 'none',
                          backgroundColor: 'transparent',
                        },
                        onMouseEnter: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },

                      },
                    }}
                    label={
                      <Box sx={{ px: 1, py: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 1,
                            bgcolor: 'transparent',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            Parameters
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, ml: 1 }}
                          >
                            ({fallbackParams.length})
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {fallbackParams.map((param, index) => (
                    <TreeItem2
                      key={`null-param-${index}`}
                      itemId={`null-param-${index}`}
                      label={
                        <Box
                          onClick={() => {
                            dispatch(setSelectedId(`null-param-${index}`));
                            dispatch(
                              setSelectedItem({
                                type: 'param',
                                data: { param: param },
                              }),
                            );
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Grid3x3Icon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              {param.name}: {param.value}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                  {/* Metrics */}
                  <TreeItem2
                    itemId={'metrics-header'}
                    slotProps={{
                      content: {
                        style: {
                          pointerEvents: 'none',
                          backgroundColor: 'transparent',
                        },
                        onMouseEnter: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        },

                      },
                    }}
                    label={
                      <Box sx={{ px: 1, py: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 1,
                            bgcolor: 'transparent',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            Metrics
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, ml: 1 }}
                          >
                            ({fallbackMetrics.length})
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {fallbackMetrics.map((metric, index) => (
                    <TreeItem2
                      key={`null-metric-${index}`}
                      itemId={`null-metric-${index}`}
                      label={
                        <Box
                          onClick={() => {
                            dispatch(setSelectedId(`null-metric-${index}`));
                            dispatch(
                              setSelectedItem({ type: 'metric', data: { metric: metric } }),
                            );
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BarChartIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              {metric.name}: {Math.round(metric.value * 100) / 100}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                  {/* Inputs */}
                  {fallbackDatasets.some(ds => ds.role === 'INPUT') && (
                    <TreeItem2
                      itemId="task-null-inputs"
                      slotProps={{
                        content: {
                          style: {
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                          },
                          onClick: (e) => {
                            e.stopPropagation();
                          },
                        },
                      }}
                      label={
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'default',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InputIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              Inputs (
                              {
                                fallbackDatasets.filter(
                                  ds => ds.role === 'INPUT',
                                ).length
                              }
                              )
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {fallbackInputGrouped.noFolder.map((ds, index) => (
                        <TreeItem2
                          key={`null-input-${index}`}
                          itemId={`null-input-${index}`}
                          disabled={!ds.source}
                          label={
                            <Box
                              onClick={() => {
                                if (ds.source) {
                                  dispatch(setSelectedId(`null-input-${index}`));
                                  dispatch(
                                    setSelectedItem({
                                      type: 'DATASET',
                                      data: { dataset: ds },
                                      meta: { experimentId, workflowId },
                                    }),
                                  );
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                              }}
                            >
                              {getDatasetIcon(ds.format)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {ds.name}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                      {Object.entries(fallbackInputGrouped.folders).map(([folder, dsList], folderIndex) => (
                        <TreeItem2
                          key={`input-folder-${folderIndex}`}
                          itemId={`input-folder-${folderIndex}`}
                          slotProps={{
                            content: {
                              style: {
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                              },
                              onClick: (e) => e.stopPropagation(),
                            },
                          }}
                          label={
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'default',
                                bgcolor: 'transparent',
                              }}
                            >
                              <FolderIcon
                                fontSize="small"
                                sx={{ mr: 1, color: theme.palette.primary.main }}
                              />
                              <Typography variant="body2">{folder}</Typography>
                            </Box>
                          }
                        >
                          {dsList.map((ds, index) => (
                            <TreeItem2
                              key={`null-input-${folder}-${index}`}
                              itemId={`null-input-${folder}-${index}`}
                              disabled={!ds.source}
                              label={
                                <Box
                                  onClick={() => {
                                    if (ds.source) {
                                      dispatch(setSelectedId(`null-input-${folder}-${index}`));
                                      dispatch(
                                        setSelectedItem({
                                          type: 'DATASET',
                                          data: { dataset: ds },
                                          meta: { experimentId, workflowId },
                                        }),
                                      );
                                    }
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {getDatasetIcon(ds.format)}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {ds.name}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem2>
                      ))}
                    </TreeItem2>
                  )}
                  {/* Outputs */}
                  {fallbackDatasets.some(ds => ds.role === 'OUTPUT') && (
                    <TreeItem2
                      itemId="task-null-outputs"
                      slotProps={{
                        content: {
                          style: {
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                          },
                          onClick: (e) => {
                            e.stopPropagation();
                          },
                        },
                      }}
                      label={
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'default',
                            bgcolor: 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <OutputIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              Outputs (
                              {
                                fallbackDatasets.filter(
                                  ds => ds.role === 'OUTPUT',
                                ).length
                              }
                              )
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {fallbackOutputGrouped.noFolder.map((ds, index) => (
                        <TreeItem2
                          key={`null-output-${index}`}
                          itemId={`null-output-${index}`}
                          disabled={!ds.source}
                          label={
                            <Box
                              onClick={() => {
                                if (ds.source) {
                                  dispatch(setSelectedId(`null-output-${index}`));
                                  dispatch(
                                    setSelectedItem({
                                      type: 'DATASET',
                                      data: { dataset: ds },
                                      meta: { experimentId, workflowId },
                                    }),
                                  );
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                              }}
                            >
                              {getDatasetIcon(ds.format)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {ds.name}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}

                      {Object.entries(fallbackOutputGrouped.folders).map(([folder, dsList], folderIndex) => (
                        <TreeItem2
                          key={`input-folder-${folderIndex}`}
                          itemId={`input-folder-${folderIndex}`}
                          slotProps={{
                            content: {
                              style: {
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                              },
                              onClick: (e) => e.stopPropagation(),
                            },
                          }}
                          label={
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'default',
                                bgcolor: 'transparent',
                              }}
                            >
                              <FolderIcon
                                fontSize="small"
                                sx={{ mr: 1, color: theme.palette.primary.main }}
                              />
                              <Typography variant="body2">{folder}</Typography>
                            </Box>
                          }
                        >
                          {dsList.map((ds, index) => (
                            <TreeItem2
                              key={`null-output-${folder}-${index}`}
                              itemId={`null-output-${folder}-${index}`}
                              disabled={!ds.source}
                              label={
                                <Box
                                  onClick={() => {
                                    if (ds.source) {
                                      dispatch(setSelectedId(`null-output-${folder}-${index}`));
                                      dispatch(
                                        setSelectedItem({
                                          type: 'DATASET',
                                          data: { dataset: ds },
                                          meta: { experimentId, workflowId },
                                        }),
                                      );
                                    }
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {getDatasetIcon(ds.format)}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {ds.name}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem2>
                      ))}
                    </TreeItem2>
                  )}
                </>
              );
            })()}
          </SimpleTreeView>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={modelExpanded}
        disableGutters
        sx={{
          boxShadow: 'none',
          '&::before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary
          onClick={(e) => e.stopPropagation()}
          sx={{ borderBottom: '1px solid #ccc', pointerEvents: 'none' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              width: '100%',
              pointerEvents: 'auto',
              cursor: 'default',
            }}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'default',
              }}
            >
              <PsychologyAltRoundedIcon color="primary" />
              <Typography fontWeight={600}>Model Insights</Typography>
            </Box>

            {/* Right-side icon */}
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setModelExpanded((prev) => !prev);
              }}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <ExpandMoreIcon />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* TreeView */}
          <SimpleTreeView defaultExpandedItems={['model']} selectedItems={ tab.dataTaskTable.selectedId ? tab.dataTaskTable.selectedId : null }>
            <TreeItem2
              aria-expanded={true}
              itemId="model"
              slotProps={{
                content: {
                  style: {
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                  onClick: (e) => {
                    e.stopPropagation();
                  },
                },
              }}
              label={
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: 'transparent',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    dispatch(setSelectedId('model'));
                    dispatch(
                      setSelectedItem({
                        type: 'model',
                        data: { model: 'Model.pkl' }
                      }),
                    );
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexGrow: 1,
                      flexWrap: 'wrap',
                      minWidth: 0,
                    }}
                  >
                    <ModelTrainingIcon
                      fontSize="small"
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    <Typography sx={{ mr: 1 }}>
                      TrainedModel
                    </Typography>
                    <Typography sx={{ color: theme.palette.primary.main }}>
                      [Model.pkl]
                    </Typography>
                  </Box>
                </Box>
              }
            >
              <TreeItem2
                itemId="instance-view"
                label={
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                    }}
                    onClick={e => {
                      dispatch(setSelectedId('instance-view'));
                      dispatch(
                        setSelectedItem({
                          type: 'instance-view',
                        }),
                      );
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        flexWrap: 'wrap',
                        minWidth: 0,
                      }}
                    >
                      <QueryStatsIcon
                        fontSize="small"
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography>
                      Instance View
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <TreeItem2
                itemId="feature-effects"
                label={
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                    }}
                    onClick={e => {
                      dispatch(setSelectedId('feature-effects'));
                      dispatch(
                        setSelectedItem({
                          type: 'feature-effects',
                        }),
                      );
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        flexWrap: 'wrap',
                        minWidth: 0,
                      }}
                    >
                      <InsightsIcon
                        fontSize="small"
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography>
                      Feature Explainability
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <TreeItem2
                itemId="hyperparameters"
                label={
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                    }}
                    onClick={e => {
                      dispatch(setSelectedId('hyperparameters'));
                      dispatch(
                        setSelectedItem({
                          type: 'hyperparameters',
                        }),
                      );
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        flexWrap: 'wrap',
                        minWidth: 0,
                      }}
                    >
                      <PermDataSettingIcon
                        fontSize="small"
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography>
                      ML Hyperparameter Explanability
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </TreeItem2>
          </SimpleTreeView>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
