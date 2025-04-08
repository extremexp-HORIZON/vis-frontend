import type * as React from "react"
import Tooltip from "@mui/material/Tooltip"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import FilterListIcon from "@mui/icons-material/FilterList"
import { alpha } from "@mui/material/styles"
import {
  Button,
  Stack,
  Box,
  Chip,
  Popover,
  FormControlLabel,
  Checkbox,
  List,
  ListItemButton,
} from "@mui/material"
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../../store/store"
import {
  setScheduledTable,
  setVisibleTable,
  setWorkflowsTable,
  setGroupBy,
} from "../../../../store/slices/monitorPageSlice"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import { useState } from "react"
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded"
import PivotTableChartRoundedIcon from "@mui/icons-material/PivotTableChartRounded"
interface ToolBarWorkflowProps {
  filterNumbers: number
  numSelected: number
  tableName: string
  actionButtonName: string
  handleClickedFunction: (
    workflowId: number[] | string,
  ) => (e: React.SyntheticEvent) => void
  filterClickedFunction: (event: React.MouseEvent<HTMLElement>) => void
  onRemoveFilter: (index: number) => void
  groupByOptions?: string[]
}

export default function ToolBarWorkflow(props: ToolBarWorkflowProps) {
  const {
    filterNumbers,
    numSelected,
    tableName,
    actionButtonName,
    handleClickedFunction,
    filterClickedFunction,
    onRemoveFilter,
    groupByOptions,
  } = props
  const { visibleTable, workflowsTable, scheduledTable, selectedTab } =
    useAppSelector((state: RootState) => state.monitorPage)
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)
  const [anchorElGroup, setAnchorElGroup] = useState<null | HTMLElement>(null)

  const handleGroupClick = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorElGroup(e.currentTarget)
  const handleGroupClose = () => setAnchorElGroup(null)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenu(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleCloseMenu = () => setAnchorElMenu(null)

  const open = Boolean(anchorEl)
  const openMenu = Boolean(anchorElMenu)

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 &&
          selectedTab !== 1 && {
            bgcolor: theme =>
              alpha(
                theme.palette.primary.dark,
                theme.palette.action.activatedOpacity,
              ),
          }),
      }}
    >
      {numSelected > 0 && selectedTab !== 1 ? (
        <Typography
          sx={{ flex: "1 1 60%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        selectedTab !== 1 && (
          <Tooltip title="" sx={{ width: "15%" }}>
            <Stack spacing={1} direction="row">
              <Button
                size="small"
                variant={
                  visibleTable === "workflows" ? "contained" : "outlined"
                }
                sx={{
                  padding: 1,
                  margin: 2,
                  fontSize: "11px",
                  fontWeight: "bold",
                  borderRadius: 4,
                }}
                onClick={() => dispatch(setVisibleTable("workflows"))}
              >
                Completed
              </Button>
              <Button
                size="small"
                variant={
                  visibleTable === "scheduled" ? "contained" : "outlined"
                }
                sx={{
                  padding: 1,
                  margin: 2,
                  fontSize: "11px",
                  fontWeight: "bold",
                  borderRadius: 4,
                }}
                onClick={() => dispatch(setVisibleTable("scheduled"))}
              >
                Scheduled
              </Button>
            </Stack>
          </Tooltip>
        )
      )}
      {numSelected > 0 && selectedTab !== 1 ? (
        <Tooltip title="">
          <Button
            sx={{ padding: 1, margin: 2 }}
            size="small"
            variant="contained"
            disabled={numSelected < 2 && tableName === "Workflow Execution"}
            style={{ fontSize: "11px" }}
            onClick={handleClickedFunction("compare-completed")} // TODO: Get the selected and get right value to open new tab or cancel scheduled
          >
            {actionButtonName}
          </Button>
        </Tooltip>
      ) : (
        <Box
          sx={{
            width: selectedTab !== 1 ? "85%" : "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            pl: 1,
          }}
        >
          {visibleTable === "workflows"
            ? (workflowsTable.filters?.length > 0 ||
                workflowsTable.groupBy?.length > 0) && (
                <Box
                  sx={{
                    overflowX: "auto",
                    display: "flex",
                    whiteSpace: "nowrap",
                    gap: 0.5,
                  }}
                >
                  {/* Filters */}
                  {workflowsTable.filters?.length > 0 && (
                    <>
                      <Chip
                        label="Filters:"
                        sx={{ fontWeight: "bold", bgcolor: "white" }}
                      />
                      {workflowsTable.filters.map((filter, index) => {
                        if (filter.column && filter.operator && filter.value) {
                          const label = `${filter.column} ${filter.operator} ${filter.value}`
                          return (
                            <Chip
                              key={`filter-${index}`}
                              label={label}
                              onDelete={() => onRemoveFilter(index)}
                            />
                          )
                        }
                        return null
                      })}
                    </>
                  )}

                  {/* Group By */}
                  {workflowsTable.groupBy?.length > 0 && (
                    <>
                      <Chip
                        label="Groups:"
                        sx={{ fontWeight: "bold", bgcolor: "white" }}
                      />
                      {workflowsTable.groupBy.map((group, index) => (
                        <Chip
                          key={`groupBy-${index}`}
                          label={group}
                          onDelete={() =>
                            dispatch(
                              setGroupBy(
                                workflowsTable.groupBy.filter(g => g !== group),
                              ),
                            )
                          }
                        />
                      ))}
                    </>
                  )}
                </Box>
              )
            : scheduledTable.filters?.length > 0 && (
                <Box
                  sx={{
                    p: 1,
                    overflowX: "auto",
                    display: "flex",
                    whiteSpace: "nowrap",
                    gap: 0.2,
                  }}
                >
                  {scheduledTable.filters.map((filter, index) => {
                    const label = `${filter.column} ${filter.operator} ${filter.value}`
                    return (
                      <Chip
                        label={label}
                        onDelete={() => onRemoveFilter(index)}
                      />
                    )
                  })}
                </Box>
              )}
          <Box sx={{ gap: 0.2, marginLeft: "auto" }}>
            <IconButton onClick={handleOpenMenu}>
              <MoreVertRoundedIcon />
            </IconButton>
            <Popover
              open={openMenu}
              anchorEl={anchorElMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <List>
                <ListItemButton onClick={event => filterClickedFunction(event)}>
                  <FilterListIcon
                    sx={{ color: theme => theme.palette.primary.main }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme => theme.palette.primary.main }}
                  >
                    {" "}
                    {filterNumbers > 0 ? ` (${filterNumbers})` : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme => theme.palette.primary.main }}
                  >
                    FILTERS
                  </Typography>
                </ListItemButton>
                <ListItemButton onClick={handleOpen}>
                  <MenuRoundedIcon
                    sx={{ color: theme => theme.palette.primary.main }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme => theme.palette.primary.main }}
                  >
                    COLUMNS
                  </Typography>
                </ListItemButton>
                {visibleTable === "workflows" && (
                  <ListItemButton onClick={handleGroupClick}>
                    <PivotTableChartRoundedIcon
                      sx={{ color: theme => theme.palette.primary.main }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: theme => theme.palette.primary.main }}
                    >
                      GROUP BY
                    </Typography>
                  </ListItemButton>
                )}
              </List>
            </Popover>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  maxheight: "250px",
                }}
              >
                {visibleTable === "workflows"
                  ? workflowsTable.visibleColumns.map(column => (
                      <FormControlLabel
                        key={column.field}
                        control={
                          <Checkbox
                            checked={
                              workflowsTable.columnsVisibilityModel[
                                column.field
                              ] ?? true
                            }
                            onChange={() => {
                              dispatch(
                                setWorkflowsTable({
                                  columnsVisibilityModel: {
                                    ...workflowsTable.columnsVisibilityModel,
                                    [column.field]:
                                      !workflowsTable.columnsVisibilityModel[
                                        column.field
                                      ],
                                  },
                                }),
                              )
                            }}
                          />
                        }
                        label={column.headerName}
                      />
                    ))
                  : scheduledTable.columns.map(column => (
                      <FormControlLabel
                        key={column.field}
                        control={
                          <Checkbox
                            checked={
                              scheduledTable.columnsVisibilityModel[
                                column.field
                              ] ?? true
                            }
                            onChange={() => {
                              dispatch(
                                setScheduledTable({
                                  columnsVisibilityModel: {
                                    ...scheduledTable.columnsVisibilityModel,
                                    [column.field]:
                                      !scheduledTable.columnsVisibilityModel[
                                        column.field
                                      ],
                                  },
                                }),
                              )
                            }}
                          />
                        }
                        label={column.headerName}
                      />
                    ))}
              </Box>
            </Popover>
            <Popover
              open={Boolean(anchorElGroup)}
              anchorEl={anchorElGroup}
              onClose={handleGroupClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  maxheight: "250px",
                }}
              >
                {groupByOptions?.map(option => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={workflowsTable.groupBy.includes(option)}
                        onChange={() => {
                          dispatch(
                            setGroupBy(
                              workflowsTable.groupBy.includes(option)
                                ? workflowsTable.groupBy.filter(
                                    p => p !== option,
                                  )
                                : [...workflowsTable.groupBy, option],
                            ),
                          )
                        }}
                      />
                    }
                    label={option}
                  />
                ))}
                {workflowsTable.groupBy.length > 0 && (
                  <Button onClick={() => dispatch(setGroupBy([]))}>
                    Clear Grouping
                  </Button>
                )}
              </Box>
            </Popover>
          </Box>
        </Box>
      )}
    </Toolbar>
  )
}
