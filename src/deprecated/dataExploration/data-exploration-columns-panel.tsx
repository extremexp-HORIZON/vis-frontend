import { useAppDispatch, useAppSelector } from "../../store/store"
import {
  Box,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material"
import { setControls } from "../../store/slices/workflowPageSlice"
import { fetchDataExplorationData } from "../../store/slices/dataExplorationSlice"
import { defaultDataExplorationQuery } from "../../shared/models/dataexploration.model"
import { useEffect, useState } from "react"
import TableRowsIcon from "@mui/icons-material/TableRows"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"

const ColumnsPanel = () => {
  const dispatch = useAppDispatch()
  const { tab } = useAppSelector(state => state.workflowPage)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const originalColumns =
    tab?.workflowTasks.dataExploration?.metaData.data?.originalColumns || []
  const selectedColumns =
    tab?.workflowTasks.dataExploration?.controlPanel?.selectedColumns || []
  const selectedColumnNames = selectedColumns.map(col => col.name)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  // useEffect(() => {
  //   if(tab?.workflowTasks?.dataExploration?.controlPanel?.chartType === "datatable" &&
  //      tab?.workflowTasks?.dataExploration?.metaData?.data) {
  //     handleFetchDataExploration(selectedColumns)
  //   }
  // }, [tab?.workflowTasks?.dataExploration?.metaData?.data])

  const handleColumnToggle = (columnName: string) => () => {
    const newSelectedColumns = selectedColumns.some(
      col => col.name === columnName,
    )
      ? selectedColumns.filter(col => col.name !== columnName)
      : [
          ...selectedColumns,
          originalColumns.find(col => col.name === columnName)!,
        ]

    dispatch(setControls({ selectedColumns: newSelectedColumns }))

    // if (newSelectedColumns.length) {
    //   // handleFetchDataExploration(newSelectedColumns)
    // }
  }

  const handleFetchDataExploration = (columns = selectedColumns) => {
    if (!columns?.length) return

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          dataSource: tab?.dataTaskTable.selectedItem?.data?.dataset?.source || "",
          columns: columns.map(col => col.name),
          filters:
            tab?.workflowTasks.dataExploration?.controlPanel?.filters || [],
        },
        metadata: {
          workflowId: tab?.workflowId || "",
          queryCase: "chart",
        },
      }),
    )
  }

  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode
    title: string
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
        px: 2,
        py: 1.5,
        background: "linear-gradient(to right, #f1f5f9, #f8fafc)",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        margin: 0,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#3566b5",
          mr: 1.5,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
          color: "#1e3a5f",
          letterSpacing: "0.3px",
        }}
      >
        {title}
      </Typography>
    </Box>
  )

  return (
    <>
      <Tooltip title="Columns">
        <IconButton onClick={handleOpen}>
          <ViewColumnIcon color="primary" fontSize="medium" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 300,
            maxHeight: 500,
            overflow: "hidden",
            padding: 0,
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
            border: "1px solid rgba(0,0,0,0.04)",
            mt: 1,
          },
        }}
      >
        <SectionHeader
          icon={<TableRowsIcon fontSize="small" />}
          title="Visible Columns"
        />

        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          <List dense>
            {originalColumns.map(column => (
              <ListItem key={column.name} disablePadding>
                <ListItemButton onClick={handleColumnToggle(column.name)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedColumnNames.includes(column.name)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={column.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  )
}

export default ColumnsPanel
