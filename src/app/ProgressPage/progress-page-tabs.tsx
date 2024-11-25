import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import { grey, red } from "@mui/material/colors"
import { useEffect, useRef, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { deleteTab } from "../../store/slices/workflowTabsSlice"
import Box from "@mui/material/Box"
import { IconButton, useTheme } from "@mui/material"

interface IProgressPageTabs {
  value: number | string
  handleChange: (newValue: number | string) => (event: any) => void
}

const ProgressPageTabs = (props: IProgressPageTabs) => {
  const { value, handleChange } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const dispatch = useAppDispatch()
  const progressPageTabsRef = useRef<HTMLDivElement>(null)
  const initialOffsetTopRef = useRef<number>(0)
  const [isSticky, setIsSticky] = useState(false)
  const theme = useTheme();

  const handleRemoveTab = (workflowId: number | string | null) => () => {
    if (workflowId === null) return
    workflowId === value && handleChange("progress")(null)
    dispatch(deleteTab(workflowId))
  }

  useEffect(() => {
    if (progressPageTabsRef.current) {
      initialOffsetTopRef.current = progressPageTabsRef.current.offsetTop
    }

    const handleScroll = () => {
      const scrollY = window.scrollY

      // Compare scrollY with the initial offsetTop value
      if (scrollY >= initialOffsetTopRef.current) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <Grid
      ref={progressPageTabsRef}
      item
      xs={12}
      sx={{
        px: 2,
        bgcolor: theme => theme.palette.customGrey.dark,
        display: "flex",
        height: "3.5rem",
        columnGap: 1,
        alignItems: "center",
        transition: "top 0.3s ease-in-out",
        position: isSticky ? "fixed" : "relative",
        top: isSticky ? 0 : "auto",
        width: "100%",
        zIndex: isSticky ? 1000 : "auto",
      }}
    >
      <Button
        variant="text"
        sx={{
          borderRadius: 20,
          px: 2,
          py: 1,
          color: "black",
          bgcolor: value === "progress" ? "white" : grey[300],
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: value !== 0 ? grey[500] : "white" },
          boxShadow: "0 0 -25px 0 #001f3f",
        }}
        size="small"
        disableRipple
        onClick={handleChange("progress")}
      >
        Experiment Overview
      </Button>
      {tabs.map((tab, index) => (
        tab.workflowId === "compare-completed" ? <Box
        key={`tab-${tab.workflowId}`}
        sx={{
          borderRadius: 3,
          border: `2px solid ${theme.palette.secondary.main}`,
          pr: 1,
          bgcolor: value === tab.workflowId ? "white" : grey[300],
          fontSize: "0.8rem",
          textTransform: "none",
          display: "flex",
          columnGap: 1,
          alignItems: "center",
          ":hover": {
            bgcolor: value !== tab.workflowId ? grey[300] : "white",
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
            color: theme.palette.secondary.dark,
            pl: 2,
            py: 1,
            borderRadius: 3,
          }}
          disableRipple
          disableFocusRipple
          disableTouchRipple
          onClick={handleChange(tab.workflowId)}
        >
          Workflow Comparative Analysis
        </Button>
        <IconButton
          sx={{ p: 0, height: "max-content" }}
          onClick={handleRemoveTab(tab.workflowId)}
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
      </Box> : <Box
          key={`tab-${tab.workflowId}`}
          sx={{
            borderRadius: 3,
            pr: 1,
            bgcolor: value === tab.workflowId ? "white" : grey[300],
            fontSize: "0.8rem",
            textTransform: "none",
            display: "flex",
            columnGap: 1,
            alignItems: "center",
            ":hover": {
              bgcolor: value !== tab.workflowId ? grey[300] : "white",
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
            onClick={handleChange(tab.workflowId)}
          >
            {tab.workflowName}
          </Button>
          <IconButton
            sx={{ p: 0, height: "max-content" }}
            onClick={handleRemoveTab(tab.workflowId)}
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
      ))}
    </Grid>
  )
}

export default ProgressPageTabs
