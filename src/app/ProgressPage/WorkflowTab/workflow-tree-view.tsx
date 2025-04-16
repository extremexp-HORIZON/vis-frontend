import { Box, Divider, Typography } from "@mui/material"
import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useMemo,
} from "react"
import { useSearchParams } from "react-router-dom"
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView"
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2"
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded"
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded"
import ImageRoundedIcon from "@mui/icons-material/ImageRounded"
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import {
  setDataTable,
  setSelectedTask,
} from "../../../store/slices/workflowPageSlice"
import theme from "../../../mui-theme"

import { setSelectedItem } from "../../../store/slices/workflowPageSlice"
import InputIcon from "@mui/icons-material/Input"
import OutputIcon from "@mui/icons-material/Output"
import DatasetIcon from "@mui/icons-material/Dataset"
import AssignmentIcon from "@mui/icons-material/Assignment"
import Grid3x3Icon from "@mui/icons-material/Grid3x3"

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

    const seen = new Set<string>();

    return tab.workflowConfiguration.tasks.reduce((acc: { id: string, name: string }[], task) => {
      if (task.name && !seen.has(task.id)) {
        seen.add(task.id);
        acc.push({id: task.id, name: task.name});
      }
      return acc;
    }, []);
  
  },[tab?.workflowConfiguration.tasks])

  return (
    <Box sx={{ p: 2 }}>
      {/* Title and Separator */}
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        Workflow Details
      </Typography>
      <Divider sx={{ my: 2 }} />{" "}
      {/* Adds a separator with some vertical margin */}
      {/* TreeView */}
      <SimpleTreeView defaultExpandedItems={["workflow-details", "tasks-root"]}>
        {uniqueTasks.map(({id, name}) => {
          const paramsForTask =
            tab?.workflowConfiguration.params?.filter(
              p => p.task === id,
            ) || []
          const metricsForTask =
            tab?.workflowMetrics.data?.filter(m => m.task === id) || []
          const datasetsForTask = 
            tab?.workflowConfiguration.dataAssets?.filter(d => d.task === id) || []
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
                    dispatch(
                      setSelectedTask({
                        type: "group",
                        role: "TASK",
                        data: datasetsForTask,
                        task: id,
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
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AssignmentIcon
                      fontSize="small"
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    <Typography sx={{ fontWeight: 500 }}>
                      Task: {taskVariants[name] || name }
                    </Typography>
                  </Box>
                </Box>
              }
            >
              {/* Data Assets */}
              {datasetsForTask &&
              <TreeItem2
                itemId={`task-${id}-assets`}
                label={
                  <Box
                    onClick={() =>
                      dispatch(
                        setSelectedTask({
                          type: "group",
                          role: "DATA_ASSETS",
                          data: datasetsForTask, // the full list for that task
                          task: id,
                        }),
                      )
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <DatasetIcon
                        fontSize="small"
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography>Data Assets</Typography>
                    </Box>
                  </Box>
                }
              >
                {/* Inputs */}
                {datasetsForTask.some(
                  (ds) => ds.role === "INPUT",
                ) && (
                  <TreeItem2
                    itemId={`task-${id}-inputs`}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <InputIcon
                          fontSize="small"
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography>Inputs</Typography>
                      </Box>
                    }
                  >
                    {datasetsForTask
                      .filter((ds) => ds.role === "INPUT")
                      .map(
                        (ds, index) => (
                          <TreeItem2
                            key={`input-${id}-${index}`}
                            itemId={`input-ds-${id}-${index}`}
                            label={
                              <Box
                                onClick={() => dispatch(setSelectedItem({ type: "DATASET", data: ds }))}
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
                        ),
                      )}
                  </TreeItem2>
                )}

                {/* Outputs */}
                {datasetsForTask.some(
                  (ds) => ds.role === "OUTPUT",
                ) && (
                  <TreeItem2
                    itemId={`task-${id}-outputs`}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <OutputIcon
                          fontSize="small"
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography>Outputs</Typography>
                      </Box>
                    }
                  >
                    {datasetsForTask
                      .filter((ds) => ds.role === "OUTPUT")
                      .map(
                        (ds, index) => (
                          <TreeItem2
                            key={`output-${id}-${index}`}
                            itemId={`output-ds-${id}-${index}`}
                            label={
                              <Box
                                onClick={() => dispatch(setSelectedItem({ type: "DATASET", data: ds }))}
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
                        ),
                      )}
                  </TreeItem2>
                )}
              </TreeItem2>
              }

              {/* Parameters */}
              {paramsForTask.length > 0 && (
                <TreeItem2
                  itemId={`task-${id}-parameters`}
                  label={
                    <Box
                      onClick={() =>
                        dispatch(
                          setSelectedTask({
                            type: "group",
                            role: "Parameters",
                            data: datasetsForTask, // the full list for that task
                            task: id,
                          }),
                        )
                      }
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Grid3x3Icon
                          fontSize="small"
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography>Parameters</Typography>
                      </Box>
                    </Box>
                  }
                >
                  {paramsForTask.map((param, index) => (
                    <TreeItem2
                      key={`${param.name}-${index}`}
                      itemId={`param-${id}-${index}`}
                      label={
                        <Box
                          onClick={() =>
                            dispatch(
                              setSelectedItem({ type: "param", data: param }),
                            )
                          }
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        >
                          <Typography variant="body2">
                            {param.name}: {param.value}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </TreeItem2>
              )}

              {/* Metrics */}
              {metricsForTask.length > 0 && (
                <TreeItem2
                  itemId={`task-${id}-metrics`}
                  label={
                    <Box
                      onClick={() =>
                        dispatch(
                          setSelectedTask({
                            type: "group",
                            role: "Metrics",
                            data: datasetsForTask, // the full list for that task
                            task: id,
                          }),
                        )
                      }
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>Metrics</Typography>
                    </Box>
                  }
                >
                  {metricsForTask.map((metric, index) => (
                    <TreeItem2
                      key={`${metric.name}-${index}`}
                      itemId={`metric-${id}-${index}`}
                      label={
                        <Box
                          onClick={() =>
                            dispatch(
                              setSelectedItem({ type: "metric", data: metric }),
                            )
                          }
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        >
                          <Typography variant="body2">
                            {metric.name}: {metric.value}
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
        {uniqueTasks.length === 0 && (() => {
          const fallbackTaskName = "Unassigned";
          const nullTask = (val: any) => val.task == null;
        
          const fallbackParams = tab?.workflowConfiguration.params?.filter(nullTask) || [];
          const fallbackDatasets = tab?.workflowConfiguration.dataAssets?.filter(nullTask) || [];
          const fallbackMetrics = tab?.workflowMetrics.data?.filter(nullTask) || [];
        
          if (
            fallbackParams.length === 0 &&
            fallbackDatasets.length === 0 &&
            fallbackMetrics.length === 0
          ) return null;
        
          return (
            <TreeItem2
              itemId="task-null"
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AssignmentIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography sx={{ fontWeight: 500 }}>
                    Task: {fallbackTaskName}
                  </Typography>
                </Box>
              }
            >
              {/* Data Assets */}
              {fallbackDatasets.length > 0 && (
                <TreeItem2
                  itemId="task-null-assets"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <DatasetIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography>Data Assets</Typography>
                    </Box>
                  }
                >
                  {/* Inputs */}
                  {fallbackDatasets.some(ds => ds.role === "INPUT") && (
                    <TreeItem2
                      itemId="task-null-inputs"
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <InputIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography>Inputs</Typography>
                        </Box>
                      }
                    >
                      {fallbackDatasets
                        .filter(ds => ds.role === "INPUT")
                        .map((ds, index) => (
                          <TreeItem2
                            key={`null-input-${index}`}
                            itemId={`null-input-${index}`}
                            label={
                              <Box
                                onClick={() => dispatch(setSelectedItem({ type: "DATASET", data: ds }))}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <OutputIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography>Outputs</Typography>
                        </Box>
                      }
                    >
                      {fallbackDatasets
                        .filter(ds => ds.role === "OUTPUT")
                        .map((ds, index) => (
                          <TreeItem2
                            key={`null-output-${index}`}
                            itemId={`null-output-${index}`}
                            label={
                              <Box
                                onClick={() => dispatch(setSelectedItem({ type: "DATASET", data: ds }))}
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
              )}
              {/* Parameters */}
              {fallbackParams.length > 0 && (
                <TreeItem2
                  itemId="task-null-parameters"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Grid3x3Icon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography>Parameters</Typography>
                    </Box>
                  }
                >
                  {fallbackParams.map((param, index) => (
                    <TreeItem2
                      key={`null-param-${index}`}
                      itemId={`null-param-${index}`}
                      label={
                        <Box
                          onClick={() => dispatch(setSelectedItem({ type: "param", data: param }))}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                          }}
                        >
                          <Typography variant="body2">
                            {param.name}: {param.value}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </TreeItem2>
              )}
              {/* Metrics */}
              {fallbackMetrics.length > 0 && (
                <TreeItem2
                  itemId="task-null-metrics"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ fontWeight: 500 }}>Metrics</Typography>
                    </Box>
                  }
                >
                  {fallbackMetrics.map((metric, index) => (
                    <TreeItem2
                      key={`null-metric-${index}`}
                      itemId={`null-metric-${index}`}
                      label={
                        <Box
                          onClick={() => dispatch(setSelectedItem({ type: "metric", data: metric }))}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                          }}
                        >
                          <Typography variant="body2">
                            {metric.name}: {metric.value}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </TreeItem2>
              )}
            </TreeItem2>
          );
        })()}
      </SimpleTreeView>
    </Box>
  )
}
