import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Tooltip, Typography } from "@mui/material"
import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView"
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2"
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded"
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded"
import ImageRoundedIcon from "@mui/icons-material/ImageRounded"
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded"
import type { RootState } from "../../../store/store"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import {
  setDataTable,
  setSelectedId,
  setSelectedTask,
} from "../../../store/slices/workflowPageSlice"

import { setSelectedItem } from "../../../store/slices/workflowPageSlice"
import InputIcon from "@mui/icons-material/Input"
import OutputIcon from "@mui/icons-material/Output"
import Grid3x3Icon from "@mui/icons-material/Grid3x3"
import BarChartIcon from "@mui/icons-material/BarChart"
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded"
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CommitIcon from '@mui/icons-material/Commit';
import theme from "../../../mui-theme"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import InsightsIcon from '@mui/icons-material/Insights';

export default function WorkflowTreeView() {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")

  useEffect(() => {
    const dataAssets = !task
      ? tab?.workflowConfiguration.dataAssets
      : tab?.workflowConfiguration.dataAssets?.filter(a => a.task === task)

    if (dataAssets && dataAssets.length > 0) {
      const rows = dataAssets.map((asset, index) => ({
        id: index + 1,
        dataset: asset.name,
        source: asset.source,
        task: asset.task,
        role: asset.role,
        format: asset.format,
      }))
      dispatch(setDataTable({ dataRows: rows }))
    }
  }, [tab?.workflowConfiguration.dataAssets, task])

  useEffect(() => {
    const params = tab?.workflowConfiguration.params
    if (params && params.length > 0) {
      const rows = params.map((param, index) => ({
        id: index + 1,
        dataset: param.name,
        source: param.value,
        task: param.task,
        role: "PARAMETER",
        format: null,
      }))
      dispatch(setDataTable({ parameters: rows }))
    }
  }, [tab?.workflowConfiguration.params])
  useEffect(() => {
    const metrics = tab?.workflowMetrics.data
    if (metrics && metrics.length > 0) {
      const rows = metrics.map((metric, index) => ({
        id: index + 1,
        dataset: metric.name,
        source: metric.value,
        task: metric.task,
        role: "METRIC",
        format: null,
      }))
      dispatch(setDataTable({ metrics: rows }))
    }
  }, [tab?.workflowMetrics.data])

  function getDatasetIcon(format: string | null | undefined) {
    if (!format || format.trim() === "") return

    switch (format.toLowerCase()) {
      case "csv":
      case "xls":
      case "xlsx":
        return (
          <TableChartRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        )

      case "json":
      case "yaml":
        return (
          <DataObjectRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        )

      case "jpg":
      case "jpeg":
      case "png":
      case "image":
        return (
          <ImageRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        )

      default:
        return (
          <InsertDriveFileRoundedIcon
            style={{ color: theme.palette.primary.main }}
            fontSize="small"
          />
        )
    }
  }

  const uniqueTasks = useMemo(() => {
    if (!tab?.workflowConfiguration.tasks) return []

    const seen = new Set<string>()

    return tab.workflowConfiguration.tasks.reduce(
      (acc: { id: string; name: string }[], task) => {
        if (task.name && !seen.has(task.id)) {
          seen.add(task.id)
          acc.push({ id: task.id, name: task.name })
        }
        return acc
      },
      [],
    )
  }, [tab?.workflowConfiguration.tasks])

  const expandedTaskItemIds = useMemo(() => {
    if (!tab?.workflowConfiguration.tasks) return []

    return tab.workflowConfiguration.tasks
      .filter(task => {
        const hasParams =
          tab?.workflowConfiguration.params?.some(p => p.task === task.id) ??
          false
        const hasMetrics =
          tab?.workflowMetrics.data?.some(
            m => m.task === task.id && m.name !== "rating",
          ) ?? false
        return hasParams || hasMetrics
      })
      .map(task => `task-${task.id}`)
  }, [
    tab?.workflowConfiguration.tasks,
    tab?.workflowConfiguration.params,
    tab?.workflowMetrics.data,
  ])

  if (!tab?.workflowConfiguration) return null

  return (
    <Box sx={{ overflow: "auto" }}>
      {/* Enhanced Title and Separator */}
      <Accordion
        defaultExpanded 
        disableGutters
        sx={{
          boxShadow: 'none',
          '&::before': {
            display: 'none',
          },
        }}      
      >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx ={{borderBottom: `1px solid ${theme.palette.divider}`}}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <AccountTreeIcon color="primary" />
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            Workflow Details
          </Typography>
        </Box>
      </AccordionSummary>

      {/* TreeView with adjusted padding */}
      <AccordionDetails>
        <SimpleTreeView defaultExpandedItems={expandedTaskItemIds} selectedItems={ tab.dataTaskTable.selectedId ? tab.dataTaskTable.selectedId : null}>
          {uniqueTasks.map(({ id, name }) => {
            const paramsForTask =
              tab?.workflowConfiguration.params?.filter(p => p.task === id) ||
              []
            const metricsForTask =
              tab?.workflowMetrics.data?.filter(
                m => m.task === id && m.name !== "rating",
              ) || []

            const seenNames = new Set<string>()
            const uniqueMetricsByName: typeof metricsForTask = []
            //keep only the first instance
            for (const metric of metricsForTask) {
              if (!seenNames.has(metric.name)) {
                seenNames.add(metric.name)
                uniqueMetricsByName.push(metric)
              }
            }

            const datasetsForTask =
              tab?.workflowConfiguration.dataAssets?.filter(
                d => d.task === id,
              ) || []
            const taskVariants: Record<string, string> =
              tab?.workflowConfiguration.tasks?.reduce(
                (acc, task) => {
                  acc[task.name] = task.variant

                  return acc
                },
                {} as Record<string, string>,
              ) || {}
            return (
              <TreeItem2
                aria-expanded={true}
                key={id}
                itemId={`task-${id}`}
                label={
                  <Box
                    onClick={() => {
                      dispatch(setSelectedId(`task-${id}`))
                      dispatch(
                        setSelectedTask({
                          type: "group",
                          role: "TASK",
                          data: datasetsForTask,
                          task: name,
                          taskId: id,
                          variant: taskVariants[name],
                        }),
                      )
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor: "transparent",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                        flexWrap: "wrap",
                        minWidth: 0,
                      }}
                    >
                      <CommitIcon
                        fontSize="small"
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography sx={{ fontWeight: 500, mr: 1 }}>
                        {name}
                      </Typography>
                      {taskVariants[name] && taskVariants[name] !== name &&
                        <Typography sx={{ fontWeight: 500, color: theme.palette.primary.main}}>
                          {`[${taskVariants[name]}]`}
                        </Typography>
                      
                      }
                    </Box>
                  </Box>
                }
              >
                {/* Parameters */}

                {paramsForTask.map((param, index) => (
                  <TreeItem2
                    key={`${param.name}-${index}`}
                    itemId={`param-${id}-${index}`}
                    label={
                      <Box
                        onClick={() => {
                          dispatch(setSelectedId(`param-${id}-${index}`))
                          dispatch(
                            setSelectedItem({
                              type: "param",
                              data: { ...param, variant: taskVariants[name] },
                            }),
                          )
                        }}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
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

                {uniqueMetricsByName.map((metric, index) => (
                  <TreeItem2
                    key={`${metric.name}-${index}`}
                    itemId={`metric-${id}-${index}`}
                    label={
                      <Box
                        onClick={() => {
                          dispatch(setSelectedId(`metric-${id}-${index}`))
                          dispatch(
                            setSelectedItem({ type: "metric", data: metric }),
                          )
                        }}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BarChartIcon
                            fontSize="small"
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          <Typography variant="body2">
                            {metric.name}:
                            {Math.round(metric.value * 100) / 100}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                ))}

                {/* Inpputs */}
                {datasetsForTask.some(ds => ds.role === "INPUT") && (
                  <TreeItem2
                    itemId={`task-${id}-inputs`}
                    label={
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <InputIcon
                            fontSize="small"
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          <Typography>
                            Inputs (
                            {
                              datasetsForTask.filter(ds => ds.role === "INPUT")
                                .length
                            }
                            )
                          </Typography>
                        </Box>
                      </Box>
                    }
                  >
                    {datasetsForTask
                      .filter(ds => ds.role === "INPUT")
                      .map((ds, index) => (
                        <TreeItem2
                          key={`input-${id}-${index}`}
                          itemId={`input-ds-${id}-${index}`}
                          disabled={!ds.source}
                          label={
                            <Box
                              onClick={() => {
                                if (ds.source) {
                                  dispatch(setSelectedId(`input-ds-${id}-${index}`))
                                  dispatch(
                                    setSelectedItem({
                                      type: "DATASET",
                                      data: ds,
                                    }),
                                  )
                                }
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: "pointer",
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
                )}

                {/* Outputs */}
                {datasetsForTask.some(ds => ds.role === "OUTPUT") && (
                  <TreeItem2
                    itemId={`task-${id}-outputs`}
                    label={
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <OutputIcon
                            fontSize="small"
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          <Typography>
                            Outputs (
                            {
                              datasetsForTask.filter(ds => ds.role === "OUTPUT")
                                .length
                            }
                            )
                          </Typography>
                        </Box>
                      </Box>
                    }
                  >
                    {datasetsForTask
                      .filter(ds => ds.role === "OUTPUT")
                      .map((ds, index) => (
                        <TreeItem2
                          key={`output-${id}-${index}`}
                          itemId={`output-ds-${id}-${index}`}
                          disabled={!ds.source}
                          label={
                            <Box
                              onClick={() => {
                                if (ds.source) {
                                  dispatch(setSelectedId(`output-ds-${id}-${index}`))
                                  dispatch(
                                    setSelectedItem({
                                      type: "DATASET",
                                      data: ds,
                                    }),
                                  )
                                }
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: "pointer",
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
                )}
              </TreeItem2>
            )
          })}

          {/* Fallback for null-task entries if no unique tasks. Supporting mlflow */}
          {uniqueTasks.length === 0 &&
            (() => {
              const nullTask = (val: any) => val.task == null

              const fallbackParams =
                tab?.workflowConfiguration.params?.filter(nullTask) || []
              const fallbackDatasets =
                tab?.workflowConfiguration.dataAssets?.filter(nullTask) || []
              const fallbackMetrics =
                tab?.workflowMetrics.data?.filter(
                  m => nullTask(m) && m.name !== "rating",
                ) || []

              if (
                fallbackParams.length === 0 &&
                fallbackDatasets.length === 0 &&
                fallbackMetrics.length === 0
              )
                return null

              return (
                <>
                  {/* Parameters */}
                  {fallbackParams.map((param, index) => (
                    <TreeItem2
                      key={`null-param-${index}`}
                      itemId={`null-param-${index}`}
                      label={
                        <Box
                          onClick={() => {
                            dispatch(setSelectedId(`null-param-${index}`))
                            dispatch(
                              setSelectedItem({
                                type: "param",
                                data: param,
                              }),
                            )
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  {fallbackMetrics.map((metric, index) => (
                    <TreeItem2
                      key={`null-metric-${index}`}
                      itemId={`null-metric-${index}`}
                      label={
                        <Box
                          onClick={() => {
                            dispatch(setSelectedId(`null-metric-${index}`))
                            dispatch(
                              setSelectedItem({ type: "metric", data: metric }),
                            )
                          }}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <BarChartIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              {metric.name}:
                              {Math.round(metric.value * 100) / 100}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                  {/* Inputs */}
                  {fallbackDatasets.some(ds => ds.role === "INPUT") && (
                    <TreeItem2
                      itemId="task-null-inputs"
                      label={
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <InputIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              Inputs (
                              {
                                fallbackDatasets.filter(
                                  ds => ds.role === "INPUT",
                                ).length
                              }
                              )
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {fallbackDatasets
                        .filter(ds => ds.role === "INPUT")
                        .map((ds, index) => (
                          <TreeItem2
                            key={`null-input-${index}`}
                            itemId={`null-input-${index}`}
                            disabled={!ds.source}
                            label={
                              <Box
                                onClick={() => {
                                  if (ds.source) {
                                    dispatch(setSelectedId(`null-input-${index}`))
                                    dispatch(
                                      setSelectedItem({
                                        type: "DATASET",
                                        data: ds,
                                      }),
                                    )
                                  }
                                }}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  cursor: "pointer",
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
                  )}
                  {/* Outputs */}
                  {fallbackDatasets.some(ds => ds.role === "OUTPUT") && (
                    <TreeItem2
                      itemId="task-null-outputs"
                      label={
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <OutputIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            <Typography variant="body2">
                              Outputs (
                              {
                                fallbackDatasets.filter(
                                  ds => ds.role === "OUTPUT",
                                ).length
                              }
                              )
                            </Typography>
                          </Box>
                        </Box>
                      }
                    >
                      {fallbackDatasets
                        .filter(ds => ds.role === "OUTPUT")
                        .map((ds, index) => (
                          <TreeItem2
                            key={`null-output-${index}`}
                            itemId={`null-output-${index}`}
                            disabled={!ds.source}
                            label={
                              <Box
                                onClick={() => {
                                  if (ds.source) {
                                    dispatch(setSelectedId(`null-output-${index}`))
                                    dispatch(
                                      setSelectedItem({
                                        type: "DATASET",
                                        data: ds,
                                      }),
                                    )
                                  }
                                }}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  cursor: "pointer",
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
                  )}
                </>
              )
            })()}
        </SimpleTreeView>
      </AccordionDetails>
      </Accordion>

      <Accordion 
        defaultExpanded
        disableGutters
        sx={{
          boxShadow: 'none',
          '&::before': {
            display: 'none',
          },
        }}      
        >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />} 
          sx ={{borderBottom: `1px solid ${theme.palette.divider}`}}
        >
          {/* Simple Title */}
          <Box
            sx={{
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%"
            }}
          >
            <PsychologyAltRoundedIcon color="primary" />
            <Typography
              variant="body1"
              sx={{ fontWeight: 800, color: theme.palette.text.primary }}
            >
              Model Insights
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* TreeView */}
          <SimpleTreeView defaultExpandedItems={["model"]} selectedItems={ tab.dataTaskTable.selectedId ? tab.dataTaskTable.selectedId : null }>
            <TreeItem2
              aria-expanded={true}
              itemId="model"
              label={
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    bgcolor: "transparent",
                  }}
                  onClick={e => {
                    dispatch(setSelectedId(`model`))
                    dispatch(
                      setSelectedItem({
                        type: "model",
                        data: {model: "Model.pkl"}
                      }),
                    )
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      flexWrap: "wrap",
                      minWidth: 0,
                    }}
                  >
                    <ModelTrainingIcon                               
                      fontSize="small"
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    <Typography sx={{mr: 1}}>
                      TrainedModel
                    </Typography>
                    <Typography sx={{color: theme.palette.primary.main}}>
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
                    cursor: "pointer",
                    bgcolor: "transparent",
                  }}
                  onClick={e => {
                    dispatch(setSelectedId(`instance-view`))
                    dispatch(
                      setSelectedItem({
                        type: "instance-view",
                      }),
                    )
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      flexWrap: "wrap",
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
                      cursor: "pointer",
                      bgcolor: "transparent",
                    }}
                    onClick={e => {
                      dispatch(setSelectedId(`feature-effects`))
                      dispatch(
                        setSelectedItem({
                          type: "feature-effects",
                        }),
                      )
                    }}
                  >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      flexWrap: "wrap",
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
                      cursor: "pointer",
                      bgcolor: "transparent",
                    }}
                    onClick={e => {
                      dispatch(setSelectedId(`hyperparameters`))
                      dispatch(
                        setSelectedItem({
                          type: "hyperparameters",
                        }),
                      )
                    }}    
                  >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      flexWrap: "wrap",
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
  )
}
