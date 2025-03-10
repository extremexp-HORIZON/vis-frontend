import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import { grey } from "@mui/material/colors"
import { useEffect, useRef, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  restrictToFirstScrollableAncestor,
  restrictToHorizontalAxis,
  restrictToWindowEdges,
  restrictToParentElement 
} from "@dnd-kit/modifiers"
import TabDroppableContainer from "./tab-droppable-container"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { setTabsOrder } from "../../../store/slices/workflowTabsSlice"

interface IProgressPageTabs {
  value: number | string
  handleChange: (newValue: number | string | null) => (event: any) => void
}

const ProgressPageTab = (props: IProgressPageTabs) => {
  const { value, handleChange } = props
  const progressPageTabsRef = useRef<HTMLDivElement>(null)
  const initialOffsetTopRef = useRef<number>(0)
  const [isSticky, setIsSticky] = useState(false)
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const dispatch = useAppDispatch()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      },
    }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return
    }

    if (active.id !== over.id) {
      const newArr = [...tabs]
      const [item] = newArr.splice(tabs.findIndex(tab => tab.workflowId === active.id.toString()), 1)
      newArr.splice(tabs.findIndex(tab => tab.workflowId === over.id.toString()), 0, item)

      dispatch(setTabsOrder(newArr))
    }
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
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis,restrictToParentElement]}
    >
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
          onClick={handleChange(null)}
        >
          Experiment Overview
        </Button>
        <TabDroppableContainer value={value} handleChange={handleChange} />
      </Grid>
    </DndContext>
  )
}

export default ProgressPageTab
