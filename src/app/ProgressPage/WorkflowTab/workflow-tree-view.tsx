import { Box, Divider, Typography } from "@mui/material"
import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView"
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2"
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded"
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded"
import ImageRoundedIcon from "@mui/icons-material/ImageRounded"
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { setDataTable } from "../../../store/slices/workflowPageSlice"
import theme from "../../../mui-theme"

import { setSelectedItem } from "../../../store/slices/workflowPageSlice"

type DatasetRow = {
  id: number
  dataset: string
  source: string
  task: string
  role: string
  format: string | null
}

export default function WorkflowTreeView() {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")

  const handleSelect = (id: number, source: string) => {
    dispatch(setDataTable({ selectedDataset: { id, source } }))
    dispatch(setSelectedItem({ type: "dataset", data:id }))

  }

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
      dispatch(setDataTable({ dataRows:rows }))
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
      dispatch(setDataTable({ parameters:rows }))
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
      dispatch(setDataTable({ metrics:rows }))
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


  const groupedByTask = useMemo(() => {
    if (!tab?.dataTaskTable?.dataRows) return {}
  
    return tab.dataTaskTable.dataRows.reduce((acc, row) => {
      if (!acc[row.task]) acc[row.task] = []
      acc[row.task].push(row)
      return acc
    }, {} as Record<string, DatasetRow[]>)
  }, [tab?.dataTaskTable?.dataRows])
  

  return (
    <Box sx={{ p: 2 }}>
         {/* Title and Separator */}
    <Typography variant="h6" sx={{ fontWeight: 500 }}>
      Workflow Details
    </Typography>
    <Divider sx={{ my: 2 }} />  {/* Adds a separator with some vertical margin */}

    {/* TreeView */}
      <SimpleTreeView defaultExpandedItems={["workflow-details", "tasks-root"]}>
        {Object.entries(groupedByTask).map(([taskName, datasets]) => {
          const paramsForTask =
            tab?.workflowConfiguration.params?.filter(
              p => p.task === taskName,
            ) || []
          const metricsForTask =
            tab?.workflowMetrics.data?.filter(m => m.task === taskName) || []
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
              key={taskName}
              itemId={`task-${taskName}`}
              label={
                <Typography sx={{ fontWeight: 500 }}>
                  Task: {taskVariants[taskName]}
                </Typography>
              }
            >
              {/* Data Assets */}
              <TreeItem2
                itemId={`task-${taskName}-assets`}
                label={
                  <Typography sx={{ fontWeight: 500 }}>Data Assets</Typography>
                }
              >
                {datasets.map((ds: DatasetRow) => (
                  <TreeItem2
                    key={ds.id}
                    itemId={`ds-${ds.id}`}
                    label={
                      <Box
                        onClick={() => handleSelect(ds.id, ds.source)}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                        }}
                      >
                        {getDatasetIcon(ds.format)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {ds.dataset}{" "}
                          {ds.role === "OUTPUT"
                            ? "[out]"
                            : ds.role === "INPUT" && "[in]"}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </TreeItem2>

              {/* Parameters */}
              {paramsForTask.length > 0 && (
                <TreeItem2
                  itemId={`task-${taskName}-params`}
                  label={
                    <Typography sx={{ fontWeight: 500 }}>Parameters</Typography>
                  }
                >
                  {paramsForTask.map((param, index) => (
                    <TreeItem2
                      key={`${param.name}-${index}`}
                      itemId={`param-${taskName}-${index}`}
                      label={
                        <Box
                        onClick={() => dispatch(setSelectedItem({ type: "param", data: param }))}
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
                  itemId={`task-${taskName}-metrics`}
                  label={
                    <Typography sx={{ fontWeight: 500 }}>Metrics</Typography>
                  }
                >
                  {metricsForTask.map((metric, index) => (
                    <TreeItem2
                      key={`${metric.name}-${index}`}
                      itemId={`metric-${taskName}-${index}`}
                      label={
                        <Box
                        onClick={() => dispatch(setSelectedItem({ type: "metric", data: metric }))}
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
      </SimpleTreeView>
    </Box>
  )
}
