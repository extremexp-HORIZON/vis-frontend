import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import grey from "@mui/material/colors/grey"
import { useTheme } from "@mui/material"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

interface ISortableTab {
  id: string
  tabName: string
  value: number | string
  handleChange: (newValue: number | string | null) => (event: any) => void
}

const TabSortable = (props: ISortableTab) => {
  const { id, tabName, value, handleChange } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [ searchParams ] = useSearchParams()
  const tabsQuery = searchParams.get("tabs")

  const handleRemoveTab = (workflowId: number | string | null) => () => {
    if (workflowId === null) return

    const tabsArray = tabsQuery ? tabsQuery.split(',').filter(tabId => tabId !== workflowId) : []
    const newTabsQuery = tabsArray.join(",")
    const queryParams = new URLSearchParams()

    if (workflowId !== value && value !== "progress") queryParams.append("workflowId", value.toString())

    if(tabsArray.length > 0) queryParams.append("tabs", newTabsQuery)
    navigate(`${location.pathname}?${queryParams.toString()}`)
  }

  const itemStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    userSelect: "none",
    cursor: "grab",
    zIndex: isDragging ? 1000 : "auto"
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={itemStyle as React.CSSProperties} >
      {id === "compare-completed" ? (
            <Box
              key={`tab-${id}`}
              sx={{
                borderRadius: 3,
                border: `2px solid ${theme.palette.secondary.main}`,
                pr: 1,
                bgcolor: value === id ? "white" : grey[300],
                fontSize: "0.8rem",
                textTransform: "none",
                display: "flex",
                columnGap: 1,
                alignItems: "center",
                ":hover": {
                  bgcolor: value !== id? grey[300] : "white",
                }
              }}
            >
              <Button
                size="small"
                sx={{
                  textTransform: "none",
                  ":hover": {
                    bgcolor: "transparent",
                  },
                  fontSize: "0.8rem",
                  p: 0,
                  color: theme.palette.secondary.dark,
                  pl: 2,
                  py: 1,
                  borderRadius: 3,
                }}
                disableRipple
                disableFocusRipple
                disableTouchRipple
                onClick={handleChange(id)}
              >
                Workflow Comparative Analysis
              </Button>
              <IconButton
                sx={{ p: 0, height: "max-content" }}
                onClick={handleRemoveTab(id)}
              >
                <CloseIcon
                  fontSize="inherit"
                  sx={{
                    borderRadius: 8,
                    fontSize: "1rem",
                    p: 0.1,
                    ":hover": { bgcolor: grey[400] },
                  }}
                />
              </IconButton>
            </Box>
        ) : (
            <Box
              key={`tab-${id}`}
              sx={{
                borderRadius: 3,
                pr: 1,
                bgcolor: value === id ? "white" : grey[300],
                fontSize: "0.8rem",
                textTransform: "none",
                display: "flex",
                columnGap: 1,
                alignItems: "center",
                ":hover": {
                  bgcolor: value !== id ? grey[300] : "white",
                },
              }}
            >
              <Button
                size="small"
                sx={{
                  textTransform: "none",
                  ":hover": {
                    bgcolor: "transparent",
                  },
                  fontSize: "0.8rem",
                  p: 0,
                  color: "black",
                  pl: 2,
                  py: 1,
                  borderRadius: 3,
                }}
                disableRipple
                disableFocusRipple
                disableTouchRipple
                onClick={handleChange(id)}
              >
                {tabName}
              </Button>
              <IconButton
                sx={{ p: 0, height: "max-content" }}
                onClick={handleRemoveTab(id)}
              >
                <CloseIcon
                  fontSize="inherit"
                  sx={{
                    borderRadius: 8,
                    fontSize: "1rem",
                    p: 0.1,
                    ":hover": { bgcolor: grey[400] },
                  }}
                />
              </IconButton>
            </Box>
          )}
    </div>
  )
}

export default TabSortable
