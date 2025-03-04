import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { Paper, styled } from "@mui/material"

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  cursor: "move",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  textAlign: "center",
  fontSize: "0.7rem",
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const SortableItem = ({ id }: { id: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <StyledPaper ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </StyledPaper>
  )
}

const DraggableColumns = ({
  foldArray,
  onOrderChange,
}: {
  foldArray: React.MutableRefObject<string[]>
  onOrderChange?: (newOrder: string[]) => void
}) => {
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = foldArray.current.indexOf(active.id)
      const newIndex = foldArray.current.indexOf(over.id)
      const newArray = arrayMove(foldArray.current, oldIndex, newIndex)
      foldArray.current = newArray
      onOrderChange?.(newArray)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={foldArray.current}>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {foldArray.current.map(id => (
            <SortableItem key={id} id={id} />
          ))}
          <div
            style={{ width: 0, padding: 0, margin: 0, visibility: "hidden" }}
          >
            <StyledPaper>placeholder</StyledPaper>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableColumns

/*
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { Paper, styled } from "@mui/material"

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  cursor: "grab", // move
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  textAlign: "center",
  width: "120px",
  fontSize: "0.8rem",
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const SortableItem = ({ id }: { id: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <StyledPaper ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </StyledPaper>
  )
}

const DraggableColumns = ({
  foldArray,
  onOrderChange,
}: {
  foldArray: React.MutableRefObject<string[]>
  onOrderChange?: (newOrder: string[]) => void
}) => {
  const [items, setItems] = useState(foldArray.current)
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setItems(prev => {
        const oldIndex = prev.indexOf(active.id)
        const newIndex = prev.indexOf(over.id)
        const newArray = arrayMove(prev, oldIndex, newIndex)
        foldArray.current = newArray
        onOrderChange?.(newArray)
        return newArray
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        <div style={{ display: "flex", gap: "10px" }}>
          {items.map(id => (
            <SortableItem key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableColumns

*/

/*import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"

const SortableItem = ({ id }: { id: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px 20px",
    margin: "5px",
    border: "1px solid black",
    background: "#f0f0f0",
    cursor: "grab",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  )
}

const DraggableColumns = () => {
  const [items, setItems] = useState(["epochs", "batch_size", "units"])

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setItems(prev => {
        const oldIndex = prev.indexOf(active.id)
        const newIndex = prev.indexOf(over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        <div style={{ display: "flex", gap: "10px" }}>
          {items.map(id => (
            <SortableItem key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableColumns */
