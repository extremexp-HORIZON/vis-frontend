import { DragOverlay, useDroppable } from "@dnd-kit/core"
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable"
import SortableTab from "./tab-sortable"
import React from "react"
import { RootState, useAppSelector } from "../../../store/store"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"

interface IDroppableContainer {
  value: number | string
  handleChange: (newValue: number | string | null) => (event: any) => void
}

const TabDroppableContainer = (props: IDroppableContainer) => {
  const { value, handleChange } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)

  const droppableStyle = {
    display: "flex",
    height: "3.5rem",
    columnGap: 8,
    alignItems: "center",
    overflow: "hidden"
  }

  return (
    <SortableContext
      id={"droppable-tabs-container"}
      items={tabs.map(tab => tab.workflowId)}
      strategy={horizontalListSortingStrategy}
    >
      <div  style={droppableStyle}>
          {tabs.map(tab => (
            <SortableTab
              key={`sortable-tab-${tab.workflowId}`}
              id={tab.workflowId}
              tabName={tab.workflowName}
              value={value}
              handleChange={handleChange}
            />
          ))}
      </div>
    </SortableContext>
  )
}

export default TabDroppableContainer
