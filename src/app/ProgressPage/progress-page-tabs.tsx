import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import { grey, red } from "@mui/material/colors"
import { useEffect, useRef, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { deleteTab } from "../../store/slices/workflowTabsSlice"

interface IProgressPageTabs {
  value: number
  handleChange: (newValue: number) => (event: React.SyntheticEvent) => void
}

const ProgressPageTabs = (props: IProgressPageTabs) => {
  const { value, handleChange } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const dispatch = useAppDispatch()
  const progressPageTabsRef = useRef<HTMLDivElement>(null)
  const initialOffsetTopRef = useRef<number>(0)
  const [isSticky, setIsSticky] = useState(false)

  const handleRemoveTab = (workflowId: number | string | null) => () => {
    dispatch(deleteTab(workflowId))
    handleChange(0)(null as any)
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
        bgcolor: grey[400],
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
          bgcolor: value === 0 ? "white" : grey[300],
          border: value !== 0 ? `1px solid ${grey[400]}` : "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: value !== 0 ? grey[500] : "white" },
          boxShadow: "0 0 -25px 0 #001f3f",
        }}
        size="small"
        disableRipple
        onClick={handleChange(0)}
      >
        Experiment Overview
      </Button>
      {/* <Button
        sx={{
          borderRadius: 3,
          px: 2,
          py: 1,
          color: "black",
          bgcolor: value === 1 ? "white" : grey[300],
          border: value !== 1 ? `1px solid ${grey[400]}` : "none",
          fontSize: "0.8rem",
          textTransform: "none",
          display: "flex",
          columnGap: 1,
          ":hover": { bgcolor: value !== 1 ? grey[300] : "white" },
        }}
        size="small"
        disableRipple
        onClick={handleChange(1)}
      >
        Workflow{1}
        <CloseIcon
          fontSize="inherit"
          onClick={handleRemoveTab(1)}
          sx={{
            borderRadius: 8,
            fontSize: "1rem",
            p: 0.1,
            ":hover": { bgcolor: grey[400], zIndex: 99999 },
          }}
        />
      </Button> */}
      {tabs.map((tab, index) => (
        <Button
          key={`tab-${tab.workflowId}`}
          sx={{
            borderRadius: 3,
            px: 2,
            py: 1,
            color: "black",
            bgcolor: value === tab.workflowId ? "white" : grey[300],
            border: value !== tab.workflowId ? `1px solid ${grey[400]}` : "none",
            fontSize: "0.8rem",
            textTransform: "none",
            display: "flex",
            columnGap: 1,
            ":hover": { bgcolor: value !== tab.workflowId ? grey[300] : "white" },
          }}
          size="small"
          disableRipple
          onClick={handleChange(tab.workflowId as number)}
        >
          Workflow{tab.workflowId}
          <CloseIcon
            fontSize="inherit"
            onClick={handleRemoveTab(tab.workflowId)}
            sx={{
              borderRadius: 8,
              fontSize: "1rem",
              p: 0.1,
              ":hover": { bgcolor: grey[400] },
            }}
          />
        </Button>
      ))}
    </Grid>
  )
}

export default ProgressPageTabs
