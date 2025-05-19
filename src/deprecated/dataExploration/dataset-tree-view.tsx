import { Box, Typography } from "@mui/material"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView"
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2"
import type { RootState } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/store"
import { setDataTable } from "../../store/slices/workflowPageSlice"
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

import theme from "../../mui-theme"


type DatasetRow = {
  id: number
  dataset: string
  source: string
  task: string
  role: string
  format: string | null
}

export default function DatasetTreeView() {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const task = searchParams.get("task")

  const handleSelect = (id: number, source: string) => {
    dispatch(setDataTable({ selectedDataset: { id, source } }))
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
        format: asset.format
      }))
      dispatch(setDataTable({ rows }))
    }
  }, [tab?.workflowConfiguration.dataAssets, task])

  function getDatasetIcon(format: string | null | undefined) {
    if (!format || format.trim() === "") return
  
    switch (format.toLowerCase()) {
      case "csv":
      case "xls":
      case "xlsx":
        return <TableChartRoundedIcon style={{color: theme.palette.primary.main}} fontSize="small" />
  
      case "json":
      case "yaml":
        return <DataObjectRoundedIcon style={{color: theme.palette.primary.main}} fontSize="small" />
  
      case "jpg":
      case "jpeg":
      case "png":
      case "image":
        return <ImageRoundedIcon style={{color: theme.palette.primary.main}} fontSize="small" />
    
      default:
        return <InsertDriveFileRoundedIcon style={{color: theme.palette.primary.main}} fontSize="small" />
    }
  }  

  const groupedByTask =
     tab?.dataAssetsTable.rows?.reduce((acc, row) => {
      if (!acc[row.task]) acc[row.task] = []
      acc[row.task].push(row)
      return acc
    }, {} as Record<string, DatasetRow[]>) || {}

  return (
    <Box sx={{ p: 2 }}>
      <SimpleTreeView defaultExpandedItems={["root"]}>
        <TreeItem2 itemId="root" label={<Typography sx={{ fontWeight: 500 }}>Tasks</Typography>}>
          {Object.entries(groupedByTask).map(([taskName, datasets]) => (
            <TreeItem2
              key={taskName}
              itemId={`task-${taskName}`}
              label={<Typography sx={{ fontWeight: 500 }}>{taskName}</Typography>}
            >
              {datasets.map((ds: DatasetRow) => {

                return (
                  <TreeItem2
                    key={ds.id}
                    itemId={`ds-${ds.id}`}
                    label={
                      <Box
                        onClick={() => handleSelect(ds.id, ds.source)}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: "transparent",
                        }}
                      >
                        {getDatasetIcon(ds.format)}
                        <Typography variant="body2">{ds.dataset} {ds.role === "OUTPUT" ? "[out]" : ds.role === "INPUT" && "[in]"}</Typography>
                      </Box>
                    }
                  />
                )
              })}
            </TreeItem2>
          ))}
        </TreeItem2>
      </SimpleTreeView>
    </Box>
  )
}